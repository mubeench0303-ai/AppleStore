package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"apple-store-backend/internal/middleware"
	"apple-store-backend/internal/service"
	"apple-store-backend/internal/utils"

	"github.com/go-chi/chi/v5"
)

type ReviewHandler struct {
	Reviews *service.ReviewService
}

func NewReviewHandler(reviews *service.ReviewService) *ReviewHandler {
	return &ReviewHandler{Reviews: reviews}
}

func (h *ReviewHandler) ListByProduct(w http.ResponseWriter, r *http.Request) {
	productID, err := strconv.Atoi(chi.URLParam(r, "productId"))
	if err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid product id")
		return
	}
	reviews, err := h.Reviews.ListByProduct(uint(productID))
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, "failed to load reviews")
		return
	}
	utils.Success(w, http.StatusOK, reviews)
}

type createReviewRequest struct {
	ProductID uint   `json:"product_id"`
	OrderID   uint   `json:"order_id"`
	Rating    int    `json:"rating"`
	Comment   string `json:"comment"`
}

func (h *ReviewHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID, _ := middleware.GetUserID(r)
	var req createReviewRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	review, err := h.Reviews.Create(userID, req.ProductID, req.OrderID, req.Rating, req.Comment)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrReviewNotEligible):
			utils.Error(w, http.StatusForbidden, err.Error())
		case errors.Is(err, service.ErrReviewAlreadyExists):
			utils.Error(w, http.StatusConflict, err.Error())
		default:
			utils.Error(w, http.StatusBadRequest, err.Error())
		}
		return
	}

	utils.Success(w, http.StatusCreated, review)
}
