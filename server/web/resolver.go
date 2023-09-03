package web

import (
	"context"

	"github.com/normanjaeckel/Meier/server/model"
	"github.com/ostcar/timer/sticky"
)

type resolver struct {
	db *sticky.Sticky[model.Model]
}

func (r *resolver) Campaign(ctx context.Context, args struct{ ID int32 }) (model.CampaignResolver, error) {
	var campaign model.CampaignResolver
	var err error
	r.db.Read(func(m model.Model) {
		// TODO: This contains a model outside of read. This could be a race condition.
		campaign, err = m.Campaign(int(args.ID))
	})

	return campaign, err
}
