package service

import (
	"crypto/rand"
	"errors"
	"fmt"
	"math/big"
	"time"

	"apple-store-backend/internal/models"
	"apple-store-backend/internal/repository"
	"apple-store-backend/internal/utils"
)

type AuthService struct {
	Users         *repository.UserRepository
	Verification  *repository.VerificationRepository
	PasswordReset *repository.PasswordResetRepository
	Email         *EmailService
	JWTSecret     string
	JWTExpiry     int
}

func NewAuthService(
	users *repository.UserRepository,
	verification *repository.VerificationRepository,
	passwordReset *repository.PasswordResetRepository,
	email *EmailService,
	jwtSecret string,
	jwtExpiry int,
) *AuthService {
	return &AuthService{
		Users:         users,
		Verification:  verification,
		PasswordReset: passwordReset,
		Email:         email,
		JWTSecret:     jwtSecret,
		JWTExpiry:     jwtExpiry,
	}
}

var (
	ErrEmailTaken      = errors.New("an account with this email already exists")
	ErrInvalidCreds    = errors.New("invalid email or password")
	ErrWrongPassword   = errors.New("current password is incorrect")
	ErrNotVerified     = errors.New("please verify your email first")
	ErrInvalidCode     = errors.New("invalid or expired verification code")
	ErrInvalidResetCode = errors.New("invalid or expired reset code")
	ErrInvalidResetToken = errors.New("invalid or expired reset token")
	ErrAlreadyVerified = errors.New("email is already verified")
)

const (
	forgotPasswordMessage = "If an account exists with this email, a reset code has been sent"
	resetTokenExpiryMin   = 10
)

func (s *AuthService) Register(name, email, password string) (*models.User, string, error) {
	if !utils.IsValidEmail(email) {
		return nil, "", errors.New("please provide a valid email address")
	}
	if len(password) < 8 {
		return nil, "", errors.New("password must be at least 8 characters")
	}
	if utils.IsBlank(name) {
		return nil, "", errors.New("name is required")
	}

	hash, err := utils.HashPassword(password)
	if err != nil {
		return nil, "", err
	}

	if existing, err := s.Users.FindByEmail(email); err == nil {
		if existing.IsVerified {
			return nil, "", ErrEmailTaken
		}
		return s.resendVerificationForUnverified(existing, name, hash)
	}

	u := &models.User{Name: name, Email: email, PasswordHash: hash, Role: "user", IsVerified: false}
	id, err := s.Users.Create(u)
	if err != nil {
		return nil, "", err
	}
	u.ID = id

	msg := "Check your email for a verification code"
	if err := s.sendVerificationCode(u); err != nil {
		msg = "Account created. We couldn't send the verification email — use Resend Code on the verification page."
	}

	return u, msg, nil
}

func (s *AuthService) resendVerificationForUnverified(u *models.User, name, passwordHash string) (*models.User, string, error) {
	if err := s.Users.UpdateProfile(u.ID, name); err != nil {
		return nil, "", err
	}
	if err := s.Users.UpdatePassword(u.ID, passwordHash); err != nil {
		return nil, "", err
	}
	u.Name = name

	msg := "An account with this email exists but is not verified. We've sent a new verification code."
	if err := s.sendVerificationCode(u); err != nil {
		msg = "An account with this email exists but is not verified. We couldn't send the email — use Resend Code on the verification page."
	}

	return u, msg, nil
}

func (s *AuthService) VerifyEmail(email, code string) (*models.User, string, error) {
	u, err := s.Users.FindByEmail(email)
	if err != nil {
		return nil, "", ErrInvalidCode
	}
	if u.IsVerified {
		return nil, "", ErrAlreadyVerified
	}

	if _, err := s.Verification.FindValid(u.ID, code); err != nil {
		return nil, "", ErrInvalidCode
	}

	if err := s.Users.SetVerified(u.ID); err != nil {
		return nil, "", err
	}
	_ = s.Verification.DeleteByUserID(u.ID)

	u.IsVerified = true
	token, err := utils.GenerateToken(u.ID, u.Role, s.JWTSecret, s.JWTExpiry)
	if err != nil {
		return nil, "", err
	}
	return u, token, nil
}

func (s *AuthService) ResendCode(email string) error {
	u, err := s.Users.FindByEmail(email)
	if err != nil {
		return errors.New("no account found with that email")
	}
	if u.IsVerified {
		return ErrAlreadyVerified
	}
	return s.sendVerificationCode(u)
}

func (s *AuthService) sendVerificationCode(u *models.User) error {
	code, err := generateVerificationCode()
	if err != nil {
		return err
	}
	expiresAt := time.Now().Add(10 * time.Minute)
	if err := s.Verification.ReplaceCode(u.ID, code, expiresAt); err != nil {
		return err
	}
	return s.Email.SendVerificationCode(u.Email, u.Name, code)
}

func generateVerificationCode() (string, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(1000000))
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%06d", n.Int64()), nil
}

func (s *AuthService) Login(email, password string) (*models.User, string, error) {
	u, err := s.Users.FindByEmail(email)
	if err != nil {
		return nil, "", ErrInvalidCreds
	}
	if !utils.CheckPassword(password, u.PasswordHash) {
		return nil, "", ErrInvalidCreds
	}
	if !u.IsVerified {
		return nil, "", ErrNotVerified
	}
	token, err := utils.GenerateToken(u.ID, u.Role, s.JWTSecret, s.JWTExpiry)
	if err != nil {
		return nil, "", err
	}
	return u, token, nil
}

func (s *AuthService) ChangePassword(userID uint, currentPassword, newPassword string) error {
	if len(newPassword) < 8 {
		return errors.New("password must be at least 8 characters")
	}

	u, err := s.Users.FindByID(userID)
	if err != nil {
		return errors.New("user not found")
	}
	if !utils.CheckPassword(currentPassword, u.PasswordHash) {
		return ErrWrongPassword
	}

	hash, err := utils.HashPassword(newPassword)
	if err != nil {
		return err
	}

	return s.Users.UpdatePassword(userID, hash)
}

func (s *AuthService) ForgotPassword(email string) (string, error) {
	if !utils.IsValidEmail(email) {
		return "", errors.New("please provide a valid email address")
	}

	u, err := s.Users.FindByEmail(email)
	if err != nil {
		return forgotPasswordMessage, nil
	}

	_ = s.sendPasswordResetCode(u)
	return forgotPasswordMessage, nil
}

func (s *AuthService) VerifyResetCode(email, code string) (string, error) {
	u, err := s.Users.FindByEmail(email)
	if err != nil {
		return "", ErrInvalidResetCode
	}

	if _, err := s.PasswordReset.FindValid(u.ID, code); err != nil {
		return "", ErrInvalidResetCode
	}

	token, err := utils.GenerateResetToken(u.ID, s.JWTSecret, resetTokenExpiryMin)
	if err != nil {
		return "", err
	}
	return token, nil
}

func (s *AuthService) ResetPassword(email, resetToken, newPassword string) error {
	if len(newPassword) < 8 {
		return errors.New("password must be at least 8 characters")
	}

	u, err := s.Users.FindByEmail(email)
	if err != nil {
		return ErrInvalidResetToken
	}

	userID, err := utils.ParseResetToken(resetToken, s.JWTSecret)
	if err != nil || userID != u.ID {
		return ErrInvalidResetToken
	}

	hash, err := utils.HashPassword(newPassword)
	if err != nil {
		return err
	}

	if err := s.Users.UpdatePassword(u.ID, hash); err != nil {
		return err
	}
	return s.PasswordReset.DeleteByUserID(u.ID)
}

func (s *AuthService) sendPasswordResetCode(u *models.User) error {
	code, err := generateVerificationCode()
	if err != nil {
		return err
	}
	expiresAt := time.Now().Add(10 * time.Minute)
	if err := s.PasswordReset.ReplaceCode(u.ID, code, expiresAt); err != nil {
		return err
	}
	return s.Email.SendPasswordResetCode(u.Email, u.Name, code)
}
