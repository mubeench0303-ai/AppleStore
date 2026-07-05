package repository

import (
	"database/sql"

	"apple-store-backend/internal/models"
)

type UserRepository struct {
	DB *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{DB: db}
}

const userSelectColumns = `id, name, email, password_hash, role, is_verified, created_at, updated_at`

func scanUser(row scanner) (*models.User, error) {
	var u models.User
	if err := row.Scan(&u.ID, &u.Name, &u.Email, &u.PasswordHash, &u.Role, &u.IsVerified, &u.CreatedAt, &u.UpdatedAt); err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) Create(u *models.User) (uint, error) {
	res, err := r.DB.Exec(
		`INSERT INTO users (name, email, password_hash, role, is_verified) VALUES (?, ?, ?, ?, ?)`,
		u.Name, u.Email, u.PasswordHash, u.Role, u.IsVerified,
	)
	if err != nil {
		return 0, err
	}
	id, err := res.LastInsertId()
	return uint(id), err
}

func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	row := r.DB.QueryRow(
		`SELECT `+userSelectColumns+` FROM users WHERE email = ?`, email,
	)
	return scanUser(row)
}

func (r *UserRepository) FindByID(id uint) (*models.User, error) {
	row := r.DB.QueryRow(
		`SELECT `+userSelectColumns+` FROM users WHERE id = ?`, id,
	)
	return scanUser(row)
}

func (r *UserRepository) SetVerified(id uint) error {
	_, err := r.DB.Exec(`UPDATE users SET is_verified = TRUE WHERE id = ?`, id)
	return err
}

func (r *UserRepository) UpdateProfile(id uint, name string) error {
	_, err := r.DB.Exec(`UPDATE users SET name = ? WHERE id = ?`, name, id)
	return err
}

func (r *UserRepository) UpdatePassword(id uint, passwordHash string) error {
	_, err := r.DB.Exec(`UPDATE users SET password_hash = ? WHERE id = ?`, passwordHash, id)
	return err
}
