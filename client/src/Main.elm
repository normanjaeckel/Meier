module Main exposing (main)

import Browser
import Dict
import Html exposing (..)
import Html.Attributes exposing (attribute, class, placeholder, required, type_, value)
import Html.Events exposing (onClick, onInput, onSubmit)
import Http
import Json.Decode as D
import Platform.Cmd as Cmd


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
    , data : Data
    , newCampaignFormData : NewCampaignFormData
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { connection = Loading
      , data = { campaigns = Dict.empty }
      , newCampaignFormData = NewCampaignFormData "" 2
      }
    , Http.get
        { url = "https://run.mocky.io/v3/c999159b-0433-405a-8f34-5652cae2f081"
        , expect = Http.expectJson GotData dataDecoder
        }
    )


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


type alias Data =
    { campaigns : Dict.Dict CampaignId Campaign
    }


dataDecoder : D.Decoder Data
dataDecoder =
    D.map Data
        (D.field
            "campaigns"
            (D.dict campaignDecoder |> dictKeyFromStringToComparable String.toInt)
        )


type alias CampaignId =
    Int


type alias Campaign =
    { title : String
    , days : Dict.Dict DayId Day
    , events : Dict.Dict EventId Event
    , pupils : Dict.Dict PupilId Pupil
    }


campaignDecoder : D.Decoder Campaign
campaignDecoder =
    D.map4 Campaign
        (D.field "title" D.string)
        (D.field "days" (D.dict dayDecoder |> dictKeyFromStringToComparable String.toInt))
        (D.field "events" (D.dict eventDecoder |> dictKeyFromStringToComparable String.toInt))
        (D.field "pupils" (D.dict pupilDecoder |> dictKeyFromStringToComparable String.toInt))


type alias DayId =
    Int


type alias Day =
    { title : String
    , events : Dict.Dict EventId (List PupilId)
    }


dayDecoder : D.Decoder Day
dayDecoder =
    D.map2 Day
        (D.field "title" D.string)
        (D.field "events" (D.dict (D.list D.int) |> dictKeyFromStringToComparable String.toInt))


type alias EventId =
    Int


type alias Event =
    { title : String
    , capacity : Int
    }


eventDecoder : D.Decoder Event
eventDecoder =
    D.map2 Event
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


{-| This helper can transform a decoder so that we can use not only strings as
key but any comparables.
-}
dictKeyFromStringToComparable : (String -> Maybe comparable) -> D.Decoder (Dict.Dict String b) -> D.Decoder (Dict.Dict comparable b)
dictKeyFromStringToComparable fn dec =
    let
        fn2 : ( String, b ) -> Maybe (List ( comparable, b )) -> Maybe (List ( comparable, b ))
        fn2 ( k1, v ) acc1 =
            acc1
                |> Maybe.andThen
                    (\acc2 ->
                        k1 |> fn |> Maybe.andThen (\k2 -> ( k2, v ) :: acc2 |> Just)
                    )
    in
    dec
        |> D.andThen
            (\d ->
                case d |> Dict.toList |> List.foldl fn2 (Just []) of
                    Nothing ->
                        D.fail "invalid object id"

                    Just l ->
                        l
                            |> List.reverse
                            |> Dict.fromList
                            |> D.succeed
            )


type alias NewCampaignFormData =
    { title : String
    , numOfDays : Int
    }


pupilToStr : Pupil -> String
pupilToStr p =
    p.name ++ " (Klasse " ++ p.class ++ ")"



-- UPDATE


type Msg
    = SwitchPage SwitchTo
    | NewCampaignFormDataMsg NewCampaignFormDataInput
    | GotData (Result Http.Error Data)


type SwitchTo
    = SwitchToOverview
    | SwitchToNewCampaign
    | SwitchToPage CampaignId
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
                Ok data ->
                    ( { model | connection = Success Overview, data = data }, Cmd.none )

                Err e ->
                    let
                        errMsg : String
                        errMsg =
                            case e of
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
                    ( { model | connection = Failure errMsg }, Cmd.none )

        SwitchPage s ->
            case s of
                SwitchToOverview ->
                    ( { model | connection = Success <| Overview }, Cmd.none )

                SwitchToNewCampaign ->
                    ( { model | connection = Success NewCampaign }, Cmd.none )

                SwitchToPage _ ->
                    ( { model
                        | connection =
                            Success <|
                                CampaignPage <|
                                    Campaign
                                        "Eine Kampagne beispielhaft"
                                        Dict.empty
                                        Dict.empty
                                        Dict.empty
                      }
                    , Cmd.none
                    )

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
                                (model.data.campaigns
                                    |> Dict.toList
                                    |> List.map
                                        (\( cId, c ) ->
                                            button
                                                [ class "button"
                                                , onClick <| SwitchPage <| SwitchToPage cId
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
    [ h1 [ classes "title is-3" ] [ text "dummy title" ]
    , div [ class "block" ] [ button [ classes "button is-primary", onClick <| SwitchPage <| SwitchToNewPupils ] [ text "Neue Schüler/innen" ] ]
    , div [ class "block" ] (c.days |> Dict.values |> List.map dayView)
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



-- eventView : Event -> Html Msg
-- eventView e =
--     div [ class "block" ]
--         [ h3 [ classes "subtitle is-5" ] [ text e.title ]
--         , if List.isEmpty e.pupils then
--             p [] [ text "Keine Schüler/innen zugeordnet" ]
--           else
--             pupilUl e.pupils
--         ]


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
            [ form [ onSubmit <| SwitchPage <| SwitchToOverview ]
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
