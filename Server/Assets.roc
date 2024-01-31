interface Server.Assets
    exposes [serve]
    imports [
        "assets/bulma/css/bulma.min.css" as bulma : List U8,
        "assets/htmx/js/htmx.min.js" as htmx : List U8,
    ]

serve = \url ->
    when url is
        "/assets/bulma/css/bulma.min.css" ->
            { body: bulma, headers: [{ name: "Content-Type", value: "text/css" }], status: 200 }

        "/assets/htmx/js/htmx.min.js" ->
            { body: htmx, headers: [{ name: "Content-Type", value: "text/javascript" }], status: 200 }

        _ ->
            { body: "404 Not Found" |> Str.toUtf8, headers: [], status: 404 }
