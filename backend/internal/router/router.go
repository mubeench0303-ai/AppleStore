package router

import (
	"database/sql"
	"net/http"

	"apple-store-backend/internal/config"
	"apple-store-backend/internal/handler"
	"apple-store-backend/internal/middleware"
	"apple-store-backend/internal/repository"
	"apple-store-backend/internal/service"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func New(db *sql.DB, cfg *config.Config) *chi.Mux {
	r := chi.NewRouter()

	r.Use(chimw.Logger)
	r.Use(chimw.Recoverer)
	r.Use(chimw.RequestID)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{cfg.FrontendURL},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Repositories
	userRepo := repository.NewUserRepository(db)
	categoryRepo := repository.NewCategoryRepository(db)
	productRepo := repository.NewProductRepository(db)
	cartRepo := repository.NewCartRepository(db)
	orderRepo := repository.NewOrderRepository(db)
	addressRepo := repository.NewAddressRepository(db)
	reviewRepo := repository.NewReviewRepository(db)
	verificationRepo := repository.NewVerificationRepository(db)
	passwordResetRepo := repository.NewPasswordResetRepository(db)

	// Services
	emailService := service.NewEmailService(cfg.SMTPHost, cfg.SMTPPort, cfg.SMTPUsername, cfg.SMTPPassword, cfg.SMTPFrom, cfg.BrevoAPIKey)
	authService := service.NewAuthService(userRepo, verificationRepo, passwordResetRepo, emailService, cfg.JWTSecret, cfg.JWTExpiryHours)
	productService := service.NewProductService(productRepo, categoryRepo)
	cartService := service.NewCartService(cartRepo, productRepo)
	orderService := service.NewOrderService(db, orderRepo, cartRepo, productRepo)
	paymentService := service.NewPaymentService(cfg.StripeSecretKey, orderRepo)

	// Handlers
	authHandler := handler.NewAuthHandler(authService, cfg.Env == "production")
	productHandler := handler.NewProductHandler(productService)
	categoryHandler := handler.NewCategoryHandler(categoryRepo)
	cartHandler := handler.NewCartHandler(cartService)
	orderHandler := handler.NewOrderHandler(orderService, paymentService, cfg.StripeWebhookSecret)
	addressHandler := handler.NewAddressHandler(addressRepo)
	reviewHandler := handler.NewReviewHandler(reviewRepo)
	userHandler := handler.NewUserHandler(userRepo, authService)

	auth := middleware.Auth(cfg.JWTSecret)

	r.Get("/health", func(w http.ResponseWriter, req *http.Request) {
		w.Write([]byte(`{"status":"ok"}`))
	})

	r.Route("/api/v1", func(r chi.Router) {
		// Public auth
		r.Post("/auth/register", authHandler.Register)
		r.Post("/auth/verify-email", authHandler.VerifyEmail)
		r.Post("/auth/resend-code", authHandler.ResendCode)
		r.Post("/auth/forgot-password", authHandler.ForgotPassword)
		r.Post("/auth/verify-reset-code", authHandler.VerifyResetCode)
		r.Post("/auth/reset-password", authHandler.ResetPassword)
		r.Post("/auth/login", authHandler.Login)
		r.Post("/auth/logout", authHandler.Logout)

		// Public catalog
		r.Get("/products", productHandler.List)
		r.Get("/products/{slug}", productHandler.GetBySlug)
		r.Get("/categories", categoryHandler.List)
		r.Get("/products/{productId}/reviews", reviewHandler.ListByProduct)

		// Stripe webhook (public, verified via signature in production)
		r.Post("/webhooks/stripe", orderHandler.StripeWebhook)

		// Authenticated (any logged-in user)
		r.Group(func(r chi.Router) {
			r.Use(auth)

			r.Get("/auth/me", authHandler.Me)
			r.Put("/users/me", userHandler.UpdateProfile)
			r.Put("/users/me/password", userHandler.ChangePassword)

			r.Get("/cart", cartHandler.Get)
			r.Post("/cart/items", cartHandler.AddItem)
			r.Put("/cart/items", cartHandler.UpdateItem)
			r.Delete("/cart/items", cartHandler.RemoveItem)

			r.Post("/checkout", orderHandler.Checkout)
			r.Get("/orders", orderHandler.MyOrders)
			r.Get("/orders/{id}", orderHandler.GetOne)
			r.Post("/orders/{id}/confirm-payment", orderHandler.ConfirmPayment)

			r.Get("/addresses", addressHandler.List)
			r.Post("/addresses", addressHandler.Create)
			r.Put("/addresses/{id}", addressHandler.Update)
			r.Delete("/addresses/{id}", addressHandler.Delete)

			r.Post("/reviews", reviewHandler.Create)
		})

		// Admin only
		r.Group(func(r chi.Router) {
			r.Use(auth)
			r.Use(middleware.AdminOnly)

			r.Get("/admin/stats", orderHandler.Stats)

			r.Get("/admin/products", productHandler.AdminList)
			r.Post("/admin/products", productHandler.Create)
			r.Put("/admin/products/{id}", productHandler.Update)
			r.Delete("/admin/products/{id}", productHandler.Delete)

			r.Post("/admin/categories", categoryHandler.Create)
			r.Put("/admin/categories/{id}", categoryHandler.Update)
			r.Delete("/admin/categories/{id}", categoryHandler.Delete)

			r.Get("/admin/orders", orderHandler.AdminList)
			r.Get("/admin/orders/{id}", orderHandler.AdminGetOne)
			r.Patch("/admin/orders/{id}/status", orderHandler.UpdateStatus)
		})
	})

	return r
}
