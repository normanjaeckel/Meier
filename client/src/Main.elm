module Main exposing (main)

import Api.Query
import Browser
import Data exposing (Campaign, Day, Event, Pupil)
import DayForm
import EventForm
import Graphql.Http
import Html exposing (Html, a, button, div, h1, h2, h3, li, main_, nav, p, section, span, text, ul)
import Html.Attributes exposing (class, name, title)
import Html.Events exposing (onClick)
import NewCampaign
import Platform.Cmd as Cmd
import PupilForm
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
    , dayForm : DayForm.Model
    , eventForm : EventForm.Model
    , pupilForm : PupilForm.Model
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { connection = Loading
      , campaigns = []
      , newCampaign = NewCampaign.init
      , dayForm = DayForm.init
      , eventForm = EventForm.init
      , pupilForm = PupilForm.init
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
    | FormPage FormPage
    | PupilPage Pupil


type FormPage
    = NewDayPage Campaign
    | EditDayPage Campaign Data.DayId
    | DeleteDayPage Campaign Data.Day
    | NewEventPage Campaign
    | EditEventPage Campaign Data.EventId
    | DeleteEventPage Campaign Data.Event
    | NewPupilPage Campaign
    | EditPupilPage Campaign Data.PupilId
    | DeletePupilPage Campaign Data.Pupil



-- UPDATE


type Msg
    = GotCampaignList (Result (Graphql.Http.Error (List Campaign)) (List Campaign))
    | SwitchPage SwitchTo
    | NewCampaignMsg NewCampaign.Msg
    | DayFormMsg Campaign DayForm.Msg
    | EventFormMsg Campaign EventForm.Msg
    | PupilFormMsg Campaign PupilForm.Msg


type SwitchTo
    = SwitchToOverview
    | SwitchToNewCampaign
    | SwitchToCampaign Campaign
    | SwitchToNewDay Campaign
    | SwitchToEditDay Campaign Day
    | SwitchToDeleteDay Campaign Day
    | SwitchToNewEvent Campaign
    | SwitchToEditEvent Campaign Event
    | SwitchToDeleteEvent Campaign Event
    | SwitchToNewPupil Campaign
    | SwitchToEditPupil Campaign Pupil
    | SwitchToDeletePupil Campaign Pupil
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

                SwitchToNewDay campaign ->
                    ( { model | connection = Success <| FormPage <| NewDayPage campaign }, Cmd.none )

                SwitchToEditDay campaign day ->
                    let
                        dayForm : DayForm.Model
                        dayForm =
                            DayForm.Model
                                day.title
                    in
                    ( { model | connection = Success <| FormPage <| EditDayPage campaign day.id, dayForm = dayForm }, Cmd.none )

                SwitchToDeleteDay campaign day ->
                    ( { model | connection = Success <| FormPage <| DeleteDayPage campaign day }, Cmd.none )

                SwitchToNewEvent campaign ->
                    ( { model | connection = Success <| FormPage <| NewEventPage campaign }, Cmd.none )

                SwitchToEditEvent campaign event ->
                    let
                        eventForm : EventForm.Model
                        eventForm =
                            EventForm.Model
                                event.title
                                event.capacity
                                event.maxSpecialPupils
                    in
                    ( { model | connection = Success <| FormPage <| EditEventPage campaign event.id, eventForm = eventForm }, Cmd.none )

                SwitchToDeleteEvent campaign event ->
                    ( { model | connection = Success <| FormPage <| DeleteEventPage campaign event }, Cmd.none )

                SwitchToNewPupil campaign ->
                    ( { model | connection = Success <| FormPage <| NewPupilPage campaign }, Cmd.none )

                SwitchToEditPupil campaign pupil ->
                    let
                        pupilForm : PupilForm.Model
                        pupilForm =
                            PupilForm.Model
                                pupil.name
                                pupil.class
                                pupil.isSpecial
                    in
                    ( { model | connection = Success <| FormPage <| EditPupilPage campaign pupil.id, pupilForm = pupilForm }, Cmd.none )

                SwitchToDeletePupil campaign pupil ->
                    ( { model | connection = Success <| FormPage <| DeletePupilPage campaign pupil }, Cmd.none )

                SwitchToCampaign campaign ->
                    ( { model | connection = Success <| CampaignPage campaign }, Cmd.none )

                SwitchToPupil pupil ->
                    ( { model | connection = Success <| PupilPage pupil }, Cmd.none )

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

        DayFormMsg campaign innerMsg ->
            let
                ( updatedModel, effect ) =
                    DayForm.update campaign innerMsg model.dayForm
            in
            case effect of
                DayForm.None ->
                    ( { model | dayForm = updatedModel }, Cmd.none )

                DayForm.Loading innerCmd ->
                    ( { model | connection = Loading }, innerCmd |> Cmd.map (DayFormMsg campaign) )

                DayForm.Done updatedCamp ->
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
                        , dayForm = DayForm.init
                      }
                    , Cmd.none
                    )

                DayForm.Error err ->
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

        PupilFormMsg campaign innerMsg ->
            let
                ( updatedModel, effect ) =
                    PupilForm.update campaign innerMsg model.pupilForm
            in
            case effect of
                PupilForm.None ->
                    ( { model | pupilForm = updatedModel }, Cmd.none )

                PupilForm.Loading innerCmd ->
                    ( { model | connection = Loading }, innerCmd |> Cmd.map (PupilFormMsg campaign) )

                PupilForm.Done updatedCamp ->
                    let
                        newCampaignList : List Campaign
                        newCampaignList =
                            -- TODO: use recursion here and reuse fn from above
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
                        , pupilForm = PupilForm.init
                      }
                    , Cmd.none
                    )

                PupilForm.Error err ->
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

                            FormPage fp ->
                                case fp of
                                    NewDayPage c ->
                                        campaignView c ++ [ DayForm.view DayForm.New model.dayForm |> Html.map (DayFormMsg c) ]

                                    EditDayPage c dayId ->
                                        campaignView c ++ [ DayForm.view (DayForm.Edit dayId) model.dayForm |> Html.map (DayFormMsg c) ]

                                    DeleteDayPage c day ->
                                        campaignView c ++ [ DayForm.view (DayForm.Delete day) model.dayForm |> Html.map (DayFormMsg c) ]

                                    NewEventPage c ->
                                        campaignView c ++ [ EventForm.view EventForm.New model.eventForm |> Html.map (EventFormMsg c) ]

                                    EditEventPage c eventId ->
                                        campaignView c ++ [ EventForm.view (EventForm.Edit eventId) model.eventForm |> Html.map (EventFormMsg c) ]

                                    DeleteEventPage c event ->
                                        campaignView c ++ [ EventForm.view (EventForm.Delete event) model.eventForm |> Html.map (EventFormMsg c) ]

                                    NewPupilPage c ->
                                        campaignView c ++ [ PupilForm.view PupilForm.New model.pupilForm |> Html.map (PupilFormMsg c) ]

                                    EditPupilPage c pupilId ->
                                        campaignView c ++ [ PupilForm.view (PupilForm.Edit pupilId) model.pupilForm |> Html.map (PupilFormMsg c) ]

                                    DeletePupilPage c pupil ->
                                        campaignView c ++ [ PupilForm.view (PupilForm.Delete pupil) model.pupilForm |> Html.map (PupilFormMsg c) ]

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
campaignView campaign =
    [ h1 [ classes "title is-3" ] [ text campaign.title ]
    , div [ class "block" ]
        ((campaign.days |> List.map (dayView campaign))
            ++ [ button [ classes "button is-primary", onClick <| SwitchPage <| SwitchToNewDay campaign ] [ text "Neuer Tag" ] ]
        )
    , div [ class "block" ]
        (h2 [ classes "title is-5" ] [ text "Alle Angebote" ]
            :: (campaign.events |> List.map (eventView campaign))
            ++ [ button [ classes "button is-primary", onClick <| SwitchPage <| SwitchToNewEvent campaign ] [ text "Neues Angebot" ] ]
        )
    , div [ class "block" ]
        [ h2 [ classes "title is-5" ] [ text "Alle Schüler/innen" ]
        , campaign.pupils |> pupilUl campaign
        , button [ classes "button is-primary", onClick <| SwitchPage <| SwitchToNewPupil campaign ] [ text "Neue Schüler/innen" ]
        ]
    ]


dayView : Campaign -> Day -> Html Msg
dayView campaign day =
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
        [ div [ classes "field is-grouped is-grouped-multiline" ]
            [ div [ class "control" ]
                (h2 [ classes "title is-5" ] [ text day.title ] :: events ++ unassignedPupils)
            , a [ title "Bearbeiten", onClick <| SwitchPage <| SwitchToEditDay campaign day ]
                [ span [ class "icon" ]
                    [ Html.node "ion-icon" [ name "create-outline" ] []
                    ]
                ]
            , a [ title "Löschen", onClick <| SwitchPage <| SwitchToDeleteDay campaign day ]
                [ span [ class "icon" ]
                    [ Html.node "ion-icon" [ name "trash-outline" ] []
                    ]
                ]
            ]
        ]


eventView : Campaign -> Event -> Html Msg
eventView campaign event =
    div [ class "block" ]
        [ div [ classes "field is-grouped is-grouped-multiline" ]
            [ div [ class "control" ]
                [ h3 [ classes "subtitle is-5" ] [ text event.title ]
                ]
            , div [ class "control" ]
                [ div [ classes "tags has-addons" ]
                    [ span [ class "tag" ] [ text "max." ]
                    , span [ classes "tag is-primary" ] [ text <| String.fromInt event.capacity ]
                    ]
                ]
            , div [ class "control" ]
                [ div [ classes "tags has-addons" ]
                    [ span [ class "tag" ] [ text "bes." ]
                    , span [ classes "tag is-primary" ] [ text <| String.fromInt event.maxSpecialPupils ]
                    ]
                ]
            , a [ title "Bearbeiten", onClick <| SwitchPage <| SwitchToEditEvent campaign event ]
                [ span [ class "icon" ]
                    [ Html.node "ion-icon" [ name "create-outline" ] []
                    ]
                ]
            , a [ title "Löschen", onClick <| SwitchPage <| SwitchToDeleteEvent campaign event ]
                [ span [ class "icon" ]
                    [ Html.node "ion-icon" [ name "trash-outline" ] []
                    ]
                ]
            ]
        ]


pupilUl : Campaign -> List Pupil -> Html Msg
pupilUl campaign pupList =
    div [ class "block" ]
        [ ul []
            (pupList
                |> List.map
                    (\pup ->
                        li []
                            [ a [ onClick <| SwitchPage <| SwitchToPupil pup ] [ text <| pupilToStr pup ]
                            , a [ title "Bearbeiten", onClick <| SwitchPage <| SwitchToEditPupil campaign pup ]
                                [ span [ class "icon" ]
                                    [ Html.node "ion-icon" [ name "create-outline" ] []
                                    ]
                                ]
                            , a [ title "Löschen", onClick <| SwitchPage <| SwitchToDeletePupil campaign pup ]
                                [ span [ class "icon" ]
                                    [ Html.node "ion-icon" [ name "trash-outline" ] []
                                    ]
                                ]
                            ]
                    )
            )
        ]


pupilView : Pupil -> List (Html Msg)
pupilView pup =
    [ h1 [ classes "title is-3" ] [ text <| pupilToStr pup ]
    , p [] [ text "Lorem ipsum ..." ]
    ]
