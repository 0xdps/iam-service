package database

import (
	"database/sql"
	"time"

	_ "github.com/lib/pq"
)

type User struct {
	ID           string         `json:"id"`
	Email        string         `json:"email"`
	PasswordHash string         `json:"-"`
	MFASecret    sql.NullString `json:"-"`
	MFAEnabled   bool           `json:"mfa_enabled"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
}

type Session struct {
	ID              string    `json:"id"`
	UserID          string    `json:"user_id"`
	RefreshTokenHash string   `json:"-"`
	ExpiresAt       time.Time `json:"expires_at"`
	Revoked         bool      `json:"revoked"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type Repository struct {
	db *sql.DB
}

func Connect(databaseURL string) (*Repository, error) {
	db, err := sql.Open("postgres", databaseURL)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	return &Repository{db: db}, nil
}

func (r *Repository) Close() error {
	return r.db.Close()
}

func (r *Repository) GetUserByEmail(email string) (*User, error) {
	user := &User{}
	err := r.db.QueryRow(`
		SELECT id, email, password_hash, mfa_secret, mfa_enabled, created_at, updated_at 
		FROM users WHERE email = $1`,
		email).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.MFASecret, &user.MFAEnabled, &user.CreatedAt, &user.UpdatedAt)
	
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *Repository) GetUserByID(id string) (*User, error) {
	user := &User{}
	err := r.db.QueryRow(`
		SELECT id, email, password_hash, mfa_secret, mfa_enabled, created_at, updated_at 
		FROM users WHERE id = $1`,
		id).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.MFASecret, &user.MFAEnabled, &user.CreatedAt, &user.UpdatedAt)
	
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *Repository) CreateSession(session *Session) error {
	_, err := r.db.Exec(`
		INSERT INTO sessions (id, user_id, refresh_token_hash, expires_at, revoked) 
		VALUES ($1, $2, $3, $4, $5)`,
		session.ID, session.UserID, session.RefreshTokenHash, session.ExpiresAt, session.Revoked)
	return err
}

func (r *Repository) GetSession(sessionID string) (*Session, error) {
	session := &Session{}
	err := r.db.QueryRow(`
		SELECT id, user_id, refresh_token_hash, expires_at, revoked, created_at, updated_at 
		FROM sessions WHERE id = $1`,
		sessionID).Scan(&session.ID, &session.UserID, &session.RefreshTokenHash, &session.ExpiresAt, &session.Revoked, &session.CreatedAt, &session.UpdatedAt)
	
	if err != nil {
		return nil, err
	}
	return session, nil
}

func (r *Repository) UpdateSession(session *Session) error {
	_, err := r.db.Exec(`
		UPDATE sessions SET refresh_token_hash = $2, expires_at = $3, revoked = $4, updated_at = NOW() 
		WHERE id = $1`,
		session.ID, session.RefreshTokenHash, session.ExpiresAt, session.Revoked)
	return err
}

func (r *Repository) RevokeSession(sessionID string) error {
	_, err := r.db.Exec(`UPDATE sessions SET revoked = true, updated_at = NOW() WHERE id = $1`, sessionID)
	return err
}

func (r *Repository) RevokeUserSessions(userID string) error {
	_, err := r.db.Exec(`UPDATE sessions SET revoked = true, updated_at = NOW() WHERE user_id = $1`, userID)
	return err
}

func (r *Repository) UpdateUserMFASecret(userID, secret string) error {
	_, err := r.db.Exec(`UPDATE users SET mfa_secret = $2, mfa_enabled = true, updated_at = NOW() WHERE id = $1`, userID, secret)
	return err
}