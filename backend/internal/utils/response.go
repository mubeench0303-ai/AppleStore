package utils

import (
	"encoding/json"
	"net/http"
)

// APIResponse is the consistent JSON envelope returned by every endpoint.
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Meta    interface{} `json:"meta,omitempty"`
}

func JSON(w http.ResponseWriter, status int, payload APIResponse) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func Success(w http.ResponseWriter, status int, data interface{}) {
	JSON(w, status, APIResponse{Success: true, Data: data})
}

func SuccessWithMeta(w http.ResponseWriter, status int, data interface{}, meta interface{}) {
	JSON(w, status, APIResponse{Success: true, Data: data, Meta: meta})
}

func Error(w http.ResponseWriter, status int, message string) {
	JSON(w, status, APIResponse{Success: false, Error: message})
}
