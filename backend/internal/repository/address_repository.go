package repository

import (
	"database/sql"

	"apple-store-backend/internal/models"
)

type AddressRepository struct {
	DB *sql.DB
}

func NewAddressRepository(db *sql.DB) *AddressRepository {
	return &AddressRepository{DB: db}
}

func (r *AddressRepository) Create(a *models.Address) (uint, error) {
	res, err := r.DB.Exec(`
		INSERT INTO addresses (user_id, full_name, phone, street, city, state, postal_code, country, is_default)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		a.UserID, a.FullName, a.Phone, a.Street, a.City, a.State, a.PostalCode, a.Country, a.IsDefault)
	if err != nil {
		return 0, err
	}
	id, err := res.LastInsertId()
	return uint(id), err
}

func (r *AddressRepository) FindByUser(userID uint) ([]models.Address, error) {
	rows, err := r.DB.Query(`SELECT id, user_id, full_name, phone, street, city, state, postal_code, country, is_default FROM addresses WHERE user_id = ?`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.Address
	for rows.Next() {
		var a models.Address
		if err := rows.Scan(&a.ID, &a.UserID, &a.FullName, &a.Phone, &a.Street, &a.City, &a.State, &a.PostalCode, &a.Country, &a.IsDefault); err != nil {
			return nil, err
		}
		out = append(out, a)
	}
	return out, nil
}

func (r *AddressRepository) Delete(id, userID uint) error {
	_, err := r.DB.Exec(`DELETE FROM addresses WHERE id = ? AND user_id = ?`, id, userID)
	return err
}

func (r *AddressRepository) Update(a *models.Address) error {
	_, err := r.DB.Exec(`
		UPDATE addresses SET full_name=?, phone=?, street=?, city=?, state=?, postal_code=?, country=?, is_default=?
		WHERE id=? AND user_id=?`,
		a.FullName, a.Phone, a.Street, a.City, a.State, a.PostalCode, a.Country, a.IsDefault, a.ID, a.UserID)
	return err
}
