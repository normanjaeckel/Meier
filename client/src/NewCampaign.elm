module NewCampaign exposing (Effect(..), Model, Msg, init, update, view)

import Data exposing (Campaign, queryCampaign)
import Html exposing (Html, button, div, form, h1, input, p, text)
import Html.Attributes exposing (attribute, class, placeholder, required, type_, value)
import Html.Events exposing (onInput, onSubmit)
import Http
import Json.Decode as D
import Json.Encode as E
import Shared exposing (classes, parseError)



-- MODEL


type alias Model =
    { title : String
    , numOfDays : Int
    }


init : Model
init =
    Model "" 2



-- UPDATE


type Msg
    = NewCampaignFormDataMsg NewCampaignFormDataInput
    | SendNewCampaignForm
    | GotNewCampaign (Result Http.Error Campaign)


type NewCampaignFormDataInput
    = Title String
    | NumOfDays Int


type Effect
    = None
    | Loading (Cmd Msg)
    | Done Campaign
    | Error String


update : Msg -> Model -> ( Model, Effect )
update msg model =
    case msg of
        NewCampaignFormDataMsg newData ->
            let
                updatedModel : Model
                updatedModel =
                    case newData of
                        Title t ->
                            { model | title = t }

                        NumOfDays n ->
                            { model | numOfDays = n }
            in
            ( updatedModel, None )

        SendNewCampaignForm ->
            let
                mutationQuery : String
                mutationQuery =
                    String.join " "
                        [ "mutation"
                        , "{"
                        , "addCampaign"
                        , "("
                        , "title:"
                        , E.encode 0 <| E.string model.title
                        , ")"
                        , queryCampaign
                        , "}"
                        ]

                addCampaignDecoder : D.Decoder Campaign
                addCampaignDecoder =
                    D.field
                        "data"
                        (D.field "addCampaign" Data.campaignDecoder)
            in
            ( model
            , Loading <|
                Http.post
                    { url = Shared.queryUrl
                    , body = Http.jsonBody <| E.object [ ( "query", E.string mutationQuery ) ]
                    , expect = Http.expectJson GotNewCampaign addCampaignDecoder
                    }
            )

        GotNewCampaign res ->
            case res of
                Ok camp ->
                    ( model, Done camp )

                Err err ->
                    ( model, Error (parseError err) )



-- VIEW


view : Model -> List (Html Msg)
view ncfd =
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
