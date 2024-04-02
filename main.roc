app "meier"
    packages {
        pf: "https://oshahn.de/BTMaAYUoV_nQAliSkaBH1RY16JOPWjw_Gm0oF7C5FJA.tar.br",
        html: "vendor/roc-html/src/main.roc", # html: "https://github.com/Hasnep/roc-html/releases/download/v0.3.0/BWz3TyGqkM8lFZy4Ww5cspdEgEAbCwpC60G5HMafNjA.tar.br",
    }
    imports [
        pf.Webserver.{ Request, Response },
        Server.Assets,
        Server.Campaign,
        Server.Root,
        Server.Modeling,
        Server.Shared.{ response200, response400, response404 },
    ]
    provides [main, Model] to pf

Model : Server.Modeling.Model

Program : {
    init : Model,
    handleReadRequest : Request, Model -> Response,
    handleWriteRequest : Request, Model -> (Response, Model),
}

main : Program
main =
    { init, handleReadRequest, handleWriteRequest }

init : Model
init =
    Server.Modeling.init

handleReadRequest : Request, Model -> Response
handleReadRequest = \request, model ->
    when request.url |> Str.split "/" is
        ["", ""] -> Server.Root.page model
        ["", "campaign", .. as subPath] -> Server.Campaign.readRequest subPath model
        ["", "assets", .. as subPath] -> Server.Assets.serve subPath
        _ -> response404

handleWriteRequest : Request, Model -> (Response, Model)
handleWriteRequest = \request, model ->
    responseBody =
        when request.url |> Str.split "/" is
            ["", "campaign", .. as subPath] -> Server.Campaign.writeRequest subPath request.body model
            _ -> Err NotFound

    when responseBody is
        Ok (body, newModel) ->
            (response200 body, newModel)

        Err BadRequest ->
            (response400, model)

        Err NotFound ->
            (response404, model)

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
