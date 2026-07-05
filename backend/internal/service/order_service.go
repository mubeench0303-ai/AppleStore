package service

import (
	"database/sql"
	"errors"
	"fmt"

	"apple-store-backend/internal/models"
	"apple-store-backend/internal/repository"
)

type OrderService struct {
	DB       *sql.DB
	Orders   *repository.OrderRepository
	Carts    *repository.CartRepository
	Products *repository.ProductRepository
}

func NewOrderService(db *sql.DB, o *repository.OrderRepository, c *repository.CartRepository, p *repository.ProductRepository) *OrderService {
	return &OrderService{DB: db, Orders: o, Carts: c, Products: p}
}

// CreateOrderFromCart converts the user's current cart into a pending order,
// snapshotting product name/price at time of purchase and decrementing stock
// inside a single DB transaction.
func (s *OrderService) CreateOrderFromCart(userID uint, shippingAddress string) (*models.Order, error) {
	cart, err := s.Carts.GetOrCreateCart(userID)
	if err != nil {
		return nil, err
	}
	items, err := s.Carts.GetItems(cart.ID)
	if err != nil {
		return nil, err
	}
	if len(items) == 0 {
		return nil, errors.New("cart is empty")
	}

	tx, err := s.DB.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	var total float64
	for _, it := range items {
		total += it.UnitPriceSnapshot * float64(it.Quantity)
	}

	order := &models.Order{
		UserID:          userID,
		Status:          "pending",
		TotalAmount:     total,
		ShippingAddress: shippingAddress,
		PaymentStatus:   "unpaid",
	}
	orderID, err := s.Orders.CreateOrderTx(tx, order)
	if err != nil {
		return nil, err
	}
	order.ID = orderID

	for _, it := range items {
		if err := s.Products.DecrementStock(tx, it.ProductID, it.Quantity); err != nil {
			return nil, err
		}
		var affected int64
		row := tx.QueryRow(`SELECT stock_quantity FROM products WHERE id = ?`, it.ProductID)
		var remaining int
		if err := row.Scan(&remaining); err == nil && remaining < 0 {
			return nil, fmt.Errorf("insufficient stock for %s", it.ProductName)
		}
		_ = affected

		item := &models.OrderItem{
			OrderID:             orderID,
			ProductID:           it.ProductID,
			ProductNameSnapshot: it.ProductName,
			Quantity:            it.Quantity,
			UnitPriceSnapshot:   it.UnitPriceSnapshot,
			Subtotal:            it.UnitPriceSnapshot * float64(it.Quantity),
		}
		if err := s.Orders.AddOrderItemTx(tx, item); err != nil {
			return nil, err
		}
		order.Items = append(order.Items, *item)
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	_ = s.Carts.ClearCart(cart.ID)

	return order, nil
}

func (s *OrderService) ListForUser(userID uint) ([]models.Order, error) {
	return s.Orders.FindByUser(userID)
}

func (s *OrderService) ListAll() ([]models.Order, error) {
	return s.Orders.FindAllAdmin()
}

func (s *OrderService) GetAdmin(id uint) (*models.Order, error) {
	return s.Orders.FindByIDAdmin(id)
}

func (s *OrderService) Get(id uint) (*models.Order, error) {
	return s.Orders.FindByID(id)
}

func (s *OrderService) UpdateStatus(id uint, status string) error {
	valid := map[string]bool{"pending": true, "paid": true, "shipped": true, "delivered": true, "cancelled": true}
	if !valid[status] {
		return errors.New("invalid order status")
	}
	return s.Orders.UpdateStatus(id, status)
}

func (s *OrderService) MarkPaid(orderID uint, stripeIntentID string) error {
	return s.Orders.UpdatePaymentStatus(orderID, "paid", stripeIntentID)
}

func (s *OrderService) Stats() (int, float64, int, error) {
	totalOrders, revenue, err := s.Orders.Stats()
	if err != nil {
		return 0, 0, 0, err
	}
	productCount, err := s.Products.Count()
	if err != nil {
		return 0, 0, 0, err
	}
	return totalOrders, revenue, productCount, nil
}
