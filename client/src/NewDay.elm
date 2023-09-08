module NewDay exposing (Effect(..), Model, Msg, init, update, view)

import Data exposing (Campaign, Day)
import Html exposing (Html, button, div, form, h1, input, text)
import Html.Attributes exposing (attribute, class, placeholder, required, type_, value)
import Html.Events exposing (onInput, onSubmit)
import Http
import Json.Decode as D
import Json.Encode as E
import Shared exposing (classes)



-- MODEL


type alias Model =
    { title : String }


init : Model
init =
    Model ""



-- UPDATE


type Msg
    = NewDayFormDataMsg NewDayFormDataInput
    | SendNewDayForm Campaign
    | GotNewDay Campaign (Result Http.Error Day)


type NewDayFormDataInput
    = Title String


type Effect
    = None
    | Loading (Cmd Msg)
    | Done Campaign
    | Error String


update : Msg -> Model -> ( Model, Effect )
update msg model =
    case msg of
        NewDayFormDataMsg newData ->
            let
                updatedModel : Model
                updatedModel =
                    case newData of
                        Title t ->
                            { model | title = t }
            in
            ( updatedModel, None )

        SendNewDayForm c ->
            let
                mutationQuery : String
                mutationQuery =
                    -- TODO
                    String.join " "
                        [ "mutation"
                        , "{"
                        , "addDay"
                        , "("
                        , "campaignID:"
                        , E.encode 0 <| E.int c.id
                        , ", title:"
                        , E.encode 0 <| E.string model.title
                        , ")"
                        , Data.queryDay
                        , "}"
                        ]

                addDayDecoder : D.Decoder Day
                addDayDecoder =
                    D.field
                        "data"
                        (D.field "addDay" Data.dayDecoder)
            in
            ( model
            , Loading <|
                Http.post
                    { url = Shared.queryUrl
                    , body = Http.jsonBody <| E.object [ ( "query", E.string mutationQuery ) ]
                    , expect = Http.expectJson (GotNewDay c) addDayDecoder
                    }
            )

        GotNewDay c res ->
            case res of
                Ok d ->
                    ( model, Done { c | days = c.days ++ [ d ] } )

                Err err ->
                    ( model, Error (Shared.parseError err) )



-- VIEW


view : Campaign -> Model -> List (Html Msg)
view c model =
    [ h1 [ classes "title is-3" ] [ text "Neuen Tag hinzufügen" ]
    , div [ class "columns" ]
        [ div [ classes "column is-half-tablet is-one-third-desktop is-one-quarter-widescreen" ]
            [ form [ onSubmit <| SendNewDayForm c ]
                [ div [ class "field" ]
                    [ div [ class "control" ]
                        [ input
                            [ class "input"
                            , type_ "text"
                            , placeholder "Titel"
                            , attribute "aria-label" "Titel"
                            , required True
                            , onInput (Title >> NewDayFormDataMsg)
                            , value model.title
                            ]
                            []
                        ]
                    ]
                , div [ class "field" ]
                    [ button [ classes "button is-primary", type_ "submit" ] [ text "Hinzufügen" ] ]
                ]
            ]
        ]
    ]
