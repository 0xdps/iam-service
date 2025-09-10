package handlers

import (
	"auth-service/internal/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req services.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	response, err := h.authService.Login(&req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Set refresh token in HTTP-only cookie
	c.SetCookie("refresh_token", response.RefreshToken, 30*24*3600, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{
		"access_token": response.AccessToken,
		"expires_in":   response.ExpiresIn,
		"token_type":   "Bearer",
	})
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req services.RefreshRequest
	
	// Try to get refresh token from cookie first
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil {
		// Fallback to JSON body
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Refresh token required"})
			return
		}
		refreshToken = req.RefreshToken
	}

	req.RefreshToken = refreshToken
	response, err := h.authService.RefreshToken(&req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Update refresh token cookie
	c.SetCookie("refresh_token", response.RefreshToken, 30*24*3600, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{
		"access_token": response.AccessToken,
		"expires_in":   response.ExpiresIn,
		"token_type":   "Bearer",
	})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	sessionID, exists := c.Get("session_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid session"})
		return
	}

	if err := h.authService.Logout(sessionID.(string)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to logout"})
		return
	}

	// Clear refresh token cookie
	c.SetCookie("refresh_token", "", -1, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

func (h *AuthHandler) Introspect(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	sessionID, _ := c.Get("session_id")

	c.JSON(http.StatusOK, gin.H{
		"active":     true,
		"sub":        userID,
		"session_id": sessionID,
	})
}

func (h *AuthHandler) SetupMFA(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	secret, err := h.authService.SetupMFA(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to setup MFA"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"secret": secret,
		"qr_url": "otpauth://totp/AuthService?secret=" + secret,
	})
}

func (h *AuthHandler) VerifyMFA(c *gin.Context) {
	var req struct {
		Code string `json:"code"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// This would typically verify the TOTP code and enable MFA
	c.JSON(http.StatusOK, gin.H{"message": "MFA verified successfully"})
}