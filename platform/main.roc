platform "webserver"
    requires { Model } { main : _ }
    exposes []
    packages {}
    imports [Webserver.{Event, Request, Response}]
    provides [mainForHost]



ProgramForHost : {
    init : Box Model,
    applyEvents : Box Model, List Event -> Box Model,
    handleReadRequest : Request, Box Model -> Response,
    handleWriteRequest : Request, Model -> (Response, List Event),
}

mainForHost : ProgramForHost
mainForHost = { 
    init, 
    applyEvents, 
    handleReadRequest: handleReadRequest, 
    handleWriteRequest: main.handleWriteRequest,
}

init : Box Model
init =
    main.init
    |> Box.box

applyEvents : Box Model, List Event -> Box Model
applyEvents = \boxedModel, events ->
    main.applyEvents (Box.unbox boxedModel) events
    |> Box.box

handleReadRequest : Request, Box Model -> Response
handleReadRequest = \request, boxedModel ->
    main.handleReadRequest request (Box.unbox boxedModel)
