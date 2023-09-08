module NewEvent exposing (Effect(..), Model, Msg, init, update, view)

import Data exposing (Campaign, Event)
import Html exposing (Html, button, div, form, h1, input, p, text)
import Html.Attributes exposing (attribute, class, placeholder, required, type_, value)
import Html.Events exposing (onInput, onSubmit)
import Http
import Json.Decode as D
import Json.Encode as E
import Shared exposing (classes)



-- MODEL


type alias Model =
    { title : String
    , capacity : Int
    , maxSpecialPupils : Int
    }


init : Model
init =
    Model "" 12 2



-- UPDATE


type Msg
    = NewEventFormDataMsg NewEventFormDataInput
    | SendNewEventForm Campaign
    | GotNewEvent Campaign (Result Http.Error Event)


type NewEventFormDataInput
    = Title String
    | Capacity Int
    | MaxSpecialPupils Int


type Effect
    = None
    | Loading (Cmd Msg)
    | Done Campaign
    | Error String


update : Msg -> Model -> ( Model, Effect )
update msg model =
    case msg of
        NewEventFormDataMsg newData ->
            let
                updatedModel : Model
                updatedModel =
                    case newData of
                        Title t ->
                            { model | title = t }

                        Capacity c ->
                            { model | capacity = c }

                        MaxSpecialPupils msp ->
                            { model | maxSpecialPupils = msp }
            in
            ( updatedModel, None )

        SendNewEventForm c ->
            let
                mutationQuery : String
                mutationQuery =
                    String.join " "
                        [ "mutation"
                        , "{"
                        , "addEvent"
                        , "("
                        , "campaignID:"
                        , E.encode 0 <| E.int c.id
                        , ", title:"
                        , E.encode 0 <| E.string model.title
                        , ",capacity:"
                        , E.encode 0 <| E.int model.capacity
                        , ", maxSpecialPupils:"
                        , E.encode 0 <| E.int model.maxSpecialPupils
                        , ", dayIDs: []"
                        , ")"
                        , Data.queryEvent
                        , "}"
                        ]

                addEventDecoder : D.Decoder Event
                addEventDecoder =
                    D.field
                        "data"
                        (D.field "addEvent" Data.eventDecoder)
            in
            ( model
            , Loading <|
                Http.post
                    { url = Shared.queryUrl
                    , body = Http.jsonBody <| E.object [ ( "query", E.string mutationQuery ) ]
                    , expect = Http.expectJson (GotNewEvent c) addEventDecoder
                    }
            )

        GotNewEvent c res ->
            case res of
                Ok e ->
                    ( model, Done { c | events = c.events ++ [ e ] } )

                Err err ->
                    ( model, Error (Shared.parseError err) )



-- VIEW


view : Campaign -> Model -> List (Html Msg)
view c model =
    let
        labelCapacity : String
        labelCapacity =
            "Maximale Anzahl der Schüler/innen"

        labelMaxSpecialPupils : String
        labelMaxSpecialPupils =
            "Maximale Anzahl an besonderen Schüler/innen"
    in
    [ h1 [ classes "title is-3" ] [ text "Neues Event hinzufügen" ]
    , div [ class "columns" ]
        [ div [ classes "column is-half-tablet is-one-third-desktop is-one-quarter-widescreen" ]
            [ form [ onSubmit <| SendNewEventForm c ]
                [ div [ class "field" ]
                    [ div [ class "control" ]
                        [ input
                            [ class "input"
                            , type_ "text"
                            , placeholder "Titel"
                            , attribute "aria-label" "Titel"
                            , required True
                            , onInput (Title >> NewEventFormDataMsg)
                            , value model.title
                            ]
                            []
                        ]
                    ]
                , div [ class "field" ]
                    [ div [ class "control" ]
                        [ input
                            [ class "input"
                            , type_ "number"
                            , attribute "aria-label" labelCapacity
                            , Html.Attributes.min "1"
                            , onInput (String.toInt >> Maybe.withDefault 0 >> Capacity >> NewEventFormDataMsg)
                            , value <| String.fromInt model.capacity
                            ]
                            []
                        ]
                    , p [ class "help" ] [ text labelCapacity ]
                    ]
                , div [ class "field" ]
                    [ div [ class "control" ]
                        [ input
                            [ class "input"
                            , type_ "number"
                            , attribute "aria-label" labelMaxSpecialPupils
                            , Html.Attributes.min "1"
                            , onInput (String.toInt >> Maybe.withDefault 0 >> MaxSpecialPupils >> NewEventFormDataMsg)
                            , value <| String.fromInt model.maxSpecialPupils
                            ]
                            []
                        ]
                    , p [ class "help" ] [ text labelMaxSpecialPupils ]
                    ]
                , div [ class "field" ]
                    [ button [ classes "button is-primary", type_ "submit" ] [ text "Hinzufügen" ] ]
                ]
            ]
        ]
    ]
