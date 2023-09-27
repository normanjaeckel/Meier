module EventForm exposing (Action(..), Effect(..), Model, Msg, ReturnValue(..), init, update, view)

import Api.Mutation
import Data
import Graphql.Http
import Graphql.OptionalArgument
import Html exposing (Html, button, div, footer, form, header, input, p, section, text)
import Html.Attributes exposing (attribute, class, placeholder, required, type_, value)
import Html.Events exposing (onClick, onInput, onSubmit)
import Shared exposing (classes)


type alias Obj =
    Data.Event


type alias ObjId =
    Data.EventId



-- MODEL


type alias Model =
    { title : String
    , capacity : Int
    , maxSpecialPupils : Int
    , campaignId : Data.CampaignId
    , action : Action
    }


init : Data.CampaignId -> Action -> Model
init campaignId action =
    Model "" 12 2 campaignId action



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
    | Capacity Int
    | MaxSpecialPupil Int


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

                        Capacity cap ->
                            { model | capacity = cap }

                        MaxSpecialPupil msp ->
                            { model | maxSpecialPupils = msp }
            in
            ( updatedModel, None )

        SendForm action ->
            case action of
                New ->
                    let
                        optionalArgs : Api.Mutation.AddEventOptionalArguments -> Api.Mutation.AddEventOptionalArguments
                        optionalArgs args =
                            args
                    in
                    ( model
                    , Loading <|
                        (Api.Mutation.addEvent
                            optionalArgs
                            (Api.Mutation.AddEventRequiredArguments
                                model.campaignId
                                model.title
                                model.capacity
                                model.maxSpecialPupils
                            )
                            Data.eventSelectionSet
                            |> Graphql.Http.mutationRequest Shared.queryUrl
                            |> Graphql.Http.send GotNew
                        )
                    )

                Edit objId ->
                    let
                        optionalArgs : Api.Mutation.UpdateEventOptionalArguments -> Api.Mutation.UpdateEventOptionalArguments
                        optionalArgs args =
                            { args
                                | title = Graphql.OptionalArgument.Present model.title
                                , capacity = Graphql.OptionalArgument.Present model.capacity
                                , maxSpecialPupils = Graphql.OptionalArgument.Present model.maxSpecialPupils
                            }
                    in
                    ( model
                    , Loading <|
                        (Api.Mutation.updateEvent
                            optionalArgs
                            (Api.Mutation.UpdateEventRequiredArguments objId)
                            Data.eventSelectionSet
                            |> Graphql.Http.mutationRequest Shared.queryUrl
                            |> Graphql.Http.send GotUpdated
                        )
                    )

                Delete objId ->
                    ( model
                    , Loading <|
                        (Api.Mutation.deleteEvent (Api.Mutation.DeleteEventRequiredArguments objId)
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
            viewNewAndEdit "Neues Angebot hinzufügen" model

        Edit _ ->
            viewNewAndEdit "Angebot bearbeiten" model

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
                , onInput Title
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
                , onInput (String.toInt >> Maybe.withDefault 0 >> Capacity)
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
                , onInput (String.toInt >> Maybe.withDefault 0 >> MaxSpecialPupil)
                , value <| String.fromInt model.maxSpecialPupils
                ]
                []
            ]
        , p [ class "help" ] [ text labelMaxSpecialPupils ]
        ]
    ]


viewDelete : Model -> Html Msg
viewDelete model =
    div [ classes "modal is-active" ]
        [ div [ class "modal-background", onClick CloseForm ] []
        , div [ class "modal-card" ]
            [ header [ class "modal-card-head" ]
                [ p [ class "modal-card-title" ] [ text "Angebot löschen" ]
                , button [ class "delete", type_ "button", attribute "aria-label" "close", onClick CloseForm ] []
                ]
            , section [ class "modal-card-body" ]
                [ p [] [ text <| "Wollen Sie das Angebot " ++ model.title ++ " wirklich löschen?" ]
                ]
            , footer [ class "modal-card-foot" ]
                [ button [ classes "button is-success", onClick <| SendForm model.action ] [ text "Löschen" ]
                , button [ class "button", type_ "button", onClick CloseForm ] [ text "Abbrechen" ]
                ]
            ]
        ]
