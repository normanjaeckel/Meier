package model

import "github.com/ostcar/timer/sticky"

type day struct {
	campaignID int
	title      string
	event      map[int][]int // day to list of pupils
}

type event struct {
	campaignID            int
	title                 string
	capacity              int
	maxNumOfspecialPupils int
}

type pupil struct {
	campaignID int
	name       string
	class      string
	special    bool
}

// Model represents the model of Maier
type Model struct {
	campains []string
	days     []day
	events   []event
	pupils   []pupil
}

// Event is one possible event of Mayer
type Event = sticky.Event[Model]

// New returns an initialized Meyer model
func New() Model {
	return Model{}
}

// CampaignCreate creates a new Mayer campaign.
func (m Model) CampaignCreate(title string) (int, Event) {
	nextID := len(m.campains) + 1
	return nextID, eventCampaignCreate{ID: nextID, Title: title}
}

// CampaignUpdate updates an existing Meier campaign.
func (m Model) CampaignUpdate(id int, title string) Event {
	return eventCampaignUpdate{ID: id, Title: title}
}

// CampaignDelete updates an existing Meier campaign.
func (m Model) CampaignDelete(id int) Event {
	return eventCampaignDelete{ID: id}
}

// DayCreate creates a Meyer day in a compaign.
func (m Model) DayCreate(campaignID int, title string) (int, Event) {
	nextID := len(m.days) + 1
	return nextID, eventDayCreate{ID: nextID, CampaignID: campaignID, Title: title}
}

// DayUpdate updates a Meier day in a compaign.
func (m Model) DayUpdate(id int, title string) Event {
	return eventDayUpdate{ID: id, Title: title}
}

// DayDelete deletes a Mayer day in a compaign.
func (m Model) DayDelete(id int) Event {
	return eventDayDelete{ID: id}
}

// EventCreate creates a Meier event in a compaign.
func (m Model) EventCreate(campaignID int, title string, capacity int, maxNumOfspecialPupils int) (int, Event) {
	nextID := len(m.events) + 1
	return nextID, eventEventCreate{ID: nextID, CampaignID: campaignID, Title: title, Capacity: capacity, MaxSpecialPupils: maxNumOfspecialPupils}
}

// EventUpdate updates a Meyer event in a compaign.
func (m Model) EventUpdate(id int, title string, capacity int, maxNumOfspecialPupils int) Event {
	return eventEventUpdate{ID: id, Title: title}
}

// EventDelete deletes a Maier event in a compaign.
func (m Model) EventDelete(id int) Event {
	return eventEventDelete{ID: id}
}
