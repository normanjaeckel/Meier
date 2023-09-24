module EventForm exposing (Action(..), Effect(..), Model, Msg, init, update, view)

import Api.Mutation
import Data
import Graphql.Http
import Graphql.OptionalArgument
import Html exposing (Html, button, div, footer, form, header, input, p, section, text)
import Html.Attributes exposing (attribute, class, placeholder, required, type_, value)
import Html.Events exposing (onClick, onInput, onSubmit)
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
    = FormMsg FormMsg
    | SendEventForm Action
    | CloseForm
    | GotNewEvent (Result (Graphql.Http.Error Data.Event) Data.Event)
    | GotUpdatedEvent (Result (Graphql.Http.Error Data.Event) Data.Event)
    | GotDeleteEvent Data.EventId (Result (Graphql.Http.Error Bool) Bool)


type FormMsg
    = Title String
    | Capacity Int
    | MaxSpecialPupil Int


type Action
    = New
    | Edit Data.EventId
    | Delete Data.Event


type Effect
    = None
    | Loading (Cmd Msg)
    | Done Data.Campaign
    | Error String


update : Data.Campaign -> Msg -> Model -> ( Model, Effect )
update campaign msg model =
    case msg of
        FormMsg formMsg ->
            let
                updatedModel : Model
                updatedModel =
                    case formMsg of
                        Title t ->
                            { model | title = t }

                        Capacity cap ->
                            { model | capacity = cap }

                        MaxSpecialPupil msp ->
                            { model | maxSpecialPupils = msp }
            in
            ( updatedModel, None )

        SendEventForm action ->
            case action of
                New ->
                    ( model
                    , Loading <|
                        (Api.Mutation.addEvent
                            (Api.Mutation.AddEventRequiredArguments
                                campaign.id
                                model.title
                                []
                                model.capacity
                                model.maxSpecialPupils
                            )
                            Data.eventSelectionSet
                            |> Graphql.Http.mutationRequest Shared.queryUrl
                            |> Graphql.Http.send GotNewEvent
                        )
                    )

                Edit eventId ->
                    let
                        optionalArgs : Api.Mutation.UpdateEventOptionalArguments -> Api.Mutation.UpdateEventOptionalArguments
                        optionalArgs args =
                            { args
                                | title = Graphql.OptionalArgument.Present model.title
                                , capacity = Graphql.OptionalArgument.Present model.capacity
                                , maxSpecialPupils = Graphql.OptionalArgument.Present model.maxSpecialPupils
                            }
                    in
                    ( model
                    , Loading <|
                        (Api.Mutation.updateEvent
                            optionalArgs
                            (Api.Mutation.UpdateEventRequiredArguments eventId)
                            Data.eventSelectionSet
                            |> Graphql.Http.mutationRequest Shared.queryUrl
                            |> Graphql.Http.send GotUpdatedEvent
                        )
                    )

                Delete event ->
                    ( model
                    , Loading <|
                        (Api.Mutation.deleteEvent (Api.Mutation.DeleteEventRequiredArguments event.id)
                            |> Graphql.Http.mutationRequest Shared.queryUrl
                            |> Graphql.Http.send (GotDeleteEvent event.id)
                        )
                    )

        CloseForm ->
            ( model, Done campaign )

        GotNewEvent res ->
            case res of
                Ok event ->
                    ( model, Done { campaign | events = campaign.events ++ [ event ] } )

                Err err ->
                    ( model, Error (Shared.parseGraphqlError err) )

        GotUpdatedEvent res ->
            case res of
                Ok eventFromServer ->
                    let
                        walkToUpdate : List Data.Event -> List Data.Event
                        walkToUpdate events =
                            case events of
                                event :: rest ->
                                    if event.id == eventFromServer.id then
                                        eventFromServer :: rest

                                    else
                                        event :: walkToUpdate rest

                                [] ->
                                    []
                    in
                    ( model, Done { campaign | events = walkToUpdate campaign.events } )

                Err err ->
                    ( model, Error (Shared.parseGraphqlError err) )

        GotDeleteEvent eventToBeDeletedId res ->
            case res of
                Ok _ ->
                    let
                        walkToUpdate : List Data.Event -> List Data.Event
                        walkToUpdate events =
                            case events of
                                event :: rest ->
                                    if event.id == eventToBeDeletedId then
                                        rest

                                    else
                                        event :: walkToUpdate rest

                                [] ->
                                    []
                    in
                    ( model, Done { campaign | events = walkToUpdate campaign.events } )

                Err err ->
                    ( model, Error (Shared.parseGraphqlError err) )



-- VIEW


view : Action -> Model -> Html Msg
view action model =
    case action of
        New ->
            viewNewAndEdit "Neues Angebot hinzufügen" action model

        Edit _ ->
            viewNewAndEdit "Angebot bearbeiten" action model

        Delete event ->
            viewDelete event


viewNewAndEdit : String -> Action -> Model -> Html Msg
viewNewAndEdit headline action model =
    div [ classes "modal is-active" ]
        [ div [ class "modal-background", onClick CloseForm ] []
        , div [ class "modal-card" ]
            [ form [ onSubmit <| SendEventForm action ]
                [ header [ class "modal-card-head" ]
                    [ p [ class "modal-card-title" ] [ text headline ]
                    , button [ class "delete", attribute "aria-label" "close", onClick CloseForm ] []
                    ]
                , section [ class "modal-card-body" ]
                    (formFields model |> List.map (Html.map FormMsg))
                , footer [ class "modal-card-foot" ]
                    [ button [ classes "button is-success", type_ "submit" ] [ text "Speichern" ]
                    , button [ class "button", onClick CloseForm ] [ text "Abbrechen" ]
                    ]
                ]
            ]
        ]


formFields : Model -> List (Html FormMsg)
formFields model =
    let
        labelCapacity : String
        labelCapacity =
            "Maximale Anzahl der Schüler/innen"

        labelMaxSpecialPupils : String
        labelMaxSpecialPupils =
            "Maximale Anzahl an besonderen Schüler/innen"
    in
    [ div [ class "field" ]
        [ div [ class "control" ]
            [ input
                [ class "input"
                , type_ "text"
                , placeholder "Titel"
                , attribute "aria-label" "Titel"
                , required True
                , onInput Title
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
                , Html.Attributes.max "10000"
                , onInput (String.toInt >> Maybe.withDefault 0 >> Capacity)
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
                , Html.Attributes.max "10000"
                , onInput (String.toInt >> Maybe.withDefault 0 >> MaxSpecialPupil)
                , value <| String.fromInt model.maxSpecialPupils
                ]
                []
            ]
        , p [ class "help" ] [ text labelMaxSpecialPupils ]
        ]
    ]


viewDelete : Data.Event -> Html Msg
viewDelete event =
    div [ classes "modal is-active" ]
        [ div [ class "modal-background", onClick CloseForm ] []
        , div [ class "modal-card" ]
            [ header [ class "modal-card-head" ]
                [ p [ class "modal-card-title" ] [ text "Angebot löschen" ]
                , button [ class "delete", type_ "button", attribute "aria-label" "close", onClick CloseForm ] []
                ]
            , section [ class "modal-card-body" ]
                [ p [] [ text <| "Wollen Sie das Angebot " ++ event.title ++ " wirklich löschen?" ]
                ]
            , footer [ class "modal-card-foot" ]
                [ button [ classes "button is-success", onClick <| SendEventForm (Delete event) ] [ text "Löschen" ]
                , button [ class "button", type_ "button", onClick CloseForm ] [ text "Abbrechen" ]
                ]
            ]
        ]
