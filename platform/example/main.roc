app "basic"
    packages {
        webserver: "../main.roc",
    }
    imports [webserver.Webserver.{Event, Request, Response}]
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
handleReadRequest = \request, model ->
    {}

handleWriteRequest : Request, Model -> (Response, List Event)
handleWriteRequest = \request, model ->
    ({}, [])
