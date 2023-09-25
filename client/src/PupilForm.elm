module PupilForm exposing (Action(..), Effect(..), Model, Msg, ReturnValue(..), init, update, view)

import Api.Mutation
import Data
import Graphql.Http
import Graphql.OptionalArgument
import Html exposing (Html, button, div, footer, form, header, input, label, p, section, text)
import Html.Attributes exposing (attribute, checked, class, placeholder, required, type_, value)
import Html.Events exposing (onCheck, onClick, onInput, onSubmit)
import Shared exposing (classes)


type alias Obj =
    Data.Pupil


type alias ObjId =
    Data.PupilId



-- MODEL


type alias Model =
    { name : String
    , class : String
    , isSpecial : Bool
    }


init : Model
init =
    Model "" "" False



-- UPDATE


type Msg
    = FormMsg FormMsg
    | SendForm Action
    | CloseForm
    | GotNew (Result (Graphql.Http.Error Obj) Obj)
    | GotUpdated (Result (Graphql.Http.Error Obj) Obj)
    | GotDelete ObjId (Result (Graphql.Http.Error Bool) Bool)


type FormMsg
    = Name String
    | Class String
    | IsSpecial Bool


type Action
    = New
    | Edit ObjId
    | Delete Obj


type Effect
    = None
    | Loading (Cmd Msg)
    | ClosedWithoutChange
    | Done ReturnValue
    | Error String


type ReturnValue
    = NewOrUpdated Obj
    | Deleted ObjId


update : Data.CampaignId -> Msg -> Model -> ( Model, Effect )
update campaignId msg model =
    case msg of
        FormMsg formMsg ->
            let
                updatedModel : Model
                updatedModel =
                    case formMsg of
                        Name n ->
                            { model | name = n }

                        Class cls ->
                            { model | class = cls }

                        IsSpecial isp ->
                            { model | isSpecial = isp }
            in
            ( updatedModel, None )

        SendForm action ->
            case action of
                New ->
                    let
                        optionalArguments : Api.Mutation.AddPupilOptionalArguments -> Api.Mutation.AddPupilOptionalArguments
                        optionalArguments args =
                            { args | special = Graphql.OptionalArgument.Present model.isSpecial }
                    in
                    ( model
                    , Loading <|
                        (Api.Mutation.addPupil
                            optionalArguments
                            (Api.Mutation.AddPupilRequiredArguments
                                campaignId
                                model.name
                                model.class
                            )
                            Data.pupilSelectionSet
                            |> Graphql.Http.mutationRequest Shared.queryUrl
                            |> Graphql.Http.send GotNew
                        )
                    )

                Edit objId ->
                    let
                        optionalArgs : Api.Mutation.UpdatePupilOptionalArguments -> Api.Mutation.UpdatePupilOptionalArguments
                        optionalArgs args =
                            { args
                                | name = Graphql.OptionalArgument.Present model.name
                                , class = Graphql.OptionalArgument.Present model.class
                                , special = Graphql.OptionalArgument.Present model.isSpecial
                            }
                    in
                    ( model
                    , Loading <|
                        (Api.Mutation.updatePupil
                            optionalArgs
                            (Api.Mutation.UpdatePupilRequiredArguments objId)
                            Data.pupilSelectionSet
                            |> Graphql.Http.mutationRequest Shared.queryUrl
                            |> Graphql.Http.send GotUpdated
                        )
                    )

                Delete obj ->
                    ( model
                    , Loading <|
                        (Api.Mutation.deletePupil (Api.Mutation.DeletePupilRequiredArguments obj.id)
                            |> Graphql.Http.mutationRequest Shared.queryUrl
                            |> Graphql.Http.send (GotDelete obj.id)
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


view : Action -> Model -> Html Msg
view action model =
    case action of
        New ->
            viewNewAndEdit "Neue/n Schüler/in hinzufügen" action model

        Edit _ ->
            viewNewAndEdit "Schüler/in bearbeiten" action model

        Delete obj ->
            viewDelete obj


viewNewAndEdit : String -> Action -> Model -> Html Msg
viewNewAndEdit headline action model =
    div [ classes "modal is-active" ]
        [ div [ class "modal-background", onClick CloseForm ] []
        , div [ class "modal-card" ]
            [ form [ onSubmit <| SendForm action ]
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
                , placeholder "Name"
                , attribute "aria-label" "Name"
                , required True
                , onInput Name
                , value model.name
                ]
                []
            ]
        ]
    , div [ class "field" ]
        [ div [ class "control" ]
            [ input
                [ class "input"
                , type_ "text"
                , placeholder "Klasse"
                , attribute "aria-label" "Klasse"
                , required True
                , onInput Class
                , value model.class
                ]
                []
            ]
        ]
    , div [ class "field" ]
        [ div [ class "control" ]
            [ label [ class "checkbox" ]
                [ input
                    [ class "mr-2"
                    , type_ "checkbox"
                    , onCheck IsSpecial
                    , checked model.isSpecial
                    ]
                    []
                , text "Besondere/r Schüler/in"
                ]
            ]
        ]
    ]


viewDelete : Obj -> Html Msg
viewDelete obj =
    div [ classes "modal is-active" ]
        [ div [ class "modal-background", onClick CloseForm ] []
        , div [ class "modal-card" ]
            [ header [ class "modal-card-head" ]
                [ p [ class "modal-card-title" ] [ text "Schüler/in löschen" ]
                , button [ class "delete", type_ "button", attribute "aria-label" "close", onClick CloseForm ] []
                ]
            , section [ class "modal-card-body" ]
                [ p [] [ text <| "Wollen Sie den Schüler bzw. die Schülerin " ++ obj.name ++ " wirklich löschen?" ]
                ]
            , footer [ class "modal-card-foot" ]
                [ button [ classes "button is-success", onClick <| SendForm (Delete obj) ] [ text "Löschen" ]
                , button [ class "button", type_ "button", onClick CloseForm ] [ text "Abbrechen" ]
                ]
            ]
        ]
