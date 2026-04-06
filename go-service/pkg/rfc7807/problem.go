package rfc7807

import "github.com/gin-gonic/gin"

// ProblemDetail RFC 7807 standart hata formatı.
type ProblemDetail struct {
	Type     string `json:"type"`
	Title    string `json:"title"`
	Status   int    `json:"status"`
	Detail   string `json:"detail"`
	Instance string `json:"instance"`
}

// NewProblemDetail RFC 7807 uyumlu hata yanıtı oluşturur.
func NewProblemDetail(status int, title, detail, instance string) *ProblemDetail {
	return &ProblemDetail{
		Type:     getErrorType(status),
		Title:    title,
		Status:   status,
		Detail:   detail,
		Instance: instance,
	}
}

// Send hata yanıtını JSON olarak gönderir.
func Send(c *gin.Context, status int, title, detail string) {
	problem := NewProblemDetail(status, title, detail, c.Request.URL.Path)
	c.JSON(status, problem)
}

func getErrorType(status int) string {
	types := map[int]string{
		400: "https://campusconnect.api/errors/bad-request",
		401: "https://campusconnect.api/errors/unauthorized",
		403: "https://campusconnect.api/errors/forbidden",
		404: "https://campusconnect.api/errors/not-found",
		409: "https://campusconnect.api/errors/conflict",
		429: "https://campusconnect.api/errors/too-many-requests",
		500: "https://campusconnect.api/errors/internal-server-error",
	}

	if t, ok := types[status]; ok {
		return t
	}
	return "https://campusconnect.api/errors/unknown"
}
