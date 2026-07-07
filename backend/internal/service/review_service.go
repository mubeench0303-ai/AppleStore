package service

import (
	"errors"
	"strings"

	"apple-store-backend/internal/models"
	"apple-store-backend/internal/repository"
)

var (
	ErrReviewNotEligible   = errors.New("you can only review products from delivered orders")
	ErrReviewAlreadyExists = errors.New("you have already reviewed this product")
)

type ReviewService struct {
	Reviews *repository.ReviewRepository
}

func NewReviewService(reviews *repository.ReviewRepository) *ReviewService {
	return &ReviewService{Reviews: reviews}
}

func (s *ReviewService) ListByProduct(productID uint) ([]models.Review, error) {
	reviews, err := s.Reviews.FindByProduct(productID)
	if err != nil {
		return nil, err
	}
	if reviews == nil {
		reviews = []models.Review{}
	}
	return reviews, nil
}

func (s *ReviewService) Create(userID, productID, orderID uint, rating int, comment string) (*models.Review, error) {
	if rating < 1 || rating > 5 {
		return nil, errors.New("rating must be between 1 and 5")
	}
	comment = strings.TrimSpace(comment)
	if comment == "" {
		return nil, errors.New("comment is required")
	}
	if orderID == 0 || productID == 0 {
		return nil, errors.New("product_id and order_id are required")
	}

	exists, err := s.Reviews.ExistsForUserProduct(userID, productID)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrReviewAlreadyExists
	}

	eligible, err := s.Reviews.UserOwnsDeliveredOrderItem(userID, orderID, productID)
	if err != nil {
		return nil, err
	}
	if !eligible {
		return nil, ErrReviewNotEligible
	}

	review := &models.Review{
		ProductID: productID,
		UserID:    userID,
		OrderID:   orderID,
		Rating:    rating,
		Comment:   comment,
	}
	id, err := s.Reviews.Create(review)
	if err != nil {
		return nil, err
	}
	review.ID = id
	return review, nil
}

func (s *ReviewService) EnrichOrderForUser(order *models.Order, userID uint) error {
	if len(order.Items) == 0 {
		return nil
	}

	productIDs := make([]uint, len(order.Items))
	for i, item := range order.Items {
		productIDs[i] = item.ProductID
	}

	reviewed, err := s.Reviews.ReviewedProductIDs(userID, productIDs)
	if err != nil {
		return err
	}

	delivered := order.Status == "delivered"
	for i := range order.Items {
		pid := order.Items[i].ProductID
		order.Items[i].HasReviewed = reviewed[pid]
		order.Items[i].CanReview = delivered && !reviewed[pid]
	}
	return nil
}
