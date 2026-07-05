package service

import (
	"fmt"

	"gopkg.in/gomail.v2"
)

type EmailService struct {
	Host     string
	Port     int
	Username string
	Password string
	From     string
}

func NewEmailService(host string, port int, username, password, from string) *EmailService {
	if from == "" {
		from = username
	}
	return &EmailService{
		Host:     host,
		Port:     port,
		Username: username,
		Password: password,
		From:     from,
	}
}

func (s *EmailService) configured() bool {
	return s.Host != "" && s.Port > 0 && s.Username != "" && s.Password != ""
}

func (s *EmailService) SendVerificationCode(toEmail, name, code string) error {
	if !s.configured() {
		return fmt.Errorf("email service is not configured")
	}

	html := fmt.Sprintf(
		`<p>Hi %s,</p><p>Your verification code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px">%s</p><p>This code expires in 10 minutes.</p>`,
		name, code,
	)

	msg := gomail.NewMessage()
	msg.SetHeader("From", fmt.Sprintf("Apple Store <%s>", s.From))
	msg.SetHeader("To", toEmail)
	msg.SetHeader("Subject", "Verify your Apple Store account")
	msg.SetBody("text/html", html)

	dialer := gomail.NewDialer(s.Host, s.Port, s.Username, s.Password)
	if err := dialer.DialAndSend(msg); err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}

func (s *EmailService) SendPasswordResetCode(toEmail, name, code string) error {
	if !s.configured() {
		return fmt.Errorf("email service is not configured")
	}

	html := fmt.Sprintf(
		`<p>Hi %s,</p><p>Your password reset code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px">%s</p><p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>`,
		name, code,
	)

	msg := gomail.NewMessage()
	msg.SetHeader("From", fmt.Sprintf("Apple Store <%s>", s.From))
	msg.SetHeader("To", toEmail)
	msg.SetHeader("Subject", "Reset your Apple Store password")
	msg.SetBody("text/html", html)

	dialer := gomail.NewDialer(s.Host, s.Port, s.Username, s.Password)
	if err := dialer.DialAndSend(msg); err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}
