module CampaignForm exposing (Action(..), Effect(..), Model, Msg, Obj, ObjId, ReturnValue(..), init, update, view)

import Api.Mutation
import Data
import Graphql.Http
import Graphql.OptionalArgument
import Html exposing (Html, button, div, footer, form, header, input, p, section, text)
import Html.Attributes exposing (attribute, class, placeholder, required, type_, value)
import Html.Events exposing (onClick, onInput, onSubmit)
import Shared exposing (classes)


type alias Obj =
    Data.Campaign


type alias ObjId =
    Data.CampaignId



-- MODEL


type alias Model =
    { title : String
    , numOfDays : Int
    , action : Action
    }


init : Action -> Model
init action =
    Model "" 2 action



-- UPDATE


type Msg
    = FormMsg FormMsg
    | SendForm Action
    | CloseForm
    | GotNew (Result (Graphql.Http.Error Obj) Obj)
    | GotUpdated (Result (Graphql.Http.Error Obj) Obj)
    | GotDelete ObjId (Result (Graphql.Http.Error Bool) Bool)


type FormMsg
    = Title String
    | NumOfDays Int


type Action
    = New
    | Edit ObjId
    | Delete ObjId


type Effect
    = None
    | Loading (Cmd Msg)
    | ClosedWithoutChange
    | Done ReturnValue
    | Error String


type ReturnValue
    = NewOrUpdated Obj
    | Deleted ObjId


update : Msg -> Model -> ( Model, Effect )
update msg model =
    case msg of
        FormMsg formMsg ->
            let
                updatedModel : Model
                updatedModel =
                    case formMsg of
                        Title t ->
                            { model | title = t }

                        NumOfDays nod ->
                            { model | numOfDays = nod }
            in
            ( updatedModel, None )

        SendForm action ->
            case action of
                New ->
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
                        (Api.Mutation.addCampaign
                            optionalArgs
                            (Api.Mutation.AddCampaignRequiredArguments model.title)
                            Data.campaingSelectionSet
                            |> Graphql.Http.mutationRequest Shared.queryUrl
                            |> Graphql.Http.send GotNew
                        )
                    )

                Edit objId ->
                    ( model
                    , Loading <|
                        (Api.Mutation.updateCampaign
                            (Api.Mutation.UpdateCampaignRequiredArguments objId model.title)
                            Data.campaingSelectionSet
                            |> Graphql.Http.mutationRequest Shared.queryUrl
                            |> Graphql.Http.send GotUpdated
                        )
                    )

                Delete objId ->
                    ( model
                    , Loading <|
                        (Api.Mutation.deleteCampaign (Api.Mutation.DeleteCampaignRequiredArguments objId)
                            |> Graphql.Http.mutationRequest Shared.queryUrl
                            |> Graphql.Http.send (GotDelete objId)
                        )
                    )

        CloseForm ->
            ( model, ClosedWithoutChange )

        GotNew res ->
            case res of
                Ok obj ->
                    ( model, Done <| NewOrUpdated obj )

                Err err ->
                    ( model, Error (Shared.parseGraphqlError err) )

        GotUpdated res ->
            case res of
                Ok obj ->
                    ( model, Done <| NewOrUpdated obj )

                Err err ->
                    ( model, Error (Shared.parseGraphqlError err) )

        GotDelete objId res ->
            case res of
                Ok _ ->
                    ( model, Done <| Deleted objId )

                Err err ->
                    ( model, Error (Shared.parseGraphqlError err) )



-- VIEW


view : Model -> Html Msg
view model =
    case model.action of
        New ->
            viewNewAndEdit "Neue Kampagne hinzufügen" model

        Edit _ ->
            viewNewAndEdit "Kampagne bearbeiten" model

        Delete _ ->
            viewDelete model


viewNewAndEdit : String -> Model -> Html Msg
viewNewAndEdit headline model =
    let
        withDays : Bool
        withDays =
            case model.action of
                New ->
                    True

                _ ->
                    False
    in
    div [ classes "modal is-active" ]
        [ div [ class "modal-background", onClick CloseForm ] []
        , div [ class "modal-card" ]
            [ form [ onSubmit <| SendForm model.action ]
                [ header [ class "modal-card-head" ]
                    [ p [ class "modal-card-title" ] [ text headline ]
                    , button [ class "delete", type_ "button", attribute "aria-label" "close", onClick CloseForm ] []
                    ]
                , section [ class "modal-card-body" ]
                    (formFields model withDays |> List.map (Html.map FormMsg))
                , footer [ class "modal-card-foot" ]
                    [ button [ classes "button is-success", type_ "submit" ] [ text "Speichern" ]
                    , button [ class "button", type_ "button", onClick CloseForm ] [ text "Abbrechen" ]
                    ]
                ]
            ]
        ]


formFields : Model -> Bool -> List (Html FormMsg)
formFields model withDays =
    [ div [ class "field" ]
        [ div [ class "control" ]
            [ input
                [ class "input"
                , type_ "text"
                , placeholder "Titel"
                , attribute "aria-label" "Titel"
                , required True
                , onInput Title
                , value model.title
                ]
                []
            ]
        ]
    , if withDays then
        let
            labelNumOfDays : String
            labelNumOfDays =
                "Anzahl der Tage"
        in
        div [ class "field" ]
            [ div [ class "control" ]
                [ input
                    [ class "input"
                    , type_ "number"
                    , attribute "aria-label" labelNumOfDays
                    , Html.Attributes.min "1"
                    , Html.Attributes.max "10"
                    , onInput (String.toInt >> Maybe.withDefault 0 >> NumOfDays)
                    , value <| String.fromInt model.numOfDays
                    ]
                    []
                ]
            , p [ class "help" ] [ text labelNumOfDays ]
            ]

      else
        div [] []
    ]


viewDelete : Model -> Html Msg
viewDelete model =
    div [ classes "modal is-active" ]
        [ div [ class "modal-background", onClick CloseForm ] []
        , div [ class "modal-card" ]
            [ header [ class "modal-card-head" ]
                [ p [ class "modal-card-title" ] [ text "Kampagne löschen" ]
                , button [ class "delete", type_ "button", attribute "aria-label" "close", onClick CloseForm ] []
                ]
            , section [ class "modal-card-body" ]
                [ p [] [ text <| "Wollen Sie die Kampagne " ++ model.title ++ " wirklich löschen?" ]
                ]
            , footer [ class "modal-card-foot" ]
                [ button [ classes "button is-success", onClick <| SendForm model.action ] [ text "Löschen" ]
                , button [ class "button", type_ "button", onClick CloseForm ] [ text "Abbrechen" ]
                ]
            ]
        ]
