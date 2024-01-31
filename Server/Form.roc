interface Server.Form
    exposes [serve]
    imports [
        html.Html.{ div, button, footer, form, header, input, p, renderWithoutDocType, section, text },
        html.Attribute.{ attribute, class, max, min, name, placeholder, required, type, value },
    ]

hyperscript =
    attribute "_"

onClickCloseModal =
    hyperscript "on click remove the closest .modal"

ariaLabel =
    attribute "aria-label"

serve = \url ->
    when url is
        "/openForm/newCampaign" ->
            renderedNode =
                div [class "modal is-active"] [
                    div [class "modal-background", onClickCloseModal] [],
                    div [class "modal-card"] [
                        form [(attribute "hx-post") "/addNewCampaign", (attribute "hx-disabled-elt") "button"] [
                            header [class "modal-card-head"] [
                                p [class "modal-card-title"] [text "Neue Kampagne hinzufügen"],
                                button [class "delete", type "button", ariaLabel "close", onClickCloseModal] [],
                            ],
                            section [class "modal-card-body"] [
                                div [class "field"] [
                                    div [class "control"] [
                                        input
                                            [
                                                class "input",
                                                type "text",
                                                placeholder "Titel",
                                                ariaLabel "Titel",
                                                required "",
                                                name "title",
                                            ]
                                            [],
                                    ],
                                ],
                                div [class "field"] [
                                    div [class "control"] [
                                        input
                                            [
                                                class "input",
                                                type "number",
                                                ariaLabel "Anzahl der Tage",
                                                min "1",
                                                max "10",
                                                name "numOfDays",
                                                value "2",
                                            ]
                                            [],
                                    ],
                                    p [class "help"] [text "Anzahl der Tage"],
                                ],
                            ],
                            footer [class "modal-card-foot"] [
                                button [class "button is-success", type "submit"] [text "Speichern"],
                                button [class "button", type "button", onClickCloseModal] [text "Abbrechen"],
                            ],
                        ],
                    ],
                ]
                |> renderWithoutDocType

            {
                body: renderedNode |> Str.toUtf8,
                headers: [],
                status: 200,
            }

        _ ->
            {
                body: "400 Bad Request" |> Str.toUtf8,
                headers: [],
                status: 400,
            }

