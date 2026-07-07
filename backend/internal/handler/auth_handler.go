package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"apple-store-backend/internal/middleware"
	"apple-store-backend/internal/service"
	"apple-store-backend/internal/utils"
)

type AuthHandler struct {
	Auth   *service.AuthService
	IsProd bool
}

func NewAuthHandler(auth *service.AuthService, isProd bool) *AuthHandler {
	return &AuthHandler{Auth: auth, IsProd: isProd}
}

type registerRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type verifyEmailRequest struct {
	Email string `json:"email"`
	Code  string `json:"code"`
}

type resendCodeRequest struct {
	Email string `json:"email"`
}

type forgotPasswordRequest struct {
	Email string `json:"email"`
}

type verifyResetCodeRequest struct {
	Email string `json:"email"`
	Code  string `json:"code"`
}

type resetPasswordRequest struct {
	Email       string `json:"email"`
	ResetToken  string `json:"reset_token"`
	NewPassword string `json:"new_password"`
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	user, message, err := h.Auth.Register(req.Name, req.Email, req.Password)
	if err != nil {
		utils.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	utils.Success(w, http.StatusCreated, map[string]interface{}{
		"message": message,
		"email":   user.Email,
	})
}

func (h *AuthHandler) VerifyEmail(w http.ResponseWriter, r *http.Request) {
	var req verifyEmailRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Email == "" || req.Code == "" {
		utils.Error(w, http.StatusBadRequest, "email and code are required")
		return
	}

	user, token, err := h.Auth.VerifyEmail(req.Email, req.Code)
	if err != nil {
		status := http.StatusBadRequest
		if errors.Is(err, service.ErrInvalidCode) {
			status = http.StatusUnauthorized
		}
		utils.Error(w, status, err.Error())
		return
	}

	h.setAuthCookie(w, token)
	utils.Success(w, http.StatusOK, map[string]interface{}{
		"user":  user,
		"token": token,
	})
}

func (h *AuthHandler) ResendCode(w http.ResponseWriter, r *http.Request) {
	var req resendCodeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Email == "" {
		utils.Error(w, http.StatusBadRequest, "email is required")
		return
	}

	if err := h.Auth.ResendCode(req.Email); err != nil {
		utils.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	utils.Success(w, http.StatusOK, map[string]string{
		"message": "A new verification code has been sent to your email",
	})
}

func (h *AuthHandler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var req forgotPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Email == "" {
		utils.Error(w, http.StatusBadRequest, "email is required")
		return
	}

	message, err := h.Auth.ForgotPassword(req.Email)
	if err != nil {
		utils.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	utils.Success(w, http.StatusOK, map[string]string{"message": message})
}

func (h *AuthHandler) VerifyResetCode(w http.ResponseWriter, r *http.Request) {
	var req verifyResetCodeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Email == "" || req.Code == "" {
		utils.Error(w, http.StatusBadRequest, "email and code are required")
		return
	}

	resetToken, err := h.Auth.VerifyResetCode(req.Email, req.Code)
	if err != nil {
		status := http.StatusUnauthorized
		if !errors.Is(err, service.ErrInvalidResetCode) {
			status = http.StatusBadRequest
		}
		utils.Error(w, status, err.Error())
		return
	}

	utils.Success(w, http.StatusOK, map[string]string{
		"message":     "Code verified — enter your new password",
		"reset_token": resetToken,
	})
}

func (h *AuthHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req resetPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Email == "" || req.ResetToken == "" || req.NewPassword == "" {
		utils.Error(w, http.StatusBadRequest, "email, reset_token, and new_password are required")
		return
	}

	if err := h.Auth.ResetPassword(req.Email, req.ResetToken, req.NewPassword); err != nil {
		status := http.StatusBadRequest
		if errors.Is(err, service.ErrInvalidResetToken) {
			status = http.StatusUnauthorized
		}
		utils.Error(w, status, err.Error())
		return
	}

	utils.Success(w, http.StatusOK, map[string]string{
		"message": "Password reset successful — please sign in with your new password",
	})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	user, token, err := h.Auth.Login(req.Email, req.Password)
	if err != nil {
		status := http.StatusUnauthorized
		if errors.Is(err, service.ErrNotVerified) {
			status = http.StatusForbidden
		}
		utils.Error(w, status, err.Error())
		return
	}
	h.setAuthCookie(w, token)
	utils.Success(w, http.StatusOK, map[string]interface{}{
		"user":  user,
		"token": token,
	})
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	sameSite := http.SameSiteLaxMode
	if h.IsProd {
		sameSite = http.SameSiteNoneMode
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
		Secure:   h.IsProd,
		SameSite: sameSite,
	})
	utils.Success(w, http.StatusOK, map[string]string{"message": "logged out"})
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		utils.Error(w, http.StatusUnauthorized, "not authenticated")
		return
	}
	user, err := h.Auth.Users.FindByID(userID)
	if err != nil {
		utils.Error(w, http.StatusNotFound, "user not found")
		return
	}
	utils.Success(w, http.StatusOK, user)
}

func (h *AuthHandler) setAuthCookie(w http.ResponseWriter, token string) {
	sameSite := http.SameSiteLaxMode
	if h.IsProd {
		sameSite = http.SameSiteNoneMode
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    token,
		Path:     "/",
		MaxAge:   int((24 * time.Hour).Seconds()),
		HttpOnly: true,
		Secure:   h.IsProd,
		SameSite: sameSite,
	})
}
