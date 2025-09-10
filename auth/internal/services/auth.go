package services

import (
	"auth-service/internal/database"
	"auth-service/internal/redis"
	"crypto/rand"
	"encoding/base32"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/pquerna/otp/totp"
	"golang.org/x/crypto/argon2"
)

type AuthService struct {
	db        *database.Repository
	redis     *redis.Client
	jwtSecret string
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	TOTPCode string `json:"totp_code,omitempty"`
}

type LoginResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

type Claims struct {
	Sub       string `json:"sub"`
	SessionID string `json:"session_id"`
	jwt.RegisteredClaims
}

func NewAuthService(db *database.Repository, redis *redis.Client, jwtSecret string) *AuthService {
	return &AuthService{
		db:        db,
		redis:     redis,
		jwtSecret: jwtSecret,
	}
}

func (s *AuthService) Login(req *LoginRequest) (*LoginResponse, error) {
	// Get user
	user, err := s.db.GetUserByEmail(req.Email)
	if err != nil {
		return nil, fmt.Errorf("invalid credentials")
	}

	// Verify password
	if !s.verifyPassword(req.Password, user.PasswordHash) {
		return nil, fmt.Errorf("invalid credentials")
	}

	// Check MFA if enabled
	if user.MFAEnabled {
		if req.TOTPCode == "" {
			return nil, fmt.Errorf("totp code required")
		}
		if !totp.Validate(req.TOTPCode, user.MFASecret.String) {
			return nil, fmt.Errorf("invalid totp code")
		}
	}

	// Create session
	sessionID := uuid.New().String()
	refreshToken := s.generateRefreshToken()
	refreshTokenHash := s.hashPassword(refreshToken)

	session := &database.Session{
		ID:               sessionID,
		UserID:           user.ID,
		RefreshTokenHash: refreshTokenHash,
		ExpiresAt:        time.Now().Add(30 * 24 * time.Hour), // 30 days
		Revoked:          false,
	}

	if err := s.db.CreateSession(session); err != nil {
		return nil, fmt.Errorf("failed to create session")
	}

	// Generate access token
	accessToken, err := s.generateAccessToken(user.ID, sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token")
	}

	return &LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    300, // 5 minutes
	}, nil
}

func (s *AuthService) RefreshToken(req *RefreshRequest) (*LoginResponse, error) {
	// Find session by refresh token
	sessions, err := s.findSessionByRefreshToken(req.RefreshToken)
	if err != nil || len(sessions) == 0 {
		return nil, fmt.Errorf("invalid refresh token")
	}

	session := sessions[0]

	// Check if session is revoked or expired
	if session.Revoked || time.Now().After(session.ExpiresAt) {
		return nil, fmt.Errorf("invalid refresh token")
	}

	// Check revocation in Redis
	revoked, err := s.redis.IsRevoked(fmt.Sprintf("revoked:session:%s", session.ID))
	if err != nil || revoked {
		return nil, fmt.Errorf("session revoked")
	}

	// Generate new tokens
	newRefreshToken := s.generateRefreshToken()
	newRefreshTokenHash := s.hashPassword(newRefreshToken)

	// Update session
	session.RefreshTokenHash = newRefreshTokenHash
	if err := s.db.UpdateSession(session); err != nil {
		return nil, fmt.Errorf("failed to update session")
	}

	// Generate new access token
	accessToken, err := s.generateAccessToken(session.UserID, session.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token")
	}

	return &LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
		ExpiresIn:    300, // 5 minutes
	}, nil
}

func (s *AuthService) Logout(sessionID string) error {
	// Revoke session in database
	if err := s.db.RevokeSession(sessionID); err != nil {
		return err
	}

	// Set revocation in Redis
	return s.redis.SetRevocation(fmt.Sprintf("revoked:session:%s", sessionID), 24*time.Hour)
}

func (s *AuthService) SetupMFA(userID string) (string, error) {
	_, err := s.db.GetUserByID(userID)
	if err != nil {
		return "", err
	}

	secret := s.generateMFASecret()
	if err := s.db.UpdateUserMFASecret(userID, secret); err != nil {
		return "", err
	}

	return secret, nil
}

func (s *AuthService) VerifyToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.jwtSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		// Check session revocation
		revoked, err := s.redis.IsRevoked(fmt.Sprintf("revoked:session:%s", claims.SessionID))
		if err != nil || revoked {
			return nil, fmt.Errorf("session revoked")
		}

		// Check user revocation
		revoked, err = s.redis.IsRevoked(fmt.Sprintf("revoked:user:%s", claims.Sub))
		if err != nil || revoked {
			return nil, fmt.Errorf("user revoked")
		}

		return claims, nil
	}

	return nil, fmt.Errorf("invalid token")
}

func (s *AuthService) generateAccessToken(userID, sessionID string) (string, error) {
	claims := &Claims{
		Sub:       userID,
		SessionID: sessionID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(5 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}

func (s *AuthService) generateRefreshToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return base32.StdEncoding.EncodeToString(b)
}

func (s *AuthService) generateMFASecret() string {
	b := make([]byte, 20)
	rand.Read(b)
	return base32.StdEncoding.EncodeToString(b)
}

func (s *AuthService) hashPassword(password string) string {
	hash := argon2.IDKey([]byte(password), []byte("salt"), 1, 64*1024, 4, 32)
	return base32.StdEncoding.EncodeToString(hash)
}

func (s *AuthService) verifyPassword(password, hash string) bool {
	return s.hashPassword(password) == hash
}

func (s *AuthService) findSessionByRefreshToken(refreshToken string) ([]*database.Session, error) {
	// This is a simplified implementation
	// In production, you'd have a proper query to find sessions by refresh token hash
	_ = refreshToken // Mark as used
	return []*database.Session{}, nil
}