package utils

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID  uint   `json:"user_id"`
	Role    string `json:"role"`
	Purpose string `json:"purpose,omitempty"`
	jwt.RegisteredClaims
}

func GenerateToken(userID uint, role string, secret string, expiryHours int) (string, error) {
	claims := Claims{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(expiryHours) * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func GenerateResetToken(userID uint, secret string, expiryMinutes int) (string, error) {
	claims := Claims{
		UserID:  userID,
		Role:    "user",
		Purpose: "password_reset",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(expiryMinutes) * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func ParseResetToken(tokenString, secret string) (uint, error) {
	claims, err := ParseToken(tokenString, secret)
	if err != nil {
		return 0, err
	}
	if claims.Purpose != "password_reset" {
		return 0, errors.New("invalid or expired reset token")
	}
	return claims.UserID, nil
}

func ParseToken(tokenString string, secret string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(secret), nil
	})
	if err != nil || !token.Valid {
		return nil, errors.New("invalid or expired token")
	}
	return claims, nil
}
