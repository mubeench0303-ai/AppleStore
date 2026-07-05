package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"apple-store-backend/internal/models"
	"apple-store-backend/internal/repository"
	"apple-store-backend/internal/service"
	"apple-store-backend/internal/utils"

	"github.com/go-chi/chi/v5"
)

type ProductHandler struct {
	Products *service.ProductService
}

func NewProductHandler(p *service.ProductService) *ProductHandler {
	return &ProductHandler{Products: p}
}

func (h *ProductHandler) List(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	page, _ := strconv.Atoi(q.Get("page"))
	pageSize, _ := strconv.Atoi(q.Get("page_size"))
	catID, _ := strconv.Atoi(q.Get("category_id"))
	minPrice, _ := strconv.ParseFloat(q.Get("min_price"), 64)
	maxPrice, _ := strconv.ParseFloat(q.Get("max_price"), 64)

	search := q.Get("search")
	if search == "" {
		search = q.Get("q")
	}

	filter := repository.ProductFilter{
		Search:     search,
		CategoryID: uint(catID),
		MinPrice:   minPrice,
		MaxPrice:   maxPrice,
		SortBy:     q.Get("sort"),
		Page:       page,
		PageSize:   pageSize,
		ActiveOnly: true,
	}

	products, total, err := h.Products.List(filter)
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, "failed to load products")
		return
	}
	if products == nil {
		products = []models.Product{}
	}
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.PageSize < 1 {
		filter.PageSize = 12
	}
	utils.SuccessWithMeta(w, http.StatusOK, products, map[string]interface{}{
		"total":     total,
		"page":      filter.Page,
		"page_size": filter.PageSize,
		"pages":     (total + filter.PageSize - 1) / filter.PageSize,
	})
}

func (h *ProductHandler) GetBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	product, related, err := h.Products.GetBySlug(slug)
	if err != nil {
		utils.Error(w, http.StatusNotFound, "product not found")
		return
	}
	utils.Success(w, http.StatusOK, map[string]interface{}{
		"product": product,
		"related": related,
	})
}

// --- Admin endpoints ---

func (h *ProductHandler) AdminList(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	page, _ := strconv.Atoi(q.Get("page"))
	pageSize, _ := strconv.Atoi(q.Get("page_size"))
	products, total, err := h.Products.List(repository.ProductFilter{Page: page, PageSize: pageSize, ActiveOnly: false})
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, "failed to load products")
		return
	}
	utils.SuccessWithMeta(w, http.StatusOK, products, map[string]interface{}{"total": total})
}

func (h *ProductHandler) Create(w http.ResponseWriter, r *http.Request) {
	var p models.Product
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	p.IsActive = true
	id, err := h.Products.Create(&p)
	if err != nil {
		utils.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	p.ID = id
	utils.Success(w, http.StatusCreated, p)
}

type updateProductRequest struct {
	Name          string  `json:"name"`
	Description   string  `json:"description"`
	Price         float64 `json:"price"`
	StockQuantity int     `json:"stock_quantity"`
	CategoryID    uint    `json:"category_id"`
	ImageURL      string  `json:"image_url"`
	ModelVariant  string  `json:"model_variant"`
	IsActive      *bool   `json:"is_active"`
}

func (h *ProductHandler) Update(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid product id")
		return
	}
	var req updateProductRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	product, err := h.Products.Update(uint(id), service.ProductUpdateInput{
		Name:          req.Name,
		Description:   req.Description,
		Price:         req.Price,
		StockQuantity: req.StockQuantity,
		CategoryID:    req.CategoryID,
		ImageURL:      req.ImageURL,
		ModelVariant:  req.ModelVariant,
		IsActive:      req.IsActive,
	})
	if err != nil {
		utils.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	utils.Success(w, http.StatusOK, product)
}

func (h *ProductHandler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid product id")
		return
	}
	if err := h.Products.Delete(uint(id)); err != nil {
		utils.Error(w, http.StatusInternalServerError, "failed to delete product")
		return
	}
	utils.Success(w, http.StatusOK, map[string]string{"message": "product deleted"})
}
