package repository

import (
	"database/sql"
	"fmt"
	"strings"

	"apple-store-backend/internal/models"
)

type ProductRepository struct {
	DB *sql.DB
}

func NewProductRepository(db *sql.DB) *ProductRepository {
	return &ProductRepository{DB: db}
}

const productStatsJoins = `
LEFT JOIN (
	SELECT product_id, AVG(rating) AS avg_rating, COUNT(*) AS review_count
	FROM reviews GROUP BY product_id
) rv ON rv.product_id = p.id
LEFT JOIN (
	SELECT oi.product_id, COALESCE(SUM(oi.quantity), 0) AS total_sold
	FROM order_items oi
	INNER JOIN orders o ON o.id = oi.order_id
	WHERE o.status IN ('paid', 'shipped', 'delivered')
	GROUP BY oi.product_id
) sold ON sold.product_id = p.id`

const productSelectWithStats = `
	p.id, p.name, p.slug, p.description, p.price, p.stock_quantity, p.category_id,
	c.name, p.image_url, p.model_variant, p.is_active, p.created_at, p.updated_at,
	COALESCE(rv.avg_rating, 0), COALESCE(rv.review_count, 0), COALESCE(sold.total_sold, 0)`

func scanProductWithStats(scanner interface {
	Scan(dest ...interface{}) error
}) (models.Product, error) {
	var p models.Product
	err := scanner.Scan(
		&p.ID, &p.Name, &p.Slug, &p.Description, &p.Price, &p.StockQuantity,
		&p.CategoryID, &p.CategoryName, &p.ImageURL, &p.ModelVariant, &p.IsActive, &p.CreatedAt, &p.UpdatedAt,
		&p.AvgRating, &p.ReviewCount, &p.TotalSold,
	)
	return p, err
}

type ProductFilter struct {
	Search     string
	CategoryID uint
	MinPrice   float64
	MaxPrice   float64
	SortBy     string // "price_asc" | "price_desc" | "newest" | "popularity"
	Page       int
	PageSize   int
	ActiveOnly bool
}

func (r *ProductRepository) FindAll(f ProductFilter) ([]models.Product, int, error) {
	where := []string{"1=1"}
	args := []interface{}{}

	if f.ActiveOnly {
		where = append(where, "p.is_active = TRUE")
	}
	if f.Search != "" {
		where = append(where, "(p.name LIKE ? OR p.description LIKE ?)")
		pattern := "%" + f.Search + "%"
		args = append(args, pattern, pattern)
	}
	if f.CategoryID > 0 {
		where = append(where, "p.category_id = ?")
		args = append(args, f.CategoryID)
	}
	if f.MinPrice > 0 {
		where = append(where, "p.price >= ?")
		args = append(args, f.MinPrice)
	}
	if f.MaxPrice > 0 {
		where = append(where, "p.price <= ?")
		args = append(args, f.MaxPrice)
	}

	whereClause := strings.Join(where, " AND ")

	var total int
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM products p WHERE %s", whereClause)
	if err := r.DB.QueryRow(countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	orderBy := "p.created_at DESC"
	switch f.SortBy {
	case "price_asc":
		orderBy = "p.price ASC"
	case "price_desc":
		orderBy = "p.price DESC"
	case "newest":
		orderBy = "p.created_at DESC"
	case "popularity":
		orderBy = "COALESCE(sold.total_sold, 0) DESC, p.created_at DESC"
	}

	if f.Page < 1 {
		f.Page = 1
	}
	if f.PageSize < 1 {
		f.PageSize = 12
	}
	offset := (f.Page - 1) * f.PageSize

	query := fmt.Sprintf(`
		SELECT %s
		FROM products p
		JOIN categories c ON c.id = p.category_id
		%s
		WHERE %s
		ORDER BY %s
		LIMIT ? OFFSET ?`, productSelectWithStats, productStatsJoins, whereClause, orderBy)

	args = append(args, f.PageSize, offset)

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var out []models.Product
	for rows.Next() {
		p, err := scanProductWithStats(rows)
		if err != nil {
			return nil, 0, err
		}
		out = append(out, p)
	}
	return out, total, nil
}

func (r *ProductRepository) FindBySlug(slug string) (*models.Product, error) {
	row := r.DB.QueryRow(fmt.Sprintf(`
		SELECT %s
		FROM products p
		JOIN categories c ON c.id = p.category_id
		%s
		WHERE p.slug = ?`, productSelectWithStats, productStatsJoins), slug)

	p, err := scanProductWithStats(row)
	if err != nil {
		return nil, err
	}

	imgRows, err := r.DB.Query(`SELECT id, product_id, image_url, sort_order FROM product_images WHERE product_id = ? ORDER BY sort_order ASC`, p.ID)
	if err == nil {
		defer imgRows.Close()
		for imgRows.Next() {
			var img models.ProductImage
			if err := imgRows.Scan(&img.ID, &img.ProductID, &img.ImageURL, &img.SortOrder); err == nil {
				p.Images = append(p.Images, img)
			}
		}
	}
	return &p, nil
}

func (r *ProductRepository) FindByID(id uint) (*models.Product, error) {
	row := r.DB.QueryRow(`
		SELECT p.id, p.name, p.slug, p.description, p.price, p.stock_quantity, p.category_id,
		       c.name, p.image_url, p.model_variant, p.is_active, p.created_at, p.updated_at
		FROM products p JOIN categories c ON c.id = p.category_id
		WHERE p.id = ?`, id)
	var p models.Product
	if err := row.Scan(&p.ID, &p.Name, &p.Slug, &p.Description, &p.Price, &p.StockQuantity,
		&p.CategoryID, &p.CategoryName, &p.ImageURL, &p.ModelVariant, &p.IsActive, &p.CreatedAt, &p.UpdatedAt); err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *ProductRepository) FindRelated(categoryID uint, excludeID uint, limit int) ([]models.Product, error) {
	rows, err := r.DB.Query(fmt.Sprintf(`
		SELECT %s
		FROM products p
		JOIN categories c ON c.id = p.category_id
		%s
		WHERE p.category_id = ? AND p.id != ? AND p.is_active = TRUE
		LIMIT ?`, productSelectWithStats, productStatsJoins), categoryID, excludeID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.Product
	for rows.Next() {
		p, err := scanProductWithStats(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	return out, nil
}

func (r *ProductRepository) Create(p *models.Product) (uint, error) {
	res, err := r.DB.Exec(`
		INSERT INTO products (name, slug, description, price, stock_quantity, category_id, image_url, model_variant, is_active)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		p.Name, p.Slug, p.Description, p.Price, p.StockQuantity, p.CategoryID, p.ImageURL, p.ModelVariant, p.IsActive)
	if err != nil {
		return 0, err
	}
	id, err := res.LastInsertId()
	return uint(id), err
}

func (r *ProductRepository) Update(p *models.Product) error {
	_, err := r.DB.Exec(`
		UPDATE products SET name=?, slug=?, description=?, price=?, stock_quantity=?, category_id=?, image_url=?, model_variant=?, is_active=?
		WHERE id=?`,
		p.Name, p.Slug, p.Description, p.Price, p.StockQuantity, p.CategoryID, p.ImageURL, p.ModelVariant, p.IsActive, p.ID)
	return err
}

func (r *ProductRepository) Delete(id uint) error {
	_, err := r.DB.Exec(`DELETE FROM products WHERE id = ?`, id)
	return err
}

func (r *ProductRepository) DecrementStock(tx *sql.Tx, productID uint, qty int) error {
	_, err := tx.Exec(`UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?`, qty, productID, qty)
	return err
}

func (r *ProductRepository) AddImage(img *models.ProductImage) error {
	_, err := r.DB.Exec(`INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)`,
		img.ProductID, img.ImageURL, img.SortOrder)
	return err
}

func (r *ProductRepository) Count() (int, error) {
	var count int
	err := r.DB.QueryRow(`SELECT COUNT(*) FROM products`).Scan(&count)
	return count, err
}
