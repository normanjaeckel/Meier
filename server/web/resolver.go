package web

import (
	"fmt"

	"github.com/normanjaeckel/Meier/server/model"
	"github.com/ostcar/timer/sticky"
)

type resolver struct {
	db *sticky.Sticky[model.Model]
}

func (r *resolver) Campaign(args struct{ ID int32 }) (model.CampaignResolver, error) {
	var campaign model.CampaignResolver
	var err error
	r.db.Read(func(m model.Model) {
		// TODO: This contains a model outside of read. This could be a race condition.
		campaign, err = m.Campaign(int(args.ID))
	})

	return campaign, err
}

func (r *resolver) CampaignList() ([]model.CampaignResolver, error) {
	var campaignList []model.CampaignResolver
	var err error
	r.db.Read(func(m model.Model) {
		ids := m.CampaignIDs()
		campaignList = make([]model.CampaignResolver, len(ids))
		for i, id := range ids {
			var campaign model.CampaignResolver
			campaign, err = m.Campaign(int(id))
			if err != nil {
				err = fmt.Errorf("campaign %d: %w", id, err)
				return
			}

			campaignList[i] = campaign
		}
	})

	// TODO: This contains a model outside of read. This could be a race condition.
	return campaignList, err
}

func (r *resolver) AddCampaign(
	args struct {
		Title      string
		LoginToken *string
		Days       []string
	},
) (model.CampaignResolver, error) {
	var newID int
	err := r.db.Write(func(m model.Model) sticky.Event[model.Model] {
		loginToken := ""
		if args.LoginToken != nil {
			loginToken = *args.LoginToken
		}

		id, e := m.CampaignCreate(args.Title, loginToken, args.Days)
		newID = id

		return e
	})
	if err != nil {
		return model.CampaignResolver{}, fmt.Errorf("write: %w", err)
	}

	var campaign model.CampaignResolver
	r.db.Read(func(m model.Model) {
		// TODO: This contains a model outside of read. This could be a race condition.
		campaign, err = m.Campaign(newID)
	})

	return campaign, err
}

func (r *resolver) UpdateCampaign(
	args struct {
		ID         int
		Title      *string
		LoginToken *string
	},
) (model.CampaignResolver, error) {
	title := ""
	if args.Title != nil {
		title = *args.Title
	}

	loginToken := ""
	if args.LoginToken != nil {
		loginToken = *args.LoginToken
	}

	err := r.db.Write(func(m model.Model) sticky.Event[model.Model] {
		return m.CampaignUpdate(args.ID, title, loginToken)
	})
	if err != nil {
		return model.CampaignResolver{}, fmt.Errorf("write: %w", err)
	}

	var campaign model.CampaignResolver
	r.db.Read(func(m model.Model) {
		// TODO: This contains a model outside of read. This could be a race condition.
		campaign, err = m.Campaign(args.ID)
	})

	return campaign, err
}

func (r *resolver) DeleteCampaign(
	args struct {
		ID int
	},
) (bool, error) {
	err := r.db.Write(func(m model.Model) sticky.Event[model.Model] {
		return m.CampaignDelete(args.ID)
	})
	if err != nil {
		return false, fmt.Errorf("write: %w", err)
	}

	return true, nil
}

func (r *resolver) AddDay(
	args struct {
		CampaignID model.ID
		Title      string
	},
) (model.DayResolver, error) {
	var newID int
	err := r.db.Write(func(m model.Model) sticky.Event[model.Model] {
		id, event := m.DayCreate(int(args.CampaignID), args.Title)
		newID = id
		return event
	})
	if err != nil {
		return model.DayResolver{}, fmt.Errorf("write: %w", err)
	}

	var day model.DayResolver
	r.db.Read(func(m model.Model) {
		// TODO: This contains a model outside of read. This could be a race condition.
		day, err = m.Day(newID)
	})

	return day, err
}

func (r *resolver) UpdateDay(
	args struct {
		ID    int
		Title string
	},
) (model.DayResolver, error) {
	err := r.db.Write(func(m model.Model) sticky.Event[model.Model] {
		return m.DayUpdate(args.ID, args.Title)
	})
	if err != nil {
		return model.DayResolver{}, fmt.Errorf("write: %w", err)
	}

	var day model.DayResolver
	r.db.Read(func(m model.Model) {
		// TODO: This contains a model outside of read. This could be a race condition.
		day, err = m.Day(args.ID)
	})

	return day, err
}

func (r *resolver) DeleteDay(
	args struct {
		ID int
	},
) (bool, error) {
	err := r.db.Write(func(m model.Model) sticky.Event[model.Model] {
		return m.DayDelete(args.ID)
	})
	if err != nil {
		return false, fmt.Errorf("write: %w", err)
	}

	return true, nil
}

func (r *resolver) AddEvent(
	args struct {
		CampaignID       model.ID
		Title            string
		DayIDs           []model.ID
		Capacity         int32
		MaxSpecialPupils int32
	},
) (model.EventResolver, error) {
	var newID int
	err := r.db.Write(func(m model.Model) sticky.Event[model.Model] {
		dayIDs := make([]int, len(args.DayIDs))
		for i, dayID := range args.DayIDs {
			dayIDs[i] = int(dayID)
		}

		id, event := m.EventCreate(int(args.CampaignID), args.Title, dayIDs, int(args.Capacity), int(args.MaxSpecialPupils))
		newID = id
		return event
	})
	if err != nil {
		return model.EventResolver{}, fmt.Errorf("write: %w", err)
	}

	var event model.EventResolver
	r.db.Read(func(m model.Model) {
		// TODO: This contains a model outside of read. This could be a race condition.
		event, err = m.Event(newID)
	})

	return event, err
}

func (r *resolver) UpdateEvent(
	args struct {
		ID               int
		Title            *string
		DayIDs           *[]model.ID
		Capacity         *int32
		MaxSpecialPupils *int32
	},
) (model.EventResolver, error) {
	err := r.db.Write(func(m model.Model) sticky.Event[model.Model] {
		title := ""
		if args.Title != nil {
			title = *args.Title
		}

		var dayIDs []int
		if args.DayIDs != nil {
			dayIDs = make([]int, len(*args.DayIDs))
			for i, dayID := range *args.DayIDs {
				dayIDs[i] = int(dayID)
			}
		}

		capacity := 0
		if args.Capacity != nil {
			capacity = int(*args.Capacity)
		}

		maxSpecialPupils := 0
		if args.MaxSpecialPupils != nil {
			maxSpecialPupils = int(*args.MaxSpecialPupils)
		}

		return m.EventUpdate(args.ID, title, dayIDs, capacity, maxSpecialPupils)
	})
	if err != nil {
		return model.EventResolver{}, fmt.Errorf("write: %w", err)
	}

	var event model.EventResolver
	r.db.Read(func(m model.Model) {
		// TODO: This contains a model outside of read. This could be a race condition.
		event, err = m.Event(args.ID)
	})

	return event, err
}

func (r *resolver) DeleteEvent(
	args struct {
		ID int
	},
) (bool, error) {
	err := r.db.Write(func(m model.Model) sticky.Event[model.Model] {
		return m.EventDelete(args.ID)
	})
	if err != nil {
		return false, fmt.Errorf("write: %w", err)
	}

	return true, nil
}

func (r *resolver) AddPupil(
	args struct {
		CampaignID model.ID
		Name       string
		LoginToken *string
		Class      string
		Special    bool
	},
) (model.PupilResolver, error) {
	loginToken := ""
	if args.LoginToken != nil {
		loginToken = *args.LoginToken
	}

	var newID int
	err := r.db.Write(func(m model.Model) sticky.Event[model.Model] {
		id, event := m.PupilCreate(int(args.CampaignID), args.Name, loginToken, args.Class, args.Special)
		newID = id
		return event
	})
	if err != nil {
		return model.PupilResolver{}, fmt.Errorf("write: %w", err)
	}

	var pupil model.PupilResolver
	r.db.Read(func(m model.Model) {
		// TODO: This contains a model outside of read. This could be a race condition.
		pupil, err = m.Pupil(newID)
	})

	return pupil, err
}

func (r *resolver) UpdatePupil(
	args struct {
		ID         int
		Name       *string
		LoginToken *string
		Class      *string
		Special    *bool
	},
) (model.PupilResolver, error) {
	err := r.db.Write(func(m model.Model) sticky.Event[model.Model] {
		name := ""
		if args.Name != nil {
			name = *args.Name
		}

		loginToken := ""
		if args.LoginToken != nil {
			loginToken = *args.LoginToken
		}

		class := ""
		if args.Class != nil {
			class = *args.Class
		}

		special := false
		if args.Special != nil {
			special = *args.Special
		}

		return m.PupilUpdate(args.ID, name, loginToken, class, special)
	})
	if err != nil {
		return model.PupilResolver{}, fmt.Errorf("write: %w", err)
	}

	var pupil model.PupilResolver
	r.db.Read(func(m model.Model) {
		// TODO: This contains a model outside of read. This could be a race condition.
		pupil, err = m.Pupil(args.ID)
	})

	return pupil, err
}

func (r *resolver) DeletePupil(
	args struct {
		ID int
	},
) (bool, error) {
	err := r.db.Write(func(m model.Model) sticky.Event[model.Model] {
		return m.PupilDelete(args.ID)
	})
	if err != nil {
		return false, fmt.Errorf("write: %w", err)
	}

	return true, nil
}

func (r *resolver) AssignPupil(
	args struct {
		PupilID model.ID
		EventID model.ID
		DayID   model.ID
	},
) (model.DayResolver, error) {
	err := r.db.Write(func(m model.Model) sticky.Event[model.Model] {
		return m.AssignPupil(int(args.PupilID), int(args.EventID), int(args.DayID))
	})
	if err != nil {
		return model.DayResolver{}, fmt.Errorf("write: %w", err)
	}

	var day model.DayResolver
	r.db.Read(func(m model.Model) {
		// TODO: This contains a model outside of read. This could be a race condition.
		day, err = m.Day(int(args.DayID))
	})

	return day, nil
}

func (r *resolver) PupilChoice(
	args struct {
		PupilID model.ID
		Choices []struct {
			EventID model.ID
			Choice  model.Choice
		}
	},
) (bool, error) {
	err := r.db.Write(func(m model.Model) sticky.Event[model.Model] {
		choices := make([]model.EventChoice, len(args.Choices))
		for i, c := range args.Choices {
			choices[i].EventID = int(c.EventID)
			choices[i].Choice = c.Choice
		}

		return m.PupilChoice(int(args.PupilID), choices)
	})
	if err != nil {
		return false, fmt.Errorf("write: %w", err)
	}

	return true, nil
}
