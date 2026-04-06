package middleware

import (
	"campusconnect-go/pkg/rfc7807"
	"net/http"

	"github.com/gin-gonic/gin"
)

// APIKeyAuth X-API-Key header'ını doğrulayan middleware.
// Tüm Go endpoint'leri bu middleware ile korunur.
func APIKeyAuth(validAPIKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := c.GetHeader("X-API-Key")

		if apiKey == "" {
			rfc7807.Send(c, http.StatusUnauthorized,
				"Unauthorized",
				"X-API-Key header'ı eksik. Lütfen geçerli bir API anahtarı gönderin.",
			)
			c.Abort()
			return
		}

		if apiKey != validAPIKey {
			rfc7807.Send(c, http.StatusUnauthorized,
				"Unauthorized",
				"Geçersiz API anahtarı.",
			)
			c.Abort()
			return
		}

		c.Next()
	}
}
