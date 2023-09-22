module Event.New exposing (Effect(..), Msg, update, view)

import Api.Mutation
import Data
import Event.Form exposing (Msg(..))
import Graphql.Http
import Html exposing (Html)
import Shared


type Msg
    = FormMsg Event.Form.Msg
    | GotNewEvent (Result (Graphql.Http.Error Data.Event) Data.Event)


type Effect
    = None
    | Loading (Cmd Msg)
    | Done Data.Campaign
    | Error String


update : Data.Campaign -> Msg -> Event.Form.Model -> ( Event.Form.Model, Effect )
update campaign msg model =
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
                    ( model
                    , Loading <|
                        (Api.Mutation.addEvent (Api.Mutation.AddEventRequiredArguments campaign.id model.title [] model.capacity model.maxSpecialPupils) Data.eventSelectionSet
                            |> Graphql.Http.mutationRequest Shared.queryUrl
                            |> Graphql.Http.send GotNewEvent
                        )
                    )

                Event.Form.Close ->
                    ( model, Done campaign )

        GotNewEvent res ->
            case res of
                Ok event ->
                    ( model, Done { campaign | events = campaign.events ++ [ event ] } )

                Err err ->
                    ( model, Error (Shared.parseGraphqlError err) )


view : Event.Form.Model -> List (Html Msg)
view model =
    Event.Form.modalWithForm "Neues Angebot hinzufügen" model |> List.map (Html.map FormMsg)
