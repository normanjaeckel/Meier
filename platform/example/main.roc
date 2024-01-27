app "basic"
    packages {
        webserver: "../main.roc",
    }
    imports [webserver.Webserver.{ Event, Request, Response }]
    provides [main, Model] to webserver

Program : {
    init : Model,
    applyEvents : Model, List Event -> Model,
    handleReadRequest : Request, Model -> Response,
    handleWriteRequest : Request, Model -> (Response, List Event),
}

Model : Str

main : Program
main = { init, applyEvents, handleReadRequest, handleWriteRequest }

init : Model
init =
    "hello"

applyEvents : Model, List Event -> Model
applyEvents = \model, _ ->
    Str.concat model " world"

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
