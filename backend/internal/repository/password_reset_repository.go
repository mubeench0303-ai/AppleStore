package repository

import (
	"database/sql"
	"time"

	"apple-store-backend/internal/models"
)

type PasswordResetRepository struct {
	DB *sql.DB
}

func NewPasswordResetRepository(db *sql.DB) *PasswordResetRepository {
	return &PasswordResetRepository{DB: db}
}

func (r *PasswordResetRepository) ReplaceCode(userID uint, code string, expiresAt time.Time) error {
	if _, err := r.DB.Exec(`DELETE FROM password_reset_codes WHERE user_id = ?`, userID); err != nil {
		return err
	}
	_, err := r.DB.Exec(`
		INSERT INTO password_reset_codes (user_id, code, expires_at) VALUES (?, ?, ?)`,
		userID, code, expiresAt)
	return err
}

func (r *PasswordResetRepository) FindValid(userID uint, code string) (*models.PasswordResetCode, error) {
	row := r.DB.QueryRow(`
		SELECT id, user_id, code, expires_at, created_at
		FROM password_reset_codes
		WHERE user_id = ? AND code = ? AND expires_at > NOW()`, userID, code)
	var prc models.PasswordResetCode
	if err := row.Scan(&prc.ID, &prc.UserID, &prc.Code, &prc.ExpiresAt, &prc.CreatedAt); err != nil {
		return nil, err
	}
	return &prc, nil
}

func (r *PasswordResetRepository) DeleteByUserID(userID uint) error {
	_, err := r.DB.Exec(`DELETE FROM password_reset_codes WHERE user_id = ?`, userID)
	return err
}
