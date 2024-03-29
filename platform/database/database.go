package database

import (
	"bufio"
	"bytes"
	"errors"
	"fmt"
	"io"
	"os"
	"strings"
)

// Database has the ability to read all events or add another.
type Database interface {
	Reader() (io.ReadCloser, error)
	Append([][]byte) error
}

// ReadEvents reads all events from the database.
func ReadEvents(db Database) ([][]byte, error) {
	reader, err := db.Reader()
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}
	defer reader.Close()

	var events [][]byte
	scanner := bufio.NewScanner(reader)
	for scanner.Scan() {
		events = append(events, scanner.Bytes())
	}

	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("read event: %w", err)
	}

	return events, nil
}

// FileDB is a evet database based of one file.
type FileDB struct {
	File string
}

// Reader opens the file and returns its reader.
func (db FileDB) Reader() (io.ReadCloser, error) {
	f, err := os.Open(db.File)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return io.NopCloser(strings.NewReader("")), nil
		}
		return nil, fmt.Errorf("open database file: %w", err)
	}
	return f, nil
}

// Append adds data to the file with a newline.
func (db FileDB) Append(eventList [][]byte) error {
	f, err := os.OpenFile(db.File, os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0o600)
	if err != nil {
		return fmt.Errorf("open db file: %w", err)
	}
	defer func() {
		wErr := f.Close()
		if err != nil {
			err = wErr
		}
	}()

	for _, event := range eventList {
		if bytes.Contains(event, []byte("\n")) {
			return errors.New("event contains a newline")
		}

		if _, err := fmt.Fprintf(f, "%s\n", event); err != nil {
			return fmt.Errorf("writing event to file: %q: %w", event, err)
		}
	}

	return nil
}

// MemoryDB stores Events in memory.
//
// Usefull for testing.
type MemoryDB struct {
	Content string
}

// Reader reads the content.
func (db *MemoryDB) Reader() (io.ReadCloser, error) {
	return io.NopCloser(strings.NewReader(db.Content)), nil
}

// Append adds a new event.
func (db *MemoryDB) Append(events [][]byte) error {
	for _, event := range events {
		db.Content += fmt.Sprintf("%s\n", event)
	}
	return nil
}
