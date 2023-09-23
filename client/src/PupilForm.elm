module PupilForm exposing (Action(..), Effect(..), Model, Msg, init, update, view)

import Api.Mutation
import Data
import Graphql.Http
import Graphql.OptionalArgument
import Html exposing (Html, button, div, footer, form, header, input, label, p, section, text)
import Html.Attributes exposing (attribute, checked, class, placeholder, required, type_, value)
import Html.Events exposing (onCheck, onClick, onInput, onSubmit)
import Shared exposing (classes)



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
    | SendPupilForm Action
    | CloseForm
    | GotNewPupil (Result (Graphql.Http.Error Data.Pupil) Data.Pupil)
    | GotUpdatedPupil (Result (Graphql.Http.Error Data.Pupil) Data.Pupil)
    | GotDeletePupil Data.PupilId (Result (Graphql.Http.Error Bool) Bool)


type FormMsg
    = Name String
    | Class String
    | IsSpecial Bool


type Action
    = New
    | Edit Data.PupilId
    | Delete Data.PupilId


type Effect
    = None
    | Loading (Cmd Msg)
    | Done Data.Campaign
    | Error String


update : Data.Campaign -> Msg -> Model -> ( Model, Effect )
update campaign msg model =
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

        SendPupilForm action ->
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
                                campaign.id
                                model.name
                                model.class
                            )
                            Data.pupilSelectionSet
                            |> Graphql.Http.mutationRequest Shared.queryUrl
                            |> Graphql.Http.send GotNewPupil
                        )
                    )

                Edit pupilId ->
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
                            (Api.Mutation.UpdatePupilRequiredArguments pupilId)
                            Data.pupilSelectionSet
                            |> Graphql.Http.mutationRequest Shared.queryUrl
                            |> Graphql.Http.send GotUpdatedPupil
                        )
                    )

                Delete pupilId ->
                    ( model
                    , Loading <|
                        (Api.Mutation.deleteEvent (Api.Mutation.DeletePupilRequiredArguments pupilId)
                            |> Graphql.Http.mutationRequest Shared.queryUrl
                            |> Graphql.Http.send (GotDeletePupil pupilId)
                        )
                    )

        CloseForm ->
            ( model, Done campaign )

        GotNewPupil res ->
            case res of
                Ok pupil ->
                    ( model, Done { campaign | pupils = campaign.pupils ++ [ pupil ] } )

                Err err ->
                    ( model, Error (Shared.parseGraphqlError err) )

        GotUpdatedPupil res ->
            case res of
                Ok pupilFromServer ->
                    let
                        walkToUpdate : List Data.Pupil -> List Data.Pupil
                        walkToUpdate pupils =
                            case pupils of
                                pupil :: rest ->
                                    if pupil.id == pupilFromServer.id then
                                        pupilFromServer :: rest

                                    else
                                        pupil :: walkToUpdate rest

                                [] ->
                                    []
                    in
                    ( model, Done { campaign | pupils = walkToUpdate campaign.pupils } )

                Err err ->
                    ( model, Error (Shared.parseGraphqlError err) )

        GotDeletePupil pupilToBeDeletedId res ->
            case res of
                Ok _ ->
                    let
                        walkToUpdate : List Data.Pupil -> List Data.Pupil
                        walkToUpdate pupils =
                            case pupils of
                                pupil :: rest ->
                                    if pupil.id == pupilToBeDeletedId then
                                        rest

                                    else
                                        pupil :: walkToUpdate rest

                                [] ->
                                    []
                    in
                    ( model, Done { campaign | pupils = walkToUpdate campaign.pupils } )

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

        Delete _ ->
            viewDelete action model


viewNewAndEdit : String -> Action -> Model -> Html Msg
viewNewAndEdit headline action model =
    div [ classes "modal is-active" ]
        [ div [ class "modal-background", onClick CloseForm ] []
        , div [ class "modal-card" ]
            [ form [ onSubmit <| SendPupilForm action ]
                [ header [ class "modal-card-head" ]
                    [ p [ class "modal-card-title" ] [ text headline ]
                    , button [ class "delete", attribute "aria-label" "close", onClick CloseForm ] []
                    ]
                , section [ class "modal-card-body" ]
                    (formFields model |> List.map (Html.map FormMsg))
                , footer [ class "modal-card-foot" ]
                    [ button [ classes "button is-success", type_ "submit" ] [ text "Speichern" ]
                    , button [ class "button", onClick CloseForm ] [ text "Abbrechen" ]
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


viewDelete : Action -> Model -> Html Msg
viewDelete action model =
    div [ classes "modal is-active" ]
        [ div [ class "modal-background", onClick CloseForm ] []
        , div [ class "modal-card" ]
            [ header [ class "modal-card-head" ]
                [ p [ class "modal-card-title" ] [ text "Schüler/in löschen" ]
                , button [ class "delete", attribute "aria-label" "close", onClick CloseForm ] []
                ]
            , section [ class "modal-card-body" ]
                [ p [] [ text <| "Wollen Sie den/die Schüler/in " ++ model.name ++ "wirklich löschen?" ]
                ]
            , footer [ class "modal-card-foot" ]
                [ button [ classes "button is-success", onClick <| SendPupilForm action ] [ text "Löschen" ]
                , button [ class "button", onClick CloseForm ] [ text "Abbrechen" ]
                ]
            ]
        ]
