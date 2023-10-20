package otherweb

import (
	"context"
	"embed"
	"fmt"
	"io/fs"
	"log"
	"log/slog"
	"net"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/normanjaeckel/Meier/server/config"
	"github.com/normanjaeckel/Meier/server/model"
	"github.com/normanjaeckel/Meier/server/otherweb/template"
	"github.com/ostcar/timer/sticky"
)

//go:embed files
var publicFiles embed.FS

//go:generate templ generate -path template

// Run starts the server.
func Run(ctx context.Context, s *sticky.Sticky[model.Model], cfg config.Config) error {
	handler := newServer(cfg, s)

	httpSRV := &http.Server{
		Addr:        cfg.OtherWebListenAddr,
		Handler:     handler,
		BaseContext: func(net.Listener) context.Context { return ctx },
	}

	// Shutdown logic in separate goroutine.
	wait := make(chan error)
	go func() {
		// Wait for the context to be closed.
		<-ctx.Done()

		if err := httpSRV.Shutdown(context.WithoutCancel(ctx)); err != nil {
			wait <- fmt.Errorf("HTTP server shutdown: %w", err)
			return
		}
		wait <- nil
	}()

	fmt.Printf("Listen webserver on: %s\n", cfg.OtherWebListenAddr)
	if err := httpSRV.ListenAndServe(); err != http.ErrServerClosed {
		return fmt.Errorf("HTTP Server failed: %v", err)
	}

	return <-wait
}

type server struct {
	http.Handler
	cfg   config.Config
	model *sticky.Sticky[model.Model]
}

func newServer(cfg config.Config, s *sticky.Sticky[model.Model]) server {
	srv := server{
		cfg:   cfg,
		model: s,
	}
	srv.registerHandlers()

	return srv
}

func (s *server) registerHandlers() {
	router := mux.NewRouter()

	router.PathPrefix("/assets").Handler(handleStatic())
	router.Handle("/", handleError(s.campainList))
	router.Handle("/create_campain", handleError(s.campainCreate))
	router.Handle("/campain/{campain_id:[0-9]+}", handleError(s.campainDetail))
	router.Handle("/campain/{campain_id:[0-9]+}/create_day", handleError(s.dayCreate))

	s.Handler = loggingMiddleware(router)
}

func (s server) campainList(w http.ResponseWriter, r *http.Request) error {
	var campains []model.Campaign
	s.model.Read(func(m model.Model) {
		campains = m.CampaignList()
	})

	return template.CampainList(campains).Render(r.Context(), w)
}

func (s server) campainCreate(w http.ResponseWriter, r *http.Request) error {
	r.ParseForm()

	title := r.FormValue("title")
	dayCount, err := strconv.Atoi(r.FormValue("day-count"))
	if err != nil {
		// TODO: Make me a client error
		return fmt.Errorf("day has to be a number, not `%s`", r.FormValue("day-count"))
	}

	days := make([]string, dayCount)
	for i := 0; i < dayCount; i++ {
		days[i] = fmt.Sprintf("Tag %d", i+1)
	}

	if err := s.model.Write(func(m model.Model) sticky.Event[model.Model] {
		_, event := m.CampaignCreate(title, days)
		return event
	}); err != nil {
		return fmt.Errorf("writing event: %w", err)
	}

	http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
	return nil
}

func (s server) campainDetail(w http.ResponseWriter, r *http.Request) error {
	id, _ := strconv.Atoi(mux.Vars(r)["campain_id"])
	var campaign model.CampaignResolver
	var err error
	s.model.Read(func(m model.Model) {
		campaign, err = m.Campaign(id)
	})
	if err != nil {
		return err
	}

	return template.CampainDetail(campaign).Render(r.Context(), w)
}

func (s server) dayCreate(w http.ResponseWriter, r *http.Request) error {
	campaignID, _ := strconv.Atoi(mux.Vars(r)["campain_id"])
	r.ParseForm()
	title := r.FormValue("title")

	var dayID int
	if err := s.model.Write(func(m model.Model) sticky.Event[model.Model] {
		id, event := m.DayCreate(campaignID, title)
		dayID = id
		return event
	}); err != nil {
		return err
	}

	if isHTMX(r) {
		log.Println("is html")
		var day model.DayResolver
		var err error
		s.model.Read(func(m model.Model) {
			day, err = m.Day(dayID)
		})
		if err != nil {
			return err
		}
		return template.CampainDetailDayEntry(day).Render(r.Context(), w)
	}

	http.Redirect(w, r, fmt.Sprintf("/campain/%d", campaignID), http.StatusTemporaryRedirect)
	return nil
}

func isHTMX(r *http.Request) bool {
	return r.Header.Get("HX-Request") != ""
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

func handleError(handler func(w http.ResponseWriter, r *http.Request) error) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if err := handler(w, r); err != nil {
			// TODO
			http.Error(w, err.Error(), 500)
		}
	}
}
