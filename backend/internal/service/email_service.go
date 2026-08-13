package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	"gopkg.in/gomail.v2"
)

type EmailService struct {
	Host           string
	Port           int
	Username       string
	Password       string
	From           string
	IXmailerAPIKey string
}

func NewEmailService(host string, port int, username, password, from, ixmailerAPIKey string) *EmailService {
	from = strings.TrimSpace(from)
	ixmailerAPIKey = strings.TrimSpace(ixmailerAPIKey)
	if from == "" {
		from = strings.TrimSpace(username)
	}
	s := &EmailService{
		Host:           host,
		Port:           port,
		Username:       username,
		Password:       password,
		From:           from,
		IXmailerAPIKey: ixmailerAPIKey,
	}
	s.logStartupConfig()
	return s
}

func (s *EmailService) logStartupConfig() {
	switch {
	case s.IXmailerAPIKey != "":
		log.Printf("email: using IXmailer API (from=%s, key_set=true)", s.From)
	case s.Host != "" && s.Port > 0 && s.Username != "" && s.Password != "":
		log.Printf("email: using SMTP fallback (host=%s:%d, from=%s)", s.Host, s.Port, s.From)
	default:
		log.Printf("email: not configured (from=%s, ixmailer_key_set=%t)", s.From, s.IXmailerAPIKey != "")
	}
}

func (s *EmailService) configured() bool {
	if s.IXmailerAPIKey != "" && s.From != "" {
		return true
	}
	return s.Host != "" && s.Port > 0 && s.Username != "" && s.Password != ""
}

func (s *EmailService) SendVerificationCode(toEmail, name, code string) error {
	text := fmt.Sprintf("Hi %s,\n\nYour verification code is: %s\n\nThis code expires in 10 minutes.", name, code)
	return s.send(toEmail, "Verify your Apple Store account", text, text)
}

func (s *EmailService) SendPasswordResetCode(toEmail, name, code string) error {
	text := fmt.Sprintf("Hi %s,\n\nYour password reset code is: %s\n\nThis code expires in 10 minutes. If you didn't request this, you can ignore this email.", name, code)
	return s.send(toEmail, "Reset your Apple Store password", text, text)
}

func (s *EmailService) send(toEmail, subject, htmlBody, text string) error {
	if !s.configured() {
		log.Printf("email: send blocked — service not configured (to=%s, subject=%q)", toEmail, subject)
		return fmt.Errorf("email service is not configured")
	}
	if s.IXmailerAPIKey != "" {
		log.Printf("email: sending via IXmailer API (to=%s, from=%s, subject=%q)", toEmail, s.From, subject)
		return s.sendViaIXmailer(toEmail, subject, htmlBody, text)
	}
	log.Printf("email: sending via SMTP (to=%s, host=%s:%d, subject=%q)", toEmail, s.Host, s.Port, subject)
	return s.sendViaSMTP(toEmail, subject, htmlBody)
}

func (s *EmailService) sendViaSMTP(toEmail, subject, html string) error {
	msg := gomail.NewMessage()
	msg.SetHeader("From", fmt.Sprintf("Apple Store <%s>", s.From))
	msg.SetHeader("To", toEmail)
	msg.SetHeader("Subject", subject)
	msg.SetBody("text/html", html)

	dialer := gomail.NewDialer(s.Host, s.Port, s.Username, s.Password)
	if err := dialer.DialAndSend(msg); err != nil {
		log.Printf("email: SMTP failed (to=%s): %v", toEmail, err)
		return fmt.Errorf("failed to send email: %w", err)
	}
	log.Printf("email: SMTP sent successfully (to=%s)", toEmail)
	return nil
}

func (s *EmailService) sendViaIXmailer(toEmail, subject, htmlBody, text string) error {
	payload := map[string]interface{}{
		"from":     s.From,
		"fromName": "Apple Store",
		"to":       toEmail,
		"subject":  subject,
		"html":     htmlBody,
		"text":     text,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, "https://api.ixmailer.com/v1/messages", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+s.IXmailerAPIKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Printf("email: IXmailer request failed (to=%s): %v", toEmail, err)
		return fmt.Errorf("failed to send email: %w", err)
	}
	defer res.Body.Close()

	respBody, _ := io.ReadAll(res.Body)
	if res.StatusCode >= 200 && res.StatusCode < 300 {
		log.Printf("email: IXmailer sent successfully (to=%s, status=%d, body=%s)", toEmail, res.StatusCode, string(respBody))
		return nil
	}

	log.Printf("email: IXmailer rejected (to=%s, status=%d, body=%s)", toEmail, res.StatusCode, string(respBody))
	return fmt.Errorf("failed to send email: ixmailer returned %d: %s", res.StatusCode, string(respBody))
}
