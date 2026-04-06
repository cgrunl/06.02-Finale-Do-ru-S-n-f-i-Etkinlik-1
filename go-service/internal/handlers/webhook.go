package handlers

import (
	"campusconnect-go/internal/models"
	"campusconnect-go/pkg/rfc7807"
	"crypto/hmac"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// WebhookHandler webhook isteklerini işler.
type WebhookHandler struct {
	db            *sql.DB
	webhookSecret string
}

// NewWebhookHandler yeni bir WebhookHandler oluşturur.
func NewWebhookHandler(db *sql.DB, webhookSecret string) *WebhookHandler {
	return &WebhookHandler{
		db:            db,
		webhookSecret: webhookSecret,
	}
}

// HandleEventWebhook NestJS'ten gelen event.created webhook'unu işler.
// - Signature doğrulama (HMAC-SHA256)
// - Goroutine ile asenkron DB ve log yazma
func (h *WebhookHandler) HandleEventWebhook(c *gin.Context) {
	// Body'yi oku
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		rfc7807.Send(c, http.StatusBadRequest, "Bad Request", "Request body okunamadı.")
		return
	}

	// Signature doğrulama
	signature := c.GetHeader("X-Webhook-Signature")
	if signature == "" {
		rfc7807.Send(c, http.StatusUnauthorized, "Unauthorized", "X-Webhook-Signature header'ı eksik.")
		return
	}

	if !h.verifySignature(body, signature) {
		rfc7807.Send(c, http.StatusUnauthorized, "Unauthorized", "Webhook imzası geçersiz.")
		return
	}

	// Payload'ı parse et
	var payload models.WebhookPayload
	if err := json.Unmarshal(body, &payload); err != nil {
		rfc7807.Send(c, http.StatusBadRequest, "Bad Request", "Geçersiz JSON formatı.")
		return
	}

	clientIP := c.ClientIP()

	// Goroutine ile asenkron DB yazma ve loglama (Bonus B)
	go h.processWebhookAsync(payload, signature, clientIP, body)

	// Hemen 202 Accepted döner
	c.JSON(http.StatusAccepted, gin.H{
		"message":   "Webhook başarıyla alındı ve işleniyor.",
		"eventType": payload.EventType,
		"eventId":   payload.Data.ID,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})
}

// processWebhookAsync goroutine ile asenkron olarak webhook'u DB'ye yazar ve loglar.
func (h *WebhookHandler) processWebhookAsync(payload models.WebhookPayload, signature, clientIP string, rawBody []byte) {
	log.Printf("📨 [WEBHOOK] İşleniyor: eventType=%s, eventId=%s, title=%s",
		payload.EventType, payload.Data.ID, payload.Data.Title)

	// DB'ye yaz
	_, err := h.db.Exec(`
		INSERT INTO webhook_logs (event_id, event_title, payload, signature, status, ip_address)
		VALUES ($1, $2, $3, $4, $5, $6)
	`,
		payload.Data.ID,
		payload.Data.Title,
		string(rawBody),
		signature,
		"processed",
		clientIP,
	)

	if err != nil {
		log.Printf("❌ [WEBHOOK] DB yazma hatası: %v", err)
		return
	}

	log.Printf("✅ [WEBHOOK] Başarıyla işlendi ve DB'ye kaydedildi: eventId=%s", payload.Data.ID)
}

// verifySignature HMAC-SHA256 imzasını doğrular.
func (h *WebhookHandler) verifySignature(body []byte, signature string) bool {
	mac := hmac.New(sha256.New, []byte(h.webhookSecret))
	mac.Write(body)
	expectedSignature := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expectedSignature), []byte(signature))
}
