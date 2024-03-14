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
        Server.Root,
        Server.Modeling,
        Server.Shared.{ response200, response400, response404 },
        # html.Html.{ renderWithoutDocType },
        # json.Core.{ json },
        # Server.Campaign,
        # Server.Form,
        # "Server/templates/index.html" as index : Str,
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
applyEvents = \_model, _events ->
    crash ""

handleReadRequest : Request, Model -> Response
handleReadRequest = \request, model ->
    when request.url |> Str.split "/" is
        ["", ""] -> Server.Root.page model
        ["", "campaign", .. as subPath] -> Server.Campaign.readRequest subPath model
        ["", "assets", .. as subPath] -> Server.Assets.serve subPath
        # ["", "openForm", .. as subPath] ->
        #     when Server.Form.serve subPath model is
        #         Ok body -> response200 body
        #         Err NotFound -> response404
        _ -> response404

handleWriteRequest : Request, Model -> (Response, List Command)
handleWriteRequest = \request, model ->
    responseBody =
        when request.url |> Str.split "/" is
            ["", "campaign", .. as subPath] -> Server.Campaign.writeRequest subPath request.body model
            # ["", "campaign", objId] ->
            #     if request.method == Post then
            #         crash "Not implemented"
            #     else if request.method == Delete then
            #         Server.Campaign.deleteCampaign objId model
            #     else
            #         Err BadRequest
            _ -> Err NotFound

    when responseBody is
        Ok (body, commands) ->
            (response200 body, commands)

        Err BadRequest ->
            (response400, [])

        Err NotFound ->
            (response404, [])

expect
    42 == 42

# Model : List Campaign

# Campaign : {
#     id : Str,
#     title : Str,
#     days : List Day,
# }

# Day : {
#     title : Str,
# }

# init : Model
# init =
#     []

# applyEvents : Model, List Event -> Model
# applyEvents = \model, events ->
#     events
#     |> List.walk
#         model
#         \state, event -> applyEvent state event
#     |> List.sortWith \a, b ->
#         # We switch a and b to make an inverse sorting
#         Num.compare
#             (b.id |> Str.toU64 |> Result.withDefault 0)
#             (a.id |> Str.toU64 |> Result.withDefault 0)

# applyEvent : Model, Event -> Model
# applyEvent = \model, event ->
#     decodedEvent = Decode.fromBytes event json
#     when decodedEvent is
#         Ok dc ->
#             when dc.action is
#                 "addCampaign" ->
#                     Server.Campaign.addCampaignEvent model event

#                 "deleteCampaign" ->
#                     Server.Campaign.deleteCampaignEvent model event

#                 _ -> crash "Oh, no! Bad database with unknown event."

#         Err _ -> crash "Oh, no! Cannot decode event."

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
