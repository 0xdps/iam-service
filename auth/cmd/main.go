package main

import (
	"auth-service/internal/config"
	"auth-service/internal/database"
	"auth-service/internal/handlers"
	"auth-service/internal/middleware"
	"auth-service/internal/redis"
	"auth-service/internal/services"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Initialize Redis
	redisClient := redis.NewClient(cfg.RedisURL)
	defer redisClient.Close()

	// Initialize services
	authService := services.NewAuthService(db, redisClient, cfg.JWTSecret)
	eventService := services.NewEventService(redisClient)

	// Start event consumer
	go eventService.StartConsumer()

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)

	// Setup router
	router := gin.Default()
	
	// Middleware
	router.Use(middleware.CORS())
	router.Use(middleware.RateLimiter())

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "healthy"})
	})

	// API routes
	api := router.Group("/api/auth")
	{
		api.POST("/login", authHandler.Login)
		api.POST("/refresh", authHandler.RefreshToken)
		api.POST("/logout", middleware.AuthRequired(cfg.JWTSecret), authHandler.Logout)
		api.POST("/introspect", middleware.AuthRequired(cfg.JWTSecret), authHandler.Introspect)
		api.POST("/mfa/setup", middleware.AuthRequired(cfg.JWTSecret), authHandler.SetupMFA)
		api.POST("/mfa/verify", authHandler.VerifyMFA)
	}

	log.Printf("Auth service starting on port %s", cfg.Port)
	router.Run(":" + cfg.Port)
}