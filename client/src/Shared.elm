module Shared exposing (classes, parseGraphqlError, queryUrl)

import Graphql.Http
import Graphql.Http.GraphqlError
import Html
import Html.Attributes
import Json.Decode


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



-- parseError : Http.Error -> String
-- parseError err =
--     case err of
--         Http.BadUrl m ->
--             "bad url: " ++ m
--         Http.Timeout ->
--             "timeout"
--         Http.NetworkError ->
--             "network error"
--         Http.BadStatus code ->
--             "bad status: " ++ String.fromInt code
--         Http.BadBody m ->
--             "bad body: " ++ m


parseGraphqlError : Graphql.Http.Error a -> String
parseGraphqlError err =
    case err of
        Graphql.Http.HttpError httpErr ->
            case httpErr of
                Graphql.Http.BadUrl m ->
                    "bad url: " ++ m

                Graphql.Http.Timeout ->
                    "timeout"

                Graphql.Http.NetworkError ->
                    "network error"

                Graphql.Http.BadStatus _ code ->
                    "bad status: " ++ code

                Graphql.Http.BadPayload e ->
                    "bad payload: " ++ Json.Decode.errorToString e

        Graphql.Http.GraphqlError ppd gErrs ->
            let
                errMsg : String
                errMsg =
                    gErrs |> List.map fn |> String.join ","

                fn : Graphql.Http.GraphqlError.GraphqlError -> String
                fn e =
                    e.message
            in
            "graphql error: " ++ errMsg
