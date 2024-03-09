interface Server.Campaign
    exposes [
        addCampaign,
        addCampaignEvent,
        campaignListView,
    ]
    imports [
        html.Html.{ a, div, h1, p, renderWithoutDocType, text },
        html.Attribute.{ attribute, class, id },
        json.Core.{ json },
    ]

campaignListView = \model ->
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
                            a [class "has-text-white", (attribute "hx-get") "/openForm/addCampaign", (attribute "hx-target") "#formModal"] [text "Kampagne anlegen"],
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

campaignCard = \objId, title, numOfDays ->
    div [class "column is-one-third"] [
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
                        (attribute "hx-get") "/openForm/editCampaign/$(objId)",
                        (attribute "hx-target") "#formModal",
                    ]
                    [text "Einstellungen"],
                a [class "card-footer-item"] [text "Löschen"],
            ],
        ],
    ]

campaignCardWithHxSwapOob = \objId, title, numOfDays ->
    div [(attribute "hx-swap-oob") "afterend:#newCampaignForm"] [
        campaignCard objId title numOfDays,
    ]

addCampaignEvent = \model, event ->
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

addCampaign = \body, model ->
    when body is
        EmptyBody ->
            Err BadRequest

        Body b ->
            when bodyToFields b.body |> Result.try parseAddCampaignFormFields is
                Err InvalidInput ->
                    Err BadRequest

                Ok { title, numOfDays } ->
                    newObjId = getHighestId model + 1 |> Num.toStr

                    event =
                        Encode.toBytes { action: "addCampaign", data: { title, numOfDays, id: newObjId } } json

                    Ok (campaignCardWithHxSwapOob newObjId title numOfDays |> renderWithoutDocType, [AddEvent event])

parseAddCampaignFormFields = \fields ->
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

getHighestId = \model ->
    model
    |> List.map
        \campaign -> campaign.id |> Str.toU64 |> Result.withDefault 0
    |> List.max
    |> Result.withDefault 0

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

urlDecode : List U8 -> Result (List U8) [InvalidInput]
urlDecode = \bytes ->
    bytes
    |> List.map
        \char -> if char == '+' then ' ' else char
    |> percentDecode

percentDecode : List U8 -> Result (List U8) [InvalidInput]
percentDecode = \bytes ->
    percentDecodeHelper bytes (List.withCapacity (List.len bytes))

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
