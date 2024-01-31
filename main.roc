app "meier"
    packages {
        pf: "platform/main.roc",
        # json: "https://github.com/lukewilliamboswell/roc-json/releases/download/...",
        html: "https://github.com/Hasnep/roc-html/releases/download/v0.2.0/5fqQTpMYIZkigkDa2rfTc92wt-P_lsa76JVXb8Qb3ms.tar.br",
    }
    imports [
        pf.Webserver.{ Event, Request, Response, Command },
        # json.Core.{ Json },
        html.Html,
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

Model : List Str

init : Model
init =
    ["Tanztage", "Sportfest", "Frei-Lern-Tage", "Winterwoche"]

applyEvents : Model, List Event -> Model
applyEvents = \model, _ ->
    model

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
    when request.url is
        "/addNewCampaign" ->
            Server.Campaign.newCampaign request.body model

        _ ->
            (
                {
                    body: [],
                    headers: [],
                    status: 200,
                },
                [],
            )

expect 42 == 42

expect
    # TODO: Remove this useless test, after https://github.com/Hasnep/roc-html/issues/5 is fixed.
    Html.renderWithoutDocType (Html.text "") == ""
