app "meier"
    packages {
        pf: "platform/main.roc",
        html: "https://github.com/Hasnep/roc-html/releases/download/v0.2.1/gvFCxQTb3ytGwm7RQ87BVDMHzo7MNIM2uqY4GBDSP7M.tar.br",
        json: "https://github.com/lukewilliamboswell/roc-json/releases/download/0.6.1/-7UaQL9fbi0J3P6nS_qlxTdpDkOu_7CUm4MZzAN9ZUQ.tar.br",
    }
    imports [
        pf.Webserver.{ Event, Request, Response, Command },
        json.Core.{ json },
        Server.Assets,
        Server.Campaign,
        Server.Form,
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

Model : List Campaign

Campaign : {
    title : Str,
    days : List Day,
}

Day : {
    title : Str,
}

init : Model
init =
    []

applyEvents : Model, List Event -> Model
applyEvents = \model, events ->
    events
    |> List.walk
        model
        \state, event -> applyEvent state event

applyEvent = \model, event ->
    decodedEvent = Decode.fromBytes event json
    when decodedEvent is
        Ok dc ->
            when dc.action is
                "addCampaign" ->
                    Server.Campaign.addCampaignEvent model event

                _ -> crash "Oh, no! Bad database with unknow event."

        Err _ -> crash "Oh, no!"

handleReadRequest : Request, Model -> Response
handleReadRequest = \request, model ->
    if request.url == "/" then
        Server.Campaign.campaignListView model
    else if request.url |> Str.startsWith "/assets" then
        Server.Assets.serve request.url
    else if request.url |> Str.startsWith "/openForm" then
        Server.Form.serve request.url
    else
        {
            body: "400 Bad Request" |> Str.toUtf8,
            headers: [],
            status: 400,
        }

handleWriteRequest : Request, Model -> (Response, List Command)
handleWriteRequest = \request, model ->
    responseBody =
        when request.url is
            "/addCampaign" ->
                Server.Campaign.addCampaign request.body model

            _ -> Err NotFound

    when responseBody is
        Ok (body, commands) ->
            (
                {
                    body: body |> Str.toUtf8,
                    headers: [],
                    status: 200,
                },
                commands,
            )

        Err BadRequest ->
            (
                {
                    body: "400 Bad Request" |> Str.toUtf8,
                    headers: [],
                    status: 400,
                },
                [],
            )

        Err NotFound ->
            (
                {
                    body: "404 Not Found" |> Str.toUtf8,
                    headers: [],
                    status: 404,
                },
                [],
            )

expect 42 == 42
