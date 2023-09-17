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
    | SendNewDayForm Data.Campaign2
    | GotNewDay Data.Campaign2 (Result (Graphql.Http.Error Data.Day2) Data.Day2)


type NewDayFormDataInput
    = Title String


type Effect
    = None
    | Loading (Cmd Msg)
    | Done Data.Campaign2
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
            ( model
            , Loading <|
                Api.Mutation.addDay (Api.Mutation.AddDayRequiredArguments c.id model.title) Data.daySelectionSet
                    |> Graphql.Http.mutationRequest Shared.queryUrl
                    |> Graphql.Http.send (GotNewDay c)
            )

        GotNewDay c res ->
            case res of
                Ok d ->
                    ( model, Done { c | days = c.days ++ [ d ] } )

                Err err ->
                    ( model, Error (Shared.parseGraphqlError err) )



-- VIEW


view : Data.Campaign2 -> Model -> List (Html Msg)
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
