interface Server.Root
    exposes [page]
    imports [
        html.Html.{ renderWithoutDocType },
        pf.Webserver.{ Response },
        Server.Campaign,
        Server.Modeling.{ Model },
        Server.Shared.{ response200 },
        "templates/index.html" as index : Str,
    ]

page : Model -> Response
page = \model ->
    body =
        index
        |> Str.replaceFirst
            "{% content %}"
            (Server.Campaign.listView model |> renderWithoutDocType)
    response200 body
