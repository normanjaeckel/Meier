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
	db, err := sticky.New(dbContent, model.New(testCreatePassword), model.GetEvent, sticky.WithNow[model.Model](now))
	if err != nil {
		t.Fatalf("sticky.New: %v", err)
	}

	t.Run("create campaign without title has to return an error", func(t *testing.T) {
		err := db.Write(func(m model.Model) sticky.Event[model.Model] {
			_, e := m.CampaignCreate("", nil)
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
			id, e = m.CampaignCreate("my title", nil)
			return e
		})
		if err != nil {
			t.Fatalf("write: %v", err)
		}

		if id != 1 {
			t.Errorf("got id %d, expected 1", id)
		}

		expect := `{"time":"0001-01-01 00:00:00","type":"campaign-create","payload":{"id":1,"title":"my title","login_token":"randomra"}}`
		if got := strings.TrimSpace(dbContent.Content); got != expect {
			t.Errorf("got event\n%s\n\nexpected\n%s", got, expect)
		}
	})

	t.Run("create second campaign creates second event", func(t *testing.T) {
		var id int
		err := db.Write(func(m model.Model) sticky.Event[model.Model] {
			var e sticky.Event[model.Model]
			id, e = m.CampaignCreate("my second title", nil)
			return e
		})
		if err != nil {
			t.Fatalf("write: %v", err)
		}

		if id != 2 {
			t.Errorf("got id %d, expected 2", id)
		}

		expect := `{"time":"0001-01-01 00:00:00","type":"campaign-create","payload":{"id":2,"title":"my second title","login_token":"randomra"}}`
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

func TestStandardData(t *testing.T) {
	now := func() time.Time { return time.Time{} }
	dbContent := sticky.NewMemoryDB(`
	{"time":"2023-09-03 12:30:36","type":"campaign-create","payload":{"id":1,"title":"Herbstprojektwoche"}}
	{"time":"2023-09-03 12:38:48","type":"day-create","payload":{"id":1,"campaign_id":1,"title":"Erster Tag (Dienstag)"}}
	{"time":"2023-09-03 12:40:21","type":"day-create","payload":{"id":2,"campaign_id":1,"title":"Zweiter Tag (Mittwoch)"}}
	{"time":"2023-09-03 12:42:07","type":"event-create","payload":{"id":1,"campaign_id":1,"title":"Kochen","capacity":12,"max_special_pupils":3}}
	{"time":"2023-09-03 12:43:33","type":"event-create","payload":{"id":2,"campaign_id":1,"title":"Tanzen","capacity":16,"max_special_pupils":1}}
	{"time":"2023-09-03 12:48:03","type":"pupil-create","payload":{"id":1,"campaign_id":1,"name":"Max Mustermann","class":"2b","special":false}}
	{"time":"2023-09-04 07:45:53","type":"assign-pupil","payload":{"pupil_id":1,"day_id":1,"event_id":1}}
	{"time":"2023-09-04 07:46:22","type":"assign-pupil","payload":{"pupil_id":1,"day_id":2,"event_id":2}}
	{"time":"2023-09-04 09:25:00","type":"pupil-choice","payload":{"pupil_id":1,"choices":[{"event_id":1,"choice":1},{"event_id":2,"choice":2}]}}
	`)
	db, err := sticky.New(dbContent, model.New(testCreatePassword), model.GetEvent, sticky.WithNow[model.Model](now))
	if err != nil {
		t.Fatalf("sticky.New: %v", err)
	}

	db.Read(func(m model.Model) {
		campaign, err := m.Campaign(1)
		if err != nil {
			t.Fatalf("getting campaign: %v", err)
		}

		if campaign.Title != "Herbstprojektwoche" {
			t.Errorf("Title == %s, expected Herbstprojektwoche", campaign.Title)
		}

		days, err := campaign.Days()
		if err != nil {
			t.Fatalf("getting days: %v", err)
		}

		if len(days) != 2 {
			t.Errorf("got %d days, expected 2", len(days))
		}

		if days[0].Title != "Erster Tag (Dienstag)" {
			t.Errorf("Day(1).Title == %s, expected Erster Tag (Dienstag)", days[0].Title)
		}

		if days[1].Title != "Zweiter Tag (Mittwoch)" {
			t.Errorf("Day(2).Title == %s, expected Zweiter Tag (Mittwoch)", days[1].Title)
		}

		pupils, err := campaign.Pupils()
		if err != nil {
			t.Fatalf("getting pupils: %v", err)
		}

		if len(pupils) != 1 {
			t.Errorf("got %d pupils, expected 1", len(pupils))
		}
	})
}

func testCreatePassword(length int) string {
	var s string
	for len(s) < length {
		s += "random"
	}
	return s[:length]
}
