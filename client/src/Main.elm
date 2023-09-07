module Main exposing (main)

import Browser
import Html exposing (..)
import Html.Attributes exposing (attribute, class, placeholder, required, type_, value)
import Html.Events exposing (onClick, onInput, onSubmit)
import Http
import Json.Decode as D
import Json.Encode as E
import Platform.Cmd as Cmd


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , subscriptions = subscriptions
        , view = view
        }


queryUrl : String
queryUrl =
    "/query"



-- MODEL


type alias Model =
    { connection : Connection
    , campaigns : List Campaign
    , newCampaignFormData : NewCampaignFormData
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { connection = Loading
      , campaigns = []
      , newCampaignFormData = NewCampaignFormData "" 2
      }
    , Http.post
        { url = queryUrl
        , body = Http.jsonBody <| E.object [ ( "query", E.string queryCampaignList ) ]
        , expect = Http.expectJson GotData dataDecoder
        }
    )


queryCampaignList : String
queryCampaignList =
    String.join " " [ "{", "campaignList", queryCampaign, "}" ]


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


type Connection
    = Loading
    | Failure String
    | Success Page


type Page
    = Overview
    | CampaignPage Campaign
    | NewCampaign
    | PupilPage Pupil
    | NewPupils


dataDecoder : D.Decoder (List Campaign)
dataDecoder =
    D.field
        "data"
        (D.field "campaignList" <| D.list campaignDecoder)


type alias CampaignId =
    Int


type alias Campaign =
    { id : CampaignId
    , title : String
    , days : List Day
    , events : List Event
    , pupils : List Pupil
    }


campaignDecoder : D.Decoder Campaign
campaignDecoder =
    D.map5 Campaign
        (D.field "id" D.int)
        (D.field "title" D.string)
        (D.field "days" (D.list dayDecoder))
        (D.field "events" (D.list eventDecoder))
        (D.field "pupils" (D.list pupilDecoder))


type alias DayId =
    Int


type alias Day =
    { id : DayId
    , title : String
    , events : List ( EventId, List PupilId )
    }


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


type alias EventId =
    Int


type alias Event =
    { id : EventId
    , title : String
    , capacity : Int
    }


eventDecoder : D.Decoder Event
eventDecoder =
    D.map3 Event
        (D.field "id" D.int)
        (D.field "title" D.string)
        (D.field "capacity" D.int)


type alias PupilId =
    Int


type alias Pupil =
    { name : String
    , class : String
    , isSpecial : Bool
    }


pupilDecoder : D.Decoder Pupil
pupilDecoder =
    D.map3 Pupil
        (D.field "name" D.string)
        (D.field "class" D.string)
        (D.field "isSpecial" D.bool)


type alias NewCampaignFormData =
    { title : String
    , numOfDays : Int
    }


pupilToStr : Pupil -> String
pupilToStr p =
    p.name ++ " (Klasse " ++ p.class ++ ")"



-- UPDATE


type Msg
    = GotData (Result Http.Error (List Campaign))
    | SwitchPage SwitchTo
    | NewCampaignFormDataMsg NewCampaignFormDataInput
    | SendNewCampaignForm
    | GotNewCampaign (Result Http.Error Campaign)


type SwitchTo
    = SwitchToOverview
    | SwitchToNewCampaign
    | SwitchToPage Campaign
    | SwitchToPupil Pupil
    | SwitchToNewPupils


type NewCampaignFormDataInput
    = Title String
    | NumOfDays Int


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GotData res ->
            case res of
                Ok campaigns ->
                    ( { model | connection = Success Overview, campaigns = campaigns }, Cmd.none )

                Err err ->
                    ( model |> parseError err, Cmd.none )

        SwitchPage s ->
            case s of
                SwitchToOverview ->
                    ( { model | connection = Success <| Overview }, Cmd.none )

                SwitchToNewCampaign ->
                    ( { model | connection = Success NewCampaign }, Cmd.none )

                SwitchToPage c ->
                    ( { model | connection = Success <| CampaignPage <| c }, Cmd.none )

                SwitchToPupil pup ->
                    ( { model | connection = Success <| PupilPage pup }, Cmd.none )

                SwitchToNewPupils ->
                    ( { model | connection = Success NewPupils }, Cmd.none )

        NewCampaignFormDataMsg i ->
            let
                newData : NewCampaignFormData
                newData =
                    let
                        currentData =
                            model.newCampaignFormData
                    in
                    case i of
                        Title t ->
                            { currentData | title = t }

                        NumOfDays n ->
                            { currentData | numOfDays = n }
            in
            ( { model | newCampaignFormData = newData }, Cmd.none )

        SendNewCampaignForm ->
            let
                mutationQuery =
                    String.join " "
                        [ "mutation"
                        , "{"
                        , "addCampaign"
                        , "("
                        , "title:"
                        , E.encode 0 <| E.string model.newCampaignFormData.title
                        , ")"
                        , queryCampaign
                        , "}"
                        ]

                addCampaignDecoder : D.Decoder Campaign
                addCampaignDecoder =
                    D.field
                        "data"
                        (D.field "addCampaign" campaignDecoder)
            in
            ( { model | connection = Loading }
            , Http.post
                { url = queryUrl
                , body = Http.jsonBody <| E.object [ ( "query", E.string mutationQuery ) ]
                , expect = Http.expectJson GotNewCampaign addCampaignDecoder
                }
            )

        GotNewCampaign res ->
            case res of
                Ok c ->
                    ( { model | connection = Success Overview, campaigns = model.campaigns ++ [ c ] }, Cmd.none )

                Err err ->
                    ( model |> parseError err, Cmd.none )


parseError : Http.Error -> Model -> Model
parseError err model =
    let
        errMsg : String
        errMsg =
            case err of
                Http.BadUrl m ->
                    "bad url: " ++ m

                Http.Timeout ->
                    "timeout"

                Http.NetworkError ->
                    "network error"

                Http.BadStatus code ->
                    "bad status: " ++ String.fromInt code

                Http.BadBody m ->
                    "bad body: " ++ m
    in
    { model | connection = Failure errMsg }


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none



-- VIEW


view : Model -> Html Msg
view model =
    main_ []
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

                        NewCampaign ->
                            newCampaignView model.newCampaignFormData

                        PupilPage pup ->
                            pupilView pup

                        NewPupils ->
                            newPupilsView
            )
        ]


campaignView : Campaign -> List (Html Msg)
campaignView c =
    [ h1 [ classes "title is-3" ] [ text c.title ]
    , div [ class "block" ] (c.days |> List.map dayView)
    , div [ class "block" ]
        (h2 [ classes "title is-5" ] [ text "Alle Angebote" ]
            :: (c.events |> List.map eventView)
            ++ [ button [ classes "button is-primary" ] [ text "Neues Angebot" ] ]
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

        unassignedPupils =
            if List.isEmpty [] then
                []

            else
                [ div [ class "block" ]
                    [ h3 [ classes "subtitle is-5" ] [ text "Bisher nicht zugeordnete Schüler/innen" ]
                    , pupilUl []
                    ]
                ]
    in
    div [ class "block" ]
        (h2 [ classes "title is-5" ] [ text d.title ] :: events ++ unassignedPupils)


eventView : Event -> Html Msg
eventView e =
    div [ class "block" ]
        [ h3 [ classes "subtitle is-5" ] [ text e.title ] ]


pupilUl : List Pupil -> Html Msg
pupilUl pupList =
    ul []
        (pupList
            |> List.map
                (\pup -> li [] [ a [ onClick <| SwitchPage <| SwitchToPupil pup ] [ text <| pupilToStr pup ] ])
        )


newCampaignView : NewCampaignFormData -> List (Html Msg)
newCampaignView ncfd =
    let
        labelNumOfDays : String
        labelNumOfDays =
            "Anzahl der Tage"
    in
    [ h1 [ classes "title is-3" ] [ text "Neue Kampagne hinzufügen" ]
    , div [ class "columns" ]
        [ div [ classes "column is-half-tablet is-one-third-desktop is-one-quarter-widescreen" ]
            [ form [ onSubmit <| SendNewCampaignForm ]
                [ div [ class "field" ]
                    [ div [ class "control" ]
                        [ input
                            [ class "input"
                            , type_ "text"
                            , placeholder "Titel"
                            , attribute "aria-label" "Titel"
                            , required True
                            , onInput (Title >> NewCampaignFormDataMsg)
                            , value ncfd.title
                            ]
                            []
                        ]
                    ]
                , div [ class "field" ]
                    [ div [ class "control" ]
                        [ input
                            [ class "input"
                            , type_ "number"
                            , attribute "aria-label" labelNumOfDays
                            , Html.Attributes.min "1"
                            , onInput (String.toInt >> Maybe.withDefault 0 >> NumOfDays >> NewCampaignFormDataMsg)
                            , value <| String.fromInt ncfd.numOfDays
                            ]
                            []
                        ]
                    , p [ class "help" ] [ text labelNumOfDays ]
                    ]
                , div [ class "field" ]
                    [ button [ classes "button is-primary", type_ "submit" ] [ text "Hinzufügen" ] ]
                ]
            ]
        ]
    ]


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


{-| This helper takes a string with class names separated by one whitespace. All
classes are applied to the result.

    import Html exposing (..)

    view : Model -> Html msg
    view model =
        div [ classes "center with-border nice-color" ] [ text model.content ]

-}
classes : String -> Html.Attribute msg
classes s =
    let
        cl : List ( String, Bool )
        cl =
            String.split " " s |> List.map (\c -> ( c, True ))
    in
    Html.Attributes.classList cl
