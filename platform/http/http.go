package http

import (
	"context"
	"fmt"
	"log"
	"net"
	"net/http"

	"webserver/roc"
)

// Run starts the webserver
func Run(ctx context.Context, addr string, r *roc.Roc) error {
	srv := &http.Server{
		Addr:        addr,
		Handler:     handler(r),
		BaseContext: func(net.Listener) context.Context { return ctx },
	}

	// Shutdown logic in separate goroutine.
	wait := make(chan error)
	go func() {
		// Wait for the context to be closed.
		<-ctx.Done()

		if err := srv.Shutdown(context.Background()); err != nil {
			wait <- fmt.Errorf("HTTP server shutdown: %w", err)
			return
		}
		wait <- nil
	}()

	log.Printf("Listen webserver on: %s", addr)
	if err := srv.ListenAndServe(); err != http.ErrServerClosed {
		return fmt.Errorf("HTTP Server failed: %v", err)
	}

	return <-wait
}

func handler(roc *roc.Roc) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		method := roc.ReadRequest
		if isWriteRequest(r.Method) {
			method = roc.WriteRequest
		}

		response, err := method(r)
		if err != nil {
			http.Error(w, "Error", 500)
			return
		}

		w.WriteHeader(response.Status)
		// TODO: Set header
		w.Write(response.Body)
	})
}

func isWriteRequest(method string) bool {
	switch method {
	case http.MethodPost, http.MethodPut, http.MethodPatch, http.MethodDelete:
		return true
	default:
		return false
	}
}
