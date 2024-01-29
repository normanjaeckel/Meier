app "meier"
    packages {
        pf: "platform/main.roc",
        # json: "https://github.com/lukewilliamboswell/roc-json/releases/download/...",
        # html: "https://github.com/Hasnep/roc-html/releases/download/v0.2.0/5fqQTpMYIZkigkDa2rfTc92wt-P_lsa76JVXb8Qb3ms.tar.br",
    }
    imports [
        pf.Webserver.{ Event, Request, Response, Command },
        # json.Core.{ Json },
        # html.Html,
        "templates/index.html" as index : Str,
        "assets/bulma-0.9.4/bulma/css/bulma.min.css" as bulma : Str,
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

Model : Str

init : Model
init =
    "Hello"

applyEvents : Model, List Event -> Model
applyEvents = \model, _ ->
    Str.concat model ", World!"

handleReadRequest : Request, Model -> Response
handleReadRequest = \request, _model ->
    if request.url == "/" then
        {
            body: index,
            headers: [],
            status: 200,
        }
    else if request.url |> Str.startsWith "/assets" then
        handleAssets request
    else
        {
            body: "400 Bad Request",
            headers: [],
            status: 400,
        }

handleAssets = \request ->
    when request.url is
        "/assets/bulma-0.9.4/bulma/css/bulma.min.css" ->
            { body: bulma, headers: [], status: 200 }

        _ ->
            { body: "404 Not Found", headers: [], status: 404 }

handleWriteRequest : Request, Model -> (Response, List Command)
handleWriteRequest = \_request, _model ->
    (
        {
            body: "Nothing to write",
            headers: [],
            status: 500,
        },
        [],
    )

expect 42 == 42
