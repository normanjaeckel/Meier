module Data exposing (Campaign, Day, Event, Pupil, campaignDecoder, dayDecoder, eventDecoder, pupilDecoder, queryCampaign)

import Json.Decode as D


type alias Campaign =
    { id : CampaignId
    , title : String
    , days : List Day
    , events : List Event
    , pupils : List Pupil
    }


type alias CampaignId =
    Int


campaignDecoder : D.Decoder Campaign
campaignDecoder =
    D.map5 Campaign
        (D.field "id" D.int)
        (D.field "title" D.string)
        (D.field "days" (D.list dayDecoder))
        (D.field "events" (D.list eventDecoder))
        (D.field "pupils" (D.list pupilDecoder))


queryCampaign : String
queryCampaign =
    """
    {
        id
        title
        days {
            id
            title
            events {
                event {
                    id
                }
                pupils {
                    id
                }
            }
        }
        events {
            id
            title
            capacity
            maxSpecialPupils
        }
        pupils {
            id
            name
            class
            isSpecial
            choices {
                event {
                    id
                    title
                }
                choice
            }
        }
    }
    """


type alias Day =
    { id : DayId
    , title : String
    , events : List ( EventId, List PupilId )
    }


type alias DayId =
    Int


dayDecoder : D.Decoder Day
dayDecoder =
    D.map3 Day
        (D.field "id" D.int)
        (D.field "title" D.string)
        (D.field "events"
            (D.list
                (D.map2 Tuple.pair
                    (D.field "event" (D.field "id" D.int))
                    (D.field "pupils" (D.list <| D.field "id" D.int))
                )
            )
        )


type alias Event =
    { id : EventId
    , title : String
    , capacity : Int
    }


type alias EventId =
    Int


eventDecoder : D.Decoder Event
eventDecoder =
    D.map3 Event
        (D.field "id" D.int)
        (D.field "title" D.string)
        (D.field "capacity" D.int)


type alias Pupil =
    { name : String
    , class : String
    , isSpecial : Bool
    }


type alias PupilId =
    Int


pupilDecoder : D.Decoder Pupil
pupilDecoder =
    D.map3 Pupil
        (D.field "name" D.string)
        (D.field "class" D.string)
        (D.field "isSpecial" D.bool)
