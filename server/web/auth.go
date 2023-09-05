package web

import (
	"fmt"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/normanjaeckel/Meier/server/config"
)

const (
	authCookieName = "maier"
	loginTime      = 265 * 24 * time.Hour

	roleAdmin  = "admin"
	roleReader = "reader"
	rolePupil  = "pupil"
)

type authPayload struct {
	jwt.RegisteredClaims
	Role string `json:"role"`
	ID   int    `json:"id,omitemtpy"`
}

func setAuthToken(w http.ResponseWriter, role string, id int, cfg config.Config) error {
	claims := authPayload{
		Role: role,
		ID:   id,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(loginTime)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString([]byte(cfg.Secred))
	if err != nil {
		return fmt.Errorf("signing token: %w", err)
	}

	http.SetCookie(w, &http.Cookie{Name: authCookieName, Value: tokenString, Path: "/", MaxAge: int(loginTime.Seconds()), Secure: true})

	return nil
}

func checkClaim(tokenString string, secred []byte, role string, id int) (bool, error) {
	var claim authPayload

	_, err := jwt.ParseWithClaims(tokenString, &claim, func(token *jwt.Token) (interface{}, error) {
		return secred, nil
	})
	if err != nil {
		return false, fmt.Errorf("parsing token: %w", err)
	}

	return claim.Role == role && (claim.ID == 0 || claim.ID == id), nil
}

func isAdmin(r *http.Request, cfg config.Config) bool {
	c, err := r.Cookie(authCookieName)
	if err != nil {
		return false
	}

	v, _ := checkClaim(c.Value, []byte(cfg.Secred), roleAdmin, 0)
	return v
}

func isReader(r *http.Request, cfg config.Config, id int) bool {
	c, err := r.Cookie(authCookieName)
	if err != nil {
		return false
	}

	v, _ := checkClaim(c.Value, []byte(cfg.Secred), roleReader, id)
	return v
}

func isPupil(r *http.Request, cfg config.Config, id int) bool {
	c, err := r.Cookie(authCookieName)
	if err != nil {
		return false
	}

	v, _ := checkClaim(c.Value, []byte(cfg.Secred), rolePupil, id)
	return v
}
