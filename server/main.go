package main

import (
	"context"
	"fmt"
	"log/slog"
	"math/rand"
	"os"
	"os/signal"
	"time"

	"github.com/normanjaeckel/Meier/server/config"
	"github.com/normanjaeckel/Meier/server/model"
	"github.com/normanjaeckel/Meier/server/web"
	"github.com/ostcar/timer/sticky"
)

func main() {
	if err := run(); err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}
}

func run() error {
	ctx, cancel := interruptContext()
	defer cancel()

	setlogger()

	rnd := rand.New(rand.NewSource(time.Now().Unix()))

	s, err := sticky.New(sticky.FileDB{File: "db.jsonl"}, model.New(rnd), model.GetEvent)
	if err != nil {
		return fmt.Errorf("loading model: %w", err)
	}

	config, err := config.LoadConfig(rnd, "config.toml")
	if err != nil {
		return fmt.Errorf("loading config: %w", err)
	}

	if err := web.Run(ctx, s, config); err != nil {
		return fmt.Errorf("running http server: %w", err)
	}

	return nil
}

// interruptContext works like signal.NotifyContext
//
// In only listens on os.Interrupt. If the signal is received two times,
// os.Exit(1) is called.
func interruptContext() (context.Context, context.CancelFunc) {
	ctx, cancel := context.WithCancel(context.Background())
	go func() {
		sigint := make(chan os.Signal, 1)
		signal.Notify(sigint, os.Interrupt)
		<-sigint
		cancel()

		// If the signal was send for the second time, make a hard cut.
		<-sigint
		os.Exit(1)
	}()
	return ctx, cancel
}

func setlogger() {
	level := new(slog.LevelVar)
	level.UnmarshalText([]byte("DEBUG"))
	h := slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{Level: level})
	slog.SetDefault(slog.New(h))
}
