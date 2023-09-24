module Main exposing (main)

import Api.Query
import Browser
import CampaignForm
import Data exposing (Campaign, CampaignId, Day, Event, Pupil)
import DayForm
import EventForm
import Graphql.Http
import Html exposing (Html, a, button, div, h1, h2, h3, li, main_, nav, p, section, span, text, ul)
import Html.Attributes exposing (class, name, title)
import Html.Events exposing (onClick)
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
    , campaignForm : CampaignForm.Model
    , dayForm : DayForm.Model
    , eventForm : EventForm.Model
    , pupilForm : PupilForm.Model
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { connection = Loading
      , campaigns = []
      , campaignForm = CampaignForm.init
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
    | CampaignPage CampaignId
    | FormPage FormPage
    | PupilPage Pupil


type FormPage
    = NewCampaignPage
    | NewDayPage CampaignId
    | EditDayPage CampaignId Data.Day
    | DeleteDayPage CampaignId Data.Day
    | NewEventPage CampaignId
    | EditEventPage CampaignId Data.EventId
    | DeleteEventPage CampaignId Data.Event
    | NewPupilPage Campaign
    | EditPupilPage Campaign Data.PupilId
    | DeletePupilPage Campaign Data.Pupil



-- UPDATE


type Msg
    = GotCampaignList (Result (Graphql.Http.Error (List Campaign)) (List Campaign))
    | SwitchPage SwitchTo
    | CampaignFormMsg CampaignForm.Msg
    | DayFormMsg CampaignId DayForm.Msg
    | EventFormMsg CampaignId EventForm.Msg
    | PupilFormMsg Campaign PupilForm.Msg


type SwitchTo
    = SwitchToOverview
    | SwitchToCampaign CampaignId
    | SwitchToNewCampaign
    | SwitchToNewDay CampaignId
    | SwitchToEditDay CampaignId Day
    | SwitchToDeleteDay CampaignId Day
    | SwitchToNewEvent CampaignId
    | SwitchToEditEvent CampaignId Event
    | SwitchToDeleteEvent CampaignId Event
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
                    ( { model | connection = Success <| FormPage <| NewCampaignPage }, Cmd.none )

                SwitchToNewDay campaignId ->
                    ( { model | connection = Success <| FormPage <| NewDayPage campaignId }, Cmd.none )

                SwitchToEditDay campaignId day ->
                    let
                        dayForm : DayForm.Model
                        dayForm =
                            DayForm.Model
                                day.title
                    in
                    ( { model | connection = Success <| FormPage <| EditDayPage campaignId day, dayForm = dayForm }, Cmd.none )

                SwitchToDeleteDay campaignId day ->
                    ( { model | connection = Success <| FormPage <| DeleteDayPage campaignId day }, Cmd.none )

                SwitchToNewEvent campaignId ->
                    ( { model | connection = Success <| FormPage <| NewEventPage campaignId }, Cmd.none )

                SwitchToEditEvent campaignId event ->
                    let
                        eventForm : EventForm.Model
                        eventForm =
                            EventForm.Model
                                event.title
                                event.capacity
                                event.maxSpecialPupils
                    in
                    ( { model | connection = Success <| FormPage <| EditEventPage campaignId event.id, eventForm = eventForm }, Cmd.none )

                SwitchToDeleteEvent campaignId event ->
                    ( { model | connection = Success <| FormPage <| DeleteEventPage campaignId event }, Cmd.none )

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

                SwitchToCampaign campaignId ->
                    ( { model | connection = Success <| CampaignPage campaignId }, Cmd.none )

                SwitchToPupil pupil ->
                    ( { model | connection = Success <| PupilPage pupil }, Cmd.none )

        CampaignFormMsg innerMsg ->
            let
                ( updatedModel, effect ) =
                    CampaignForm.update innerMsg model.campaignForm
            in
            case effect of
                CampaignForm.None ->
                    ( { model | campaignForm = updatedModel }, Cmd.none )

                CampaignForm.Loading innerCmd ->
                    ( { model | connection = Loading }, innerCmd |> Cmd.map CampaignFormMsg )

                CampaignForm.ClosedWithoutChange ->
                    ( { model
                        | connection = Success <| Overview
                        , campaignForm = CampaignForm.init
                      }
                    , Cmd.none
                    )

                CampaignForm.Done returnValue ->
                    case returnValue of
                        CampaignForm.NewOrUpdated obj ->
                            let
                                walkObjectsNewAndEdit : List Campaign -> List Campaign
                                walkObjectsNewAndEdit objects =
                                    case objects of
                                        one :: rest ->
                                            if one.id == obj.id then
                                                obj :: rest

                                            else
                                                one :: walkObjectsNewAndEdit rest

                                        [] ->
                                            [ obj ]
                            in
                            ( { model
                                | connection = Success <| Overview
                                , campaigns = walkObjectsNewAndEdit model.campaigns
                                , campaignForm = CampaignForm.init
                              }
                            , Cmd.none
                            )

                        CampaignForm.Deleted objId ->
                            let
                                walkObjectsDelete : List Campaign -> List Campaign
                                walkObjectsDelete objects =
                                    case objects of
                                        one :: rest ->
                                            if objId == one.id then
                                                rest

                                            else
                                                one :: walkObjectsDelete rest

                                        [] ->
                                            []
                            in
                            ( { model
                                | connection = Success <| Overview
                                , campaigns = walkObjectsDelete model.campaigns
                                , campaignForm = CampaignForm.init
                              }
                            , Cmd.none
                            )

                CampaignForm.Error err ->
                    ( { model | connection = Failure err }, Cmd.none )

        DayFormMsg campaignId innerMsg ->
            let
                ( updatedModel, effect ) =
                    DayForm.update campaignId innerMsg model.dayForm
            in
            case effect of
                DayForm.None ->
                    ( { model | dayForm = updatedModel }, Cmd.none )

                DayForm.Loading innerCmd ->
                    ( { model | connection = Loading }, innerCmd |> Cmd.map (DayFormMsg campaignId) )

                DayForm.ClosedWithoutChange ->
                    ( { model
                        | connection = Success <| CampaignPage campaignId
                        , dayForm = DayForm.init
                      }
                    , Cmd.none
                    )

                DayForm.Done returnValue ->
                    let
                        walkCampaigns : (List Day -> List Day) -> List Campaign -> List Campaign
                        walkCampaigns innerWalk campaigns =
                            case campaigns of
                                one :: rest ->
                                    if one.id == campaignId then
                                        { one | days = innerWalk one.days } :: rest

                                    else
                                        one :: walkCampaigns innerWalk rest

                                [] ->
                                    []
                    in
                    case returnValue of
                        DayForm.NewOrUpdated obj ->
                            let
                                walkObjectsNewAndEdit : List Day -> List Day
                                walkObjectsNewAndEdit objects =
                                    case objects of
                                        one :: rest ->
                                            if one.id == obj.id then
                                                obj :: rest

                                            else
                                                one :: walkObjectsNewAndEdit rest

                                        [] ->
                                            [ obj ]
                            in
                            ( { model
                                | connection = Success <| CampaignPage campaignId
                                , campaigns = walkCampaigns walkObjectsNewAndEdit model.campaigns
                                , dayForm = DayForm.init
                              }
                            , Cmd.none
                            )

                        DayForm.Deleted objId ->
                            let
                                walkObjectsDelete : List Day -> List Day
                                walkObjectsDelete objects =
                                    case objects of
                                        one :: rest ->
                                            if objId == one.id then
                                                rest

                                            else
                                                one :: walkObjectsDelete rest

                                        [] ->
                                            []
                            in
                            ( { model
                                | connection = Success <| CampaignPage campaignId
                                , campaigns = walkCampaigns walkObjectsDelete model.campaigns
                                , dayForm = DayForm.init
                              }
                            , Cmd.none
                            )

                DayForm.Error err ->
                    ( { model | connection = Failure err }, Cmd.none )

        EventFormMsg campaignId innerMsg ->
            let
                ( updatedModel, effect ) =
                    EventForm.update campaignId innerMsg model.eventForm
            in
            case effect of
                EventForm.None ->
                    ( { model | eventForm = updatedModel }, Cmd.none )

                EventForm.Loading innerCmd ->
                    ( { model | connection = Loading }, innerCmd |> Cmd.map (EventFormMsg campaignId) )

                EventForm.ClosedWithoutChange ->
                    ( { model
                        | connection = Success <| CampaignPage campaignId
                        , eventForm = EventForm.init
                      }
                    , Cmd.none
                    )

                EventForm.Done returnValue ->
                    let
                        walkCampaigns : (List Event -> List Event) -> List Campaign -> List Campaign
                        walkCampaigns innerWalk campaigns =
                            case campaigns of
                                one :: rest ->
                                    if one.id == campaignId then
                                        { one | events = innerWalk one.events } :: rest

                                    else
                                        one :: walkCampaigns innerWalk rest

                                [] ->
                                    []
                    in
                    case returnValue of
                        EventForm.NewOrUpdated obj ->
                            let
                                walkObjectsNewAndEdit : List Event -> List Event
                                walkObjectsNewAndEdit objects =
                                    case objects of
                                        one :: rest ->
                                            if one.id == obj.id then
                                                obj :: rest

                                            else
                                                one :: walkObjectsNewAndEdit rest

                                        [] ->
                                            [ obj ]
                            in
                            ( { model
                                | connection = Success <| CampaignPage campaignId
                                , campaigns = walkCampaigns walkObjectsNewAndEdit model.campaigns
                                , eventForm = EventForm.init
                              }
                            , Cmd.none
                            )

                        EventForm.Deleted objId ->
                            let
                                walkObjectsDelete : List Event -> List Event
                                walkObjectsDelete objects =
                                    case objects of
                                        one :: rest ->
                                            if objId == one.id then
                                                rest

                                            else
                                                one :: walkObjectsDelete rest

                                        [] ->
                                            []
                            in
                            ( { model
                                | connection = Success <| CampaignPage campaignId
                                , campaigns = walkCampaigns walkObjectsDelete model.campaigns
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
                        | connection = Success <| CampaignPage updatedCamp.id
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
                        let
                            overview =
                                [ h1 [ classes "title is-3" ] [ text "Überblick über alle Kampagnen" ]
                                , div [ class "buttons" ]
                                    (model.campaigns
                                        |> List.map
                                            (\c ->
                                                button
                                                    [ class "button"
                                                    , onClick <| SwitchPage <| SwitchToCampaign c.id
                                                    ]
                                                    [ text c.title ]
                                            )
                                    )
                                , button [ classes "button is-primary", onClick <| SwitchPage <| SwitchToNewCampaign ] [ text "Neue Kampagne" ]
                                ]
                        in
                        case p of
                            Overview ->
                                overview

                            CampaignPage campaignId ->
                                model.campaigns |> getCampaign campaignId |> campaignView

                            FormPage fp ->
                                case fp of
                                    NewCampaignPage ->
                                        overview ++ [ CampaignForm.view CampaignForm.New model.campaignForm |> Html.map CampaignFormMsg ]

                                    NewDayPage campaignId ->
                                        (model.campaigns |> getCampaign campaignId |> campaignView)
                                            ++ [ DayForm.view DayForm.New model.dayForm |> Html.map (DayFormMsg campaignId) ]

                                    EditDayPage campaignId day ->
                                        (model.campaigns |> getCampaign campaignId |> campaignView)
                                            ++ [ DayForm.view (DayForm.Edit day.id) model.dayForm |> Html.map (DayFormMsg campaignId) ]

                                    DeleteDayPage campaignId day ->
                                        (model.campaigns |> getCampaign campaignId |> campaignView)
                                            ++ [ DayForm.view (DayForm.Delete day) model.dayForm |> Html.map (DayFormMsg campaignId) ]

                                    NewEventPage campaignId ->
                                        (model.campaigns |> getCampaign campaignId |> campaignView)
                                            ++ [ EventForm.view EventForm.New model.eventForm |> Html.map (EventFormMsg campaignId) ]

                                    EditEventPage campaignId eventId ->
                                        (model.campaigns |> getCampaign campaignId |> campaignView)
                                            ++ [ EventForm.view (EventForm.Edit eventId) model.eventForm |> Html.map (EventFormMsg campaignId) ]

                                    DeleteEventPage campaignId event ->
                                        (model.campaigns |> getCampaign campaignId |> campaignView)
                                            ++ [ EventForm.view (EventForm.Delete event) model.eventForm |> Html.map (EventFormMsg campaignId) ]

                                    NewPupilPage c ->
                                        (model.campaigns |> getCampaign c.id |> campaignView)
                                            ++ [ PupilForm.view PupilForm.New model.pupilForm |> Html.map (PupilFormMsg c) ]

                                    EditPupilPage c pupilId ->
                                        (model.campaigns |> getCampaign c.id |> campaignView)
                                            ++ [ PupilForm.view (PupilForm.Edit pupilId) model.pupilForm |> Html.map (PupilFormMsg c) ]

                                    DeletePupilPage c pupil ->
                                        (model.campaigns |> getCampaign c.id |> campaignView)
                                            ++ [ PupilForm.view (PupilForm.Delete pupil) model.pupilForm |> Html.map (PupilFormMsg c) ]

                            PupilPage pup ->
                                pupilView pup
                )
            ]
        ]


getCampaign : CampaignId -> List Campaign -> Maybe Campaign
getCampaign campaignId campaigns =
    campaigns |> List.filter (\c -> c.id == campaignId) |> List.head


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


campaignView : Maybe Campaign -> List (Html Msg)
campaignView c =
    case c of
        Nothing ->
            []

        Just campaign ->
            [ h1 [ classes "title is-3" ] [ text campaign.title ]
            , div [ class "block" ]
                ((campaign.days |> List.map (dayView campaign))
                    ++ [ button [ classes "button is-primary", onClick <| SwitchPage <| SwitchToNewDay campaign.id ] [ text "Neuer Tag" ] ]
                )
            , div [ class "block" ]
                (h2 [ classes "title is-5" ] [ text "Alle Angebote" ]
                    :: (campaign.events |> List.map (eventView campaign))
                    ++ [ button [ classes "button is-primary", onClick <| SwitchPage <| SwitchToNewEvent campaign.id ] [ text "Neues Angebot" ] ]
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
            , a [ title "Bearbeiten", onClick <| SwitchPage <| SwitchToEditDay campaign.id day ]
                [ span [ class "icon" ]
                    [ Html.node "ion-icon" [ name "create-outline" ] []
                    ]
                ]
            , a [ title "Löschen", onClick <| SwitchPage <| SwitchToDeleteDay campaign.id day ]
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
            , a [ title "Bearbeiten", onClick <| SwitchPage <| SwitchToEditEvent campaign.id event ]
                [ span [ class "icon" ]
                    [ Html.node "ion-icon" [ name "create-outline" ] []
                    ]
                ]
            , a [ title "Löschen", onClick <| SwitchPage <| SwitchToDeleteEvent campaign.id event ]
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
