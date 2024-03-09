app "meier"
    packages {
        pf: "platform/main.roc",
        html: "https://github.com/Hasnep/roc-html/releases/download/v0.3.0/BWz3TyGqkM8lFZy4Ww5cspdEgEAbCwpC60G5HMafNjA.tar.br",
        json: "https://github.com/lukewilliamboswell/roc-json/releases/download/0.6.3/_2Dh4Eju2v_tFtZeMq8aZ9qw2outG04NbkmKpFhXS_4.tar.br",
    }
    imports [
        pf.Webserver.{ Event, Request, Response, Command },
        html.Html.{ renderWithoutDocType },
        json.Core.{ json },
        Server.Assets,
        Server.Campaign,
        Server.Form,
        "Server/templates/index.html" as index : Str,
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
    id : Str,
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
    |> List.sortWith \a, b ->
        # We switch a and b to make an inverse sorting
        Num.compare
            (b.id |> Str.toU64 |> Result.withDefault 0)
            (a.id |> Str.toU64 |> Result.withDefault 0)

applyEvent : Model, Event -> Model
applyEvent = \model, event ->
    decodedEvent = Decode.fromBytes event json
    when decodedEvent is
        Ok dc ->
            when dc.action is
                "addCampaign" ->
                    Server.Campaign.addCampaignEvent model event

                _ -> crash "Oh, no! Bad database with unknown event."

        Err _ -> crash "Oh, no! Cannot decode event."

handleReadRequest : Request, Model -> Response
handleReadRequest = \request, model ->
    when request.url |> Str.split "/" is
        ["", ""] -> rootPage model
        ["", "assets", .. as subPath] -> Server.Assets.serve subPath
        ["", "openForm", .. as subPath] ->
            when Server.Form.serve subPath model is
                Ok body -> response200 body
                Err NotFound -> response404

        _ -> response400

rootPage : Model -> Response
rootPage = \model ->
    body =
        index
        |> Str.replaceFirst
            "{% content %}"
            (Server.Campaign.campaignListView model |> renderWithoutDocType)
    response200 body

handleWriteRequest : Request, Model -> (Response, List Command)
handleWriteRequest = \request, model ->
    responseBody =
        when request.url is
            "/addCampaign" ->
                Server.Campaign.addCampaign request.body model

            "/editCampaign" ->
                Err NotFound

            _ -> Err NotFound

    when responseBody is
        Ok (body, commands) ->
            (response200 body, commands)

        Err BadRequest ->
            (response400, [])

        Err NotFound ->
            (response404, [])

response200 : Str -> Response
response200 = \body ->
    { body: body |> Str.toUtf8, headers: [], status: 200 }

response400 : Response
response400 =
    { body: "400 Bad Request" |> Str.toUtf8, headers: [], status: 400 }

response404 : Response
response404 =
    { body: "404 Not Found" |> Str.toUtf8, headers: [], status: 404 }

# Testing

rootRequest = {
    method: Get,
    headers: [],
    url: "/",
    body: EmptyBody,
    timeout: NoTimeout,
}

expect
    model = []
    request = rootRequest
    response = handleReadRequest request model
    response.status == 200
