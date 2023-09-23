module Main exposing (main)

import Api.Query
import Browser
import Data exposing (Campaign, Day, Event, Pupil)
import EventForm
import Graphql.Http
import Html exposing (Html, a, button, div, h1, h2, h3, li, main_, nav, p, section, span, text, ul)
import Html.Attributes exposing (class, name, title)
import Html.Events exposing (onClick)
import NewCampaign
import NewDay
import NewPupil
import Platform.Cmd as Cmd
import Shared exposing (classes, parseGraphqlError)


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , subscriptions = subscriptions
        , view = view
        }



-- MODEL


type alias Model =
    { connection : Connection
    , campaigns : List Campaign
    , newCampaign : NewCampaign.Model
    , newDay : NewDay.Model
    , eventForm : EventForm.Model
    , newPupil : NewPupil.Model
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { connection = Loading
      , campaigns = []
      , newCampaign = NewCampaign.init
      , newDay = NewDay.init
      , eventForm = EventForm.init
      , newPupil = NewPupil.init
      }
    , Api.Query.campaignList Data.campaingSelectionSet
        |> Graphql.Http.queryRequest Shared.queryUrl
        |> Graphql.Http.send GotCampaignList
    )


type Connection
    = Loading
    | Failure String
    | Success Page


type Page
    = Overview
    | CampaignPage Campaign
    | NewCampaignPage
    | NewDayPage Campaign
    | NewEventPage Campaign
    | EditEventPage Campaign Data.EventId
    | DeleteEventPage Campaign Data.EventId
    | NewPupilPage Campaign
    | PupilPage Pupil



-- UPDATE


type Msg
    = GotCampaignList (Result (Graphql.Http.Error (List Campaign)) (List Campaign))
    | SwitchPage SwitchTo
    | NewCampaignMsg NewCampaign.Msg
    | NewDayMsg NewDay.Msg
    | EventFormMsg Campaign EventForm.Msg
    | NewPupilMsg NewPupil.Msg


type SwitchTo
    = SwitchToOverview
    | SwitchToNewCampaign
    | SwitchToCampaign Campaign
    | SwitchToNewDay Campaign
    | SwitchToNewEvent Campaign
    | SwitchToEditEvent Campaign Event
    | SwitchToDeleteEvent Campaign Event
    | SwitchToNewPupil Campaign
    | SwitchToPupil Pupil


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GotCampaignList res ->
            case res of
                Ok campaigns ->
                    ( { model | connection = Success Overview, campaigns = campaigns }, Cmd.none )

                Err err ->
                    ( { model | connection = Failure (parseGraphqlError err) }, Cmd.none )

        SwitchPage s ->
            case s of
                SwitchToOverview ->
                    ( { model | connection = Success <| Overview }, Cmd.none )

                SwitchToNewCampaign ->
                    ( { model | connection = Success NewCampaignPage }, Cmd.none )

                SwitchToNewDay c ->
                    ( { model | connection = Success <| NewDayPage c }, Cmd.none )

                SwitchToNewEvent c ->
                    ( { model | connection = Success <| NewEventPage c }, Cmd.none )

                SwitchToEditEvent c e ->
                    let
                        eventForm : EventForm.Model
                        eventForm =
                            EventForm.Model
                                e.title
                                e.capacity
                                e.maxSpecialPupils
                    in
                    ( { model | connection = Success <| EditEventPage c e.id, eventForm = eventForm }, Cmd.none )

                SwitchToDeleteEvent c e ->
                    ( { model | connection = Success <| DeleteEventPage c e.id }, Cmd.none )

                SwitchToNewPupil c ->
                    ( { model | connection = Success <| NewPupilPage c }, Cmd.none )

                SwitchToCampaign c ->
                    ( { model | connection = Success <| CampaignPage c }, Cmd.none )

                SwitchToPupil pup ->
                    ( { model | connection = Success <| PupilPage pup }, Cmd.none )

        NewCampaignMsg innerMsg ->
            let
                ( updatedModel, effect ) =
                    NewCampaign.update innerMsg model.newCampaign
            in
            case effect of
                NewCampaign.None ->
                    ( { model | newCampaign = updatedModel }, Cmd.none )

                NewCampaign.Loading innerCmd ->
                    ( { model | connection = Loading }, innerCmd |> Cmd.map NewCampaignMsg )

                NewCampaign.Done c ->
                    ( { model
                        | connection = Success <| CampaignPage c
                        , campaigns = model.campaigns ++ [ c ]
                        , newCampaign = NewCampaign.init
                      }
                    , Cmd.none
                    )

                NewCampaign.Error err ->
                    ( { model | connection = Failure err }, Cmd.none )

        NewDayMsg innerMsg ->
            let
                ( updatedModel, effect ) =
                    NewDay.update innerMsg model.newDay
            in
            case effect of
                NewDay.None ->
                    ( { model | newDay = updatedModel }, Cmd.none )

                NewDay.Loading innerCmd ->
                    ( { model | connection = Loading }, innerCmd |> Cmd.map NewDayMsg )

                NewDay.Done updatedCamp ->
                    let
                        newCampaignList : List Campaign
                        newCampaignList =
                            -- TODO: use recursion here
                            model.campaigns
                                |> List.foldr
                                    (\camp acc ->
                                        if camp.id == updatedCamp.id then
                                            updatedCamp :: acc

                                        else
                                            camp :: acc
                                    )
                                    []
                    in
                    ( { model
                        | connection = Success <| CampaignPage updatedCamp
                        , campaigns = newCampaignList
                        , newDay = NewDay.init
                      }
                    , Cmd.none
                    )

                NewDay.Error err ->
                    ( { model | connection = Failure err }, Cmd.none )

        EventFormMsg campaign innerMsg ->
            let
                ( updatedModel, effect ) =
                    EventForm.update campaign innerMsg model.eventForm
            in
            case effect of
                EventForm.None ->
                    ( { model | eventForm = updatedModel }, Cmd.none )

                EventForm.Loading innerCmd ->
                    ( { model | connection = Loading }, innerCmd |> Cmd.map (EventFormMsg campaign) )

                EventForm.Done updatedCamp ->
                    let
                        newCampaignList : List Campaign
                        newCampaignList =
                            -- TODO: use recursion here
                            model.campaigns
                                |> List.foldr
                                    (\camp acc ->
                                        if camp.id == updatedCamp.id then
                                            updatedCamp :: acc

                                        else
                                            camp :: acc
                                    )
                                    []
                    in
                    ( { model
                        | connection = Success <| CampaignPage updatedCamp
                        , campaigns = newCampaignList
                        , eventForm = EventForm.init
                      }
                    , Cmd.none
                    )

                EventForm.Error err ->
                    ( { model | connection = Failure err }, Cmd.none )

        NewPupilMsg innerMsg ->
            let
                ( updatedModel, effect ) =
                    NewPupil.update innerMsg model.newPupil
            in
            case effect of
                NewPupil.None ->
                    ( { model | newPupil = updatedModel }, Cmd.none )

                NewPupil.Loading innerCmd ->
                    ( { model | connection = Loading }, innerCmd |> Cmd.map NewPupilMsg )

                NewPupil.Done updatedCamp ->
                    let
                        newCampaignList : List Campaign
                        newCampaignList =
                            -- TODO: use recursion here
                            model.campaigns
                                |> List.foldr
                                    (\camp acc ->
                                        if camp.id == updatedCamp.id then
                                            updatedCamp :: acc

                                        else
                                            camp :: acc
                                    )
                                    []
                    in
                    ( { model
                        | connection = Success <| CampaignPage updatedCamp
                        , campaigns = newCampaignList
                        , newPupil = NewPupil.init
                      }
                    , Cmd.none
                    )

                NewPupil.Error err ->
                    ( { model | connection = Failure err }, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none



-- VIEW


view : Model -> Html Msg
view model =
    div []
        [ navbar
        , main_ []
            [ section [ class "section" ]
                (case model.connection of
                    Loading ->
                        [ text "Loading" ]

                    Failure f ->
                        [ text f ]

                    Success p ->
                        case p of
                            Overview ->
                                [ h1 [ classes "title is-3" ] [ text "Überblick über alle Kampagnen" ]
                                , div [ class "buttons" ]
                                    (model.campaigns
                                        |> List.map
                                            (\c ->
                                                button
                                                    [ class "button"
                                                    , onClick <| SwitchPage <| SwitchToCampaign c
                                                    ]
                                                    [ text c.title ]
                                            )
                                    )
                                , button [ classes "button is-primary", onClick <| SwitchPage <| SwitchToNewCampaign ] [ text "Neue Kampagne" ]
                                ]

                            CampaignPage c ->
                                campaignView c

                            NewCampaignPage ->
                                NewCampaign.view model.newCampaign |> List.map (Html.map NewCampaignMsg)

                            NewDayPage c ->
                                NewDay.view c model.newDay |> List.map (Html.map NewDayMsg)

                            NewEventPage c ->
                                campaignView c ++ [ EventForm.view EventForm.New model.eventForm |> Html.map (EventFormMsg c) ]

                            EditEventPage c e ->
                                campaignView c ++ [ EventForm.view (EventForm.Edit e) model.eventForm |> Html.map (EventFormMsg c) ]

                            DeleteEventPage c e ->
                                campaignView c ++ [ EventForm.view (EventForm.Delete e) model.eventForm |> Html.map (EventFormMsg c) ]

                            NewPupilPage c ->
                                NewPupil.view c model.newPupil |> List.map (Html.map NewPupilMsg)

                            PupilPage pup ->
                                pupilView pup
                )
            ]
        ]


pupilToStr : Pupil -> String
pupilToStr p =
    p.name ++ " (Klasse " ++ p.class ++ ")"


navbar : Html Msg
navbar =
    nav [ class "navbar" ]
        [ div [ class "navbar-brand" ]
            [ a [ classes "navbar-item", onClick <| SwitchPage <| SwitchToOverview ] [ text "Home" ]
            ]
        ]


campaignView : Campaign -> List (Html Msg)
campaignView c =
    [ h1 [ classes "title is-3" ] [ text c.title ]
    , div [ class "block" ]
        ((c.days |> List.map dayView)
            ++ [ button [ classes "button is-primary", onClick <| SwitchPage <| SwitchToNewDay c ] [ text "Neuer Tag" ] ]
        )
    , div [ class "block" ]
        (h2 [ classes "title is-5" ] [ text "Alle Angebote" ]
            :: (c.events |> List.map (eventView c))
            ++ [ button [ classes "button is-primary", onClick <| SwitchPage <| SwitchToNewEvent c ] [ text "Neues Angebot" ] ]
        )
    , div [ class "block" ]
        [ h2 [ classes "title is-5" ] [ text "Alle Schüler/innen" ]
        , c.pupils |> pupilUl
        , button [ classes "button is-primary", onClick <| SwitchPage <| SwitchToNewPupil c ] [ text "Neue Schüler/innen" ]
        ]
    ]


dayView : Day -> Html Msg
dayView d =
    let
        events : List (Html Msg)
        events =
            --d.events |> Dict.values |> List.map eventView
            []

        unassignedPupils : List (Html Msg)
        unassignedPupils =
            []

        -- if True then
        --     []
        -- else
        --     [ div [ class "block" ]
        --         [ h3 [ classes "subtitle is-5" ] [ text "Bisher nicht zugeordnete Schüler/innen" ]
        --         , pupilUl []
        --         ]
        --     ]
    in
    div [ class "block" ]
        (h2 [ classes "title is-5" ] [ text d.title ] :: events ++ unassignedPupils)


eventView : Campaign -> Event -> Html Msg
eventView c e =
    div [ class "block" ]
        [ div [ classes "field is-grouped is-grouped-multiline" ]
            [ div [ class "control" ]
                [ h3 [ classes "subtitle is-5" ] [ text e.title ]
                ]
            , div [ class "control" ]
                [ div [ classes "tags has-addons" ]
                    [ span [ class "tag" ] [ text "max." ]
                    , span [ classes "tag is-primary" ] [ text <| String.fromInt e.capacity ]
                    ]
                ]
            , div [ class "control" ]
                [ div [ classes "tags has-addons" ]
                    [ span [ class "tag" ] [ text "bes." ]
                    , span [ classes "tag is-primary" ] [ text <| String.fromInt e.maxSpecialPupils ]
                    ]
                ]
            , a [ title "Bearbeiten", onClick <| SwitchPage <| SwitchToEditEvent c e ]
                [ span [ class "icon" ]
                    [ Html.node "ion-icon" [ name "create-outline" ] []
                    ]
                ]
            , a [ title "Löschen", onClick <| SwitchPage <| SwitchToDeleteEvent c e ]
                [ span [ class "icon" ]
                    [ Html.node "ion-icon" [ name "trash-outline" ] []
                    ]
                ]
            ]
        ]


pupilUl : List Pupil -> Html Msg
pupilUl pupList =
    ul []
        (pupList
            |> List.map
                (\pup -> li [] [ a [ onClick <| SwitchPage <| SwitchToPupil pup ] [ text <| pupilToStr pup ] ])
        )


pupilView : Pupil -> List (Html Msg)
pupilView pup =
    [ h1 [ classes "title is-3" ] [ text <| pupilToStr pup ]
    , p [] [ text "Lorem ipsum ..." ]
    ]
