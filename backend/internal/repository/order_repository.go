package repository

import (
	"database/sql"

	"apple-store-backend/internal/models"
)

type OrderRepository struct {
	DB *sql.DB
}

func NewOrderRepository(db *sql.DB) *OrderRepository {
	return &OrderRepository{DB: db}
}

const orderSelectColumns = `
	o.id, o.user_id, o.user_order_number, o.status, o.total_amount, o.shipping_address,
	o.payment_status, COALESCE(o.stripe_payment_intent_id, ''), o.created_at, o.updated_at`

type scanner interface {
	Scan(dest ...any) error
}

func scanOrder(row scanner) (models.Order, error) {
	var o models.Order
	err := row.Scan(
		&o.ID, &o.UserID, &o.UserOrderNumber, &o.Status, &o.TotalAmount, &o.ShippingAddress,
		&o.PaymentStatus, &o.StripePaymentIntentID, &o.CreatedAt, &o.UpdatedAt,
	)
	return o, err
}

func (r *OrderRepository) NextUserOrderNumberTx(tx *sql.Tx, userID uint) (int, error) {
	var locked uint
	if err := tx.QueryRow(`SELECT id FROM users WHERE id = ? FOR UPDATE`, userID).Scan(&locked); err != nil {
		return 0, err
	}

	var next int
	err := tx.QueryRow(`SELECT COALESCE(MAX(user_order_number), 0) + 1 FROM orders WHERE user_id = ?`, userID).Scan(&next)
	return next, err
}

func (r *OrderRepository) CreateOrderTx(tx *sql.Tx, o *models.Order) (uint, error) {
	nextNum, err := r.NextUserOrderNumberTx(tx, o.UserID)
	if err != nil {
		return 0, err
	}
	o.UserOrderNumber = nextNum

	res, err := tx.Exec(`
		INSERT INTO orders (user_id, user_order_number, status, total_amount, shipping_address, payment_status, stripe_payment_intent_id)
		VALUES (?, ?, ?, ?, ?, ?, ?)`,
		o.UserID, o.UserOrderNumber, o.Status, o.TotalAmount, o.ShippingAddress, o.PaymentStatus, o.StripePaymentIntentID)
	if err != nil {
		return 0, err
	}
	id, err := res.LastInsertId()
	return uint(id), err
}

func (r *OrderRepository) AddOrderItemTx(tx *sql.Tx, item *models.OrderItem) error {
	_, err := tx.Exec(`
		INSERT INTO order_items (order_id, product_id, product_name_snapshot, quantity, unit_price_snapshot, subtotal)
		VALUES (?, ?, ?, ?, ?, ?)`,
		item.OrderID, item.ProductID, item.ProductNameSnapshot, item.Quantity, item.UnitPriceSnapshot, item.Subtotal)
	return err
}

func (r *OrderRepository) FindByUser(userID uint) ([]models.Order, error) {
	rows, err := r.DB.Query(`
		SELECT `+orderSelectColumns+`
		FROM orders o WHERE o.user_id = ? ORDER BY o.created_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.Order
	for rows.Next() {
		o, err := scanOrder(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, o)
	}
	return out, nil
}

func (r *OrderRepository) FindAll() ([]models.Order, error) {
	return r.FindAllAdmin()
}

func (r *OrderRepository) FindAllAdmin() ([]models.Order, error) {
	rows, err := r.DB.Query(`
		SELECT ` + orderSelectColumns + `, u.name, u.email
		FROM orders o
		JOIN users u ON u.id = o.user_id
		ORDER BY o.created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.Order
	for rows.Next() {
		o, err := scanOrderAdmin(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, o)
	}
	return out, nil
}

func scanOrderAdmin(row scanner) (models.Order, error) {
	var o models.Order
	err := row.Scan(
		&o.ID, &o.UserID, &o.UserOrderNumber, &o.Status, &o.TotalAmount, &o.ShippingAddress,
		&o.PaymentStatus, &o.StripePaymentIntentID, &o.CreatedAt, &o.UpdatedAt,
		&o.CustomerName, &o.CustomerEmail,
	)
	return o, err
}

func (r *OrderRepository) FindByID(id uint) (*models.Order, error) {
	row := r.DB.QueryRow(`
		SELECT `+orderSelectColumns+`
		FROM orders o WHERE o.id = ?`, id)
	o, err := scanOrder(row)
	if err != nil {
		return nil, err
	}
	return r.attachItems(&o, id)
}

func (r *OrderRepository) FindByIDAdmin(id uint) (*models.Order, error) {
	row := r.DB.QueryRow(`
		SELECT `+orderSelectColumns+`, u.name, u.email
		FROM orders o
		JOIN users u ON u.id = o.user_id
		WHERE o.id = ?`, id)
	o, err := scanOrderAdmin(row)
	if err != nil {
		return nil, err
	}
	return r.attachItemsAdmin(&o, id)
}

func (r *OrderRepository) attachItems(o *models.Order, id uint) (*models.Order, error) {
	itemRows, err := r.DB.Query(`
		SELECT id, order_id, product_id, product_name_snapshot, quantity, unit_price_snapshot, subtotal
		FROM order_items WHERE order_id = ?`, id)
	if err == nil {
		defer itemRows.Close()
		for itemRows.Next() {
			var it models.OrderItem
			if err := itemRows.Scan(&it.ID, &it.OrderID, &it.ProductID, &it.ProductNameSnapshot, &it.Quantity, &it.UnitPriceSnapshot, &it.Subtotal); err == nil {
				o.Items = append(o.Items, it)
			}
		}
	}
	return o, nil
}

func (r *OrderRepository) attachItemsAdmin(o *models.Order, id uint) (*models.Order, error) {
	itemRows, err := r.DB.Query(`
		SELECT oi.id, oi.order_id, oi.product_id, oi.product_name_snapshot, oi.quantity,
		       oi.unit_price_snapshot, oi.subtotal, COALESCE(p.image_url, '')
		FROM order_items oi
		LEFT JOIN products p ON p.id = oi.product_id
		WHERE oi.order_id = ?`, id)
	if err == nil {
		defer itemRows.Close()
		for itemRows.Next() {
			var it models.OrderItem
			if err := itemRows.Scan(&it.ID, &it.OrderID, &it.ProductID, &it.ProductNameSnapshot, &it.Quantity, &it.UnitPriceSnapshot, &it.Subtotal, &it.ProductImage); err == nil {
				o.Items = append(o.Items, it)
			}
		}
	}
	return o, nil
}

func (r *OrderRepository) UpdateStatus(id uint, status string) error {
	_, err := r.DB.Exec(`UPDATE orders SET status = ? WHERE id = ?`, status, id)
	return err
}

func (r *OrderRepository) UpdatePaymentStatus(id uint, paymentStatus, stripeIntentID string) error {
	_, err := r.DB.Exec(`UPDATE orders SET payment_status = ?, stripe_payment_intent_id = ? WHERE id = ?`, paymentStatus, stripeIntentID, id)
	return err
}

func (r *OrderRepository) MarkPaidByIntent(intentID string) error {
	_, err := r.DB.Exec(`UPDATE orders SET payment_status = 'paid', status = 'paid' WHERE stripe_payment_intent_id = ?`, intentID)
	return err
}

func (r *OrderRepository) Stats() (totalOrders int, revenue float64, err error) {
	err = r.DB.QueryRow(`SELECT COUNT(*), COALESCE(SUM(total_amount),0) FROM orders WHERE payment_status = 'paid'`).Scan(&totalOrders, &revenue)
	return
}
