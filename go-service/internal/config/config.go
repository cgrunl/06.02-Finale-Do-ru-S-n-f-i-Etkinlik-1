package config

import (
	"os"
	"strconv"
)

// Config uygulama konfigürasyonunu tutar.
type Config struct {
	Port          string
	DatabaseURL   string
	APIKey        string
	WebhookSecret string
	RateLimitRPM  int
}

// Load çevre değişkenlerinden konfigürasyon yükler.
func Load() *Config {
	rateLimitRPM := 60
	if val, err := strconv.Atoi(getEnv("RATE_LIMIT_RPM", "60")); err == nil {
		rateLimitRPM = val
	}

	return &Config{
		Port:          getEnv("PORT", "8080"),
		DatabaseURL:   getEnv("DATABASE_URL", "postgresql://campusconnect:campusconnect_secret@localhost:5432/campusconnect?sslmode=disable"),
		APIKey:        getEnv("API_KEY", "campusconnect_api_key_change_in_production"),
		WebhookSecret: getEnv("WEBHOOK_SECRET", "webhook_shared_secret_key"),
		RateLimitRPM:  rateLimitRPM,
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
