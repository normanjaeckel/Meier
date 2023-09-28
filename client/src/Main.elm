module Main exposing (main)

import Api.Object exposing (Pupil(..))
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
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { connection = Loading
      , campaigns = []
      }
    , Api.Query.campaignList Data.campaingSelectionSet
        |> Graphql.Http.queryRequest Shared.queryUrl
        |> Graphql.Http.send GotCampaignList
    )


getObjFromCampaign : CampaignId -> a -> (Campaign -> List { b | id : a }) -> List Campaign -> Maybe { b | id : a }
getObjFromCampaign campaignId objId getter campaigns =
    campaigns
        |> List.filter (\c -> c.id == campaignId)
        |> List.head
        |> Maybe.andThen (\c -> getter c |> List.filter (\e -> e.id == objId) |> List.head)


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
    = CampaignFormPage CampaignForm.Model
    | DayFormPage DayForm.Model
    | EventFormPage EventForm.Model
    | PupilFormPage PupilForm.Model



-- UPDATE


type Msg
    = GotCampaignList (Result (Graphql.Http.Error (List Campaign)) (List Campaign))
    | SwitchPage SwitchTo
    | FormMsg FormMsg


type FormMsg
    = CampaignFormMsg CampaignForm.Msg
    | DayFormMsg DayForm.Msg
    | EventFormMsg EventForm.Msg
    | PupilFormMsg PupilForm.Msg


type SwitchTo
    = SwitchToOverview
    | SwitchToCampaign CampaignId
    | SwitchToCampaignFormPage CampaignForm.Action
    | SwitchToDayFormPage CampaignId DayForm.Action
    | SwitchToEventFormPage CampaignId EventForm.Action
    | SwitchToPupilFormPage CampaignId PupilForm.Action
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

                SwitchToCampaignFormPage action ->
                    let
                        formModel : CampaignForm.Model
                        formModel =
                            let
                                emptyForm : CampaignForm.Model
                                emptyForm =
                                    CampaignForm.init action
                            in
                            case action of
                                CampaignForm.New ->
                                    emptyForm

                                CampaignForm.Edit objId ->
                                    case model.campaigns |> List.filter (\c -> c.id == objId) |> List.head of
                                        Just obj ->
                                            { emptyForm | title = obj.title }

                                        Nothing ->
                                            emptyForm

                                CampaignForm.Delete objId ->
                                    case model.campaigns |> List.filter (\c -> c.id == objId) |> List.head of
                                        Just obj ->
                                            { emptyForm | title = obj.title }

                                        Nothing ->
                                            emptyForm
                    in
                    ( { model | connection = Success <| FormPage <| CampaignFormPage formModel }, Cmd.none )

                SwitchToDayFormPage campaignId action ->
                    let
                        formModel : DayForm.Model
                        formModel =
                            let
                                emptyForm : DayForm.Model
                                emptyForm =
                                    DayForm.init campaignId action
                            in
                            case action of
                                DayForm.New ->
                                    emptyForm

                                DayForm.Edit objId ->
                                    case model.campaigns |> getObjFromCampaign campaignId objId .events of
                                        Just obj ->
                                            { emptyForm | title = obj.title }

                                        Nothing ->
                                            emptyForm

                                DayForm.Delete objId ->
                                    case model.campaigns |> getObjFromCampaign campaignId objId .events of
                                        Just obj ->
                                            { emptyForm | title = obj.title }

                                        Nothing ->
                                            emptyForm
                    in
                    ( { model | connection = Success <| FormPage <| DayFormPage formModel }, Cmd.none )

                SwitchToEventFormPage campaignId action ->
                    let
                        formModel : EventForm.Model
                        formModel =
                            let
                                emptyForm : EventForm.Model
                                emptyForm =
                                    EventForm.init campaignId action
                            in
                            case action of
                                EventForm.New ->
                                    emptyForm

                                EventForm.Edit objId ->
                                    case model.campaigns |> getObjFromCampaign campaignId objId .events of
                                        Just obj ->
                                            { emptyForm | title = obj.title, capacity = obj.capacity, maxSpecialPupils = obj.maxSpecialPupils }

                                        Nothing ->
                                            emptyForm

                                EventForm.Delete objId ->
                                    case model.campaigns |> getObjFromCampaign campaignId objId .events of
                                        Just obj ->
                                            { emptyForm | title = obj.title }

                                        Nothing ->
                                            emptyForm
                    in
                    ( { model | connection = Success <| FormPage <| EventFormPage formModel }, Cmd.none )

                SwitchToPupilFormPage campaignId action ->
                    let
                        formModel : PupilForm.Model
                        formModel =
                            let
                                emptyForm : PupilForm.Model
                                emptyForm =
                                    PupilForm.init campaignId action
                            in
                            case action of
                                PupilForm.New ->
                                    emptyForm

                                PupilForm.Edit objId ->
                                    case model.campaigns |> getObjFromCampaign campaignId objId .pupils of
                                        Just obj ->
                                            { emptyForm | name = obj.name, class = obj.class, isSpecial = obj.isSpecial }

                                        Nothing ->
                                            emptyForm

                                PupilForm.Delete objId ->
                                    case model.campaigns |> getObjFromCampaign campaignId objId .pupils of
                                        Just obj ->
                                            { emptyForm | name = obj.name }

                                        Nothing ->
                                            emptyForm
                    in
                    ( { model | connection = Success <| FormPage <| PupilFormPage formModel }, Cmd.none )

                SwitchToCampaign campaignId ->
                    ( { model | connection = Success <| CampaignPage campaignId }, Cmd.none )

                SwitchToPupil pupil ->
                    ( { model | connection = Success <| PupilPage pupil }, Cmd.none )

        FormMsg formMsg ->
            case model.connection of
                Success page ->
                    case page of
                        FormPage fp ->
                            updateForm model formMsg fp |> Tuple.mapSecond (Cmd.map FormMsg)

                        _ ->
                            ( model, Cmd.none )

                _ ->
                    ( model, Cmd.none )


updateForm : Model -> FormMsg -> FormPage -> ( Model, Cmd FormMsg )
updateForm model msg formPage =
    case formPage of
        CampaignFormPage formModel ->
            case msg of
                CampaignFormMsg innerMsg ->
                    updateCampaignForm model innerMsg formModel |> Tuple.mapSecond (Cmd.map CampaignFormMsg)

                _ ->
                    ( model, Cmd.none )

        DayFormPage formModel ->
            case msg of
                DayFormMsg innerMsg ->
                    updateDayForm model innerMsg formModel |> Tuple.mapSecond (Cmd.map DayFormMsg)

                _ ->
                    ( model, Cmd.none )

        EventFormPage formModel ->
            case msg of
                EventFormMsg innerMsg ->
                    updateEventForm model innerMsg formModel |> Tuple.mapSecond (Cmd.map EventFormMsg)

                _ ->
                    ( model, Cmd.none )

        PupilFormPage formModel ->
            case msg of
                PupilFormMsg innerMsg ->
                    updatePupilForm model innerMsg formModel |> Tuple.mapSecond (Cmd.map PupilFormMsg)

                _ ->
                    ( model, Cmd.none )


updateCampaignForm : Model -> CampaignForm.Msg -> CampaignForm.Model -> ( Model, Cmd CampaignForm.Msg )
updateCampaignForm model msg formModel =
    let
        ( updatedFormModel, effect ) =
            CampaignForm.update msg formModel
    in
    case effect of
        CampaignForm.None ->
            ( { model | connection = Success <| FormPage <| CampaignFormPage updatedFormModel }, Cmd.none )

        CampaignForm.Loading innerCmd ->
            ( { model | connection = Loading }, innerCmd )

        CampaignForm.ClosedWithoutChange ->
            ( { model | connection = Success <| Overview }, Cmd.none )

        CampaignForm.Done returnValue ->
            case returnValue of
                CampaignForm.NewOrUpdated obj ->
                    ( { model
                        | connection = Success <| Overview
                        , campaigns = model.campaigns |> insertOrUpdateInList obj
                      }
                    , Cmd.none
                    )

                CampaignForm.Deleted objId ->
                    ( { model
                        | connection = Success <| Overview
                        , campaigns = model.campaigns |> deleteFromList objId
                      }
                    , Cmd.none
                    )

        CampaignForm.Error err ->
            ( { model | connection = Failure err }, Cmd.none )


updateDayForm : Model -> DayForm.Msg -> DayForm.Model -> ( Model, Cmd DayForm.Msg )
updateDayForm model msg formModel =
    let
        ( updatedFormModel, effect ) =
            DayForm.update msg formModel
    in
    case effect of
        DayForm.None ->
            ( { model | connection = Success <| FormPage <| DayFormPage updatedFormModel }, Cmd.none )

        DayForm.Loading innerCmd ->
            ( { model | connection = Loading }, innerCmd )

        DayForm.ClosedWithoutChange ->
            ( { model | connection = Success <| CampaignPage updatedFormModel.campaignId }, Cmd.none )

        DayForm.Done returnValue ->
            case returnValue of
                DayForm.NewOrUpdated obj ->
                    let
                        newOrEditObj : Campaign -> Campaign
                        newOrEditObj campaign =
                            { campaign | days = campaign.days |> insertOrUpdateInList obj }
                    in
                    ( { model
                        | connection = Success <| CampaignPage updatedFormModel.campaignId
                        , campaigns = model.campaigns |> findCampaigns newOrEditObj updatedFormModel.campaignId
                      }
                    , Cmd.none
                    )

                DayForm.Deleted objId ->
                    let
                        deleteObj : Campaign -> Campaign
                        deleteObj campaign =
                            { campaign | days = campaign.days |> deleteFromList objId }
                    in
                    ( { model
                        | connection = Success <| CampaignPage updatedFormModel.campaignId
                        , campaigns = model.campaigns |> findCampaigns deleteObj updatedFormModel.campaignId
                      }
                    , Cmd.none
                    )

        DayForm.Error err ->
            ( { model | connection = Failure err }, Cmd.none )


updateEventForm : Model -> EventForm.Msg -> EventForm.Model -> ( Model, Cmd EventForm.Msg )
updateEventForm model msg formModel =
    let
        ( updatedFormModel, effect ) =
            EventForm.update msg formModel
    in
    case effect of
        EventForm.None ->
            ( { model | connection = Success <| FormPage <| EventFormPage updatedFormModel }, Cmd.none )

        EventForm.Loading innerCmd ->
            ( { model | connection = Loading }, innerCmd )

        EventForm.ClosedWithoutChange ->
            ( { model | connection = Success <| CampaignPage updatedFormModel.campaignId }, Cmd.none )

        EventForm.Done returnValue ->
            case returnValue of
                EventForm.NewOrUpdated obj ->
                    let
                        newOrEditObj : Campaign -> Campaign
                        newOrEditObj campaign =
                            { campaign | events = campaign.events |> insertOrUpdateInList obj }
                    in
                    ( { model
                        | connection = Success <| CampaignPage updatedFormModel.campaignId
                        , campaigns = model.campaigns |> findCampaigns newOrEditObj updatedFormModel.campaignId
                      }
                    , Cmd.none
                    )

                EventForm.Deleted objId ->
                    let
                        deleteObj : Campaign -> Campaign
                        deleteObj campaign =
                            { campaign | events = campaign.events |> deleteFromList objId }
                    in
                    ( { model
                        | connection = Success <| CampaignPage updatedFormModel.campaignId
                        , campaigns = model.campaigns |> findCampaigns deleteObj updatedFormModel.campaignId
                      }
                    , Cmd.none
                    )

        EventForm.Error err ->
            ( { model | connection = Failure err }, Cmd.none )


updatePupilForm : Model -> PupilForm.Msg -> PupilForm.Model -> ( Model, Cmd PupilForm.Msg )
updatePupilForm model msg formModel =
    let
        ( updatedFormModel, effect ) =
            PupilForm.update msg formModel
    in
    case effect of
        PupilForm.None ->
            ( { model | connection = Success <| FormPage <| PupilFormPage updatedFormModel }, Cmd.none )

        PupilForm.Loading innerCmd ->
            ( { model | connection = Loading }, innerCmd )

        PupilForm.ClosedWithoutChange ->
            ( { model | connection = Success <| CampaignPage updatedFormModel.campaignId }, Cmd.none )

        PupilForm.Done returnValue ->
            case returnValue of
                PupilForm.NewOrUpdated obj ->
                    let
                        newOrEditObj : Campaign -> Campaign
                        newOrEditObj campaign =
                            { campaign | pupils = campaign.pupils |> insertOrUpdateInList obj }
                    in
                    ( { model
                        | connection = Success <| CampaignPage updatedFormModel.campaignId
                        , campaigns = model.campaigns |> findCampaigns newOrEditObj updatedFormModel.campaignId
                      }
                    , Cmd.none
                    )

                PupilForm.Deleted objId ->
                    let
                        deleteObj : Campaign -> Campaign
                        deleteObj campaign =
                            { campaign | pupils = campaign.pupils |> deleteFromList objId }
                    in
                    ( { model
                        | connection = Success <| CampaignPage updatedFormModel.campaignId
                        , campaigns = model.campaigns |> findCampaigns deleteObj updatedFormModel.campaignId
                      }
                    , Cmd.none
                    )

        PupilForm.Error err ->
            ( { model | connection = Failure err }, Cmd.none )


findCampaigns : (Campaign -> Campaign) -> CampaignId -> List Campaign -> List Campaign
findCampaigns innerChangeFn campaignId campaigns =
    case campaigns of
        one :: rest ->
            if one.id == campaignId then
                innerChangeFn one :: rest

            else
                one :: rest |> findCampaigns innerChangeFn campaignId

        [] ->
            []


insertOrUpdateInList : { a | id : b } -> List { a | id : b } -> List { a | id : b }
insertOrUpdateInList obj objects =
    case objects of
        one :: rest ->
            if one.id == obj.id then
                obj :: rest

            else
                one :: rest |> insertOrUpdateInList obj

        [] ->
            [ obj ]


deleteFromList : b -> List { a | id : b } -> List { a | id : b }
deleteFromList objId objects =
    case objects of
        one :: rest ->
            if one.id == objId then
                rest

            else
                one :: rest |> deleteFromList objId

        [] ->
            []


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
                                , button [ classes "button is-primary", onClick <| SwitchPage <| SwitchToCampaignFormPage CampaignForm.New ] [ text "Neue Kampagne" ]
                                ]
                        in
                        case p of
                            Overview ->
                                overview

                            CampaignPage campaignId ->
                                model.campaigns |> getCampaign campaignId |> campaignView

                            FormPage fp ->
                                case fp of
                                    CampaignFormPage formModel ->
                                        overview ++ [ CampaignForm.view formModel |> Html.map (CampaignFormMsg >> FormMsg) ]

                                    DayFormPage formModel ->
                                        (model.campaigns |> getCampaign formModel.campaignId |> campaignView)
                                            ++ [ DayForm.view formModel |> Html.map (DayFormMsg >> FormMsg) ]

                                    EventFormPage formModel ->
                                        (model.campaigns |> getCampaign formModel.campaignId |> campaignView)
                                            ++ [ EventForm.view formModel |> Html.map (EventFormMsg >> FormMsg) ]

                                    PupilFormPage formModel ->
                                        (model.campaigns |> getCampaign formModel.campaignId |> campaignView)
                                            ++ [ PupilForm.view formModel |> Html.map (PupilFormMsg >> FormMsg) ]

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
                    ++ [ button [ classes "button is-primary", onClick <| SwitchPage <| SwitchToDayFormPage campaign.id DayForm.New ] [ text "Neuer Tag" ] ]
                )
            , div [ class "block" ]
                (h2 [ classes "title is-5" ] [ text "Alle Angebote" ]
                    :: (campaign.events |> List.map (eventView campaign))
                    ++ [ button [ classes "button is-primary", onClick <| SwitchPage <| SwitchToEventFormPage campaign.id EventForm.New ] [ text "Neues Angebot" ] ]
                )
            , div [ class "block" ]
                [ h2 [ classes "title is-5" ] [ text "Alle Schüler/innen" ]
                , campaign.pupils |> pupilUl campaign
                , button [ classes "button is-primary", onClick <| SwitchPage <| SwitchToPupilFormPage campaign.id PupilForm.New ] [ text "Neue Schüler/innen" ]
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
            , a [ title "Bearbeiten", onClick <| SwitchPage <| SwitchToDayFormPage campaign.id (DayForm.Edit day.id) ]
                [ span [ class "icon" ]
                    [ Html.node "ion-icon" [ name "create-outline" ] []
                    ]
                ]
            , a [ title "Löschen", onClick <| SwitchPage <| SwitchToDayFormPage campaign.id (DayForm.Delete day.id) ]
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
            , a [ title "Bearbeiten", onClick <| SwitchPage <| SwitchToEventFormPage campaign.id (EventForm.Edit event.id) ]
                [ span [ class "icon" ]
                    [ Html.node "ion-icon" [ name "create-outline" ] []
                    ]
                ]
            , a [ title "Löschen", onClick <| SwitchPage <| SwitchToEventFormPage campaign.id (EventForm.Delete event.id) ]
                [ span [ class "icon" ]
                    [ Html.node "ion-icon" [ name "trash-outline" ] []
                    ]
                ]
            ]
        ]


pupilUl : Campaign -> List Pupil -> Html Msg
pupilUl campaign pupils =
    div [ class "block" ]
        [ ul []
            (pupils
                |> List.map
                    (\pupil ->
                        li []
                            [ a [ onClick <| SwitchPage <| SwitchToPupil pupil ] [ text <| pupilToStr pupil ]
                            , a [ title "Bearbeiten", onClick <| SwitchPage <| SwitchToPupilFormPage campaign.id (PupilForm.Edit pupil.id) ]
                                [ span [ class "icon" ]
                                    [ Html.node "ion-icon" [ name "create-outline" ] []
                                    ]
                                ]
                            , a [ title "Löschen", onClick <| SwitchPage <| SwitchToPupilFormPage campaign.id (PupilForm.Delete pupil.id) ]
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
