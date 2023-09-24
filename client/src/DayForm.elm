module DayForm exposing (Action(..), Effect(..), Model, Msg, init, update, view)

import Api.Mutation
import Data
import Graphql.Http
import Html exposing (Html, button, div, footer, form, header, input, p, section, text)
import Html.Attributes exposing (attribute, class, placeholder, required, type_, value)
import Html.Events exposing (onClick, onInput, onSubmit)
import Shared exposing (classes)



-- MODEL


type alias Model =
    { title : String
    }


init : Model
init =
    Model ""



-- UPDATE


type Msg
    = FormMsg FormMsg
    | SendDayForm Action
    | CloseForm
    | GotNewDay (Result (Graphql.Http.Error Data.Day) Data.Day)
    | GotUpdatedDay (Result (Graphql.Http.Error Data.Day) Data.Day)
    | GotDeleteDay Data.DayId (Result (Graphql.Http.Error Bool) Bool)


type FormMsg
    = Title String


type Action
    = New
    | Edit Data.DayId
    | Delete Data.Day


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
                        Title t ->
                            { model | title = t }
            in
            ( updatedModel, None )

        SendDayForm action ->
            case action of
                New ->
                    ( model
                    , Loading <|
                        (Api.Mutation.addDay
                            (Api.Mutation.AddDayRequiredArguments
                                campaign.id
                                model.title
                            )
                            Data.daySelectionSet
                            |> Graphql.Http.mutationRequest Shared.queryUrl
                            |> Graphql.Http.send GotNewDay
                        )
                    )

                Edit dayId ->
                    ( model
                    , Loading <|
                        (Api.Mutation.updateDay
                            (Api.Mutation.UpdateDayRequiredArguments dayId model.title)
                            Data.daySelectionSet
                            |> Graphql.Http.mutationRequest Shared.queryUrl
                            |> Graphql.Http.send GotUpdatedDay
                        )
                    )

                Delete day ->
                    ( model
                    , Loading <|
                        (Api.Mutation.deleteDay (Api.Mutation.DeleteDayRequiredArguments day.id)
                            |> Graphql.Http.mutationRequest Shared.queryUrl
                            |> Graphql.Http.send (GotDeleteDay day.id)
                        )
                    )

        CloseForm ->
            ( model, Done campaign )

        GotNewDay res ->
            case res of
                Ok day ->
                    ( model, Done { campaign | days = campaign.days ++ [ day ] } )

                Err err ->
                    ( model, Error (Shared.parseGraphqlError err) )

        GotUpdatedDay res ->
            case res of
                Ok dayFromServer ->
                    let
                        walkToUpdate : List Data.Day -> List Data.Day
                        walkToUpdate days =
                            case days of
                                day :: rest ->
                                    if day.id == dayFromServer.id then
                                        dayFromServer :: rest

                                    else
                                        day :: walkToUpdate rest

                                [] ->
                                    []
                    in
                    ( model, Done { campaign | days = walkToUpdate campaign.days } )

                Err err ->
                    ( model, Error (Shared.parseGraphqlError err) )

        GotDeleteDay dayToBeDeletedId res ->
            case res of
                Ok _ ->
                    let
                        walkToUpdate : List Data.Day -> List Data.Day
                        walkToUpdate days =
                            case days of
                                day :: rest ->
                                    if day.id == dayToBeDeletedId then
                                        rest

                                    else
                                        day :: walkToUpdate rest

                                [] ->
                                    []
                    in
                    ( model, Done { campaign | days = walkToUpdate campaign.days } )

                Err err ->
                    ( model, Error (Shared.parseGraphqlError err) )



-- VIEW


view : Action -> Model -> Html Msg
view action model =
    case action of
        New ->
            viewNewAndEdit "Neues Tag hinzufügen" action model

        Edit _ ->
            viewNewAndEdit "Tag bearbeiten" action model

        Delete day ->
            viewDelete day


viewNewAndEdit : String -> Action -> Model -> Html Msg
viewNewAndEdit headline action model =
    div [ classes "modal is-active" ]
        [ div [ class "modal-background", onClick CloseForm ] []
        , div [ class "modal-card" ]
            [ form [ onSubmit <| SendDayForm action ]
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


viewDelete : Data.Day -> Html Msg
viewDelete day =
    div [ classes "modal is-active" ]
        [ div [ class "modal-background", onClick CloseForm ] []
        , div [ class "modal-card" ]
            [ header [ class "modal-card-head" ]
                [ p [ class "modal-card-title" ] [ text "Tag löschen" ]
                , button [ class "delete", attribute "aria-label" "close", onClick CloseForm ] []
                ]
            , section [ class "modal-card-body" ]
                [ p [] [ text <| "Wollen Sie den Tag " ++ day.title ++ "wirklich löschen?" ]
                ]
            , footer [ class "modal-card-foot" ]
                [ button [ classes "button is-success", onClick <| SendDayForm (Delete day) ] [ text "Löschen" ]
                , button [ class "button", onClick CloseForm ] [ text "Abbrechen" ]
                ]
            ]
        ]
