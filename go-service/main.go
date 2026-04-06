package main

import (
	"campusconnect-go/internal/config"
	"campusconnect-go/internal/database"
	"campusconnect-go/internal/handlers"
	"campusconnect-go/internal/middleware"
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// Konfigürasyon yükle
	cfg := config.Load()

	// Veritabanı bağlantısı
	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("❌ Veritabanı bağlantısı kurulamadı: %v", err)
	}
	defer db.Close()
	log.Println("✅ PostgreSQL veritabanı bağlantısı kuruldu")

	// Gin router
	router := gin.Default()

	// API v1 group
	v1 := router.Group("/api/v1")

	// Middleware Chain: API Key + Rate Limit
	v1.Use(middleware.APIKeyAuth(cfg.APIKey))
	v1.Use(middleware.RateLimiter(cfg.RateLimitRPM))

	// ---- Webhook Handler ----
	webhookHandler := handlers.NewWebhookHandler(db, cfg.WebhookSecret)
	v1.POST("/webhooks/events", webhookHandler.HandleEventWebhook)

	// ---- Analytics Handlers ----
	analyticsHandler := handlers.NewAnalyticsHandler(db)
	analytics := v1.Group("/analytics")
	{
		analytics.GET("/popular", analyticsHandler.GetPopularEvents)
		analytics.GET("/categories", analyticsHandler.GetCategoryStats)
		analytics.GET("/weekly", analyticsHandler.GetWeeklyStats)
	}

	// Health check (middleware dışında)
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "campusconnect-go"})
	})

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("🚀 CampusConnect Go servisi http://localhost%s adresinde çalışıyor", addr)

	if err := router.Run(addr); err != nil {
		log.Fatalf("❌ Sunucu başlatılamadı: %v", err)
	}
}
