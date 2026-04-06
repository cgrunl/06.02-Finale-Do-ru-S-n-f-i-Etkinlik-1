package models

import "time"

// WebhookPayload NestJS'ten gelen webhook verisi.
type WebhookPayload struct {
	EventType string               `json:"eventType"`
	Timestamp string               `json:"timestamp"`
	Data      WebhookEventData     `json:"data"`
}

// WebhookEventData etkinlik verisi.
type WebhookEventData struct {
	ID              string    `json:"id"`
	Title           string    `json:"title"`
	Category        string    `json:"category"`
	City            string    `json:"city"`
	EventDate       time.Time `json:"eventDate"`
	OrganizerID     string    `json:"organizerId"`
	MaxParticipants int       `json:"maxParticipants"`
}

// PopularEvent popüler etkinlik analitik verisi.
type PopularEvent struct {
	ID               string    `json:"id"`
	Title            string    `json:"title"`
	Category         string    `json:"category"`
	City             string    `json:"city"`
	EventDate        time.Time `json:"eventDate"`
	ParticipantCount int       `json:"participantCount"`
}

// CategoryStats kategori bazlı analitik verisi.
type CategoryStats struct {
	Category   string `json:"category"`
	EventCount int    `json:"eventCount"`
	TotalParticipants int `json:"totalParticipants"`
}

// WeeklyStats haftalık analitik verisi.
type WeeklyStats struct {
	Week       string `json:"week"`
	EventCount int    `json:"eventCount"`
	NewUsers   int    `json:"newUsers"`
}
