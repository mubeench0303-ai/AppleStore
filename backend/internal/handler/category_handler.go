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

type CategoryHandler struct {
	Categories *repository.CategoryRepository
}

func NewCategoryHandler(c *repository.CategoryRepository) *CategoryHandler {
	return &CategoryHandler{Categories: c}
}

func (h *CategoryHandler) List(w http.ResponseWriter, r *http.Request) {
	cats, err := h.Categories.FindAll()
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, "failed to load categories")
		return
	}
	if cats == nil {
		cats = []models.Category{}
	}
	utils.Success(w, http.StatusOK, cats)
}

func (h *CategoryHandler) Create(w http.ResponseWriter, r *http.Request) {
	var c models.Category
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if c.Name == "" {
		utils.Error(w, http.StatusBadRequest, "category name is required")
		return
	}
	if c.Slug == "" {
		c.Slug = service.Slugify(c.Name)
	}
	id, err := h.Categories.Create(&c)
	if err != nil {
		utils.Error(w, http.StatusBadRequest, "failed to create category (slug may already exist)")
		return
	}
	c.ID = id
	utils.Success(w, http.StatusCreated, c)
}

func (h *CategoryHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid category id")
		return
	}
	var c models.Category
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if c.Slug == "" {
		c.Slug = service.Slugify(c.Name)
	}
	if err := h.Categories.Update(uint(id), c.Name, c.Slug); err != nil {
		utils.Error(w, http.StatusBadRequest, "failed to update category")
		return
	}
	utils.Success(w, http.StatusOK, map[string]string{"message": "category updated"})
}

func (h *CategoryHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid category id")
		return
	}
	if err := h.Categories.Delete(uint(id)); err != nil {
		utils.Error(w, http.StatusInternalServerError, "failed to delete category")
		return
	}
	utils.Success(w, http.StatusOK, map[string]string{"message": "category deleted"})
}
