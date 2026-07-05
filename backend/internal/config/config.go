package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	ServerPort          string
	Env                 string
	DBHost              string
	DBPort              string
	DBUser              string
	DBPassword          string
	DBName              string
	JWTSecret           string
	JWTExpiryHours      int
	StripeSecretKey     string
	StripeWebhookSecret string
	FrontendURL         string
	SMTPHost            string
	SMTPPort            int
	SMTPUsername        string
	SMTPPassword        string
	SMTPFrom            string
}

// Load reads environment variables (via .env if present) into a Config struct.
func Load() *Config {
	_ = godotenv.Load()

	expiry, err := strconv.Atoi(getEnv("JWT_EXPIRY_HOURS", "24"))
	if err != nil {
		expiry = 24
	}

	smtpUser := getEnv("SMTP_USERNAME", "")
	if smtpUser == "" {
		smtpUser = getEnv("SMTP_EMAIL", "")
	}
	smtpFrom := getEnv("SMTP_FROM", "")
	if smtpFrom == "" {
		smtpFrom = smtpUser
	}
	smtpPort, err := strconv.Atoi(getEnv("SMTP_PORT", "587"))
	if err != nil {
		smtpPort = 587
	}

	return &Config{
		ServerPort:          getEnv("SERVER_PORT", "8080"),
		Env:                 getEnv("ENV", "development"),
		DBHost:              getEnv("DB_HOST", "127.0.0.1"),
		DBPort:              getEnv("DB_PORT", "3306"),
		DBUser:              getEnv("DB_USER", "root"),
		DBPassword:          getEnv("DB_PASSWORD", ""),
		DBName:              getEnv("DB_NAME", "apple_store"),
		JWTSecret:           getEnv("JWT_SECRET", "insecure_dev_secret_change_me"),
		JWTExpiryHours:      expiry,
		StripeSecretKey:     getEnv("STRIPE_SECRET_KEY", ""),
		StripeWebhookSecret: getEnv("STRIPE_WEBHOOK_SECRET", ""),
		FrontendURL:         getEnv("FRONTEND_URL", "http://localhost:3000"),
		SMTPHost:            getEnv("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:            smtpPort,
		SMTPUsername:        smtpUser,
		SMTPPassword:        getEnv("SMTP_PASSWORD", ""),
		SMTPFrom:            smtpFrom,
	}
}

func getEnv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return fallback
}

// DSN builds the MySQL data source name used by database/sql.
func (c *Config) DSN() string {
	return c.DBUser + ":" + c.DBPassword + "@tcp(" + c.DBHost + ":" + c.DBPort + ")/" + c.DBName + "?parseTime=true&charset=utf8mb4&loc=Local"
}
