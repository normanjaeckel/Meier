module Main exposing (main)

import Browser
import Html exposing (..)
import Html.Attributes exposing (attribute, class, id, placeholder, required, type_, value)
import Html.Events exposing (onClick, onInput, onSubmit)


main : Program () Model Msg
main =
    Browser.sandbox { init = init, update = update, view = view }



-- MODEL


type alias Model =
    { page : Page
    , newCampaignFormData : NewCampaignFormData
    }


init : Model
init =
    { page =
        Overview
            [ CampaignRef 1 "Erste Kampagne"
            , CampaignRef 2 "Andere Projekte"
            , CampaignRef 42 "Noch eine Projektwoche"
            ]
    , newCampaignFormData = NewCampaignFormData "" 2
    }


type Page
    = Overview (List CampaignRef)
    | CampaignPage Campaign
    | NewCampaign
    | PupilPage Pupil
    | NewPupils


type alias CampaignRef =
    { id : Id
    , title : String
    }


type alias Id =
    Int


type alias Campaign =
    { ref : CampaignRef
    , days : List Day
    }


type alias Day =
    { title : String
    , events : List Event
    , unassignedPupils : List Pupil
    }


type alias Event =
    { title : String
    , pupils : List Pupil
    }


type alias Pupil =
    { name : String
    , class : String
    }


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


type SwitchTo
    = SwitchToOverview
    | SwitchToNewCampaign
    | SwitchToPage Id
    | SwitchToPupil Pupil
    | SwitchToNewPupils


type NewCampaignFormDataInput
    = Title String
    | NumOfDays Int


update : Msg -> Model -> Model
update msg model =
    case msg of
        SwitchPage s ->
            case s of
                SwitchToOverview ->
                    { model | page = Overview [] }

                SwitchToNewCampaign ->
                    { model | page = NewCampaign }

                SwitchToPage id ->
                    { model
                        | page =
                            CampaignPage <|
                                Campaign (CampaignRef id "Name der Kampagne")
                                    [ Day
                                        "Tag 1"
                                        [ Event "Kochen"
                                            [ Pupil "Anna" "1b"
                                            , Pupil "Joe" "2a"
                                            ]
                                        , Event "Tanzen" []
                                        ]
                                        [ Pupil "Jim" "1a", Pupil "Maxi" "2b" ]
                                    , Day
                                        "Tag 2"
                                        [ Event "Kochen" [], Event "Museumsbesuch" [] ]
                                        []
                                    ]
                    }

                SwitchToPupil pup ->
                    { model | page = PupilPage pup }

                SwitchToNewPupils ->
                    { model | page = NewPupils }

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
            { model | newCampaignFormData = newData }



-- VIEW


view : Model -> Html Msg
view model =
    main_ []
        [ section [ class "section" ]
            (case model.page of
                Overview campaigns ->
                    [ h1 [ classes "title is-3" ] [ text "Überblick über alle Kampagnen" ]
                    , div [ class "buttons" ]
                        (campaigns
                            |> List.map
                                (\c ->
                                    button
                                        [ class "button"
                                        , onClick <| SwitchPage <| SwitchToPage c.id
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
    [ h1 [ classes "title is-3" ] [ text c.ref.title ]
    , div [ class "block" ] [ button [ classes "button is-primary", onClick <| SwitchPage <| SwitchToNewPupils ] [ text "Neue Schüler/innen" ] ]
    , div [ class "block" ] (c.days |> List.map dayView)
    ]


dayView : Day -> Html Msg
dayView d =
    let
        events : List (Html Msg)
        events =
            d.events |> List.map eventView

        unassignedPupils =
            if List.isEmpty d.unassignedPupils then
                []

            else
                [ div [ class "block" ]
                    [ h3 [ classes "subtitle is-5" ] [ text "Bisher nicht zugeordnete Schüler/innen" ]
                    , pupilUl d.unassignedPupils
                    ]
                ]
    in
    div [ class "block" ]
        (h2 [ classes "title is-5" ] [ text d.title ] :: events ++ unassignedPupils)


eventView : Event -> Html Msg
eventView e =
    div [ class "block" ]
        [ h3 [ classes "subtitle is-5" ] [ text e.title ]
        , if List.isEmpty e.pupils then
            p [] [ text "Keine Schüler/innen zugeordnet" ]

          else
            pupilUl e.pupils
        ]


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
