// Package main seeds demo categories, products, and an admin user.
// Run with: go run ./seed
package main

import (
	"database/sql"
	"log"

	"apple-store-backend/internal/config"
	"apple-store-backend/internal/service"
	"apple-store-backend/internal/utils"

	_ "github.com/go-sql-driver/mysql"
)

type seedProduct struct {
	Name        string
	Description string
	Price       float64
	Stock       int
	Category    string
	Image       string
	Variant     string
}

func main() {
	cfg := config.Load()
	db, err := sql.Open("mysql", cfg.DSN())
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("cannot connect to database: %v", err)
	}

	categories := []string{"iPhone", "MacBook", "iPad", "Apple Watch", "AirPods", "Accessories"}
	categoryIDs := map[string]int64{}

	for _, name := range categories {
		slug := service.Slugify(name)
		res, err := db.Exec(`INSERT IGNORE INTO categories (name, slug) VALUES (?, ?)`, name, slug)
		if err != nil {
			log.Fatalf("seed category %s: %v", name, err)
		}
		id, _ := res.LastInsertId()
		if id == 0 {
			db.QueryRow(`SELECT id FROM categories WHERE slug = ?`, slug).Scan(&id)
		}
		categoryIDs[name] = id
	}
	log.Println("seeded categories")

	products := []seedProduct{
		{"iPhone 16 Pro", "The most advanced iPhone yet, featuring a titanium design and the A18 Pro chip.", 999, 50, "iPhone", "https://images.unsplash.com/photo-1592286927505-1def25115558?w=800", "128GB, Natural Titanium"},
		{"iPhone 16", "A beautifully balanced iPhone with a stunning display and all-day battery life.", 799, 80, "iPhone", "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800", "128GB, Blue"},
		{"iPhone 16 Plus", "Bigger display, longer battery life, same pro-grade cameras.", 899, 40, "iPhone", "https://images.unsplash.com/photo-1611791484670-ce19b801d192?w=800", "128GB, Pink"},
		{"MacBook Pro 14\"", "Supercharged for pros with the M4 Pro chip and Liquid Retina XDR display.", 1999, 30, "MacBook", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800", "M4 Pro, 512GB, Space Black"},
		{"MacBook Air 13\"", "Strikingly thin, remarkably capable, built for M4.", 1099, 60, "MacBook", "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800", "M4, 256GB, Midnight"},
		{"MacBook Pro 16\"", "The ultimate pro laptop with the M4 Max chip for extreme workloads.", 2499, 20, "MacBook", "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800", "M4 Max, 1TB, Silver"},
		{"iPad Pro 11\"", "The most advanced iPad with the M4 chip and Ultra Retina XDR display.", 999, 45, "iPad", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800", "256GB, Wi-Fi, Space Black"},
		{"iPad Air", "Serious performance in a thin, light design, now with M2.", 599, 55, "iPad", "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800", "128GB, Wi-Fi, Blue"},
		{"iPad mini", "Mega power. Mini form.", 499, 35, "iPad", "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800", "128GB, Purple"},
		{"Apple Watch Series 10", "Thinner design, bigger display, smarter health features.", 429, 70, "Apple Watch", "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800", "46mm, Jet Black Aluminum"},
		{"Apple Watch Ultra 2", "The most rugged and capable Apple Watch for extreme adventures.", 799, 25, "Apple Watch", "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800", "49mm, Titanium"},
		{"Apple Watch SE", "A great smartwatch for the whole family, now more affordable.", 249, 90, "Apple Watch", "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800", "44mm, Starlight"},
		{"AirPods Pro 2", "Adaptive Audio and richer, more immersive sound.", 249, 100, "AirPods", "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800", "USB-C"},
		{"AirPods 4", "Redesigned for an unparalleled fit, with Active Noise Cancellation.", 179, 120, "AirPods", "https://images.unsplash.com/photo-1588156979435-379b9d365296?w=800", "With ANC"},
		{"AirPods Max", "High-fidelity sound with computational audio and industry-leading noise cancellation.", 549, 20, "AirPods", "https://images.unsplash.com/photo-1610041321420-a596dd6d0bde?w=800", "Sky Blue"},
		{"MagSafe Charger", "Wireless charging in a snap, for a perfect alignment every time.", 39, 200, "Accessories", "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800", "1m Cable"},
		{"20W USB-C Power Adapter", "Fast, efficient charging at home, in the office, or on the go.", 19, 250, "Accessories", "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800", "USB-C"},
		{"AppleCare+", "Extended coverage and priority access to Apple experts.", 199, 500, "Accessories", "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800", "2 Years"},
	}

	for _, p := range products {
		slug := service.Slugify(p.Name)
		_, err := db.Exec(`
			INSERT IGNORE INTO products (name, slug, description, price, stock_quantity, category_id, image_url, model_variant, is_active)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
			p.Name, slug, p.Description, p.Price, p.Stock, categoryIDs[p.Category], p.Image, p.Variant)
		if err != nil {
			log.Printf("skip product %s: %v", p.Name, err)
		}
	}
	log.Printf("seeded %d products", len(products))

	adminHash, err := utils.HashPassword("Admin@12345")
	if err != nil {
		log.Fatal(err)
	}
	_, err = db.Exec(`INSERT IGNORE INTO users (name, email, password_hash, role, is_verified) VALUES (?, ?, ?, 'admin', TRUE)`,
		"Store Admin", "admin@applestore.dev", adminHash)
	if err != nil {
		log.Printf("skip admin user: %v", err)
	}

	demoHash, _ := utils.HashPassword("Demo@12345")
	_, err = db.Exec(`INSERT IGNORE INTO users (name, email, password_hash, role, is_verified) VALUES (?, ?, ?, 'user', TRUE)`,
		"Demo Customer", "demo@applestore.dev", demoHash)
	if err != nil {
		log.Printf("skip demo user: %v", err)
	}

	if _, err := db.Exec(`UPDATE users SET is_verified = TRUE WHERE email IN ('admin@applestore.dev', 'demo@applestore.dev')`); err != nil {
		log.Printf("verify seed users: %v", err)
	}

	log.Println("seed complete.")
	log.Println("admin login -> email: admin@applestore.dev / password: Admin@12345")
	log.Println("demo login  -> email: demo@applestore.dev  / password: Demo@12345")
}
