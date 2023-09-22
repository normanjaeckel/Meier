module Event.Edit exposing (Effect(..), Msg(..), update, view)

import Api.Mutation
import Data
import Event.Form
import Graphql.Http
import Html exposing (Html)
import Shared


type Msg
    = FormMsg Event.Form.Msg
    | GotUpdatedEvent (Result (Graphql.Http.Error Data.Event) Data.Event)


type Effect
    = None
    | Loading (Cmd Msg)
    | Done Data.Campaign
    | Error String


update : Data.Campaign -> Data.Event -> Msg -> Event.Form.Model -> ( Event.Form.Model, Effect )
update campaign e msg model =
    case msg of
        FormMsg innerMsg ->
            let
                ( updatedModel, effect ) =
                    Event.Form.update innerMsg model
            in
            case effect of
                Event.Form.None ->
                    ( updatedModel, None )

                Event.Form.Send ->
                    let
                        optionalArgs : Api.Mutation.UpdateEventOptionalArguments -> Api.Mutation.UpdateEventOptionalArguments
                        optionalArgs args =
                            args
                    in
                    ( model
                    , Loading <|
                        (Api.Mutation.updateEvent optionalArgs (Api.Mutation.UpdateEventRequiredArguments e.id) Data.eventSelectionSet
                            |> Graphql.Http.mutationRequest Shared.queryUrl
                            |> Graphql.Http.send GotUpdatedEvent
                        )
                    )

                Event.Form.Close ->
                    ( model, Done campaign )

        GotUpdatedEvent res ->
            case res of
                Ok event ->
                    -- TODO: Update event
                    ( model, Done { campaign | events = campaign.events ++ [] } )

                Err err ->
                    ( model, Error (Shared.parseGraphqlError err) )


view : Data.Event -> Event.Form.Model -> List (Html Msg)
view e model =
    Event.Form.modalWithForm "Angebot bearbeiten" model |> List.map (Html.map FormMsg)
