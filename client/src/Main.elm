module Main exposing (main)

import Browser
import Html exposing (..)
import Html.Attributes exposing (attribute, class, href, id, type_)


main : Program () number msg
main =
    Browser.sandbox { init = 0, update = update, view = view }



-- UPDATE


update : a -> b -> number
update _ _ =
    0



-- VIEW


view : a -> Html msg
view _ =
    div []
        [ navbar
        , mainContainer
        ]


navbar : Html msg
navbar =
    nav [ classes "navbar navbar-expand-md navbar-dark fixed-top bg-dark mb-4" ]
        [ div [ class "container-fluid" ]
            [ a [ class "navbar-brand", href "#" ] [ text "Start" ]
            , button
                [ class "navbar-toggler"
                , type_ "button"
                , attribute "data-bs-toggle" "collapse"
                , attribute "data-bs-target" "#navbarCollapse"
                , attribute "aria-controls" "navbarCollapse"
                , attribute "aria-expanded" "false"
                , attribute "aria-label" "Toggle navigation"
                ]
                [ span [ class "navbar-toggler-icon" ] []
                ]
            , div [ classes "collapse navbar-collapse", id "navbarCollapse" ]
                [ ul [ classes "navbar-nav me-auto mb-2 mb-md-0" ]
                    [ li [ class "nav-item" ] [ a [ classes "nav-link", href "#classes" ] [ text "Klassen" ] ]
                    , li [ class "nav-item" ] [ a [ classes "nav-link", href "#events" ] [ text "Projektgruppen" ] ]
                    , li [ class "nav-item" ] [ a [ classes "nav-link", href "#pupils" ] [ text "Schüler/Schülerinnen" ] ]
                    , li [ class "nav-item" ] [ a [ classes "nav-link", href "#result" ] [ text "Ergebnis" ] ]
                    , li [ class "nav-item" ] [ a [ classes "nav-link", href "#admin" ] [ text "Administration" ] ]
                    ]
                ]
            ]
        ]


mainContainer : Html msg
mainContainer =
    main_ [ class "container" ]
        []


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
