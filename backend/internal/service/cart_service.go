package service

import (
	"errors"

	"apple-store-backend/internal/models"
	"apple-store-backend/internal/repository"
)

type CartService struct {
	Carts    *repository.CartRepository
	Products *repository.ProductRepository
}

func NewCartService(carts *repository.CartRepository, products *repository.ProductRepository) *CartService {
	return &CartService{Carts: carts, Products: products}
}

func (s *CartService) GetCart(userID uint) (*models.Cart, error) {
	cart, err := s.Carts.GetOrCreateCart(userID)
	if err != nil {
		return nil, err
	}
	items, err := s.Carts.GetItems(cart.ID)
	if err != nil {
		return nil, err
	}
	cart.Items = items
	return cart, nil
}

func (s *CartService) AddItem(userID, productID uint, quantity int) (*models.Cart, error) {
	if quantity < 1 {
		quantity = 1
	}
	product, err := s.Products.FindByID(productID)
	if err != nil {
		return nil, errors.New("product not found")
	}
	if product.StockQuantity < quantity {
		return nil, errors.New("not enough stock available")
	}
	cart, err := s.Carts.GetOrCreateCart(userID)
	if err != nil {
		return nil, err
	}
	if err := s.Carts.UpsertItem(cart.ID, productID, quantity, product.Price); err != nil {
		return nil, err
	}
	return s.GetCart(userID)
}

func (s *CartService) UpdateItem(userID, productID uint, quantity int) (*models.Cart, error) {
	cart, err := s.Carts.GetOrCreateCart(userID)
	if err != nil {
		return nil, err
	}
	if quantity <= 0 {
		if err := s.Carts.RemoveItem(cart.ID, productID); err != nil {
			return nil, err
		}
	} else {
		if err := s.Carts.SetItemQuantity(cart.ID, productID, quantity); err != nil {
			return nil, err
		}
	}
	return s.GetCart(userID)
}

func (s *CartService) RemoveItem(userID, productID uint) (*models.Cart, error) {
	cart, err := s.Carts.GetOrCreateCart(userID)
	if err != nil {
		return nil, err
	}
	if err := s.Carts.RemoveItem(cart.ID, productID); err != nil {
		return nil, err
	}
	return s.GetCart(userID)
}
