package handler

import (
	"fmt"
	"net/http"
	"runtime"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

var startTime = time.Now()

type HealthHandler struct {
	db *pgxpool.Pool
}

func NewHealthHandler(db *pgxpool.Pool) *HealthHandler {
	return &HealthHandler{db: db}
}

type HealthResponse struct {
	Status   string            `json:"status"`
	Version  string            `json:"version"`
	Uptime   string            `json:"uptime"`
	Services map[string]string `json:"services"`
	Memory   string            `json:"memory"`
}

// Health godoc
// @Summary Health check
// @Description Check if the service is running
// @Tags health
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /api/health [get]
func (h *HealthHandler) Health(c *gin.Context) {
	resp := HealthResponse{
		Status:   "ok",
		Version:  "1.0.0",
		Uptime:   getUptime(),
		Services: make(map[string]string),
		Memory:   getMemoryUsage(),
	}

	// Check database
	if h.db == nil {
		resp.Status = "degraded"
		resp.Services["database"] = "not configured"
	} else if err := h.db.Ping(c.Request.Context()); err != nil {
		resp.Status = "degraded"
		resp.Services["database"] = fmt.Sprintf("error: %v", err)
	} else {
		resp.Services["database"] = "ok"
	}

	if resp.Status == "ok" {
		c.JSON(http.StatusOK, resp)
	} else {
		c.JSON(http.StatusServiceUnavailable, resp)
	}
}

func getUptime() string {
	return time.Since(startTime).Round(time.Second).String()
}

func getMemoryUsage() string {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	return fmt.Sprintf("%.2f MB", float64(m.Alloc)/1024/1024)
}