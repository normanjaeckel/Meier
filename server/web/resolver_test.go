package web

import (
	"context"
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

// runQueries runs a list of queries against an empty database and returns the
// last response.
func runQueries(queries []string) (*graphql.Response, error) {
	now := func() time.Time { return time.Time{} }
	dbContent := sticky.NewMemoryDB("")
	db, err := sticky.New(dbContent, model.Model{}, model.GetEvent, sticky.WithNow[model.Model](now))
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
