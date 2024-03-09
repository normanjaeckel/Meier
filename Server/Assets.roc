interface Server.Assets
    exposes [serve]
    imports [
        "assets/styles.css" as styles : List U8,
        "assets/bulma/bulma.min.css" as bulma : List U8,
        "assets/htmx/htmx.min.js" as htmx : List U8,
        "assets/_hyperscript/_hyperscript.min.js" as hyperscript : List U8,
    ]

serve = \url ->
    when url is
        ["styles.css"] ->
            { body: styles, headers: [{ name: "Content-Type", value: "text/css" }], status: 200 }

        ["bulma", "bulma.min.css"] ->
            { body: bulma, headers: [{ name: "Content-Type", value: "text/css" }], status: 200 }

        ["htmx", "htmx.min.js"] ->
            { body: htmx, headers: [{ name: "Content-Type", value: "text/javascript" }], status: 200 }

        ["_hyperscript", "_hyperscript.min.js"] ->
            { body: hyperscript, headers: [{ name: "Content-Type", value: "text/javascript" }], status: 200 }

        _ ->
            { body: "404 Not Found" |> Str.toUtf8, headers: [], status: 404 }
