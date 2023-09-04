package web

import (
	"context"
	"embed"
	"fmt"
	"io/fs"
	"log"
	"net"
	"net/http"

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

	handler := registerHandlers(parsedSchema, cfg)

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

	log.Printf("Listen webserver on: %s", cfg.WebListenAddr)
	if err := srv.ListenAndServe(); err != http.ErrServerClosed {
		return fmt.Errorf("HTTP Server failed: %v", err)
	}

	return <-wait
}

func registerHandlers(schema *graphql.Schema, cfg config.Config) http.Handler {
	router := mux.NewRouter()
	router.Use(loggingMiddleware)

	// handleAuth(router, cfg)

	router.Handle("/query", &relay.Handler{Schema: schema})

	// route anything else to the embeded files folder
	router.PathPrefix("/").Handler(handleStatic())

	return router
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
		log.Printf("%s %d %s", r.Method, writer.code, r.RequestURI)
	})
}

func handleStatic() http.Handler {
	files, err := fs.Sub(publicFiles, "files")
	if err != nil {
		panic(err)
	}

	return http.FileServer(http.FS(files))
}
