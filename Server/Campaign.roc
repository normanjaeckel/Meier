interface Server.Campaign
    exposes [
        listView,
        readRequest,
        writeRequest,
    ]
    imports [
        html.Html.{ Node, a, button, div, header, footer, form, input, li, p, renderWithoutDocType, section, text, ul },
        html.Attribute.{ attribute, class, id, max, min, name, placeholder, required, type, value },
        pf.Webserver.{ RequestBody, Response },
        Server.Modeling.{ Model, CampaignID },
        Server.Shared.{
            addAttribute,
            ariaLabel,
            bodyToFields,
            onClickCloseModal,
            response200,
            response404,
        },
    ]

# Read

readRequest : List Str, Model -> Response
readRequest = \path, model ->
    when path is
        [] ->
            listView model |> renderWithoutDocType |> response200

        ["create"] ->
            renderWithoutDocType createCampaignForm |> response200

        [campaignId, "update"] ->
            when updateCampaignForm campaignId model is
                Ok node -> renderWithoutDocType node |> response200
                Err KeyNotFound -> response404

        [campaignId, "days"] ->
            when updateDaysForm campaignId model is
                Ok node -> renderWithoutDocType node |> response200
                Err KeyNotFound -> response404

        [campaignId, .. as subPageName] ->
            subPage =
                when subPageName is
                    ["events"] -> Events
                    _ -> Days
            when detailView campaignId model subPage is
                Ok node ->
                    renderWithoutDocType node |> response200

                Err KeyNotFound -> response404

        _ -> response404

listView : Model -> Node
listView = \model ->
    campaigns =
        model
        |> Dict.map
            \campaignId, campaign -> campaignCard campaignId campaign.title (List.len campaign.days)
        |> Dict.values
        |> List.reverse

    campaignsAndCreateCampaignCard =
        [
            div
                [
                    id "createCampaignCard",
                    class "column is-half is-one-third-desktop is-one-quarter-fullhd",
                    (attribute "hx-get") "/campaign/create",
                    (attribute "hx-target") "#formModal",
                ]
                [
                    div [class "card is-flex"] [
                        div [class "card-content is-flex-grow-1 has-background-primary is-flex is-align-items-center"] [
                            p [class "is-size-3 has-text-centered"] [
                                a [class "has-text-white"] [text "Kampagne anlegen"],
                            ],
                        ],
                    ],
                ],
        ]
        |> List.concat campaigns

    div [] [
        section [class "hero is-primary"] [
            div [class "hero-body"] [
                p [class "title"] [text "Alle Kampagnen"],
                p [class "subtitle"] [text "Projektgruppenverteilung"],
            ],
        ],
        section [class "section"] [
            div [class "container"] [
                div [class "columns is-multiline"] campaignsAndCreateCampaignCard,
            ],
        ],
    ]

campaignCard : CampaignID, Str, U64 -> Node
campaignCard = \campaignId, title, numOfDays ->
    div [id "campaign-$(campaignId)", class "column is-half is-one-third-desktop is-one-quarter-fullhd"] [
        div [class "card is-flex is-flex-direction-column"] [
            div [class "card-header"] [
                p [class "card-header-title"] [text title],
            ],
            div [class "card-content is-flex-grow-1"] [
                text "Anzahl der Tage: $(Num.toStr numOfDays)",
            ],
            div [class "card-footer"] [
                a
                    [
                        class "card-footer-item",
                        (attribute "hx-get") "/campaign/$(campaignId)",
                        (attribute "hx-target") "#mainContent",
                        (attribute "hx-push-url") "true",
                    ]
                    [text "Verwalten"],
                a
                    [
                        class "card-footer-item",
                        (attribute "hx-get") "/campaign/$(campaignId)/update",
                        (attribute "hx-target") "#formModal",
                    ]
                    [text "Einstellungen"],
                a
                    [
                        class "card-footer-item",
                        (attribute "hx-confirm") "Wollen Sie die Kampagne wirklich löschen?",
                        (attribute "hx-post") "/campaign/$(campaignId)/delete",
                        (attribute "hx-target") "#campaign-$(campaignId)",
                        (attribute "hx-swap") "delete",
                    ]
                    [text "Löschen"],
            ],
        ],
    ]

Subpage : [Days, Events, Classes, Pupils, Assignments]

detailView : CampaignID, Model, Subpage -> Result Node [KeyNotFound]
detailView = \campaignId, model, _subPage ->
    campaign <- model |> Dict.get campaignId |> Result.map

    div [] [
        section [class "hero is-primary"] [
            div [class "hero-body"] [
                p [class "title"] [text campaign.title],
                p [class "subtitle"] [text "Projektgruppenverteilung"],
            ],
        ],
        section [class "section"] [
            div [class "container"] [
                breadcrumb campaign.title,
                div [class "columns is-multiline"] [
                    div [class "column is-half is-one-third-desktop is-one-quarter-fullhd"] [
                        div [class "card"] [
                            div [class "card-header"] [p [class "card-header-title"] [text "Tage"]],
                            div [class "card-content"] [text "content"],
                            div [class "card-footer"] [
                                a
                                    [
                                        class "card-footer-item",
                                        (attribute "hx-get") "/campaign/$(campaignId)/days",
                                        (attribute "hx-target") "#formModal",
                                    ]
                                    [text "Verwalten"],
                            ],
                        ],
                    ],
                    div [class "column is-half is-one-third-desktop is-one-quarter-fullhd"] [
                        div [class "card"] [
                            div [class "card-header"] [p [class "card-header-title"] [text "Angebote"]],
                            div [class "card-content"] [text "content"],
                            div [class "card-footer"] [
                                a
                                    [
                                        class "card-footer-item",
                                    ]
                                    [text "Verwalten"],
                            ],
                        ],
                    ],
                    div [class "column is-half is-one-third-desktop is-one-quarter-fullhd"] [
                        div [class "card"] [
                            div [class "card-header"] [p [class "card-header-title"] [text "Klassen"]],
                            div [class "card-content"] [text "content"],
                            div [class "card-footer"] [
                                a
                                    [
                                        class "card-footer-item",
                                    ]
                                    [text "Verwalten"],
                            ],
                        ],
                    ],
                    div [class "column is-half is-one-third-desktop is-one-quarter-fullhd"] [
                        div [class "card"] [
                            div [class "card-header"] [p [class "card-header-title"] [text "Schüler/innen"]],
                            div [class "card-content"] [text "content"],
                            div [class "card-footer"] [
                                a
                                    [
                                        class "card-footer-item",
                                    ]
                                    [text "Verwalten"],
                            ],
                        ],
                    ],
                    div [class "column is-half is-one-third-desktop is-one-quarter-fullhd"] [
                        div [class "card"] [
                            div [class "card-header"] [p [class "card-header-title"] [text "Zurordnung"]],
                            div [class "card-content"] [text "content"],
                            div [class "card-footer"] [
                                a
                                    [
                                        class "card-footer-item",
                                    ]
                                    [text "Verwalten"],
                            ],
                        ],
                    ],

                ],
            ],
        ],
    ]

breadcrumb : Str -> Node
breadcrumb = \title ->
    div [class "breadcrumb has-dot-separator", ariaLabel "breadcrumbs"] [
        ul [] [
            li [] [
                a
                    [
                        (attribute "hx-get") "/",
                        (attribute "hx-target") "#mainContent",
                        (attribute "hx-push-url") "true",

                    ]
                    [text "Start"],
            ],
            li [class "is-active"] [a [] [text title]],
        ],
    ]

createCampaignForm : Node
createCampaignForm =
    formAttributes = [
        (attribute "hx-post") "/campaign/create",
        (attribute "hx-disabled-elt") "button",
        (attribute "hx-target") "closest .modal",
        (attribute "hx-swap") "delete",
    ]

    div [class "modal is-active"] [
        div [class "modal-background", onClickCloseModal] [],
        div [class "modal-card"] [
            form formAttributes [
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

updateCampaignForm : CampaignID, Model -> Result Node [KeyNotFound]
updateCampaignForm = \campaignId, model ->
    campaign <- model |> Dict.get campaignId |> Result.map

    formAttributes = [
        (attribute "hx-post") "/campaign/$(campaignId)/update",
        (attribute "hx-disabled-elt") "button",
        (attribute "hx-target") "closest .modal",
        (attribute "hx-swap") "delete",
    ]

    div [class "modal is-active"] [
        div [class "modal-background", onClickCloseModal] [],
        div [class "modal-card"] [
            form formAttributes [
                header [class "modal-card-head"] [
                    p [class "modal-card-title"] [text "Einstellungen für Kampagne"],
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
                                    value campaign.title,
                                ]
                                [],
                        ],
                    ],
                ],
                footer [class "modal-card-foot"] [
                    div [class "buttons"] [
                        button [class "button is-success", type "submit"] [text "Speichern"],
                        button [class "button", type "button", onClickCloseModal] [text "Abbrechen"],
                    ],
                ],
            ],
        ],
    ]

updateDaysForm : CampaignID, Model -> Result Node [KeyNotFound]
updateDaysForm = \campaignId, model ->
    campaign <- model |> Dict.get campaignId |> Result.map

    formAttributes = [
        (attribute "hx-post") "/campaign/$(campaignId)/days",
        (attribute "hx-disabled-elt") "button",
        (attribute "hx-target") "closest .modal",
        (attribute "hx-swap") "delete",
    ]

    div [class "modal is-active"] [
        div [class "modal-background", onClickCloseModal] [],
        div [class "modal-card"] [
            form formAttributes [
                header [class "modal-card-head"] [
                    p [class "modal-card-title"] [text "$(campaign.title) · Tage"],
                    button [class "delete", type "button", ariaLabel "close", onClickCloseModal] [],
                ],
                section
                    [class "modal-card-body"]
                    (
                        campaign.days
                        |> List.map
                            \d -> p [] [text d.title]

                    ),
                footer [class "modal-card-foot"] [
                    div [class "buttons"] [
                        button [class "button is-success", type "submit"] [text "Speichern"],
                        button [class "button", type "button", onClickCloseModal] [text "Abbrechen"],
                    ],
                ],
            ],
        ],
    ]

# Write

writeRequest : List Str, RequestBody, Model -> Result (Str, Model) [BadRequest, KeyNotFound, NotFound]
writeRequest = \path, body, model ->
    when path is
        ["create"] -> performCreateCampaign body model
        [objId, "update"] -> performUpdateCampaign objId body model
        [objId, "delete"] -> performDeleteCampaign objId model
        _ -> Err NotFound

## Create

performCreateCampaign : RequestBody, Model -> Result (Str, Model) [BadRequest]
performCreateCampaign = \body, model ->
    when body is
        EmptyBody ->
            Err BadRequest

        Body b ->
            when bodyToFields b.body |> Result.try parseCreateCampaignFormFields is
                Err InvalidInput ->
                    Err BadRequest

                Ok { title, numOfDays } ->
                    newObjId = getHighestId model + 1 |> Num.toStr
                    campaign = {
                        title,
                        days: List.repeat { title: "Day" } numOfDays,
                    }
                    newModel = model |> Dict.insert newObjId campaign

                    respContent =
                        div [(attribute "hx-swap-oob") "afterend:#createCampaignCard"] [campaignCard newObjId title numOfDays]

                    Ok (renderWithoutDocType respContent, newModel)

parseCreateCampaignFormFields : List (Str, List U8) -> Result { title : Str, numOfDays : U64 } [InvalidInput]
parseCreateCampaignFormFields = \fields ->
    title =
        fields
        |> List.findFirst \(fieldName, _) -> fieldName == "title"
        |> Result.try \(_, t) -> t |> Str.fromUtf8
        |> Result.mapErr
            \e ->
                when e is
                    NotFound | BadUtf8 _ _ -> InvalidInput

    numOfDays =
        fields
        |> List.findFirst \(fieldName, _) -> fieldName == "numOfDays"
        |> Result.try \(_, n) -> n |> Str.fromUtf8
        |> Result.try Str.toU64
        |> Result.mapErr
            \e ->
                when e is
                    NotFound | BadUtf8 _ _ | InvalidNumStr -> InvalidInput

    when (title, numOfDays) is
        (Ok t, Ok n) -> Ok { title: t, numOfDays: n }
        _ -> Err InvalidInput

getHighestId : Model -> U64
getHighestId = \model ->
    model
    |> Dict.keys
    |> List.map
        \campaignId -> campaignId |> Str.toU64 |> Result.withDefault 0
    |> List.max
    |> Result.withDefault 0

## Update

performUpdateCampaign : CampaignID, RequestBody, Model -> Result (Str, Model) [KeyNotFound, BadRequest]
performUpdateCampaign = \campaignId, body, model ->
    campaign <- model |> Dict.get campaignId |> Result.try

    when body is
        EmptyBody ->
            Err BadRequest

        Body b ->
            when bodyToFields b.body |> Result.try parseUpdateCampaignFormFields is
                Err InvalidInput ->
                    Err BadRequest

                Ok { title } ->
                    newModel =
                        model
                        |> Dict.update campaignId \current ->
                            when current is
                                Missing -> Missing
                                Present old -> Present { old & title: title }

                    numOfDays = List.len campaign.days

                    respContent =
                        campaignCard campaignId title numOfDays |> addAttribute ((attribute "hx-swap-oob") "true")

                    Ok (renderWithoutDocType respContent, newModel)

parseUpdateCampaignFormFields : List (Str, List U8) -> Result { title : Str } [InvalidInput]
parseUpdateCampaignFormFields = \fields ->
    fields
    |> List.findFirst \(fieldName, _) -> fieldName == "title"
    |> Result.try \(_, t) -> t |> Str.fromUtf8
    |> Result.map \title -> { title }
    |> Result.mapErr
        \e ->
            when e is
                NotFound | BadUtf8 _ _ -> InvalidInput

## Delete

performDeleteCampaign : CampaignID, Model -> Result (Str, Model) [KeyNotFound]
performDeleteCampaign = \campaignId, model ->
    if model |> Dict.contains campaignId then
        newModel = model |> Dict.remove campaignId
        Ok ("", newModel)
    else
        Err KeyNotFound
