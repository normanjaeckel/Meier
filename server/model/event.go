package model

import (
	"fmt"
	"time"
)

type eventCampaignCreate struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
}

func (e eventCampaignCreate) Name() string {
	return "campaign-create"
}

func (e eventCampaignCreate) Validate(model Model) error {
	if len(model.campains) >= e.ID {
		return fmt.Errorf("ID %d is not unique", e.ID)
	}

	if len(e.Title) == 0 {
		return fmt.Errorf("campaign title can not be empty")
	}
	return nil
}

func (e eventCampaignCreate) Execute(model Model, time time.Time) Model {
	for len(model.campains) <= e.ID {
		model.campains = append(model.campains, "")
	}
	model.campains[e.ID] = e.Title
	return model
}

type eventCampaignUpdate struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
}

func (e eventCampaignUpdate) Name() string {
	return "campaign-update"
}

func (e eventCampaignUpdate) Validate(model Model) error {
	if len(model.campains) < e.ID || model.campains[e.ID] == "" {
		return fmt.Errorf("Campaign with id %d does not exist", e.ID)
	}

	if len(e.Title) == 0 {
		return fmt.Errorf("campaign title can not be empty")
	}
	return nil
}

func (e eventCampaignUpdate) Execute(model Model, time time.Time) Model {
	if len(model.campains) < e.ID {
		return model
	}
	model.campains[e.ID] = e.Title
	return model
}

type eventCampaignDelete struct {
	ID int `json:"id"`
}

func (e eventCampaignDelete) Name() string {
	return "campaign-delete"
}

func (e eventCampaignDelete) Validate(model Model) error {
	if len(model.campains) < e.ID || model.campains[e.ID] == "" {
		return fmt.Errorf("Campaign with id %d does not exist", e.ID)
	}
	return nil
}

func (e eventCampaignDelete) Execute(model Model, time time.Time) Model {
	if len(model.campains) < e.ID {
		return model
	}
	model.campains[e.ID] = ""
	// TODO: Also delete all other campaign related stuff
	return model
}

type eventDayCreate struct {
	ID         int    `json:"id"`
	CampaignID int    `json:"campaign-id"`
	Title      string `json:"title"`
}

func (e eventDayCreate) Name() string {
	return "day-create"
}

func (e eventDayCreate) Validate(model Model) error {
	if len(model.days) >= e.ID {
		return fmt.Errorf("ID %d is not unique", e.ID)
	}

	if len(e.Title) == 0 {
		return fmt.Errorf("day title can not be empty")
	}

	if len(model.campains) <= e.ID {
		return fmt.Errorf("campaign %d does not exist", e.CampaignID)
	}
	return nil
}

func (e eventDayCreate) Execute(model Model, time time.Time) Model {
	for len(model.days) <= e.ID {
		model.days = append(model.days, day{})
	}
	model.days[e.ID] = day{
		campaignID: e.CampaignID,
		title:      e.Title,
		event:      make(map[int][]int),
	}
	return model
}

type eventDayUpdate struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
}

func (e eventDayUpdate) Name() string {
	return "day-update"
}

func (e eventDayUpdate) Validate(model Model) error {
	if len(model.days) <= e.ID {
		return fmt.Errorf("day with id %d does not exist", e.ID)
	}

	if len(e.Title) == 0 {
		return fmt.Errorf("day title can not be empty")
	}

	return nil
}

func (e eventDayUpdate) Execute(model Model, time time.Time) Model {
	if len(model.days) < e.ID {
		return model
	}

	model.days[e.ID] = day{
		title: e.Title,
	}
	return model
}

type eventDayDelete struct {
	ID int `json:"id"`
}

func (e eventDayDelete) Name() string {
	return "day-delete"
}

func (e eventDayDelete) Validate(model Model) error {
	if len(model.days) <= e.ID {
		return fmt.Errorf("Day with ID %d does not exist", e.ID)
	}

	return nil
}

func (e eventDayDelete) Execute(model Model, time time.Time) Model {
	if len(model.days) < e.ID {
		return model
	}
	model.days[e.ID] = day{}
	return model
}

type eventEventCreate struct {
	ID               int    `json:"id"`
	CampaignID       int    `json:"campaign-id"`
	Title            string `json:"title"`
	Capacity         int    `json:"capacity"`
	MaxSpecialPupils int    `json:"max-special-pupils"`
}

func (e eventEventCreate) Name() string {
	return "event-create"
}

func (e eventEventCreate) Validate(model Model) error {
	if len(model.events) >= e.ID {
		return fmt.Errorf("ID %d is not unique", e.ID)
	}

	if len(e.Title) == 0 {
		return fmt.Errorf("event title can not be empty")
	}

	if len(model.campains) <= e.ID {
		return fmt.Errorf("campaign %d does not exist", e.CampaignID)
	}
	return nil
}

func (e eventEventCreate) Execute(model Model, time time.Time) Model {
	for len(model.events) <= e.ID {
		model.events = append(model.events, event{})
	}
	model.events[e.ID] = event{
		campaignID:            e.CampaignID,
		title:                 e.Title,
		capacity:              e.Capacity,
		maxNumOfspecialPupils: e.MaxSpecialPupils,
	}
	return model
}

type eventEventUpdate struct {
	ID               int    `json:"id"`
	Title            string `json:"title"`
	Capacity         int    `json:"capacity"`
	MaxSpecialPupils int    `json:"max-special-pupils"`
}

func (e eventEventUpdate) Name() string {
	return "day-update"
}

func (e eventEventUpdate) Validate(model Model) error {
	if len(model.events) <= e.ID {
		return fmt.Errorf("event with id %d does not exist", e.ID)
	}

	if len(e.Title) == 0 {
		return fmt.Errorf("event title can not be empty")
	}

	return nil
}

func (e eventEventUpdate) Execute(model Model, time time.Time) Model {
	if len(model.events) < e.ID {
		return model
	}

	model.events[e.ID] = event{
		title:                 e.Title,
		capacity:              e.Capacity,
		maxNumOfspecialPupils: e.MaxSpecialPupils,
	}
	return model
}

type eventEventDelete struct {
	ID int `json:"id"`
}

func (e eventEventDelete) Name() string {
	return "event-delete"
}

func (e eventEventDelete) Validate(model Model) error {
	if len(model.events) <= e.ID {
		return fmt.Errorf("Event with ID %d does not exist", e.ID)
	}

	return nil
}

func (e eventEventDelete) Execute(model Model, time time.Time) Model {
	if len(model.events) < e.ID {
		return model
	}
	model.events[e.ID] = event{}
	return model
}
