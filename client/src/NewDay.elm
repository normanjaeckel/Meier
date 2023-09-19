module NewDay exposing (Effect(..), Model, Msg, init, update, view)

import Api.Mutation
import Data
import Graphql.Http
import Html exposing (Html, button, div, form, h1, input, text)
import Html.Attributes exposing (attribute, class, placeholder, required, type_, value)
import Html.Events exposing (onInput, onSubmit)
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
    | SendNewDayForm Data.Campaign
    | GotNewDay Data.Campaign (Result (Graphql.Http.Error Data.Day) Data.Day)


type NewDayFormDataInput
    = Title String


type Effect
    = None
    | Loading (Cmd Msg)
    | Done Data.Campaign
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

        SendNewDayForm campaign ->
            ( model
            , Loading <|
                (Api.Mutation.addDay (Api.Mutation.AddDayRequiredArguments campaign.id model.title) Data.daySelectionSet
                    |> Graphql.Http.mutationRequest Shared.queryUrl
                    |> Graphql.Http.send (GotNewDay campaign)
                )
            )

        GotNewDay campaign res ->
            case res of
                Ok day ->
                    ( model, Done { campaign | days = campaign.days ++ [ day ] } )

                Err err ->
                    ( model, Error (Shared.parseGraphqlError err) )



-- VIEW


view : Data.Campaign -> Model -> List (Html Msg)
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
