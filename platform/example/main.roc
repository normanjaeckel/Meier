app "basic"
    packages {
        webserver: "../main.roc",
    }
    imports [webserver.Webserver.{ Event, Request, Response, Command }]
    provides [main, Model] to webserver

Program : {
    init : Model,
    applyEvents : Model, List Event -> Model,
    handleReadRequest : Request, Model -> Response,
    handleWriteRequest : Request, Model -> (Response, List Command),
}

Model : Str

main : Program
main = { init, applyEvents, handleReadRequest, handleWriteRequest }

init : Model
init =
    "hello"

applyEvents : Model, List Event -> Model
applyEvents = \model, events ->
    List.walk events (model) \state, event ->
        Str.concat state event

handleReadRequest : Request, Model -> Response
handleReadRequest = \_request, model -> {
    body: model,
    headers: [],
    status: 200,
}

handleWriteRequest : Request, Model -> (Response, List Command)
handleWriteRequest = \_request, _model ->
    (
        {
            body: "wrote something",
            headers: [],
            status: 500,
        },
        [AddEvent ", something", PrintThisNumber 42],
    )
