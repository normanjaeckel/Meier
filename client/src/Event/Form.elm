module Event.Form exposing (Effect(..), Model, Msg(..), init, modalWithForm, update)

import Html exposing (Html, button, div, footer, form, header, input, p, section, text)
import Html.Attributes exposing (attribute, class, placeholder, required, type_, value)
import Html.Events exposing (onClick, onInput, onSubmit)
import Shared exposing (classes)


type alias Model =
    { title : String
    , capacity : Int
    , maxSpecialPupils : Int
    }


init : Model
init =
    Model "" 12 2


type Msg
    = FormDataTitle String
    | FormDataCapacity Int
    | FormDataMaxSpecialPupil Int
    | SendEventForm
    | CloseForm


type Effect
    = None
    | Send
    | Close


update : Msg -> Model -> ( Model, Effect )
update msg model =
    case msg of
        FormDataTitle t ->
            ( { model | title = t }, None )

        FormDataCapacity cap ->
            ( { model | capacity = cap }, None )

        FormDataMaxSpecialPupil msp ->
            ( { model | maxSpecialPupils = msp }, None )

        SendEventForm ->
            ( model, Send )

        CloseForm ->
            ( model, Close )


modalWithForm : String -> Model -> List (Html Msg)
modalWithForm headline model =
    [ div [ classes "modal is-active" ]
        [ div [ class "modal-background", onClick CloseForm ] []
        , div [ class "modal-card" ]
            [ form [ onSubmit SendEventForm ]
                [ header [ class "modal-card-head" ]
                    [ p [ class "modal-card-title" ] [ text headline ]
                    , button [ class "delete", attribute "aria-label" "close", onClick CloseForm ] []
                    ]
                , section [ class "modal-card-body" ]
                    (formFields model)
                , footer [ class "modal-card-foot" ]
                    [ button [ classes "button is-success", type_ "submit" ] [ text "Speichern" ]
                    , button [ class "button", onClick CloseForm ] [ text "Abbrechen" ]
                    ]
                ]
            ]
        ]
    ]


formFields : Model -> List (Html Msg)
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
                , onInput FormDataTitle
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
                , onInput (String.toInt >> Maybe.withDefault 0 >> FormDataCapacity)
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
                , onInput (String.toInt >> Maybe.withDefault 0 >> FormDataMaxSpecialPupil)
                , value <| String.fromInt model.maxSpecialPupils
                ]
                []
            ]
        , p [ class "help" ] [ text labelMaxSpecialPupils ]
        ]
    ]
