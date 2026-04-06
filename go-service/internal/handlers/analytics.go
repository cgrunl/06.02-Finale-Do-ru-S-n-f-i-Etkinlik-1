package handlers

import (
	"campusconnect-go/internal/models"
	"campusconnect-go/pkg/rfc7807"
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

// AnalyticsHandler analitik endpoint'lerini işler.
type AnalyticsHandler struct {
	db *sql.DB
}

// NewAnalyticsHandler yeni bir AnalyticsHandler oluşturur.
func NewAnalyticsHandler(db *sql.DB) *AnalyticsHandler {
	return &AnalyticsHandler{db: db}
}

// GetPopularEvents en popüler etkinlikleri (en çok katılımcı) getirir.
// GET /api/v1/analytics/popular
func (h *AnalyticsHandler) GetPopularEvents(c *gin.Context) {
	query := `
		SELECT 
			e.id, e.title, e.category, e.city, e.event_date,
			COUNT(ep.id) AS participant_count
		FROM events e
		LEFT JOIN event_participants ep ON e.id = ep.event_id
		GROUP BY e.id, e.title, e.category, e.city, e.event_date
		ORDER BY participant_count DESC
		LIMIT 10
	`

	rows, err := h.db.Query(query)
	if err != nil {
		rfc7807.Send(c, http.StatusInternalServerError, "Internal Server Error", "Veritabanı sorgu hatası: "+err.Error())
		return
	}
	defer rows.Close()

	var events []models.PopularEvent
	for rows.Next() {
		var event models.PopularEvent
		if err := rows.Scan(
			&event.ID, &event.Title, &event.Category,
			&event.City, &event.EventDate, &event.ParticipantCount,
		); err != nil {
			rfc7807.Send(c, http.StatusInternalServerError, "Internal Server Error", "Veri okuma hatası: "+err.Error())
			return
		}
		events = append(events, event)
	}

	if events == nil {
		events = []models.PopularEvent{}
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    events,
		"message": "En popüler etkinlikler başarıyla getirildi.",
	})
}

// GetCategoryStats kategori bazlı etkinlik ve katılımcı istatistiklerini getirir.
// GET /api/v1/analytics/categories
func (h *AnalyticsHandler) GetCategoryStats(c *gin.Context) {
	query := `
		SELECT 
			e.category,
			COUNT(DISTINCT e.id) AS event_count,
			COUNT(ep.id) AS total_participants
		FROM events e
		LEFT JOIN event_participants ep ON e.id = ep.event_id
		GROUP BY e.category
		ORDER BY event_count DESC
	`

	rows, err := h.db.Query(query)
	if err != nil {
		rfc7807.Send(c, http.StatusInternalServerError, "Internal Server Error", "Veritabanı sorgu hatası: "+err.Error())
		return
	}
	defer rows.Close()

	var stats []models.CategoryStats
	for rows.Next() {
		var stat models.CategoryStats
		if err := rows.Scan(&stat.Category, &stat.EventCount, &stat.TotalParticipants); err != nil {
			rfc7807.Send(c, http.StatusInternalServerError, "Internal Server Error", "Veri okuma hatası: "+err.Error())
			return
		}
		stats = append(stats, stat)
	}

	if stats == nil {
		stats = []models.CategoryStats{}
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    stats,
		"message": "Kategori bazlı istatistikler başarıyla getirildi.",
	})
}

// GetWeeklyStats haftalık etkinlik ve yeni kullanıcı istatistiklerini getirir.
// GET /api/v1/analytics/weekly
func (h *AnalyticsHandler) GetWeeklyStats(c *gin.Context) {
	query := `
		SELECT 
			TO_CHAR(DATE_TRUNC('week', e.created_at), 'YYYY-MM-DD') AS week,
			COUNT(DISTINCT e.id) AS event_count,
			COALESCE(
				(SELECT COUNT(DISTINCT u.id) 
				 FROM users u 
				 WHERE DATE_TRUNC('week', u.created_at) = DATE_TRUNC('week', e.created_at)
				), 0
			) AS new_users
		FROM events e
		GROUP BY DATE_TRUNC('week', e.created_at)
		ORDER BY week DESC
		LIMIT 12
	`

	rows, err := h.db.Query(query)
	if err != nil {
		rfc7807.Send(c, http.StatusInternalServerError, "Internal Server Error", "Veritabanı sorgu hatası: "+err.Error())
		return
	}
	defer rows.Close()

	var stats []models.WeeklyStats
	for rows.Next() {
		var stat models.WeeklyStats
		if err := rows.Scan(&stat.Week, &stat.EventCount, &stat.NewUsers); err != nil {
			rfc7807.Send(c, http.StatusInternalServerError, "Internal Server Error", "Veri okuma hatası: "+err.Error())
			return
		}
		stats = append(stats, stat)
	}

	if stats == nil {
		stats = []models.WeeklyStats{}
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    stats,
		"message": "Haftalık istatistikler başarıyla getirildi.",
	})
}
