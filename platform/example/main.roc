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

Model : List U8

main : Program
main = { init, applyEvents, handleReadRequest, handleWriteRequest }

init : Model
init =
    "hello" |> Str.toUtf8

applyEvents : Model, List Event -> Model
applyEvents = \model, events ->
    List.walk events (model) \state, event ->
        List.concat state event

handleReadRequest : Request, Model -> Response
handleReadRequest = \request, model ->
    allHeaders =
        List.walk
            request.headers
            ""
            (\state, header ->
                Str.concat state "$(header.name): $(header.value)\n")
        |> Str.toUtf8

    hasBody =
        (
            when request.body is
                EmptyBody -> "no body"
                Body str -> "Body: $(str.body |> Str.fromUtf8 |> Result.withDefault "invalid utf8")"
        )
        |> Str.toUtf8

    url = request.url |> Str.toUtf8
    dbg url

    {
        body: List.concat allHeaders model |> List.concat hasBody |> List.concat url,
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
        [AddEvent (", something" |> Str.toUtf8), PrintThisNumber 42],
    )
