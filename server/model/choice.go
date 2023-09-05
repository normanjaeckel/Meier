package model

import (
	"encoding/json"
	"fmt"
	"strings"
)

// Choice represents a pupil choice.
type Choice int

// Choice values
const (
	Yellow Choice = iota
	Red
	Green
)

var choices = [...]string{
	Yellow: "YELLOW",
	Red:    "RED",
	Green:  "GREEN",
}

func (c Choice) valid() bool {
	return c >= 0 && int(c) < len(choices)
}

func (c Choice) String() string { return choices[c] }

func (c *Choice) fromString(in string) error {
	for i, choice := range choices {
		if strings.ToLower(choice) == strings.ToLower(in) {
			(*c) = Choice(i)
			return nil
		}
	}

	return fmt.Errorf("unknown choice %s", in)
}

// ImplementsGraphQLType implements the graphql type
func (Choice) ImplementsGraphQLType(name string) bool {
	return name == "Choice"
}

// UnmarshalGraphQL tries to unmarshal a type from a given GraphQL value.
func (c *Choice) UnmarshalGraphQL(input interface{}) error {
	switch input := input.(type) {
	case string:
		return c.fromString(input)
	default:
		return fmt.Errorf("wrong type for State: %T", input)
	}
}

// MarshalJSON converts an choice to json
func (c Choice) MarshalJSON() ([]byte, error) {
	return json.Marshal(c.String())
}

// UnmarshalJSON implements the json interface.
func (c *Choice) UnmarshalJSON(data []byte) error {
	var stringChoice string
	if err := json.Unmarshal(data, &stringChoice); err == nil {
		c.fromString(stringChoice)
		return nil
	}

	var intChoice int
	if err := json.Unmarshal(data, &intChoice); err == nil {
		(*c) = Choice(intChoice)
		return nil
	}

	return fmt.Errorf("invalid value for choice `%s`", data)
}
