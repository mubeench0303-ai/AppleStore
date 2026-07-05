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

type ReviewHandler struct {
	Reviews *repository.ReviewRepository
}

func NewReviewHandler(r *repository.ReviewRepository) *ReviewHandler {
	return &ReviewHandler{Reviews: r}
}

func (h *ReviewHandler) ListByProduct(w http.ResponseWriter, r *http.Request) {
	productID, err := strconv.Atoi(chi.URLParam(r, "productId"))
	if err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid product id")
		return
	}
	reviews, err := h.Reviews.FindByProduct(uint(productID))
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, "failed to load reviews")
		return
	}
	if reviews == nil {
		reviews = []models.Review{}
	}
	utils.Success(w, http.StatusOK, reviews)
}

type createReviewRequest struct {
	ProductID uint   `json:"product_id"`
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
	if req.Rating < 1 || req.Rating > 5 {
		utils.Error(w, http.StatusBadRequest, "rating must be between 1 and 5")
		return
	}
	review := &models.Review{ProductID: req.ProductID, UserID: userID, Rating: req.Rating, Comment: req.Comment}
	id, err := h.Reviews.Create(review)
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, "failed to save review")
		return
	}
	review.ID = id
	utils.Success(w, http.StatusCreated, review)
}
