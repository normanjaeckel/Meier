package web

import (
	"context"
	"encoding/json"
	"fmt"
	"testing"
	"time"

	"github.com/graph-gophers/graphql-go"
	"github.com/normanjaeckel/Meier/server/model"
	"github.com/ostcar/timer/sticky"
)

func TestUpdateDay(t *testing.T) {
	resp, err := runQueries([]string{
		`mutation {
			addCampaign(title: "Test Campaign"){id}
		}
		`,
		`mutation {
			addDay(campaignID: 1, title: "Test Day") {id}
		}
		`,
		`mutation {
			updateDay(id: 1, title: "Updated Title") {
				id
				title
			}
		}
		`,
	})
	if err != nil {
		t.Fatalf("runQueries: %v", err)
	}

	if resp.Errors != nil {
		t.Errorf("queries did not succeed: %v", resp.Errors)
	}
}

func TestUpdateCampain(t *testing.T) {
	resp, err := runQueries([]string{
		`mutation {addCampaign(days: ["Tag 1"], title: "Herbsttage") {id}}`,
		`mutation {updateCampaign(id: 1, title: "Herbsttage Neu") {id}}`,
	})
	if err != nil {
		t.Fatalf("runQueries: %v", err)
	}
	if resp.Errors != nil {
		t.Errorf("queries did not succeed: %v", resp.Errors)
	}
}

func TestAddPupils(t *testing.T) {
	resp, err := runQueries([]string{
		`mutation {addCampaign(days: ["Tag 1"], title: "Herbsttage") {id}}`,
		`mutation {addPupilsOfClass(campaignID: 1, class: "12", names: ["Anna", "Bert"]) {id}}`,
		`query {
			campaign(id:1){
				pupils{
					name
					loginToken
				}
			}
		}`,
	})
	if err != nil {
		t.Fatalf("runQueries: %v", err)
	}
	if resp.Errors != nil {
		t.Errorf("queries did not succeed: %v", resp.Errors)
	}

	var got struct {
		Campain struct {
			Pupils []struct {
				Name       string `json:"name"`
				LoginToken string `json:"loginToken"`
			} `json:"pupils"`
		} `json:"campaign"`
	}

	if err := json.Unmarshal(resp.Data, &got); err != nil {
		t.Fatalf("decoding response: %v", err)
	}

	if l := len(got.Campain.Pupils); l != 2 {
		t.Fatalf("created %d users, expected 2", l)
	}

	name1 := got.Campain.Pupils[0].Name
	name2 := got.Campain.Pupils[1].Name

	if name1 != "Anna" || name2 != "Bert" {
		t.Errorf("created users %s and %s, expected Anna and Bert", name1, name2)
	}

	if got.Campain.Pupils[0].LoginToken == got.Campain.Pupils[1].LoginToken {
		t.Errorf("both users have the same login tokens")
	}
}

func TestAddDay(t *testing.T) {
	resp, err := runQueries([]string{
		`mutation {addCampaign(days: ["Tag 1", "Tag 2"], title: "Herbst") {id}}`,
		`mutation {addDay(campaignID: 1, title: "Tag 1a") {id}}`,
	})
	if err != nil {
		t.Fatalf("runQueries: %v", err)
	}
	if resp.Errors != nil {
		t.Errorf("queries did not succeed: %v", resp.Errors)
	}

	var got struct {
		Day struct {
			ID int `json:"id"`
		} `json:"addDay"`
	}

	if err := json.Unmarshal(resp.Data, &got); err != nil {
		t.Fatalf("decoding response: %v", err)
	}

	if got.Day.ID != 3 {
		t.Errorf("got id %d, expected 3", got.Day.ID)
	}
}

// runQueries runs a list of queries against an empty database and returns the
// last response.
func runQueries(queries []string) (*graphql.Response, error) {
	now := func() time.Time { return time.Time{} }
	dbContent := sticky.NewMemoryDB("")
	db, err := sticky.New(dbContent, model.New(nil), model.GetEvent, sticky.WithNow[model.Model](now))
	if err != nil {
		return nil, fmt.Errorf("sticky.New: %w", err)
	}

	parsedSchema, err := graphql.ParseSchema(schema, &resolver{db: db}, graphql.UseFieldResolvers())
	if err != nil {
		return nil, fmt.Errorf("parsing graphql schema: %w", err)
	}

	var resp *graphql.Response
	for _, query := range queries {
		resp = parsedSchema.Exec(context.Background(), query, "", nil)
	}

	return resp, nil
}
