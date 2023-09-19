module NewEvent exposing (Effect(..), Model, Msg, init, update, view)

import Api.Mutation
import Data
import Graphql.Http
import Html exposing (Html, button, div, form, h1, input, p, text)
import Html.Attributes exposing (attribute, class, placeholder, required, type_, value)
import Html.Events exposing (onInput, onSubmit)
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
    | SendNewEventForm Data.Campaign2
    | GotNewEvent Data.Campaign2 (Result (Graphql.Http.Error Data.Event2) Data.Event2)


type NewEventFormDataInput
    = Title String
    | Capacity Int
    | MaxSpecialPupils Int


type Effect
    = None
    | Loading (Cmd Msg)
    | Done Data.Campaign2
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

        SendNewEventForm campaign ->
            ( model
            , Loading <|
                (Api.Mutation.addEvent (Api.Mutation.AddEventRequiredArguments campaign.id model.title [] model.capacity model.maxSpecialPupils) Data.eventSelectionSet
                    |> Graphql.Http.mutationRequest Shared.queryUrl
                    |> Graphql.Http.send (GotNewEvent campaign)
                )
            )

        GotNewEvent campaign res ->
            case res of
                Ok event ->
                    ( model, Done { campaign | events = campaign.events ++ [ event ] } )

                Err err ->
                    ( model, Error (Shared.parseGraphqlError err) )



-- VIEW


view : Data.Campaign2 -> Model -> List (Html Msg)
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
