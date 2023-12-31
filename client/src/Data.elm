module Data exposing
    ( Campaign
    , CampaignId
    , Day
    , DayId
    , Event
    , EventId
    , Pupil
    , PupilId
    , campaingSelectionSet
    , daySelectionSet
    , eventSelectionSet
    , pupilSelectionSet
    )

import Api.Object
import Api.Object.Campaign
import Api.Object.Day
import Api.Object.Event
import Api.Object.EventPupil
import Api.Object.Pupil
import Graphql.SelectionSet
import IdScalarCodecs


type alias Campaign =
    { id : CampaignId
    , title : String
    , days : List Day
    , events : List Event
    , pupils : List Pupil
    }


type alias CampaignId =
    IdScalarCodecs.Id


campaingSelectionSet : Graphql.SelectionSet.SelectionSet Campaign Api.Object.Campaign
campaingSelectionSet =
    Graphql.SelectionSet.map5 Campaign
        Api.Object.Campaign.id
        Api.Object.Campaign.title
        (Api.Object.Campaign.days daySelectionSet)
        (Api.Object.Campaign.events eventSelectionSet)
        (Api.Object.Campaign.pupils pupilSelectionSet)


type alias Day =
    { id : DayId
    , title : String
    , events : List ( EventId, List PupilId )
    }


type alias DayId =
    IdScalarCodecs.Id


daySelectionSet : Graphql.SelectionSet.SelectionSet Day Api.Object.Day
daySelectionSet =
    Graphql.SelectionSet.map3 Day
        Api.Object.Day.id
        Api.Object.Day.title
        (Api.Object.Day.events eventPupilSelectionSet)


eventPupilSelectionSet : Graphql.SelectionSet.SelectionSet ( EventId, List PupilId ) Api.Object.EventPupil
eventPupilSelectionSet =
    Graphql.SelectionSet.map2 Tuple.pair
        (Api.Object.EventPupil.event Api.Object.Event.id)
        (Api.Object.EventPupil.pupils Api.Object.Pupil.id)


type alias Event =
    { id : EventId
    , title : String
    , capacity : Int
    , maxSpecialPupils : Int
    }


type alias EventId =
    IdScalarCodecs.Id


eventSelectionSet : Graphql.SelectionSet.SelectionSet Event Api.Object.Event
eventSelectionSet =
    Graphql.SelectionSet.map4 Event
        Api.Object.Event.id
        Api.Object.Event.title
        Api.Object.Event.capacity
        Api.Object.Event.maxSpecialPupils


type alias Pupil =
    { id : PupilId
    , name : String
    , class : String
    , isSpecial : Bool
    }


type alias PupilId =
    IdScalarCodecs.Id


pupilSelectionSet : Graphql.SelectionSet.SelectionSet Pupil Api.Object.Pupil
pupilSelectionSet =
    Graphql.SelectionSet.map4 Pupil
        Api.Object.Pupil.id
        Api.Object.Pupil.name
        Api.Object.Pupil.class
        Api.Object.Pupil.isSpecial
