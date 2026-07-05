package repository

import (
	"database/sql"

	"apple-store-backend/internal/models"
)

type CategoryRepository struct {
	DB *sql.DB
}

func NewCategoryRepository(db *sql.DB) *CategoryRepository {
	return &CategoryRepository{DB: db}
}

func (r *CategoryRepository) Create(c *models.Category) (uint, error) {
	res, err := r.DB.Exec(`INSERT INTO categories (name, slug) VALUES (?, ?)`, c.Name, c.Slug)
	if err != nil {
		return 0, err
	}
	id, err := res.LastInsertId()
	return uint(id), err
}

func (r *CategoryRepository) FindAll() ([]models.Category, error) {
	rows, err := r.DB.Query(`SELECT id, name, slug, created_at FROM categories ORDER BY name ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.Category
	for rows.Next() {
		var c models.Category
		if err := rows.Scan(&c.ID, &c.Name, &c.Slug, &c.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, nil
}

func (r *CategoryRepository) FindByID(id uint) (*models.Category, error) {
	row := r.DB.QueryRow(`SELECT id, name, slug, created_at FROM categories WHERE id = ?`, id)
	var c models.Category
	if err := row.Scan(&c.ID, &c.Name, &c.Slug, &c.CreatedAt); err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *CategoryRepository) Update(id uint, name, slug string) error {
	_, err := r.DB.Exec(`UPDATE categories SET name = ?, slug = ? WHERE id = ?`, name, slug, id)
	return err
}

func (r *CategoryRepository) Delete(id uint) error {
	_, err := r.DB.Exec(`DELETE FROM categories WHERE id = ?`, id)
	return err
}
