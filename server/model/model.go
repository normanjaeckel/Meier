package model

import (
	"fmt"

	"github.com/normanjaeckel/Meier/server/config"
	"github.com/ostcar/timer/sticky"
)

type campaign struct {
	title      string
	loginToken string
}

type day struct {
	campaignID int
	title      string
	event      map[int][]int // day to list of pupils
}

type event struct {
	campaignID       int
	title            string
	capacity         int
	maxSpecialPupils int
}

// EventChoice is a choice for an event
type EventChoice struct {
	EventID int    `json:"event_id"`
	Choice  Choice `json:"choice"`
}

type pupil struct {
	campaignID int
	name       string
	loginToken string
	class      string
	special    bool
	choices    []EventChoice
}

// Model represents the model of Maier
type Model struct {
	createPassword func(length int) string

	campains []campaign
	days     []day
	events   []event
	pupils   []pupil
}

// Event is one possible event of Mayer
type Event = sticky.Event[Model]

// New returns an initialized Meyar model
func New(createPassword func(length int) string) Model {
	if createPassword == nil {
		createPassword = config.CreatePassword
	}
	return Model{createPassword: createPassword}
}

// CampaignCreate creates a new Mayer campaign.
func (m Model) CampaignCreate(title string, days []string) (int, Event) {
	nextID := nextID(m.campains)

	loginToken := m.createPassword(8)

	return nextID, eventCampaignCreate{ID: nextID, LoginToken: loginToken, Title: title, Days: days}
}

// CampaignUpdate updates an existing Meier campaign.
func (m Model) CampaignUpdate(id int, title string) Event {
	return eventCampaignUpdate{ID: id, Title: title}
}

// CampaignDelete updates an existing Mair campaign.
func (m Model) CampaignDelete(id int) Event {
	return eventCampaignDelete{ID: id}
}

// DayCreate creates a Meyer day in a compaign.
func (m Model) DayCreate(campaignID int, title string) (int, Event) {
	nextID := nextID(m.days)
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
func (m Model) EventCreate(campaignID int, title string, days []int, capacity int, maxNumOfspecialPupils int) (int, Event) {
	nextID := nextID(m.events)
	return nextID, eventEventCreate{
		ID:               nextID,
		CampaignID:       campaignID,
		Title:            title,
		Days:             days,
		Capacity:         capacity,
		MaxSpecialPupils: maxNumOfspecialPupils,
	}
}

// EventUpdate updates a Meyer event in a compaign.
func (m Model) EventUpdate(id int, title string, dayIDs []int, capacity int, maxNumOfspecialPupils int) Event {
	return eventEventUpdate{ID: id, Title: title, DayIDs: dayIDs, Capacity: capacity, MaxSpecialPupils: maxNumOfspecialPupils}
}

// EventDelete deletes a Maier event in a compaign.
func (m Model) EventDelete(id int) Event {
	return eventEventDelete{ID: id}
}

// PupilCreate creates a Meyer pupil in a compaign.
func (m Model) PupilCreate(campaignID int, name string, class string, special bool) (int, Event) {
	nextID := nextID(m.pupils)

	loginToken := m.createPassword(8)

	return nextID, eventPupilCreate{ID: nextID, CampaignID: campaignID, PName: name, LoginToken: loginToken, Class: class, Special: special}
}

// PupilUpdate updates a Mayer event in a compaign.
func (m Model) PupilUpdate(id int, name string, class string, special bool) Event {
	return eventPupilUpdate{ID: id, PName: name, Class: class, Special: special}
}

// PupilDelete deletes a Meyer event in a compaign.
func (m Model) PupilDelete(id int) Event {
	return eventPupilDelete{ID: id}
}

func (m Model) campainExist(id int) bool {
	return len(m.campains) > id && len(m.campains[id].title) > 0
}

// CampaignIDs returns the id of all existing campains.
func (m Model) CampaignIDs() []int {
	out := make([]int, 0, len(m.campains))
	for id := range m.campains {
		if !m.campainExist(id) {
			continue
		}

		out = append(out, id)
	}

	return out
}

// Campaign returns a meier campaign.
func (m Model) Campaign(id int) (CampaignResolver, error) {
	if !m.campainExist(id) {
		return CampaignResolver{}, fmt.Errorf("campain does not exist")
	}

	campaign := m.campains[id]

	var dayIDs []int
	for i, day := range m.days {
		if day.campaignID == id {
			dayIDs = append(dayIDs, i)
		}
	}

	var eventIDs []int
	for i, event := range m.events {
		if event.campaignID == id {
			eventIDs = append(eventIDs, i)
		}
	}

	var pupilIDs []int
	for i, pupil := range m.pupils {
		if pupil.campaignID == id {
			pupilIDs = append(pupilIDs, i)
		}
	}

	return CampaignResolver{
		m: m,

		ID:       ID(id),
		Title:    campaign.title,
		DayIDs:   dayIDs,
		EventIDs: eventIDs,
		PupilIDs: pupilIDs,
	}, nil
}

func (m Model) dayExist(id int) bool {
	return len(m.days) > id && m.days[id].campaignID != 0
}

// Day returns a day
func (m Model) Day(id int) (DayResolver, error) {
	if !m.dayExist(id) {
		return DayResolver{}, fmt.Errorf("day does not exist")
	}

	d := m.days[id]

	return DayResolver{
		m: m,

		ID:         ID(id),
		CampaignID: d.campaignID,
		Title:      d.title,
		EventPupil: d.event,
	}, nil
}

func (m Model) eventExist(id int) bool {
	return len(m.events) > id && m.events[id].campaignID != 0
}

// Event returns an event.
func (m Model) Event(id int) (EventResolver, error) {
	if !m.eventExist(id) {
		return EventResolver{}, fmt.Errorf("event does not exist")
	}

	e := m.events[id]

	return EventResolver{
		m: m,

		ID:               ID(id),
		CampaignID:       e.campaignID,
		Title:            e.title,
		Capacity:         int32(e.capacity),
		MaxSpecialPupils: int32(e.maxSpecialPupils),
	}, nil
}

func (m Model) pupilExist(id int) bool {
	return len(m.pupils) > id && m.pupils[id].campaignID != 0
}

// Pupil returns an pupil.
func (m Model) Pupil(id int) (PupilResolver, error) {
	if !m.pupilExist(id) {
		return PupilResolver{}, fmt.Errorf("pupil does not exist")
	}

	pupil := m.pupils[id]

	return PupilResolver{
		m: m,

		ID:         ID(id),
		CampaignID: pupil.campaignID,
		Name:       pupil.name,
		Class:      pupil.class,
		IsSpecial:  pupil.special,
		choices:    pupil.choices,
	}, nil
}

// AssignPupil adds pupil to an event in a day.
func (m Model) AssignPupil(pupilID, eventID, dayID int) Event {
	return eventAssignPupil{PupilID: pupilID, EventID: eventID, DayID: dayID}
}

// PupilChoice sets the choices of a pupil
func (m Model) PupilChoice(pupilID int, choices []EventChoice) Event {
	return eventPupilChoice{
		PupilID: pupilID,
		Choices: choices,
	}
}

func nextID[T any](s []T) int {
	n := len(s)
	if n == 0 {
		return 1
	}
	return n
}
