package service

import (
	"errors"
	"fmt"

	"apple-store-backend/internal/repository"

	"github.com/stripe/stripe-go/v78"
	"github.com/stripe/stripe-go/v78/paymentintent"
)

type PaymentService struct {
	Orders *repository.OrderRepository
}

func NewPaymentService(secretKey string, orders *repository.OrderRepository) *PaymentService {
	stripe.Key = secretKey
	return &PaymentService{Orders: orders}
}

// CreatePaymentIntent creates a Stripe PaymentIntent (test mode) for the given
// order total (in the smallest currency unit, e.g. cents) and links it to the order.
func (s *PaymentService) CreatePaymentIntent(orderID uint, amountCents int64, currency string) (*stripe.PaymentIntent, error) {
	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(amountCents),
		Currency: stripe.String(currency),
		Metadata: map[string]string{
			"order_id": itoa(orderID),
		},
		AutomaticPaymentMethods: &stripe.PaymentIntentAutomaticPaymentMethodsParams{
			Enabled: stripe.Bool(true),
		},
	}
	pi, err := paymentintent.New(params)
	if err != nil {
		return nil, err
	}
	_ = s.Orders.UpdatePaymentStatus(orderID, "unpaid", pi.ID)
	return pi, nil
}

// ConfirmOrderPayment verifies the linked Stripe PaymentIntent and marks the order paid.
func (s *PaymentService) ConfirmOrderPayment(orderID uint) error {
	order, err := s.Orders.FindByID(orderID)
	if err != nil {
		return errors.New("order not found")
	}
	if order.PaymentStatus == "paid" {
		return nil
	}
	if order.StripePaymentIntentID == "" {
		return errors.New("no payment intent linked to this order")
	}

	pi, err := paymentintent.Get(order.StripePaymentIntentID, nil)
	if err != nil {
		return err
	}
	if pi.Status != stripe.PaymentIntentStatusSucceeded {
		return fmt.Errorf("payment not completed (status: %s)", pi.Status)
	}

	return s.Orders.MarkPaidByIntent(order.StripePaymentIntentID)
}

func (s *PaymentService) MarkOrderPaidByIntent(intentID string) error {
	return s.Orders.MarkPaidByIntent(intentID)
}

func itoa(u uint) string {
	if u == 0 {
		return "0"
	}
	digits := []byte{}
	for u > 0 {
		digits = append([]byte{byte('0' + u%10)}, digits...)
		u /= 10
	}
	return string(digits)
}
