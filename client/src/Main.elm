module Main exposing (main)

import Browser
import Data exposing (Campaign, Day, Event, Pupil)
import Html exposing (Html, a, button, div, form, h1, h2, h3, li, main_, nav, p, section, span, text, ul)
import Html.Attributes exposing (class, type_)
import Html.Events exposing (onClick)
import Http
import Json.Decode as D
import Json.Encode as E
import NewCampaign
import NewEvent
import Shared exposing (classes, parseError)


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
    , newEvent : NewEvent.Model
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { connection = Loading
      , campaigns = []
      , newCampaign = NewCampaign.init
      , newEvent = NewEvent.init
      }
    , Http.post
        { url = Shared.queryUrl
        , body = Http.jsonBody <| E.object [ ( "query", E.string queryCampaignList ) ]
        , expect = Http.expectJson GotData dataDecoder
        }
    )


queryCampaignList : String
queryCampaignList =
    String.join " " [ "{", "campaignList", Data.queryCampaign, "}" ]


dataDecoder : D.Decoder (List Campaign)
dataDecoder =
    D.field
        "data"
        (D.field "campaignList" <| D.list Data.campaignDecoder)


type Connection
    = Loading
    | Failure String
    | Success Page


type Page
    = Overview
    | CampaignPage Campaign
    | NewCampaignPage
    | NewEventPage Campaign
    | PupilPage Pupil
    | NewPupils



-- UPDATE


type Msg
    = GotData (Result Http.Error (List Campaign))
    | SwitchPage SwitchTo
    | NewCampaignMsg NewCampaign.Msg
    | NewEventMsg NewEvent.Msg


type SwitchTo
    = SwitchToOverview
    | SwitchToNewCampaign
    | SwitchToNewEvent Campaign
    | SwitchToPage Campaign
    | SwitchToPupil Pupil
    | SwitchToNewPupils


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GotData res ->
            case res of
                Ok campaigns ->
                    ( { model | connection = Success Overview, campaigns = campaigns }, Cmd.none )

                Err err ->
                    ( { model | connection = Failure (parseError err) }, Cmd.none )

        SwitchPage s ->
            case s of
                SwitchToOverview ->
                    ( { model | connection = Success <| Overview }, Cmd.none )

                SwitchToNewCampaign ->
                    ( { model | connection = Success NewCampaignPage }, Cmd.none )

                SwitchToNewEvent c ->
                    ( { model | connection = Success <| NewEventPage c }, Cmd.none )

                SwitchToPage c ->
                    ( { model | connection = Success <| CampaignPage c }, Cmd.none )

                SwitchToPupil pup ->
                    ( { model | connection = Success <| PupilPage pup }, Cmd.none )

                SwitchToNewPupils ->
                    ( { model | connection = Success NewPupils }, Cmd.none )

        NewCampaignMsg innerMsg ->
            let
                ( innerModel, effect ) =
                    NewCampaign.update innerMsg model.newCampaign
            in
            case effect of
                NewCampaign.None ->
                    ( { model | newCampaign = innerModel }, Cmd.none )

                NewCampaign.Loading innerCmd ->
                    ( { model | connection = Loading }, innerCmd |> Cmd.map NewCampaignMsg )

                NewCampaign.Done c ->
                    ( { model | connection = Success <| CampaignPage c, campaigns = model.campaigns ++ [ c ] }, Cmd.none )

                NewCampaign.Error err ->
                    ( { model | connection = Failure err }, Cmd.none )

        NewEventMsg innerMsg ->
            let
                ( innerModel, effect ) =
                    NewEvent.update innerMsg model.newEvent
            in
            case effect of
                NewEvent.None ->
                    ( { model | newEvent = innerModel }, Cmd.none )

                NewEvent.Loading innerCmd ->
                    ( { model | connection = Loading }, innerCmd |> Cmd.map NewEventMsg )

                NewEvent.Done camp event ->
                    -- e verwenden und zum Model hinzufügen
                    let
                        newCampaignList : List Campaign
                        newCampaignList =
                            model.campaigns
                                |> List.foldr
                                    (\a b ->
                                        if a.id == camp.id then
                                            { a | events = a.events ++ [ event ] } :: b

                                        else
                                            a :: b
                                    )
                                    []
                    in
                    ( { model | connection = Success Overview, campaigns = newCampaignList }, Cmd.none )

                NewEvent.Error err ->
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
                                                    , onClick <| SwitchPage <| SwitchToPage c
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

                            NewEventPage c ->
                                NewEvent.view c model.newEvent |> List.map (Html.map NewEventMsg)

                            PupilPage pup ->
                                pupilView pup

                            NewPupils ->
                                newPupilsView
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
    , div [ class "block" ] (c.days |> List.map dayView)
    , div [ class "block" ]
        (h2 [ classes "title is-5" ] [ text "Alle Angebote" ]
            :: (c.events |> List.map eventView)
            ++ [ button [ classes "button is-primary", onClick <| SwitchPage <| SwitchToNewEvent c ] [ text "Neues Angebot" ] ]
        )
    , div [ class "block" ]
        [ h2 [ classes "title is-5" ] [ text "Alle Schüler/innen" ]
        , c.pupils |> pupilUl
        , button [ classes "button is-primary", onClick <| SwitchPage <| SwitchToNewPupils ] [ text "Neue Schüler/innen" ]
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


eventView : Event -> Html Msg
eventView e =
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


newPupilsView : List (Html Msg)
newPupilsView =
    [ h1 [ classes "title is-3" ] [ text "Neue Schüler/innen hinzufügen" ]
    , p [] [ text "Lorem ipsum" ]
    , form []
        [ div [ class "field" ] []
        , div [ class "field" ]
            [ button [ classes "button is-primary", type_ "submit" ] [ text "Hinzufügen" ]
            ]
        ]
    ]
