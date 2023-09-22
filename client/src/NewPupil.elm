module NewPupil exposing (Effect(..), Model, Msg, init, update, view)

import Api.Mutation
import Data
import Graphql.Http
import Graphql.OptionalArgument
import Html exposing (Html, button, div, form, h1, input, label, text)
import Html.Attributes exposing (attribute, checked, class, placeholder, required, type_, value)
import Html.Events exposing (onCheck, onInput, onSubmit)
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
    = NewPupilFormDataMsg NewPupilFormDataInput
    | SendNewPupilForm Data.Campaign
    | GotNewPupil Data.Campaign (Result (Graphql.Http.Error Data.Pupil) Data.Pupil)


type NewPupilFormDataInput
    = Name String
    | Class String
    | IsSpecial Bool


type Effect
    = None
    | Loading (Cmd Msg)
    | Done Data.Campaign
    | Error String


update : Msg -> Model -> ( Model, Effect )
update msg model =
    case msg of
        NewPupilFormDataMsg newData ->
            let
                updatedModel : Model
                updatedModel =
                    case newData of
                        Name t ->
                            { model | name = t }

                        Class c ->
                            { model | class = c }

                        IsSpecial value ->
                            { model | isSpecial = value }
            in
            ( updatedModel, None )

        SendNewPupilForm campaign ->
            let
                optionalArgs : Api.Mutation.AddPupilOptionalArguments -> Api.Mutation.AddPupilOptionalArguments
                optionalArgs args =
                    { args | special = Graphql.OptionalArgument.Present model.isSpecial }
            in
            ( model
            , Loading <|
                (Api.Mutation.addPupil optionalArgs (Api.Mutation.AddPupilRequiredArguments campaign.id model.name model.class) Data.pupilSelectionSet
                    |> Graphql.Http.mutationRequest Shared.queryUrl
                    |> Graphql.Http.send (GotNewPupil campaign)
                )
            )

        GotNewPupil campaign res ->
            case res of
                Ok pupil ->
                    ( model, Done { campaign | pupils = campaign.pupils ++ [ pupil ] } )

                Err err ->
                    ( model, Error (Shared.parseGraphqlError err) )



-- VIEW


view : Data.Campaign -> Model -> List (Html Msg)
view c model =
    [ h1 [ classes "title is-3" ] [ text "Neue/n Schüler/in hinzufügen" ]
    , div [ class "columns" ]
        [ div [ classes "column is-half-tablet is-one-third-desktop is-one-quarter-widescreen" ]
            [ form [ onSubmit <| SendNewPupilForm c ]
                [ div [ class "field" ]
                    [ div [ class "control" ]
                        [ input
                            [ class "input"
                            , type_ "text"
                            , placeholder "Name"
                            , attribute "aria-label" "Name"
                            , required True
                            , onInput (Name >> NewPupilFormDataMsg)
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
                            , onInput (Class >> NewPupilFormDataMsg)
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
                                , onCheck (IsSpecial >> NewPupilFormDataMsg)
                                , checked model.isSpecial
                                ]
                                []
                            , text "Besondere/r Schüler/in"
                            ]
                        ]
                    ]
                , div [ class "field" ]
                    [ button [ classes "button is-primary", type_ "submit" ] [ text "Hinzufügen" ] ]
                ]
            ]
        ]
    ]
