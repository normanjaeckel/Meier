module DayForm exposing (Action(..), Effect(..), Model, Msg, ReturnValue(..), init, update, view)

import Api.Mutation
import Data
import Graphql.Http
import Html exposing (Html, button, div, footer, form, header, input, p, section, text)
import Html.Attributes exposing (attribute, class, placeholder, required, type_, value)
import Html.Events exposing (onClick, onInput, onSubmit)
import Shared exposing (classes)


type alias Obj =
    Data.Day


type alias ObjId =
    Data.DayId



-- MODEL


type alias Model =
    { title : String
    , campaignId : Data.CampaignId
    , action : Action
    }


init : Data.CampaignId -> Action -> Model
init campaignId action =
    Model "" campaignId action



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
            in
            ( updatedModel, None )

        SendForm action ->
            case action of
                New ->
                    ( model
                    , Loading <|
                        (Api.Mutation.addDay
                            (Api.Mutation.AddDayRequiredArguments
                                model.campaignId
                                model.title
                            )
                            Data.daySelectionSet
                            |> Graphql.Http.mutationRequest Shared.queryUrl
                            |> Graphql.Http.send GotNew
                        )
                    )

                Edit objId ->
                    ( model
                    , Loading <|
                        (Api.Mutation.updateDay
                            (Api.Mutation.UpdateDayRequiredArguments objId model.title)
                            Data.daySelectionSet
                            |> Graphql.Http.mutationRequest Shared.queryUrl
                            |> Graphql.Http.send GotUpdated
                        )
                    )

                Delete objId ->
                    ( model
                    , Loading <|
                        (Api.Mutation.deleteDay (Api.Mutation.DeleteDayRequiredArguments objId)
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
            viewNewAndEdit "Neuen Tag hinzufügen" model

        Edit _ ->
            viewNewAndEdit "Tag bearbeiten" model

        Delete _ ->
            viewDelete model


viewNewAndEdit : String -> Model -> Html Msg
viewNewAndEdit headline model =
    div [ classes "modal is-active" ]
        [ div [ class "modal-background", onClick CloseForm ] []
        , div [ class "modal-card" ]
            [ form [ onSubmit <| SendForm model.action ]
                [ header [ class "modal-card-head" ]
                    [ p [ class "modal-card-title" ] [ text headline ]
                    , button [ class "delete", type_ "button", attribute "aria-label" "close", onClick CloseForm ] []
                    ]
                , section [ class "modal-card-body" ]
                    (formFields model |> List.map (Html.map FormMsg))
                , footer [ class "modal-card-foot" ]
                    [ button [ classes "button is-success", type_ "submit" ] [ text "Speichern" ]
                    , button [ class "button", type_ "button", onClick CloseForm ] [ text "Abbrechen" ]
                    ]
                ]
            ]
        ]


formFields : Model -> List (Html FormMsg)
formFields model =
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
    ]


viewDelete : Model -> Html Msg
viewDelete model =
    div [ classes "modal is-active" ]
        [ div [ class "modal-background", onClick CloseForm ] []
        , div [ class "modal-card" ]
            [ header [ class "modal-card-head" ]
                [ p [ class "modal-card-title" ] [ text "Tag löschen" ]
                , button [ class "delete", type_ "button", attribute "aria-label" "close", onClick CloseForm ] []
                ]
            , section [ class "modal-card-body" ]
                [ p [] [ text <| "Wollen Sie den Tag " ++ model.title ++ " wirklich löschen?" ]
                ]
            , footer [ class "modal-card-foot" ]
                [ button [ classes "button is-success", onClick <| SendForm model.action ] [ text "Löschen" ]
                , button [ class "button", type_ "button", onClick CloseForm ] [ text "Abbrechen" ]
                ]
            ]
        ]
