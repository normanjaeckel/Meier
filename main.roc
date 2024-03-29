app "meier"
    packages {
        pf: "platform/main.roc",
        html: "vendor/roc-html/src/main.roc", # html: "https://github.com/Hasnep/roc-html/releases/download/v0.3.0/BWz3TyGqkM8lFZy4Ww5cspdEgEAbCwpC60G5HMafNjA.tar.br",
        json: "vendor/roc-json/package/main.roc", # json: "https://github.com/lukewilliamboswell/roc-json/releases/download/0.6.3/_2Dh4Eju2v_tFtZeMq8aZ9qw2outG04NbkmKpFhXS_4.tar.br",
    }
    imports [
        pf.Webserver.{ Event, Request, Response, Command },
        Server.Assets,
        Server.Campaign,
        Server.Modeling,
        Server.Shared.{ response200, response400, response404 },
        json.Core.{ json },
        "Server/templates/index.html" as index : Str,
    ]
    provides [main, Model] to pf

Model : Server.Modeling.Model

Program : {
    init : Model,
    applyEvents : Model, List Event -> Model,
    handleReadRequest : Request, Model -> Response,
    handleWriteRequest : Request, Model -> (Response, List Command),
}

main : Program
main =
    { init, applyEvents, handleReadRequest, handleWriteRequest }

init : Model
init =
    Server.Modeling.init

applyEvents : Model, List Event -> Model
applyEvents = \model, events ->
    events
    |> List.walk
        model
        \state, event -> applyEvent state event

applyEvent : Model, Event -> Model
applyEvent = \model, event ->
    decodedEvent : Result { action : Str } _
    decodedEvent = Decode.fromBytes event json
    when decodedEvent is
        Ok dc ->
            when dc.action |> Str.split "." is
                ["campaign", .. as subPath] ->
                    Server.Campaign.applyEvent model subPath event

                _ -> crash "Oh, no! Bad database with unknown event."

        Err _ -> crash "Oh, no! Cannot decode event."

handleReadRequest : Request, Model -> Response
handleReadRequest = \request, model ->
    isHxRequest =
        (request.headers |> List.contains { name: "Hx-Request", value: "true" })
        &&
        !(request.headers |> List.contains { name: "Hx-History-Restore-Request", value: "true" })

    if isHxRequest then
        when request.url |> Str.split "/" is
            ["", ""] ->
                # The url / is the same as /campaign.
                Server.Campaign.readRequest [] model

            ["", "campaign", .. as subPath] -> Server.Campaign.readRequest subPath model
            _ -> response404
    else
        when request.url |> Str.split "/" is
            ["", "assets", .. as subPath] -> Server.Assets.serve subPath
            _ -> index |> response200

handleWriteRequest : Request, Model -> (Response, List Command)
handleWriteRequest = \request, model ->
    responseBody =
        when request.url |> Str.split "/" is
            ["", "campaign", .. as subPath] -> Server.Campaign.writeRequest subPath request.body model
            _ -> Err NotFound

    when responseBody is
        Ok (body, commands) ->
            (response200 body, commands)

        Err BadRequest ->
            (response400, [])

        Err NotFound | Err KeyNotFound ->
            (response404, [])

# Testing

rootRequest = {
    method: Get,
    headers: [],
    url: "/",
    body: EmptyBody,
    timeout: NoTimeout,
}

expect
    model = init
    request = rootRequest
    response = handleReadRequest request model
    response.status == 200
