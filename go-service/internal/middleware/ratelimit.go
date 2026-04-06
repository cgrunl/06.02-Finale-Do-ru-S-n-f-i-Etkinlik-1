package middleware

import (
	"campusconnect-go/pkg/rfc7807"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// rateLimitEntry her bir IP için istek sayısını takip eder.
type rateLimitEntry struct {
	count    int
	resetAt  time.Time
}

// rateLimitStore IP bazlı rate limit verilerini saklar.
type rateLimitStore struct {
	mu      sync.RWMutex
	entries map[string]*rateLimitEntry
}

// newRateLimitStore yeni bir rate limit store oluşturur.
func newRateLimitStore() *rateLimitStore {
	store := &rateLimitStore{
		entries: make(map[string]*rateLimitEntry),
	}

	// Bellek temizleme goroutine'i: süresi geçmiş kayıtları temizler
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()

		for range ticker.C {
			store.mu.Lock()
			now := time.Now()
			for ip, entry := range store.entries {
				if now.After(entry.resetAt) {
					delete(store.entries, ip)
				}
			}
			store.mu.Unlock()
		}
	}()

	return store
}

// RateLimiter IP bazlı rate limiting middleware.
// requestsPerMinute: dakika başına izin verilen maksimum istek sayısı.
func RateLimiter(requestsPerMinute int) gin.HandlerFunc {
	store := newRateLimitStore()

	return func(c *gin.Context) {
		clientIP := c.ClientIP()

		store.mu.Lock()

		entry, exists := store.entries[clientIP]
		now := time.Now()

		if !exists || now.After(entry.resetAt) {
			// Yeni pencere başlat
			store.entries[clientIP] = &rateLimitEntry{
				count:   1,
				resetAt: now.Add(time.Minute),
			}
			store.mu.Unlock()
			c.Next()
			return
		}

		entry.count++
		currentCount := entry.count
		resetAt := entry.resetAt
		store.mu.Unlock()

		if currentCount > requestsPerMinute {
			remaining := time.Until(resetAt).Seconds()

			c.Header("X-RateLimit-Limit", intToStr(requestsPerMinute))
			c.Header("X-RateLimit-Remaining", "0")
			c.Header("Retry-After", intToStr(int(remaining)))

			rfc7807.Send(c, http.StatusTooManyRequests,
				"Too Many Requests",
				"İstek limiti aşıldı. Lütfen bir dakika sonra tekrar deneyin.",
			)
			c.Abort()
			return
		}

		c.Header("X-RateLimit-Limit", intToStr(requestsPerMinute))
		c.Header("X-RateLimit-Remaining", intToStr(requestsPerMinute-currentCount))

		c.Next()
	}
}

func intToStr(n int) string {
	return fmt.Sprintf("%d", n)
}
