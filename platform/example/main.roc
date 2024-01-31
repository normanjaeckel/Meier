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
handleReadRequest = \request, model ->
    allHeaders = List.walk
        request.headers
        ""
        (\state, header ->
            Str.concat state "$(header.name): $(header.value)\n")

    hasBody =
        when request.body is
            EmptyBody -> "no body"
            Body str -> "Body: $(str.body |> Str.fromUtf8 |> Result.withDefault "invalid utf8")"

    url = request.url
    dbg url

    {
        body: Str.concat allHeaders model |> Str.concat hasBody |> Str.concat url |> Str.toUtf8,
        headers: [{ name: "myHeader", value: "myvalue" }],
        status: 200,
    }

handleWriteRequest : Request, Model -> (Response, List Command)
handleWriteRequest = \request, _model ->
    body =
        when request.body is
            EmptyBody -> "empty body" |> Str.toUtf8
            Body b -> b.body
    (
        {
            body: body,
            headers: [{ name: "myHeader", value: "myvalue" }],
            status: 500,
        },
        [AddEvent ", something", PrintThisNumber 42],
    )
