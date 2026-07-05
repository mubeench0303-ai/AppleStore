package repository

import (
	"database/sql"
	"errors"

	"apple-store-backend/internal/models"
)

type CartRepository struct {
	DB *sql.DB
}

func NewCartRepository(db *sql.DB) *CartRepository {
	return &CartRepository{DB: db}
}

// GetOrCreateCart returns the user's cart, creating one if it doesn't exist.
func (r *CartRepository) GetOrCreateCart(userID uint) (*models.Cart, error) {
	row := r.DB.QueryRow(`SELECT id, user_id, created_at, updated_at FROM carts WHERE user_id = ?`, userID)
	var c models.Cart
	err := row.Scan(&c.ID, &c.UserID, &c.CreatedAt, &c.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		res, err := r.DB.Exec(`INSERT INTO carts (user_id) VALUES (?)`, userID)
		if err != nil {
			return nil, err
		}
		id, _ := res.LastInsertId()
		return &models.Cart{ID: uint(id), UserID: userID}, nil
	} else if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *CartRepository) GetItems(cartID uint) ([]models.CartItem, error) {
	rows, err := r.DB.Query(`
		SELECT ci.id, ci.cart_id, ci.product_id, p.name, p.image_url, ci.quantity, ci.unit_price_snapshot
		FROM cart_items ci JOIN products p ON p.id = ci.product_id
		WHERE ci.cart_id = ?`, cartID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []models.CartItem
	for rows.Next() {
		var it models.CartItem
		if err := rows.Scan(&it.ID, &it.CartID, &it.ProductID, &it.ProductName, &it.ProductImage, &it.Quantity, &it.UnitPriceSnapshot); err != nil {
			return nil, err
		}
		items = append(items, it)
	}
	return items, nil
}

func (r *CartRepository) UpsertItem(cartID, productID uint, quantity int, unitPrice float64) error {
	_, err := r.DB.Exec(`
		INSERT INTO cart_items (cart_id, product_id, quantity, unit_price_snapshot)
		VALUES (?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity), unit_price_snapshot = VALUES(unit_price_snapshot)`,
		cartID, productID, quantity, unitPrice)
	return err
}

func (r *CartRepository) SetItemQuantity(cartID, productID uint, quantity int) error {
	_, err := r.DB.Exec(`UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?`, quantity, cartID, productID)
	return err
}

func (r *CartRepository) RemoveItem(cartID, productID uint) error {
	_, err := r.DB.Exec(`DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?`, cartID, productID)
	return err
}

func (r *CartRepository) ClearCart(cartID uint) error {
	_, err := r.DB.Exec(`DELETE FROM cart_items WHERE cart_id = ?`, cartID)
	return err
}
