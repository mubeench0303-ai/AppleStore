package repository

import (
	"database/sql"
	"time"

	"apple-store-backend/internal/models"
)

type VerificationRepository struct {
	DB *sql.DB
}

func NewVerificationRepository(db *sql.DB) *VerificationRepository {
	return &VerificationRepository{DB: db}
}

func (r *VerificationRepository) ReplaceCode(userID uint, code string, expiresAt time.Time) error {
	if _, err := r.DB.Exec(`DELETE FROM verification_codes WHERE user_id = ?`, userID); err != nil {
		return err
	}
	_, err := r.DB.Exec(`
		INSERT INTO verification_codes (user_id, code, expires_at) VALUES (?, ?, ?)`,
		userID, code, expiresAt)
	return err
}

func (r *VerificationRepository) FindValid(userID uint, code string) (*models.VerificationCode, error) {
	row := r.DB.QueryRow(`
		SELECT id, user_id, code, expires_at, created_at
		FROM verification_codes
		WHERE user_id = ? AND code = ? AND expires_at > NOW()`, userID, code)
	var vc models.VerificationCode
	if err := row.Scan(&vc.ID, &vc.UserID, &vc.Code, &vc.ExpiresAt, &vc.CreatedAt); err != nil {
		return nil, err
	}
	return &vc, nil
}

func (r *VerificationRepository) DeleteByUserID(userID uint) error {
	_, err := r.DB.Exec(`DELETE FROM verification_codes WHERE user_id = ?`, userID)
	return err
}
