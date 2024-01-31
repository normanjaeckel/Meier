interface Server.Campaign
    exposes [campaignListView, newCampaign]
    imports [
        html.Html.{ a, div, p, renderWithoutDocType, text },
        html.Attribute.{ class },
        "templates/index.html" as index : Str,

    ]

campaignListView = \model ->
    campaigns =
        model
        |> List.map
            \campaign -> campaignCard campaign
        |> Str.joinWith ""

    {
        body: index |> Str.replaceFirst "{% campaigns %}" campaigns |> Str.toUtf8,
        headers: [],
        status: 200,
    }

campaignCard = \campaign ->
    node =
        div [class "column is-one-third"] [
            div [class "card"] [
                div [class "card-header"] [
                    p [class "card-header-title"] [text campaign],
                ],
                div [class "card-content"] [
                    text "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et.",
                ],
                div [class "card-footer"] [
                    a [class "card-footer-item"] [text "Verwalten"],
                    a [class "card-footer-item"] [text "Einstellungen"],
                    a [class "card-footer-item"] [text "Löschen"],
                ],
            ],
        ]

    renderWithoutDocType node

newCampaign = \_body, _model ->
    (
        {
            body: "Error" |> Str.toUtf8,
            headers: [],
            status: 500,
        },
        [],
    )
