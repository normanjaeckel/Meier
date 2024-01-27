app "meier"
    packages {
        pf: "platform/main.roc",
        # json: "https://github.com/lukewilliamboswell/roc-json/releases/download/0.6.0/hJySbEhJV026DlVCHXGOZNOeoOl7468y9F9Buhj0J18.tar.br",
    }
    imports [
        pf.Webserver.{ Event, Request, Response },
        # json.Core.{ Json },
    ]
    provides [main, Model] to pf

Program : {
    init : Model,
    applyEvents : Model, List Event -> Model,
    handleReadRequest : Request, Model -> Response,
    handleWriteRequest : Request, Model -> (Response, List Event),
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
    body = "Request: $(Inspect.toStr request)" |> Str.toUtf8
    {
        body: body,
        headers: [],
        status: 200,
    }

handleWriteRequest : Request, Model -> (Response, List Event)
handleWriteRequest = \_request, _model ->
    (
        {
            body: "Nothing to write" |> Str.toUtf8,
            headers: [],
            status: 500,
        },
        [],
    )
