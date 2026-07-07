package repository

import (
	"database/sql"
	"errors"

	"apple-store-backend/internal/models"
)

type ReviewRepository struct {
	DB *sql.DB
}

func NewReviewRepository(db *sql.DB) *ReviewRepository {
	return &ReviewRepository{DB: db}
}

func (r *ReviewRepository) Create(rv *models.Review) (uint, error) {
	var orderID interface{}
	if rv.OrderID > 0 {
		orderID = rv.OrderID
	}
	res, err := r.DB.Exec(
		`INSERT INTO reviews (product_id, user_id, order_id, rating, comment) VALUES (?, ?, ?, ?, ?)`,
		rv.ProductID, rv.UserID, orderID, rv.Rating, rv.Comment,
	)
	if err != nil {
		return 0, err
	}
	id, err := res.LastInsertId()
	return uint(id), err
}

func (r *ReviewRepository) ExistsForUserProduct(userID, productID uint) (bool, error) {
	var count int
	err := r.DB.QueryRow(
		`SELECT COUNT(*) FROM reviews WHERE user_id = ? AND product_id = ?`,
		userID, productID,
	).Scan(&count)
	return count > 0, err
}

func (r *ReviewRepository) ReviewedProductIDs(userID uint, productIDs []uint) (map[uint]bool, error) {
	out := make(map[uint]bool)
	if len(productIDs) == 0 {
		return out, nil
	}

	query := `SELECT product_id FROM reviews WHERE user_id = ? AND product_id IN (`
	args := []interface{}{userID}
	for i, id := range productIDs {
		if i > 0 {
			query += ","
		}
		query += "?"
		args = append(args, id)
	}
	query += ")"

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var pid uint
		if err := rows.Scan(&pid); err != nil {
			return nil, err
		}
		out[pid] = true
	}
	return out, rows.Err()
}

// UserOwnsDeliveredOrderItem verifies the user has a delivered order containing the product.
func (r *ReviewRepository) UserOwnsDeliveredOrderItem(userID, orderID, productID uint) (bool, error) {
	var found int
	err := r.DB.QueryRow(`
		SELECT 1 FROM orders o
		INNER JOIN order_items oi ON oi.order_id = o.id
		WHERE o.id = ? AND o.user_id = ? AND o.status = 'delivered' AND oi.product_id = ?
		LIMIT 1`,
		orderID, userID, productID,
	).Scan(&found)
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil
	}
	return err == nil, err
}

func (r *ReviewRepository) FindByProduct(productID uint) ([]models.Review, error) {
	rows, err := r.DB.Query(`
		SELECT rv.id, rv.product_id, rv.user_id, COALESCE(rv.order_id, 0), u.name, rv.rating, rv.comment, rv.created_at
		FROM reviews rv JOIN users u ON u.id = rv.user_id
		WHERE rv.product_id = ? ORDER BY rv.created_at DESC`, productID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.Review
	for rows.Next() {
		var rv models.Review
		if err := rows.Scan(&rv.ID, &rv.ProductID, &rv.UserID, &rv.OrderID, &rv.UserName, &rv.Rating, &rv.Comment, &rv.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, rv)
	}
	return out, nil
}
