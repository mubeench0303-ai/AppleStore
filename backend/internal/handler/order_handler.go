package handler

import (
	"encoding/json"
	"io"
	"net/http"
	"strconv"

	"apple-store-backend/internal/middleware"
	"apple-store-backend/internal/models"
	"apple-store-backend/internal/service"
	"apple-store-backend/internal/utils"

	"github.com/go-chi/chi/v5"
	"github.com/stripe/stripe-go/v78"
	"github.com/stripe/stripe-go/v78/webhook"
)

type OrderHandler struct {
	Orders        *service.OrderService
	Payments      *service.PaymentService
	Reviews       *service.ReviewService
	WebhookSecret string
}

func NewOrderHandler(o *service.OrderService, p *service.PaymentService, reviews *service.ReviewService, webhookSecret string) *OrderHandler {
	return &OrderHandler{Orders: o, Payments: p, Reviews: reviews, WebhookSecret: webhookSecret}
}

type checkoutRequest struct {
	ShippingAddress string `json:"shipping_address"`
}

// Checkout creates a pending order from the user's cart and returns a Stripe
// PaymentIntent client secret for the frontend to confirm payment with.
func (h *OrderHandler) Checkout(w http.ResponseWriter, r *http.Request) {
	userID, _ := middleware.GetUserID(r)
	var req checkoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.ShippingAddress == "" {
		utils.Error(w, http.StatusBadRequest, "shipping address is required")
		return
	}

	order, err := h.Orders.CreateOrderFromCart(userID, req.ShippingAddress)
	if err != nil {
		utils.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	amountCents := int64(order.TotalAmount * 100)
	pi, err := h.Payments.CreatePaymentIntent(order.ID, amountCents, "usd")
	if err != nil {
		// Order still exists as "pending/unpaid"; surface the Stripe error but keep the order.
		utils.Success(w, http.StatusCreated, map[string]interface{}{
			"order":         order,
			"payment_error": "Stripe payment intent could not be created: " + err.Error(),
		})
		return
	}

	utils.Success(w, http.StatusCreated, map[string]interface{}{
		"order":         order,
		"client_secret": pi.ClientSecret,
	})
}

func (h *OrderHandler) MyOrders(w http.ResponseWriter, r *http.Request) {
	userID, _ := middleware.GetUserID(r)
	orders, err := h.Orders.ListForUser(userID)
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, "failed to load orders")
		return
	}
	utils.Success(w, http.StatusOK, orders)
}

func (h *OrderHandler) GetOne(w http.ResponseWriter, r *http.Request) {
	userID, _ := middleware.GetUserID(r)
	role, _ := middleware.GetRole(r)
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid order id")
		return
	}
	order, err := h.Orders.Get(uint(id))
	if err != nil {
		utils.Error(w, http.StatusNotFound, "order not found")
		return
	}
	if order.UserID != userID && role != "admin" {
		utils.Error(w, http.StatusForbidden, "not allowed to view this order")
		return
	}
	if order.UserID == userID && h.Reviews != nil {
		_ = h.Reviews.EnrichOrderForUser(order, userID)
	}
	utils.Success(w, http.StatusOK, order)
}

// ConfirmPayment syncs order payment status with Stripe after the customer completes checkout.
func (h *OrderHandler) ConfirmPayment(w http.ResponseWriter, r *http.Request) {
	userID, _ := middleware.GetUserID(r)
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid order id")
		return
	}

	order, err := h.Orders.Get(uint(id))
	if err != nil {
		utils.Error(w, http.StatusNotFound, "order not found")
		return
	}
	if order.UserID != userID {
		utils.Error(w, http.StatusForbidden, "not allowed to confirm this order")
		return
	}

	if err := h.Payments.ConfirmOrderPayment(uint(id)); err != nil {
		utils.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	order, err = h.Orders.Get(uint(id))
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, "failed to load order")
		return
	}
	utils.Success(w, http.StatusOK, order)
}

// --- Admin ---

func (h *OrderHandler) AdminList(w http.ResponseWriter, r *http.Request) {
	orders, err := h.Orders.ListAll()
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, "failed to load orders")
		return
	}
	if orders == nil {
		orders = []models.Order{}
	}
	utils.Success(w, http.StatusOK, orders)
}

func (h *OrderHandler) AdminGetOne(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid order id")
		return
	}
	order, err := h.Orders.GetAdmin(uint(id))
	if err != nil {
		utils.Error(w, http.StatusNotFound, "order not found")
		return
	}
	utils.Success(w, http.StatusOK, order)
}

type updateStatusRequest struct {
	Status string `json:"status"`
}

func (h *OrderHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid order id")
		return
	}
	var req updateStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.Orders.UpdateStatus(uint(id), req.Status); err != nil {
		utils.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	utils.Success(w, http.StatusOK, map[string]string{"message": "order status updated"})
}

func (h *OrderHandler) Stats(w http.ResponseWriter, r *http.Request) {
	totalOrders, revenue, productCount, err := h.Orders.Stats()
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, "failed to load stats")
		return
	}
	utils.Success(w, http.StatusOK, map[string]interface{}{
		"total_orders":   totalOrders,
		"total_revenue":  revenue,
		"total_products": productCount,
	})
}

// StripeWebhook marks orders as paid when Stripe confirms a successful payment.
func (h *OrderHandler) StripeWebhook(w http.ResponseWriter, r *http.Request) {
	const maxBodyBytes = int64(65536)
	r.Body = http.MaxBytesReader(w, r.Body, maxBodyBytes)
	payload, err := io.ReadAll(r.Body)
	if err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid webhook payload")
		return
	}

	var event stripe.Event
	if h.WebhookSecret != "" {
		sig := r.Header.Get("Stripe-Signature")
		event, err = webhook.ConstructEvent(payload, sig, h.WebhookSecret)
		if err != nil {
			utils.Error(w, http.StatusBadRequest, "invalid webhook signature")
			return
		}
	} else if err := json.Unmarshal(payload, &event); err != nil {
		utils.Error(w, http.StatusBadRequest, "invalid webhook payload")
		return
	}

	if event.Type == stripe.EventTypePaymentIntentSucceeded {
		var pi stripe.PaymentIntent
		if err := json.Unmarshal(event.Data.Raw, &pi); err == nil {
			_ = h.Payments.MarkOrderPaidByIntent(pi.ID)
		}
	}

	utils.Success(w, http.StatusOK, map[string]string{"received": "true"})
}
