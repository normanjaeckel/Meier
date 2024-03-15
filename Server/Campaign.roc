interface Server.Campaign
    exposes [
        applyEvent,
        listView,
        readRequest,
        writeRequest,
    ]
    imports [
        html.Html.{ Node, a, button, div, h1, header, footer, form, input, p, renderWithoutDocType, section, text },
        html.Attribute.{ attribute, class, id, max, min, name, placeholder, required, type, value },
        json.Core.{ json },
        pf.Webserver.{ Command, Event, RequestBody, Response },
        Server.Modeling.{ Model },
        Server.Shared.{ ariaLabel, bodyToFields, onClickCloseModal, response200, response404 },
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
    decodedEvent : Result { data : { id : Str, title : Str, numOfDays : U64 } } _
    decodedEvent = Decode.fromBytes event json

    when decodedEvent is
        Ok dc ->
            campaign = {
                id: dc.data.id,
                title: dc.data.title,
                days: List.repeat { title: "Day" } dc.data.numOfDays,
            }
            model |> List.append campaign

        Err _ -> crash "Oh, no! Invalid database."

applyUpdateEvent : Model, Event -> Model
applyUpdateEvent = \model, event ->
    decodedEvent : Result { data : { id : Str, title : Str } } _
    decodedEvent = Decode.fromBytes event json

    when decodedEvent is
        Ok _dc ->
            # TODO: Use dc and update model.
            model

        Err _ -> crash "Oh, no! Invalid database."

applyDeleteEvent : Model, Event -> Model
applyDeleteEvent = \model, event ->
    decodedEvent : Result { data : { id : Str } } _
    decodedEvent = Decode.fromBytes event json

    when decodedEvent is
        Ok dc ->
            model |> List.dropIf \campaign -> campaign.id == dc.data.id

        Err _ -> crash "Oh, no! Invalid database."

# Read

readRequest : List Str, Model -> Response
readRequest = \path, model ->
    when path is
        ["create"] ->
            renderWithoutDocType createCampaignForm |> response200

        [objId, "update"] ->
            when updateCampaignForm objId model is
                Ok node -> renderWithoutDocType node |> response200
                Err NotFound -> response404

        _ -> response404

listView : Model -> Node
listView = \model ->
    campaigns =
        model
        |> List.map
            \campaign -> campaignCard campaign.id campaign.title (List.len campaign.days)

    campaignsAndCreateCampaignCard =
        [
            div [id "createCampaignCard", class "column is-one-third"] [
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

campaignCard : Str, Str, U64 -> Node
campaignCard = \objId, title, numOfDays ->
    div [id "campaign-$(objId)", class "column is-one-third"] [
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
                        (attribute "hx-get") "/campaign/$(objId)",
                        (attribute "hx-target") "#main",
                    ]
                    [text "Verwalten"],
                a
                    [
                        class "card-footer-item",
                        (attribute "hx-get") "/campaign/$(objId)/update",
                        (attribute "hx-target") "#formModal",
                    ]
                    [text "Einstellungen"],
                a
                    [
                        class "card-footer-item",
                        (attribute "hx-confirm") "Wollen Sie die Kampagne wirklich löschen?",
                        (attribute "hx-post") "/campaign/$(objId)/delete",
                        (attribute "hx-target") "#campaign-$(objId)",
                        (attribute "hx-swap") "delete",
                    ]
                    [text "Löschen"],
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

updateCampaignForm : Str, Model -> Result Node [NotFound]
updateCampaignForm = \objId, model ->
    model
    |> List.findFirst
        \campaign -> campaign.id == objId
    |> Result.map
        \campaign ->
            formAttributes = [
                (attribute "hx-post") "/campaign/$(objId)/update",
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

writeRequest : List Str, RequestBody, Model -> Result (Str, List Command) [BadRequest, NotFound]
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
    |> List.map
        \campaign -> campaign.id |> Str.toU64 |> Result.withDefault 0
    |> List.max
    |> Result.withDefault 0

## Update

performUpdateCampaign : Str, RequestBody, Model -> Result (Str, List Command) [BadRequest, NotFound]
performUpdateCampaign = \objId, body, model ->
    model
    |> List.findFirst \campaign -> campaign.id == objId
    |> Result.try
        \campaign ->
            when body is
                EmptyBody ->
                    Err BadRequest

                Body b ->
                    when bodyToFields b.body |> Result.try parseUpdateCampaignFormFields is
                        Err InvalidInput ->
                            Err BadRequest

                        Ok { title } ->
                            event = Encode.toBytes
                                { action: "campaign.update", data: { title, id: objId } }
                                json

                            numOfDays = List.len campaign.days

                            respContent =
                                div [(attribute "hx-swap-oob") "outerHTML:#campaign-$(objId)"] [campaignCard objId title numOfDays]

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

performDeleteCampaign : Str, Model -> Result (Str, List Command) [NotFound]
performDeleteCampaign = \objId, model ->
    model
    |> List.findFirst \campaign -> campaign.id == objId
    |> Result.map
        \_ ->
            event =
                Encode.toBytes { action: "campaign.delete", data: { id: objId } } json
            ("", [AddEvent event])
