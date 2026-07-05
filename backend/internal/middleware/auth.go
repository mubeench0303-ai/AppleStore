package middleware

import (
	"context"
	"net/http"
	"strings"

	"apple-store-backend/internal/utils"
)

type contextKey string

const (
	UserIDKey contextKey = "user_id"
	RoleKey   contextKey = "role"
)

// Auth validates the JWT (from cookie "access_token" or Authorization header)
// and injects user_id/role into the request context. It NEVER trusts a
// user id supplied in the request body.
func Auth(jwtSecret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token := extractToken(r)
			if token == "" {
				utils.Error(w, http.StatusUnauthorized, "authentication required")
				return
			}
			claims, err := utils.ParseToken(token, jwtSecret)
			if err != nil {
				utils.Error(w, http.StatusUnauthorized, "invalid or expired session")
				return
			}
			ctx := context.WithValue(r.Context(), UserIDKey, claims.UserID)
			ctx = context.WithValue(ctx, RoleKey, claims.Role)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// AdminOnly must be chained after Auth. Enforces role-based access server-side.
func AdminOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		role, ok := r.Context().Value(RoleKey).(string)
		if !ok || role != "admin" {
			utils.Error(w, http.StatusForbidden, "admin access required")
			return
		}
		next.ServeHTTP(w, r)
	})
}

func extractToken(r *http.Request) string {
	if cookie, err := r.Cookie("access_token"); err == nil && cookie.Value != "" {
		return cookie.Value
	}
	header := r.Header.Get("Authorization")
	if strings.HasPrefix(header, "Bearer ") {
		return strings.TrimPrefix(header, "Bearer ")
	}
	return ""
}

func GetUserID(r *http.Request) (uint, bool) {
	id, ok := r.Context().Value(UserIDKey).(uint)
	return id, ok
}

func GetRole(r *http.Request) (string, bool) {
	role, ok := r.Context().Value(RoleKey).(string)
	return role, ok
}
