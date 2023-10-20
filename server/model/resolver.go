package model

import (
	"cmp"
	"fmt"
	"slices"
	"strconv"
)

// ID is an graphql id
type ID int

// ImplementsGraphQLType implements the graphql type
func (ID) ImplementsGraphQLType(name string) bool {
	return name == "ID"
}

// UnmarshalGraphQL converts from graphql to id
func (id *ID) UnmarshalGraphQL(input interface{}) error {
	var err error
	switch input := input.(type) {
	// case string:
	// 	*id = ID(input)
	case int32:
		*id = ID(int(input))
	default:
		err = fmt.Errorf("wrong type for ID: %T", input)
	}
	return err
}

// MarshalJSON converts an id to json
func (id ID) MarshalJSON() ([]byte, error) {
	return []byte(strconv.Itoa(int(id))), nil
}

// CampaignResolver contains all data for an campaign.
type CampaignResolver struct {
	m Model

	ID         ID
	Title      string
	LoginToken string
	DayIDs     []int
	EventIDs   []int
	PupilIDs   []int
}

// Days returns the days.
func (c CampaignResolver) Days() []DayResolver {
	days := make([]DayResolver, len(c.DayIDs))
	for i, id := range c.DayIDs {
		day, err := c.m.Day(id)
		if err != nil {
			continue
		}

		days[i] = day
	}

	return days
}

// Events returns the events.
func (c CampaignResolver) Events() ([]EventResolver, error) {
	events := make([]EventResolver, len(c.EventIDs))
	for i, id := range c.EventIDs {
		event, err := c.m.Event(id)
		if err != nil {
			return nil, fmt.Errorf("getting event %d: %w", id, err)
		}

		events[i] = event
	}

	return events, nil
}

// Pupils returns the pupils.
func (c CampaignResolver) Pupils() ([]PupilResolver, error) {
	pupils := make([]PupilResolver, len(c.PupilIDs))
	for i, id := range c.PupilIDs {
		pupil, err := c.m.Pupil(id)
		if err != nil {
			return nil, fmt.Errorf("getting pupil %d: %w", id, err)
		}

		pupils[i] = pupil
	}

	return pupils, nil
}

// DayResolver contains all data from a maier day.
type DayResolver struct {
	m Model

	ID         ID
	CampaignID int
	Title      string
	EventPupil map[int][]int
}

// Campaign retuns a maier campaign
func (d DayResolver) Campaign() (CampaignResolver, error) {
	return d.m.Campaign(int(d.ID))
}

// Events returns the coralation from event to pupil
func (d DayResolver) Events() []EventPupilResolver {
	epList := make([]EventPupilResolver, 0, len(d.EventPupil))
	for eventID, pupilIDs := range d.EventPupil {
		ep := EventPupilResolver{
			m:        d.m,
			EventID:  eventID,
			PupilIDs: pupilIDs,
		}
		epList = append(epList, ep)
	}

	slices.SortFunc(epList, func(a, b EventPupilResolver) int {
		return cmp.Compare(a.EventID, b.EventID)
	})

	return epList
}

// EventPupilResolver contains the coralation between event and pupils.
type EventPupilResolver struct {
	m Model

	EventID  int
	PupilIDs []int
}

// Event returns the event.
func (e EventPupilResolver) Event() (EventResolver, error) {
	return e.m.Event(e.EventID)
}

// Pupils returns the pupils.
func (e EventPupilResolver) Pupils() ([]PupilResolver, error) {
	pupils := make([]PupilResolver, len(e.PupilIDs))
	for i, pupilID := range e.PupilIDs {
		p, err := e.m.Pupil(pupilID)
		if err != nil {
			return nil, fmt.Errorf("pupil with id %d does not exist", pupilID)
		}
		pupils[i] = p
	}
	return pupils, nil
}

// EventResolver contains all data for an meyer event.
type EventResolver struct {
	m Model

	ID               ID
	CampaignID       int
	Title            string
	Capacity         int32
	MaxSpecialPupils int32
	DayIDs           []int
}

// Campaign retuns a mayer campaign
func (e EventResolver) Campaign() (CampaignResolver, error) {
	return e.m.Campaign(int(e.ID))
}

// Days returns all days of the event.
func (e EventResolver) Days() ([]DayResolver, error) {
	days := make([]DayResolver, len(e.DayIDs))
	for i, id := range e.DayIDs {
		day, err := e.m.Day(id)
		if err != nil {
			return nil, fmt.Errorf("getting day %d: %w", id, err)
		}

		days[i] = day
	}
	return days, nil
}

// PupilResolver contains all pupil data.
type PupilResolver struct {
	m Model

	ID         ID
	CampaignID int
	Name       string
	LoginToken string
	Class      string
	IsSpecial  bool
	choices    []EventChoice
}

// Campaign retuns a maier campaign
func (p PupilResolver) Campaign() (CampaignResolver, error) {
	return p.m.Campaign(int(p.ID))
}

// Choices returns the pupils choices.
func (p PupilResolver) Choices() []EventChoiceResolver {
	out := make([]EventChoiceResolver, len(p.choices))
	for i, ec := range p.choices {
		out[i] = EventChoiceResolver{
			m:       p.m,
			EventID: ec.EventID,
			Choice:  ec.Choice,
		}
	}

	return out
}

// EventChoiceResolver returns a corelation from event to choice.
type EventChoiceResolver struct {
	m Model

	EventID int
	Choice  Choice
}

// Event returns the event of choice.
func (e EventChoiceResolver) Event() (EventResolver, error) {
	return e.m.Event(e.EventID)
}
