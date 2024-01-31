app "meier"
    packages {
        pf: "platform/main.roc",
        # json: "https://github.com/lukewilliamboswell/roc-json/releases/download/...",
        html: "https://github.com/Hasnep/roc-html/releases/download/v0.2.0/5fqQTpMYIZkigkDa2rfTc92wt-P_lsa76JVXb8Qb3ms.tar.br",
    }
    imports [
        pf.Webserver.{ Event, Request, Response, Command },
        # json.Core.{ Json },
        html.Html.{ a, div, p, text },
        html.Attribute.{ class },
        "templates/index.html" as index : Str,
        "assets/bulma-0.9.4/bulma/css/bulma.min.css" as bulma : List U8,
        "assets/htmx-1.9.10/htmx/js/htmx.min.js" as htmx : List U8,
    ]
    provides [main, Model] to pf

Program : {
    init : Model,
    applyEvents : Model, List Event -> Model,
    handleReadRequest : Request, Model -> Response,
    handleWriteRequest : Request, Model -> (Response, List Command),
}

main : Program
main =
    { init, applyEvents, handleReadRequest, handleWriteRequest }

Model : List Str

init : Model
init =
    ["Tanztage", "Sportfest", "Frei-Lern-Tage", "Winterwoche"]

applyEvents : Model, List Event -> Model
applyEvents = \model, _ ->
    model

handleReadRequest : Request, Model -> Response
handleReadRequest = \request, model ->
    if request.url == "/" then
        {
            body: campaignListView model,
            headers: [],
            status: 200,
        }
    else if request.url |> Str.startsWith "/assets" then
        handleAssets request
    else
        {
            body: "400 Bad Request" |> Str.toUtf8,
            headers: [],
            status: 400,
        }

handleAssets = \request ->
    when request.url is
        "/assets/bulma-0.9.4/bulma/css/bulma.min.css" ->
            { body: bulma, headers: [{ name: "Content-Type", value: "text/css" }], status: 200 }

        "/assets/htmx-1.9.10/htmx/js/htmx.min.js" ->
            { body: htmx, headers: [{ name: "Content-Type", value: "text/javascript" }], status: 200 }

        _ ->
            { body: "404 Not Found" |> Str.toUtf8, headers: [], status: 404 }

handleWriteRequest : Request, Model -> (Response, List Command)
handleWriteRequest = \_request, _model ->
    (
        {
            body: "Nothing to write" |> Str.toUtf8,
            headers: [],
            status: 500,
        },
        [],
    )

campaignListView = \model ->
    campaigns =
        model
        |> List.map
            \campaign -> campaignCard campaign
        |> Str.joinWith ""

    index
    |> Str.replaceFirst "{% campaigns %}" campaigns
    |> Str.toUtf8

campaignCard = \campaign ->
    node =
        div [class "column is-one-third"] [
            div [class "card"] [
                div [class "card-header"] [
                    p [class "card-header-title"] [text campaign],
                ],
                div [class "card-content"] [
                    text "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et.",
                ],
                div [class "card-footer"] [
                    a [class "card-footer-item"] [text "Verwalten"],
                    a [class "card-footer-item"] [text "Einstellungen"],
                    a [class "card-footer-item"] [text "Löschen"],
                ],
            ],
        ]

    Html.renderWithoutDocType node

expect 42 == 42
