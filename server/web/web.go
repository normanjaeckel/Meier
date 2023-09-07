package web

import (
	"context"
	"embed"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"log/slog"
	"net"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
	"github.com/graph-gophers/graphql-go"
	"github.com/graph-gophers/graphql-go/relay"
	"github.com/normanjaeckel/Meier/server/config"
	"github.com/normanjaeckel/Meier/server/model"
	"github.com/ostcar/timer/sticky"
)

const pathPrefixAssets = "/assets"

//go:embed schema.graphql
var schema string

//go:embed files
var publicFiles embed.FS

// Run starts the webserver.
func Run(ctx context.Context, s *sticky.Sticky[model.Model], cfg config.Config) error {
	parsedSchema, err := graphql.ParseSchema(schema, &resolver{db: s}, graphql.UseFieldResolvers())
	if err != nil {
		return fmt.Errorf("parsing graphql schema: %w", err)
	}

	handler := registerHandlers(parsedSchema, cfg, s)

	srv := &http.Server{
		Addr:        cfg.WebListenAddr,
		Handler:     handler,
		BaseContext: func(net.Listener) context.Context { return ctx },
	}

	// Shutdown logic in separate goroutine.
	wait := make(chan error)
	go func() {
		// Wait for the context to be closed.
		<-ctx.Done()

		if err := srv.Shutdown(context.WithoutCancel(ctx)); err != nil {
			wait <- fmt.Errorf("HTTP server shutdown: %w", err)
			return
		}
		wait <- nil
	}()

	fmt.Printf("Listen webserver on: %s\n", cfg.WebListenAddr)
	if err := srv.ListenAndServe(); err != http.ErrServerClosed {
		return fmt.Errorf("HTTP Server failed: %v", err)
	}

	return <-wait
}

func registerHandlers(schema *graphql.Schema, cfg config.Config, s *sticky.Sticky[model.Model]) http.Handler {
	router := mux.NewRouter()
	router.Use(loggingMiddleware)

	router.Handle("/auth", handleLogin(cfg, s))
	router.Handle("/query", corsMiddleware(&relay.Handler{Schema: schema}))

	// route anything else to the embeded files folder
	router.PathPrefix("/").Handler(handleStatic())

	return router
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST,OPTIONS")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

type responselogger struct {
	http.ResponseWriter
	code int
}

func (r *responselogger) WriteHeader(code int) {
	r.code = code
	r.ResponseWriter.WriteHeader(code)
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		writer := &responselogger{w, 200}
		next.ServeHTTP(writer, r)
		slog.Info("Got request", "method", r.Method, "status", writer.code, "uri", r.RequestURI)
	})
}

func handleStatic() http.Handler {
	files, err := fs.Sub(publicFiles, "files")
	if err != nil {
		panic(err)
	}

	return http.FileServer(http.FS(files))
}

func handleLogin(cfg config.Config, db *sticky.Sticky[model.Model]) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var inData struct {
			Role  string `json:"role"`
			ID    int    `json:"id"`
			Token string `json:"token"`
		}
		if err := json.NewDecoder(r.Body).Decode(&inData); err != nil {
			handleUserError(w, "invalid data in body", 400, err)
			return
		}

		switch strings.ToLower(inData.Role) {
		case roleAdmin:
			if inData.Token != cfg.LoginToken {
				handleUserError(w, "invalid token", 400, nil)
				return
			}

			err := setAuthToken(w, roleAdmin, inData.ID, cfg)
			if err != nil {
				handleError(w, err)
				return
			}

		case roleReader:
			db.Read(func(m model.Model) {
				campaign, err := m.Campaign(inData.ID)
				if err != nil {
					handleError(w, err)
					return
				}

				if campaign.LoginToken != inData.Token {
					handleUserError(w, "invalid token", 400, nil)
					return
				}

				if err := setAuthToken(w, roleReader, inData.ID, cfg); err != nil {
					handleError(w, err)
					return
				}
			})

		case rolePupil:
			db.Read(func(m model.Model) {
				pupil, err := m.Pupil(inData.ID)
				if err != nil {
					handleError(w, err)
					return
				}

				if pupil.LoginToken != inData.Token {
					handleUserError(w, "invalid token", 400, nil)
					return
				}

				if err := setAuthToken(w, rolePupil, inData.ID, cfg); err != nil {
					handleError(w, err)
					return
				}
			})

		default:
			handleUserError(w, fmt.Sprintf("unknown auth role %s", inData.Role), 400, nil)
		}
	})
}

func handleUserError(w http.ResponseWriter, msg string, status int, err error) {
	http.Error(w, msg, status)
	slog.Debug(msg, "err", err)
}

func handleError(w http.ResponseWriter, err error) {
	msg := "Interner Fehler"
	status := 500

	var errValidation sticky.ValidationError
	if errors.As(err, &errValidation) {
		msg = errValidation.Error()
		status = 400
	}

	http.Error(w, msg, status)
	slog.Error("handle error", "err", err)
}
