package repository

import (
	"database/sql"

	"apple-store-backend/internal/models"
)

type ReviewRepository struct {
	DB *sql.DB
}

func NewReviewRepository(db *sql.DB) *ReviewRepository {
	return &ReviewRepository{DB: db}
}

func (r *ReviewRepository) Create(rv *models.Review) (uint, error) {
	res, err := r.DB.Exec(`INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)`,
		rv.ProductID, rv.UserID, rv.Rating, rv.Comment)
	if err != nil {
		return 0, err
	}
	id, err := res.LastInsertId()
	return uint(id), err
}

func (r *ReviewRepository) FindByProduct(productID uint) ([]models.Review, error) {
	rows, err := r.DB.Query(`
		SELECT rv.id, rv.product_id, rv.user_id, u.name, rv.rating, rv.comment, rv.created_at
		FROM reviews rv JOIN users u ON u.id = rv.user_id
		WHERE rv.product_id = ? ORDER BY rv.created_at DESC`, productID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.Review
	for rows.Next() {
		var rv models.Review
		if err := rows.Scan(&rv.ID, &rv.ProductID, &rv.UserID, &rv.UserName, &rv.Rating, &rv.Comment, &rv.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, rv)
	}
	return out, nil
}
