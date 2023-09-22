module NewCampaign exposing (Effect(..), Model, Msg, init, update, view)

import Api.Mutation
import Data
import Graphql.Http
import Graphql.OptionalArgument
import Html exposing (Html, button, div, form, h1, input, p, text)
import Html.Attributes exposing (attribute, class, placeholder, required, type_, value)
import Html.Events exposing (onInput, onSubmit)
import Shared exposing (classes)



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
    | GotNewCampaign (Result (Graphql.Http.Error Data.Campaign) Data.Campaign)


type NewCampaignFormDataInput
    = Title String
    | NumOfDays Int


type Effect
    = None
    | Loading (Cmd Msg)
    | Done Data.Campaign
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
                dayList : List String
                dayList =
                    List.range 1 model.numOfDays
                        |> List.map (\i -> "Tag " ++ String.fromInt i)

                optionalArgs : Api.Mutation.AddCampaignOptionalArguments -> Api.Mutation.AddCampaignOptionalArguments
                optionalArgs args =
                    { args | days = Graphql.OptionalArgument.Present dayList }
            in
            ( model
            , Loading <|
                (Api.Mutation.addCampaign optionalArgs (Api.Mutation.AddCampaignRequiredArguments model.title) Data.campaingSelectionSet
                    |> Graphql.Http.mutationRequest Shared.queryUrl
                    |> Graphql.Http.send GotNewCampaign
                )
            )

        GotNewCampaign res ->
            case res of
                Ok campaign ->
                    ( model, Done campaign )

                Err err ->
                    ( model, Error (Shared.parseGraphqlError err) )



-- VIEW


view : Model -> List (Html Msg)
view model =
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
                            , attribute "aria-label" labelNumOfDays
                            , Html.Attributes.min "1"
                            , Html.Attributes.max "10"
                            , onInput (String.toInt >> Maybe.withDefault 0 >> NumOfDays >> NewCampaignFormDataMsg)
                            , value <| String.fromInt model.numOfDays
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
