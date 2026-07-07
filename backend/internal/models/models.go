package models

import "time"

type User struct {
	ID           uint      `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Role         string    `json:"role"` // "user" | "admin"
	IsVerified   bool      `json:"is_verified"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type VerificationCode struct {
	ID        uint      `json:"id"`
	UserID    uint      `json:"user_id"`
	Code      string    `json:"code"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
}

type PasswordResetCode struct {
	ID        uint      `json:"id"`
	UserID    uint      `json:"user_id"`
	Code      string    `json:"code"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
}

type Category struct {
	ID        uint      `json:"id"`
	Name      string    `json:"name"`
	Slug      string    `json:"slug"`
	CreatedAt time.Time `json:"created_at"`
}

type Product struct {
	ID            uint           `json:"id"`
	Name          string         `json:"name"`
	Slug          string         `json:"slug"`
	Description   string         `json:"description"`
	Price         float64        `json:"price"`
	StockQuantity int            `json:"stock_quantity"`
	CategoryID    uint           `json:"category_id"`
	CategoryName  string         `json:"category_name,omitempty"`
	ImageURL      string         `json:"image_url"`
	ModelVariant  string         `json:"model_variant"`
	IsActive      bool           `json:"is_active"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	Images        []ProductImage `json:"images,omitempty"`
}

type ProductImage struct {
	ID        uint   `json:"id"`
	ProductID uint   `json:"product_id"`
	ImageURL  string `json:"image_url"`
	SortOrder int    `json:"sort_order"`
}

type Cart struct {
	ID        uint       `json:"id"`
	UserID    uint       `json:"user_id"`
	Items     []CartItem `json:"items"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

type CartItem struct {
	ID                uint    `json:"id"`
	CartID            uint    `json:"cart_id"`
	ProductID         uint    `json:"product_id"`
	ProductName       string  `json:"product_name,omitempty"`
	ProductImage      string  `json:"product_image,omitempty"`
	Quantity          int     `json:"quantity"`
	UnitPriceSnapshot float64 `json:"unit_price_snapshot"`
}

type Address struct {
	ID         uint   `json:"id"`
	UserID     uint   `json:"user_id"`
	FullName   string `json:"full_name"`
	Phone      string `json:"phone"`
	Street     string `json:"street"`
	City       string `json:"city"`
	State      string `json:"state"`
	PostalCode string `json:"postal_code"`
	Country    string `json:"country"`
	IsDefault  bool   `json:"is_default"`
}

type Order struct {
	ID                    uint        `json:"id"`
	UserID                uint        `json:"user_id"`
	UserOrderNumber       int         `json:"user_order_number"`
	Status                string      `json:"status"` // pending|paid|shipped|delivered|cancelled
	TotalAmount           float64     `json:"total_amount"`
	ShippingAddress       string      `json:"shipping_address"`
	PaymentStatus         string      `json:"payment_status"` // unpaid|paid|failed
	StripePaymentIntentID string      `json:"stripe_payment_intent_id,omitempty"`
	CustomerName          string      `json:"customer_name,omitempty"`
	CustomerEmail         string      `json:"customer_email,omitempty"`
	Items                 []OrderItem `json:"items,omitempty"`
	CreatedAt             time.Time   `json:"created_at"`
	UpdatedAt             time.Time   `json:"updated_at"`
}

type OrderItem struct {
	ID                  uint    `json:"id"`
	OrderID             uint    `json:"order_id"`
	ProductID           uint    `json:"product_id"`
	ProductNameSnapshot string  `json:"product_name_snapshot"`
	Quantity            int     `json:"quantity"`
	UnitPriceSnapshot   float64 `json:"unit_price_snapshot"`
	Subtotal            float64 `json:"subtotal"`
	ProductImage        string  `json:"product_image,omitempty"`
	CanReview           bool    `json:"can_review,omitempty"`
	HasReviewed         bool    `json:"has_reviewed,omitempty"`
}

type Review struct {
	ID        uint      `json:"id"`
	ProductID uint      `json:"product_id"`
	UserID    uint      `json:"user_id"`
	OrderID   uint      `json:"order_id,omitempty"`
	UserName  string    `json:"user_name,omitempty"`
	Rating    int       `json:"rating"`
	Comment   string    `json:"comment"`
	CreatedAt time.Time `json:"created_at"`
}
