package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"apple-store-backend/internal/middleware"
	"apple-store-backend/internal/models"
	"apple-store-backend/internal/repository"
	"apple-store-backend/internal/utils"

	"github.com/go-chi/chi/v5"
)

type AddressHandler struct {
	Addresses *repository.AddressRepository
}

func NewAddressHandler(a *repository.AddressRepository) *AddressHandler {
	return &AddressHandler{Addresses: a}
}

func (h *AddressHandler) List(w http.ResponseWriter, r *http.Request) {
	userID, _ := middleware.GetUserID(r)
	addresses, err := h.Addresses.FindByUser(userID)
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, "failed to load addresses")
		return
	}
	if addresses == nil {
		addresses = []models.Address{}
	}
	utils.Success(w, http.StatusOK, addresses)
}

func (h *AddressHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID, _ := middleware.GetUserID(r)
	var a models.Address
	if err := json.NewDecoder(r.Body).Decode(&a); err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	a.UserID = userID // never trust client-supplied user id
	id, err := h.Addresses.Create(&a)
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, "failed to save address")
		return
	}
	a.ID = id
	utils.Success(w, http.StatusCreated, a)
}

func (h *AddressHandler) Update(w http.ResponseWriter, r *http.Request) {
	userID, _ := middleware.GetUserID(r)
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid address id")
		return
	}
	var a models.Address
	if err := json.NewDecoder(r.Body).Decode(&a); err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	a.ID = uint(id)
	a.UserID = userID
	if err := h.Addresses.Update(&a); err != nil {
		utils.Error(w, http.StatusInternalServerError, "failed to update address")
		return
	}
	utils.Success(w, http.StatusOK, a)
}

func (h *AddressHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID, _ := middleware.GetUserID(r)
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid address id")
		return
	}
	if err := h.Addresses.Delete(uint(id), userID); err != nil {
		utils.Error(w, http.StatusInternalServerError, "failed to delete address")
		return
	}
	utils.Success(w, http.StatusOK, map[string]string{"message": "address deleted"})
}
