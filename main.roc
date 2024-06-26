app "meier"
    packages {
        pf: "https://oshahn.de/BTMaAYUoV_nQAliSkaBH1RY16JOPWjw_Gm0oF7C5FJA.tar.br",
        html: "vendor/roc-html/src/main.roc", # html: "https://github.com/Hasnep/roc-html/releases/download/v0.3.0/BWz3TyGqkM8lFZy4Ww5cspdEgEAbCwpC60G5HMafNjA.tar.br",
    }
    imports [
        pf.Webserver.{ Request, Response },
        Server.Assets,
        Server.Campaign,
        Server.Modeling,
        Server.Shared.{ response200, response400, response404 },
        "Server/templates/index.html" as index : Str,
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
            _ -> index |> Str.replaceFirst "{% contentPath %}" request.url |> response200

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

        Err NotFound | Err KeyNotFound ->
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
    model = init
    request = rootRequest
    response = handleReadRequest request model
    response.status == 200
