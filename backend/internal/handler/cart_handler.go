package handler

import (
	"encoding/json"
	"net/http"

	"apple-store-backend/internal/middleware"
	"apple-store-backend/internal/service"
	"apple-store-backend/internal/utils"
)

type CartHandler struct {
	Cart *service.CartService
}

func NewCartHandler(c *service.CartService) *CartHandler {
	return &CartHandler{Cart: c}
}

type addCartItemRequest struct {
	ProductID uint `json:"product_id"`
	Quantity  int  `json:"quantity"`
}

func (h *CartHandler) Get(w http.ResponseWriter, r *http.Request) {
	userID, _ := middleware.GetUserID(r)
	cart, err := h.Cart.GetCart(userID)
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, "failed to load cart")
		return
	}
	utils.Success(w, http.StatusOK, cart)
}

func (h *CartHandler) AddItem(w http.ResponseWriter, r *http.Request) {
	userID, _ := middleware.GetUserID(r)
	var req addCartItemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	cart, err := h.Cart.AddItem(userID, req.ProductID, req.Quantity)
	if err != nil {
		utils.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	utils.Success(w, http.StatusOK, cart)
}

func (h *CartHandler) UpdateItem(w http.ResponseWriter, r *http.Request) {
	userID, _ := middleware.GetUserID(r)
	var req addCartItemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	cart, err := h.Cart.UpdateItem(userID, req.ProductID, req.Quantity)
	if err != nil {
		utils.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	utils.Success(w, http.StatusOK, cart)
}

func (h *CartHandler) RemoveItem(w http.ResponseWriter, r *http.Request) {
	userID, _ := middleware.GetUserID(r)
	var req addCartItemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	cart, err := h.Cart.RemoveItem(userID, req.ProductID)
	if err != nil {
		utils.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	utils.Success(w, http.StatusOK, cart)
}
