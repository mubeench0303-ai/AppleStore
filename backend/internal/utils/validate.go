package utils

import (
	"regexp"
	"strings"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

func IsValidEmail(email string) bool {
	return emailRegex.MatchString(strings.TrimSpace(email))
}

func IsBlank(s string) bool {
	return strings.TrimSpace(s) == ""
}
