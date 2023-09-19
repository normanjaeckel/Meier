module Data exposing
    ( Campaign2
    , CampaignId2
    , Day2
    , DayId2
    , Event2
    , EventId2
    , Pupil2
    , PupilId2
    , campaingSelectionSet
    , daySelectionSet
    , eventSelectionSet
    )

import Api.Object
import Api.Object.Campaign
import Api.Object.Day
import Api.Object.Event
import Api.Object.EventPupil
import Api.Object.Pupil
import Api.ScalarCodecs
import Graphql.SelectionSet


type alias Campaign2 =
    { id : CampaignId2
    , title : String
    , days : List Day2
    , events : List Event2
    , pupils : List Pupil2
    }


type alias CampaignId2 =
    Api.ScalarCodecs.Id


campaingSelectionSet : Graphql.SelectionSet.SelectionSet Campaign2 Api.Object.Campaign
campaingSelectionSet =
    Graphql.SelectionSet.map5 Campaign2
        Api.Object.Campaign.id
        Api.Object.Campaign.title
        (Api.Object.Campaign.days daySelectionSet)
        (Api.Object.Campaign.events eventSelectionSet)
        (Api.Object.Campaign.pupils pupilSelectionSet)


type alias Day2 =
    { id : DayId2
    , title : String
    , events : List ( EventId2, List PupilId2 )
    }


type alias DayId2 =
    Api.ScalarCodecs.Id


daySelectionSet : Graphql.SelectionSet.SelectionSet Day2 Api.Object.Day
daySelectionSet =
    Graphql.SelectionSet.map3 Day2
        Api.Object.Day.id
        Api.Object.Day.title
        (Api.Object.Day.events eventPupilSelectionSet)


eventPupilSelectionSet : Graphql.SelectionSet.SelectionSet ( EventId2, List PupilId2 ) Api.Object.EventPupil
eventPupilSelectionSet =
    Graphql.SelectionSet.map2 Tuple.pair
        (Api.Object.EventPupil.event Api.Object.Event.id)
        (Api.Object.EventPupil.pupils Api.Object.Pupil.id)


type alias Event2 =
    { id : EventId2
    , title : String
    , capacity : Int
    , maxSpecialPupils : Int
    }


type alias EventId2 =
    Api.ScalarCodecs.Id


eventSelectionSet : Graphql.SelectionSet.SelectionSet Event2 Api.Object.Event
eventSelectionSet =
    Graphql.SelectionSet.map4 Event2
        Api.Object.Event.id
        Api.Object.Event.title
        Api.Object.Event.capacity
        Api.Object.Event.maxSpecialPupils


type alias Pupil2 =
    { id : PupilId2
    , name : String
    , class : String
    , isSpecial : Bool
    }


type alias PupilId2 =
    Api.ScalarCodecs.Id


pupilSelectionSet : Graphql.SelectionSet.SelectionSet Pupil2 Api.Object.Pupil
pupilSelectionSet =
    Graphql.SelectionSet.map4 Pupil2
        Api.Object.Pupil.id
        Api.Object.Pupil.name
        Api.Object.Pupil.class
        Api.Object.Pupil.isSpecial
