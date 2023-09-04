package model

import (
	"fmt"
	"time"
)

// GetEvent returns an empty event for a name.
func GetEvent(eventType string) Event {
	switch eventType {
	case eventCampaignCreate{}.Name():
		return &eventCampaignCreate{}

	case eventCampaignUpdate{}.Name():
		return &eventCampaignUpdate{}

	case eventCampaignDelete{}.Name():
		return &eventCampaignDelete{}

	case eventDayCreate{}.Name():
		return &eventDayCreate{}

	case eventDayUpdate{}.Name():
		return &eventDayUpdate{}

	case eventDayDelete{}.Name():
		return &eventDayDelete{}

	case eventEventCreate{}.Name():
		return &eventEventCreate{}

	case eventEventUpdate{}.Name():
		return &eventEventUpdate{}

	case eventEventDelete{}.Name():
		return &eventEventDelete{}

	case eventPupilCreate{}.Name():
		return &eventPupilCreate{}

	case eventPupilUpdate{}.Name():
		return &eventPupilUpdate{}

	case eventPupilDelete{}.Name():
		return &eventPupilDelete{}

	case eventAssignPupil{}.Name():
		return &eventAssignPupil{}

	case eventPupilChoice{}.Name():
		return &eventPupilChoice{}

	default:
		return nil
	}
}

type eventCampaignCreate struct {
	ID    int      `json:"id"`
	Title string   `json:"title"`
	Days  []string `json:"days,omitempty"`
}

func (e eventCampaignCreate) Name() string {
	return "campaign-create"
}

func (e eventCampaignCreate) Validate(model Model) error {
	if len(model.campains) > e.ID {
		return fmt.Errorf("ID %d is not unique", e.ID)
	}

	if len(e.Title) == 0 {
		return fmt.Errorf("campaign title can not be empty")
	}
	return nil
}

func (e eventCampaignCreate) Execute(model Model, time time.Time) Model {
	for len(model.campains) <= e.ID {
		model.campains = append(model.campains, campaign{})
	}
	model.campains[e.ID] = campaign{title: e.Title}

	for _, dayTitle := range e.Days {
		model.days = append(model.days, day{
			campaignID: e.ID,
			title:      dayTitle,
			event:      make(map[int][]int),
		})
	}
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
	if len(model.campains) < e.ID || (model.campains[e.ID] == campaign{}) {
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
	model.campains[e.ID].title = e.Title
	return model
}

type eventCampaignDelete struct {
	ID int `json:"id"`
}

func (e eventCampaignDelete) Name() string {
	return "campaign-delete"
}

func (e eventCampaignDelete) Validate(model Model) error {
	if len(model.campains) < e.ID || (model.campains[e.ID] == campaign{}) {
		return fmt.Errorf("Campaign with id %d does not exist", e.ID)
	}
	return nil
}

func (e eventCampaignDelete) Execute(model Model, time time.Time) Model {
	if len(model.campains) < e.ID {
		return model
	}
	model.campains[e.ID] = campaign{}

	for i := range model.days {
		if model.days[i].campaignID == e.ID {
			model.days[i].campaignID = 0
		}
	}

	for i := range model.events {
		if model.events[i].campaignID == e.ID {
			model.events[i].campaignID = 0
		}
	}

	for i := range model.pupils {
		if model.pupils[i].campaignID == e.ID {
			model.pupils[i].campaignID = 0
		}
	}

	return model
}

type eventDayCreate struct {
	ID         int    `json:"id"`
	CampaignID int    `json:"campaign_id"`
	Title      string `json:"title"`
}

func (e eventDayCreate) Name() string {
	return "day-create"
}

func (e eventDayCreate) Validate(model Model) error {
	if len(model.days) > e.ID {
		return fmt.Errorf("ID %d is not unique", e.ID)
	}

	if len(e.Title) == 0 {
		return fmt.Errorf("day title can not be empty")
	}

	if len(model.campains) <= e.CampaignID {
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
	CampaignID       int    `json:"campaign_id"`
	Title            string `json:"title"`
	Days             []int  `json:"days"`
	Capacity         int    `json:"capacity"`
	MaxSpecialPupils int    `json:"max_special_pupils"`
}

func (e eventEventCreate) Name() string {
	return "event-create"
}

func (e eventEventCreate) Validate(model Model) error {
	if len(model.events) > e.ID {
		return fmt.Errorf("ID %d is not unique", e.ID)
	}

	if len(e.Title) == 0 {
		return fmt.Errorf("event title can not be empty")
	}

	for _, dayID := range e.Days {
		if len(model.days) <= dayID || model.days[dayID].campaignID != e.CampaignID {
			return fmt.Errorf("day %d is not in same campaign", dayID)
		}
	}

	if len(model.campains) <= e.CampaignID {
		return fmt.Errorf("campaign %d does not exist", e.CampaignID)
	}
	return nil
}

func (e eventEventCreate) Execute(model Model, time time.Time) Model {
	for len(model.events) <= e.ID {
		model.events = append(model.events, event{})
	}
	model.events[e.ID] = event{
		campaignID:       e.CampaignID,
		title:            e.Title,
		capacity:         e.Capacity,
		maxSpecialPupils: e.MaxSpecialPupils,
	}

	for _, dayID := range e.Days {
		model.days[dayID].event[e.ID] = []int{}
	}
	return model
}

type eventEventUpdate struct {
	ID               int    `json:"id"`
	Title            string `json:"title,omitempty"`
	DayIDs           []int  `json:"days,omitempty"`
	Capacity         int    `json:"capacity,omitempty"`
	MaxSpecialPupils int    `json:"max_special_pupils,omitempty"`
}

func (e eventEventUpdate) Name() string {
	return "event-update"
}

func (e eventEventUpdate) Validate(model Model) error {
	if len(model.events) <= e.ID {
		return fmt.Errorf("event with id %d does not exist", e.ID)
	}

	for _, dayID := range e.DayIDs {
		if len(model.days) <= dayID || model.days[dayID].campaignID != model.events[e.ID].campaignID {
			return fmt.Errorf("day %d is not in same campaign", dayID)
		}
	}

	return nil
}

func (e eventEventUpdate) Execute(model Model, time time.Time) Model {
	if len(model.events) < e.ID {
		return model
	}

	event := model.events[e.ID]
	if e.Title != "" {
		event.title = e.Title
	}

	if e.Capacity != 0 {
		event.capacity = e.Capacity
	}

	if e.MaxSpecialPupils != 0 {
		// TODO: How can you update to 0?
		event.maxSpecialPupils = e.MaxSpecialPupils
	}

	if e.DayIDs != nil {
		// Add new days
		set := make(map[int]struct{}, len(e.DayIDs))
		for _, dayID := range e.DayIDs {
			set[dayID] = struct{}{}
			if _, exist := model.days[e.ID].event[e.ID]; !exist {
				model.days[dayID].event[e.ID] = []int{}
			}
		}

		// Remove existing days
		for dayID, day := range model.days {
			if _, exist := day.event[e.ID]; !exist {
				continue
			}

			if _, exist := set[dayID]; exist {
				delete(model.days[dayID].event, e.ID)
			}
		}
	}

	model.events[e.ID] = event
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

	for _, day := range model.days {
		delete(day.event, e.ID)
	}
	return model
}

type eventPupilCreate struct {
	ID         int    `json:"id"`
	CampaignID int    `json:"campaign_id"`
	PName      string `json:"name"`
	Class      string `json:"class"`
	Special    bool   `json:"special"`
}

func (e eventPupilCreate) Name() string {
	return "pupil-create"
}

func (e eventPupilCreate) Validate(model Model) error {
	if len(model.pupils) > e.ID {
		return fmt.Errorf("ID %d is not unique", e.ID)
	}

	if len(e.PName) == 0 {
		return fmt.Errorf("pupil name can not be empty")
	}

	if len(e.Class) == 0 {
		return fmt.Errorf("pupil class can not be empty")
	}

	if len(model.campains) <= e.CampaignID {
		return fmt.Errorf("campaign %d does not exist", e.CampaignID)
	}
	return nil
}

func (e eventPupilCreate) Execute(model Model, time time.Time) Model {
	for len(model.pupils) <= e.ID {
		model.pupils = append(model.pupils, pupil{})
	}
	model.pupils[e.ID] = pupil{
		campaignID: e.CampaignID,
		name:       e.PName,
		class:      e.Class,
		special:    e.Special,
	}
	return model
}

type eventPupilUpdate struct {
	ID      int    `json:"id"`
	PName   string `json:"name"`
	Class   string `json:"class"`
	Special bool   `json:"special"`
}

func (e eventPupilUpdate) Name() string {
	return "pupil-update"
}

func (e eventPupilUpdate) Validate(model Model) error {
	if len(model.pupils) <= e.ID {
		return fmt.Errorf("pupil with id %d does not exist", e.ID)
	}

	if len(e.PName) == 0 {
		return fmt.Errorf("pupil name can not be empty")
	}

	if len(e.Class) == 0 {
		return fmt.Errorf("pupil class can not be empty")
	}

	return nil
}

func (e eventPupilUpdate) Execute(model Model, time time.Time) Model {
	if len(model.pupils) < e.ID {
		return model
	}

	model.pupils[e.ID] = pupil{
		name:    e.PName,
		class:   e.Class,
		special: e.Special,
	}
	return model
}

type eventPupilDelete struct {
	ID int `json:"id"`
}

func (e eventPupilDelete) Name() string {
	return "pupil-delete"
}

func (e eventPupilDelete) Validate(model Model) error {
	if len(model.pupils) <= e.ID {
		return fmt.Errorf("Pupil with ID %d does not exist", e.ID)
	}

	return nil
}

func (e eventPupilDelete) Execute(model Model, time time.Time) Model {
	if len(model.pupils) < e.ID {
		return model
	}
	model.pupils[e.ID] = pupil{}
	return model
}

type eventAssignPupil struct {
	PupilID int `json:"pupil_id"`
	DayID   int `json:"day_id"`
	EventID int `json:"event_id"`
}

func (e eventAssignPupil) Name() string {
	return "assign-pupil"
}

func (e eventAssignPupil) Validate(model Model) error {
	// All objects have to exist and be in the same campaign
	if !(model.dayExist(e.DayID) && model.pupilExist(e.PupilID) && model.eventExist(e.EventID)) {
		return fmt.Errorf("pupil, day and event have to exist")
	}

	pupil := model.pupils[e.PupilID]
	day := model.days[e.DayID]
	event := model.events[e.EventID]

	if !model.campainExist(pupil.campaignID) {
		return fmt.Errorf("campaign does not exist")
	}

	if !(pupil.campaignID == day.campaignID && pupil.campaignID == event.campaignID) {
		return fmt.Errorf("pupil, day and event have to be in the same campaign")
	}

	return nil
}

func (e eventAssignPupil) Execute(model Model, time time.Time) Model {
	day := model.days[e.DayID]
	day.event[e.EventID] = append(day.event[e.EventID], e.PupilID)
	model.days[e.DayID] = day
	return model
}

type eventPupilChoice struct {
	PupilID int           `json:"pupil_id"`
	Choices []EventChoice `json:"choices"`
}

func (e eventPupilChoice) Name() string {
	return "pupil-choice"
}

func (e eventPupilChoice) Validate(model Model) error {
	if !model.pupilExist(e.PupilID) {
		return fmt.Errorf("pupil does not exist")
	}

	for _, c := range e.Choices {
		if !model.eventExist(c.EventID) {
			return fmt.Errorf("event %d does not exist", c.EventID)
		}

		if !c.Choice.valid() {
			return fmt.Errorf("invalid choice for event %d", c.EventID)
		}
	}

	return nil
}

func (e eventPupilChoice) Execute(model Model, time time.Time) Model {
	model.pupils[e.PupilID].choices = e.Choices
	return model
}
