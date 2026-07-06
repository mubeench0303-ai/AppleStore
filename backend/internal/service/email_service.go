package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"gopkg.in/gomail.v2"
)

type EmailService struct {
	Host        string
	Port        int
	Username    string
	Password    string
	From        string
	BrevoAPIKey string
}

func NewEmailService(host string, port int, username, password, from, brevoAPIKey string) *EmailService {
	if from == "" {
		from = username
	}
	return &EmailService{
		Host:        host,
		Port:        port,
		Username:    username,
		Password:    password,
		From:        from,
		BrevoAPIKey: brevoAPIKey,
	}
}

func (s *EmailService) configured() bool {
	if s.BrevoAPIKey != "" && s.From != "" {
		return true
	}
	return s.Host != "" && s.Port > 0 && s.Username != "" && s.Password != ""
}

func (s *EmailService) SendVerificationCode(toEmail, name, code string) error {
	html := fmt.Sprintf(
		`<p>Hi %s,</p><p>Your verification code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px">%s</p><p>This code expires in 10 minutes.</p>`,
		name, code,
	)
	return s.send(toEmail, "Verify your Apple Store account", html)
}

func (s *EmailService) SendPasswordResetCode(toEmail, name, code string) error {
	html := fmt.Sprintf(
		`<p>Hi %s,</p><p>Your password reset code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px">%s</p><p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>`,
		name, code,
	)
	return s.send(toEmail, "Reset your Apple Store password", html)
}

func (s *EmailService) send(toEmail, subject, html string) error {
	if !s.configured() {
		return fmt.Errorf("email service is not configured")
	}
	if s.BrevoAPIKey != "" {
		return s.sendViaBrevo(toEmail, subject, html)
	}
	return s.sendViaSMTP(toEmail, subject, html)
}

func (s *EmailService) sendViaSMTP(toEmail, subject, html string) error {
	msg := gomail.NewMessage()
	msg.SetHeader("From", fmt.Sprintf("Apple Store <%s>", s.From))
	msg.SetHeader("To", toEmail)
	msg.SetHeader("Subject", subject)
	msg.SetBody("text/html", html)

	dialer := gomail.NewDialer(s.Host, s.Port, s.Username, s.Password)
	if err := dialer.DialAndSend(msg); err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}
	return nil
}

func (s *EmailService) sendViaBrevo(toEmail, subject, html string) error {
	payload := map[string]interface{}{
		"sender":      map[string]string{"email": s.From, "name": "Apple Store"},
		"to":          []map[string]string{{"email": toEmail}},
		"subject":     subject,
		"htmlContent": html,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, "https://api.brevo.com/v3/smtp/email", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}
	req.Header.Set("api-key", s.BrevoAPIKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode >= 200 && res.StatusCode < 300 {
		return nil
	}

	respBody, _ := io.ReadAll(res.Body)
	return fmt.Errorf("failed to send email: brevo returned %d: %s", res.StatusCode, string(respBody))
}
