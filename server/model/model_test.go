package model_test

import (
	"strings"
	"testing"
	"time"

	"github.com/normanjaeckel/Meier/server/model"
	"github.com/ostcar/timer/sticky"
)

func TestRest(t *testing.T) {
	now := func() time.Time { return time.Time{} }
	dbContent := sticky.NewMemoryDB("")
	db, err := sticky.New(dbContent, model.Model{}, model.GetEvent, sticky.WithNow[model.Model](now))
	if err != nil {
		t.Fatalf("sticky.New: %v", err)
	}

	t.Run("create campaign without title has to return an error", func(t *testing.T) {
		err := db.Write(func(m model.Model) sticky.Event[model.Model] {
			_, e := m.CampaignCreate("")
			return e
		})

		if err == nil {
			t.Errorf("got no error, expected one")
		}
	})

	t.Run("create campaign with title has to create an campaign", func(t *testing.T) {
		var id int
		err := db.Write(func(m model.Model) sticky.Event[model.Model] {
			var e sticky.Event[model.Model]
			id, e = m.CampaignCreate("my title")
			return e
		})
		if err != nil {
			t.Fatalf("write: %v", err)
		}

		if id != 1 {
			t.Errorf("got id %d, expected 1", id)
		}

		expect := `{"time":"0001-01-01 00:00:00","type":"campaign-create","payload":{"id":1,"title":"my title"}}`
		if got := strings.TrimSpace(dbContent.Content); got != expect {
			t.Errorf("got event %s, expected %s", got, expect)
		}
	})

	t.Run("create second campaign creates second event", func(t *testing.T) {
		var id int
		err := db.Write(func(m model.Model) sticky.Event[model.Model] {
			var e sticky.Event[model.Model]
			id, e = m.CampaignCreate("my second title")
			return e
		})
		if err != nil {
			t.Fatalf("write: %v", err)
		}

		if id != 2 {
			t.Errorf("got id %d, expected 2", id)
		}

		expect := `{"time":"0001-01-01 00:00:00","type":"campaign-create","payload":{"id":2,"title":"my second title"}}`
		if got := lastLine(dbContent.Content); got != expect {
			t.Errorf("got event %s, expected %s", got, expect)
		}
	})

	t.Run("update campaign without title has to return an error", func(t *testing.T) {
		err := db.Write(func(m model.Model) sticky.Event[model.Model] {
			return m.CampaignUpdate(1, "")
		})
		if err == nil {
			t.Fatalf("got no error, expected one")
		}
	})

	t.Run("update campaign with title has to create an event", func(t *testing.T) {
		err := db.Write(func(m model.Model) sticky.Event[model.Model] {
			return m.CampaignUpdate(1, "new title")
		})
		if err != nil {
			t.Fatalf("write: %v", err)
		}

		expect := `{"time":"0001-01-01 00:00:00","type":"campaign-update","payload":{"id":1,"title":"new title"}}`
		if got := lastLine(dbContent.Content); got != expect {
			t.Errorf("got event %s, expected %s", got, expect)
		}
	})

	t.Run("update non existing campaign", func(t *testing.T) {
		err := db.Write(func(m model.Model) sticky.Event[model.Model] {
			return m.CampaignUpdate(404, "new title")
		})
		if err == nil {
			t.Error("write did not return an error, expected one")
		}
	})
}

func lastLine(content string) string {
	lines := strings.Split(strings.TrimSpace(content), "\n")
	return lines[len(lines)-1]
}
