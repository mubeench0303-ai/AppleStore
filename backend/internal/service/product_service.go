package service

import (
	"errors"
	"regexp"
	"strings"

	"apple-store-backend/internal/models"
	"apple-store-backend/internal/repository"
)

type ProductService struct {
	Products   *repository.ProductRepository
	Categories *repository.CategoryRepository
}

func NewProductService(p *repository.ProductRepository, c *repository.CategoryRepository) *ProductService {
	return &ProductService{Products: p, Categories: c}
}

var nonAlnum = regexp.MustCompile(`[^a-z0-9]+`)

func Slugify(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	s = nonAlnum.ReplaceAllString(s, "-")
	return strings.Trim(s, "-")
}

func (s *ProductService) List(f repository.ProductFilter) ([]models.Product, int, error) {
	return s.Products.FindAll(f)
}

func (s *ProductService) GetBySlug(slug string) (*models.Product, []models.Product, error) {
	p, err := s.Products.FindBySlug(slug)
	if err != nil {
		return nil, nil, errors.New("product not found")
	}
	related, _ := s.Products.FindRelated(p.CategoryID, p.ID, 4)
	return p, related, nil
}

func (s *ProductService) FindByID(id uint) (*models.Product, error) {
	return s.Products.FindByID(id)
}

type ProductUpdateInput struct {
	Name          string
	Description   string
	Price         float64
	StockQuantity int
	CategoryID    uint
	ImageURL      string
	ModelVariant  string
	IsActive      *bool
}

func (s *ProductService) Create(p *models.Product) (uint, error) {
	if strings.TrimSpace(p.Name) == "" {
		return 0, errors.New("product name is required")
	}
	if p.Price <= 0 {
		return 0, errors.New("price must be greater than zero")
	}
	if p.Slug == "" {
		p.Slug = Slugify(p.Name)
	}
	return s.Products.Create(p)
}

func (s *ProductService) Update(id uint, input ProductUpdateInput) (*models.Product, error) {
	if id == 0 {
		return nil, errors.New("product id is required")
	}

	existing, err := s.Products.FindByID(id)
	if err != nil {
		return nil, errors.New("product not found")
	}

	p := *existing
	p.Name = input.Name
	p.Description = input.Description
	p.Price = input.Price
	p.StockQuantity = input.StockQuantity
	p.CategoryID = input.CategoryID
	p.ImageURL = input.ImageURL
	p.ModelVariant = input.ModelVariant
	if input.IsActive != nil {
		p.IsActive = *input.IsActive
	}

	if strings.TrimSpace(p.Name) == "" {
		return nil, errors.New("product name is required")
	}
	if p.Price <= 0 {
		return nil, errors.New("price must be greater than zero")
	}
	if p.CategoryID == 0 {
		return nil, errors.New("category is required")
	}

	if err := s.Products.Update(&p); err != nil {
		return nil, err
	}
	return &p, nil
}

func (s *ProductService) Delete(id uint) error {
	return s.Products.Delete(id)
}
