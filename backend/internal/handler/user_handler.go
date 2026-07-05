package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"apple-store-backend/internal/middleware"
	"apple-store-backend/internal/repository"
	"apple-store-backend/internal/service"
	"apple-store-backend/internal/utils"
)

type UserHandler struct {
	Users *repository.UserRepository
	Auth  *service.AuthService
}

func NewUserHandler(u *repository.UserRepository, auth *service.AuthService) *UserHandler {
	return &UserHandler{Users: u, Auth: auth}
}

type updateProfileRequest struct {
	Name string `json:"name"`
}

func (h *UserHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID, _ := middleware.GetUserID(r)
	var req updateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Name == "" {
		utils.Error(w, http.StatusBadRequest, "name is required")
		return
	}
	if err := h.Users.UpdateProfile(userID, req.Name); err != nil {
		utils.Error(w, http.StatusInternalServerError, "failed to update profile")
		return
	}
	user, err := h.Users.FindByID(userID)
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, "failed to load profile")
		return
	}
	utils.Success(w, http.StatusOK, user)
}

type changePasswordRequest struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

func (h *UserHandler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		utils.Error(w, http.StatusUnauthorized, "not authenticated")
		return
	}

	var req changePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.CurrentPassword == "" || req.NewPassword == "" {
		utils.Error(w, http.StatusBadRequest, "current_password and new_password are required")
		return
	}

	if err := h.Auth.ChangePassword(userID, req.CurrentPassword, req.NewPassword); err != nil {
		if errors.Is(err, service.ErrWrongPassword) {
			utils.Error(w, http.StatusUnauthorized, err.Error())
			return
		}
		utils.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	utils.Success(w, http.StatusOK, map[string]string{"message": "password updated successfully"})
}
