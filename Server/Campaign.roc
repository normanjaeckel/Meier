interface Server.Campaign
    exposes [
        applyEvent,
        listView,
        readRequest,
        writeRequest,
    ]
    imports [
        html.Html.{ Node, a, button, div, h1, header, footer, form, input, p, renderWithoutDocType, section, span, text },
        html.Attribute.{ attribute, class, id, max, min, name, placeholder, required, role, type, value },
        json.Core.{ json },
        pf.Webserver.{ Command, Event, RequestBody, Response },
        Server.Modeling.{ Model, CampaignID },
        Server.Shared.{ addAttribute, ariaExpanded, ariaHidden, ariaLabel, bodyToFields, onClickCloseModal, response200, response404 },
        "templates/index.html" as index : Str,
    ]

# Apply Event

applyEvent : Model, List Str, Event -> Model
applyEvent = \model, path, event ->
    when path is
        ["create"] -> applyCreateEvent model event
        ["update"] -> applyUpdateEvent model event
        ["delete"] -> applyDeleteEvent model event
        _ -> crash "Oh, no! Invalid database."

applyCreateEvent : Model, Event -> Model
applyCreateEvent = \model, event ->
    decodedEvent : Result { data : { id : CampaignID, title : Str, numOfDays : U64 } } _
    decodedEvent = Decode.fromBytes event json

    when decodedEvent is
        Ok dc ->
            campaign = {
                title: dc.data.title,
                days: List.repeat { title: "Day" } dc.data.numOfDays,
            }
            model |> Dict.insert dc.data.id campaign

        Err _ -> crash "Oh, no! Invalid database."

applyUpdateEvent : Model, Event -> Model
applyUpdateEvent = \model, event ->
    decodedEvent : Result { data : { id : CampaignID, title : Str } } _
    decodedEvent = Decode.fromBytes event json

    when decodedEvent is
        Ok dc ->
            model
            |> Dict.update
                dc.data.id
                \current ->
                    when current is
                        Missing -> Missing
                        Present campaign ->
                            Present { campaign & title: dc.data.title }

        Err _ -> crash "Oh, no! Invalid database."

applyDeleteEvent : Model, Event -> Model
applyDeleteEvent = \model, event ->
    decodedEvent : Result { data : { id : CampaignID } } _
    decodedEvent = Decode.fromBytes event json

    when decodedEvent is
        Ok dc ->
            model |> Dict.remove dc.data.id

        Err _ -> crash "Oh, no! Invalid database."

# Read

readRequest : List Str, Model, Bool -> Response
readRequest = \path, model, retrieveEntirePage ->
    when path is
        [] ->
            if retrieveEntirePage then
                listView model |> renderWithoutDocType |> entirePage |> response200
            else
                listView model |> renderWithoutDocType |> response200

        ["create"] ->
            renderWithoutDocType createCampaignForm |> response200

        [campaignId] ->
            when detailView campaignId model is
                Ok node ->
                    if retrieveEntirePage then
                        renderWithoutDocType node |> entirePage |> response200
                    else
                        renderWithoutDocType node |> response200

                Err KeyNotFound -> response404

        [campaignId, "update"] ->
            when updateCampaignForm campaignId model is
                Ok node -> renderWithoutDocType node |> response200
                Err KeyNotFound -> response404

        _ -> response404

entirePage : Str -> Str
entirePage = \node ->
    index |> Str.replaceFirst "{% content %}" node

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
            div [id "createCampaignCard", class "column is-half is-one-third-desktop is-one-quarter-fullhd"] [
                div [class "card is-flex"] [
                    div [class "card-content is-flex-grow-1 has-background-primary is-flex is-align-items-center"] [
                        p [class "is-size-3 has-text-centered"] [
                            a
                                [
                                    class "has-text-white",
                                    (attribute "hx-get") "/campaign/create",
                                    (attribute "hx-target") "#formModal",
                                ]
                                [text "Kampagne anlegen"],
                        ],
                    ],
                ],
            ],
        ]
        |> List.concat campaigns

    div [] [
        h1 [class "title"] [text "Alle Kampagnen"],
        div [class "columns is-multiline"] campaignsAndCreateCampaignCard,
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
                        (attribute "hx-target") "#main",
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

detailView : CampaignID, Model -> Result Node [KeyNotFound]
detailView = \campaignId, model ->
    campaign <- model |> Dict.get campaignId |> Result.map

    div [] [
        h1 [class "title"] [text campaign.title],
        div [class "navbar"] [
            div [class "navbar-brand"] [
                a [role "button", class "navbar-burger", ariaLabel "menu", ariaExpanded "false"] [
                    span [ariaHidden "true"] [],
                    span [ariaHidden "true"] [],
                    span [ariaHidden "true"] [],
                ],
            ],
            div [class "navbar-menu"] [
                div [class "navbar-start"] [
                    a [class "navbar-item"] [text "Tage"],
                    a [class "navbar-item"] [text "Projektgruppen"],
                    a [class "navbar-item"] [text "Schüler/innen"],
                    a [class "navbar-item"] [text "Zuweisung"],
                ],
                div [class "navbar-end"] [],
            ],
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
                    p [class "modal-card-title"] [text "Einstellungen für Kampagnen"],
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
                    button [class "button is-success", type "submit"] [text "Speichern"],
                    button [class "button", type "button", onClickCloseModal] [text "Abbrechen"],
                ],
            ],
        ],
    ]

# Write

writeRequest : List Str, RequestBody, Model -> Result (Str, List Command) [BadRequest, KeyNotFound, NotFound]
writeRequest = \path, body, model ->
    when path is
        ["create"] -> performCreateCampaign body model
        [objId, "update"] -> performUpdateCampaign objId body model
        [objId, "delete"] -> performDeleteCampaign objId model
        _ -> Err NotFound

## Create

performCreateCampaign : RequestBody, Model -> Result (Str, List Command) [BadRequest]
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

                    event = Encode.toBytes
                        { action: "campaign.create", data: { title, numOfDays, id: newObjId } }
                        json

                    respContent =
                        div [(attribute "hx-swap-oob") "afterend:#createCampaignCard"] [campaignCard newObjId title numOfDays]

                    Ok (renderWithoutDocType respContent, [AddEvent event])

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

performUpdateCampaign : CampaignID, RequestBody, Model -> Result (Str, List Command) [KeyNotFound, BadRequest]
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
                    event = Encode.toBytes
                        { action: "campaign.update", data: { title, id: campaignId } }
                        json

                    numOfDays = List.len campaign.days

                    respContent =
                        # div [(attribute "hx-swap-oob") "outerHTML:#campaign-$(campaignId)"] [
                        campaignCard campaignId title numOfDays |> addAttribute ((attribute "hx-swap-oob") "true")

                    Ok (renderWithoutDocType respContent, [AddEvent event])

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

performDeleteCampaign : CampaignID, Model -> Result (Str, List Command) [KeyNotFound]
performDeleteCampaign = \campaignId, model ->
    if model |> Dict.contains campaignId then
        event = Encode.toBytes { action: "campaign.delete", data: { id: campaignId } } json
        Ok ("", [AddEvent event])
    else
        Err KeyNotFound
