module Shared exposing (classes, parseError, parseGraphqlError, queryUrl)

import Graphql.Http
import Html
import Html.Attributes
import Http


queryUrl : String
queryUrl =
    "/query"


{-| This helper takes a string with class names separated by one whitespace. All
classes are applied to the result.

    import Html exposing (..)

    view : Model -> Html msg
    view model =
        div [ classes "center with-border nice-color" ] [ text model.content ]

-}
classes : String -> Html.Attribute msg
classes s =
    let
        cl : List ( String, Bool )
        cl =
            String.split " " s |> List.map (\c -> ( c, True ))
    in
    Html.Attributes.classList cl


parseError : Http.Error -> String
parseError err =
    case err of
        Http.BadUrl m ->
            "bad url: " ++ m

        Http.Timeout ->
            "timeout"

        Http.NetworkError ->
            "network error"

        Http.BadStatus code ->
            "bad status: " ++ String.fromInt code

        Http.BadBody m ->
            "bad body: " ++ m


parseGraphqlError : Graphql.Http.Error a -> String
parseGraphqlError _ =
    "graphqlError but is not parsed"
