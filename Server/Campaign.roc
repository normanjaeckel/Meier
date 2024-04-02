interface Server.Campaign
    exposes [
        listView,
        readRequest,
        writeRequest,
    ]
    imports [
        html.Html.{ Node, a, button, div, h1, header, footer, form, input, p, renderWithoutDocType, section, text },
        html.Attribute.{ attribute, class, id, max, min, name, placeholder, required, type, value },
        pf.Webserver.{ RequestBody, Response },
        Server.Modeling.{ Model },
        Server.Shared.{ ariaLabel, onClickCloseModal, response200, response404 },
    ]

# Read

readRequest : List Str, Model -> Response
readRequest = \path, model ->
    when path is
        ["create"] ->
            renderWithoutDocType addCampaignForm |> response200

        [objId, "update"] ->
            when editCampaignForm objId model is
                Ok node -> renderWithoutDocType node |> response200
                Err NotFound -> response404

        _ -> response404

listView : Model -> Node
listView = \model ->
    campaigns =
        model
        |> List.map
            \campaign -> campaignCard campaign.id campaign.title (List.len campaign.days)

    campaignsAndAddCampaignCard =
        [
            div [id "newCampaignForm", class "column is-one-third"] [
                div [class "card is-flex"] [
                    div [class "card-content is-flex-grow-1 has-background-primary is-flex is-align-items-center"] [
                        p [class "is-size-3 has-text-centered"] [
                            a [class "has-text-white", (attribute "hx-get") "/campaign/create", (attribute "hx-target") "#formModal"] [text "Kampagne anlegen"],
                        ],
                    ],
                ],
            ],
        ]
        |> List.concat campaigns

    div [] [
        h1 [class "title"] [text "Alle Kampagnen"],
        div [class "columns is-multiline"] campaignsAndAddCampaignCard,
    ]

campaignCard : Str, Str, U64 -> Node
campaignCard = \objId, title, numOfDays ->
    div [class "campaign column is-one-third"] [
        div [class "card is-flex is-flex-direction-column"] [
            div [class "card-header"] [
                p [class "card-header-title"] [text title],
            ],
            div [class "card-content is-flex-grow-1"] [
                text "Anzahl der Tage: $(Num.toStr numOfDays)",
            ],
            div [class "card-footer"] [
                a [class "card-footer-item"] [text "Verwalten"],
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
                        (attribute "hx-target") "closest .campaign",
                        (attribute "hx-swap") "delete",
                    ]
                    [text "Löschen"],
            ],
        ],
    ]

addCampaignForm : Node
addCampaignForm =
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

editCampaignForm : Str, Model -> Result Node [NotFound]
editCampaignForm = \objId, model ->
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

writeRequest : List Str, RequestBody, Model -> Result (Str, Model) [BadRequest, NotFound]
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
                        id: newObjId,
                    }
                    newModel = model |> List.append campaign

                    Ok (campaignCardWithHxSwapOob newObjId title numOfDays |> renderWithoutDocType, newModel)

parseCreateCampaignFormFields : List (Str, List U8) -> Result { title : Str, numOfDays : U64 } [InvalidInput]
parseCreateCampaignFormFields = \fields ->
    title =
        fields
        |> List.findFirst \(fieldName, _) -> fieldName == "title"
        |> Result.try \(_, t) -> t |> Str.fromUtf8
        |> Result.mapErr
            \_ -> InvalidInput

    numOfDays =
        fields
        |> List.findFirst \(fieldName, _) -> fieldName == "numOfDays"
        |> Result.try \(_, n) -> n |> Str.fromUtf8
        |> Result.try Str.toU64
        |> Result.mapErr
            \_ -> InvalidInput

    # TODO: Why is it not possible to write "when (title, numOfDays)"?
    when title is
        Ok t ->
            when numOfDays is
                Ok n -> Ok { title: t, numOfDays: n }
                _ -> Err InvalidInput

        _ -> Err InvalidInput

getHighestId : Model -> U64
getHighestId = \model ->
    model
    |> List.map
        \campaign -> campaign.id |> Str.toU64 |> Result.withDefault 0
    |> List.max
    |> Result.withDefault 0

campaignCardWithHxSwapOob : Str, Str, U64 -> Node
campaignCardWithHxSwapOob = \objId, title, numOfDays ->
    div [(attribute "hx-swap-oob") "afterend:#newCampaignForm"] [
        campaignCard objId title numOfDays,
    ]

## Update

performUpdateCampaign : Str, RequestBody, Model -> Result (Str, Model) [BadRequest, NotFound]

## Delete

performDeleteCampaign : Str, Model -> Result (Str, Model) [NotFound]
performDeleteCampaign = \objId, model ->
    model
    |> List.findFirst \campaign -> campaign.id == objId
    |> Result.map
        \_ ->
            newModel = model |> List.dropIf \campaign -> campaign.id == objId
            ("", newModel)

# Helpers

bodyToFields : List U8 -> Result (List (Str, List U8)) [InvalidInput]
bodyToFields = \body ->
    body
    |> urlDecode
    |> Result.try
        \r ->
            r
            |> splitListU8 '&'
            |> List.mapTry
                \elem ->
                    when elem |> splitListU8 '=' is
                        [elemName, elemValue] ->
                            when elemName |> Str.fromUtf8 is
                                Ok n ->
                                    Ok (n, elemValue)

                                Err (BadUtf8 _ _) ->
                                    Err InvalidInput

                        _ -> Err InvalidInput

# expect
#     got = bodyToFields ("foo=bar&val=baz" |> Str.toUtf8)
#     got == Ok ([("foo", "bar" |> Str.toUtf8), ("val", "baz" |> Str.toUtf8)])

# expect
#     got = bodyToFields ("invalid&val=baz" |> Str.toUtf8)
#     got == Err InvalidInput

urlDecode : List U8 -> Result (List U8) [InvalidInput]
urlDecode = \bytes ->
    bytes
    |> List.map
        \char -> if char == '+' then ' ' else char
    |> percentDecode

percentDecode : List U8 -> Result (List U8) [InvalidInput]
percentDecode = \bytes ->
    percentDecodeHelper bytes (List.withCapacity (List.len bytes))

percentDecodeHelper : List U8, List U8 -> Result (List U8) [InvalidInput]
percentDecodeHelper = \bytes, result ->
    when bytes is
        [] -> Ok result
        [first, .. as rest] ->
            if first == '%' then
                hex =
                    rest
                    |> List.takeFirst 2
                    |> Str.fromUtf8
                    |> Result.try
                        \s -> "0x$(s)" |> Str.toU8
                when hex is
                    Ok num ->
                        percentDecodeHelper (rest |> List.dropFirst 2) (result |> List.append num)

                    Err e ->
                        when e is
                            BadUtf8 _ _ | InvalidNumStr -> Err InvalidInput
            else
                percentDecodeHelper rest (result |> List.append first)

expect urlDecode ("foo%20bar" |> Str.toUtf8) == Ok ("foo bar" |> Str.toUtf8)
expect urlDecode ("foo+bar" |> Str.toUtf8) == Ok ("foo bar" |> Str.toUtf8)
expect urlDecode ("foo%" |> Str.toUtf8) == Err InvalidInput
expect urlDecode ("foo%zz" |> Str.toUtf8) == Err InvalidInput

splitListU8 : List U8, U8 -> List (List U8)
splitListU8 = \list, char ->
    list
    |> List.walk
        ([], [])
        \(current, result), elem ->
            if elem == char then
                ([], result |> List.append current)
            else
                (current |> List.append elem, result)
    |> \(current, result) ->
        result |> List.append current

expect splitListU8 [] 'a' == [[]]
expect splitListU8 ['a', 'b', 'c'] 'b' == [['a'], ['c']]
expect splitListU8 ['a', 'b', 'c'] 'c' == [['a', 'b'], []]
expect splitListU8 ['a', 'b', 'c'] 'a' == [[], ['b', 'c']]
expect splitListU8 ['a', 'b', 'b', 'c'] 'b' == [['a'], [], ['c']]
expect splitListU8 ['a', 'b', 'c', 'b', 'd'] 'b' == [['a'], ['c'], ['d']]
