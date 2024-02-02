interface Server.Campaign
    exposes [
        addCampaign,
        addCampaignEvent,
        campaignListView,
    ]
    imports [
        html.Html.{ a, div, p, renderWithoutDocType, text },
        html.Attribute.{ attribute, class },
        json.Core.{ json },
        "templates/index.html" as index : Str,

    ]

campaignListView = \model ->
    campaigns =
        model
        |> List.map
            \campaign -> campaignCard campaign.title 42 Bool.false
        |> Str.joinWith ""
    {
        body: index |> Str.replaceFirst "{% campaigns %}" campaigns |> Str.toUtf8,
        headers: [],
        status: 200,
    }

campaignCard = \title, numOfDays, withHxSwapOoB ->
    node =
        div [class "column is-one-third"] [
            div [class "card"] [
                div [class "card-header"] [
                    p [class "card-header-title"] [text title],
                ],
                div [class "card-content"] [
                    text "Anzahl der Tage: $(Num.toStr numOfDays)",
                ],
                div [class "card-footer"] [
                    a [class "card-footer-item"] [text "Verwalten"],
                    a [class "card-footer-item"] [text "Einstellungen"],
                    a [class "card-footer-item"] [text "Löschen"],
                ],
            ],
        ]
    if withHxSwapOoB then
        renderWithoutDocType (div [(attribute "hx-swap-oob") "beforebegin:#newCampaignForm"] [node])
    else
        renderWithoutDocType node

addCampaignEvent = \model, event ->
    decodedEvent : Result { data : { title : Str, numOfDays : U64 } } _
    decodedEvent = Decode.fromBytes event json
    when decodedEvent is
        Ok dc ->
            campaign = {
                title: dc.data.title,
                days: List.repeat { title: "Day" } (Num.toNat dc.data.numOfDays),
            }
            model |> List.append campaign

        Err _ -> crash "Oh, no! Invalid database."

addCampaign = \body, _model ->
    when body is
        EmptyBody ->
            Err BadRequest

        Body b ->
            when bodyToFields b.body |> Result.try parseAddCampaignFormFields is
                Err InvalidInput ->
                    Err BadRequest

                Ok data ->
                    event =
                        Encode.toBytes { action: "addCampaign", data } json

                    Ok (campaignCard data.title data.numOfDays Bool.true, [AddEvent event])

parseAddCampaignFormFields = \fields ->
    title =
        fields
        |> List.findFirst \(name, _) -> name == "title"
        |> Result.try \(_, t) -> t |> Str.fromUtf8
        |> Result.mapErr
            \e ->
                when e is
                    NotFound | BadUtf8 _ _ -> InvalidInput

    numOfDays =
        fields
        |> List.findFirst \(name, _) -> name == "numOfDays"
        |> Result.try \(_, n) -> n |> Str.fromUtf8
        |> Result.try Str.toU64
        |> Result.mapErr
            \e ->
                when e is
                    NotFound | BadUtf8 _ _ | InvalidNumStr -> InvalidInput

    when (title, numOfDays) is
        (Ok t, Ok n) -> Ok { title: t, numOfDays: n }
        _ -> Err InvalidInput

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
                        [name, value] ->
                            when name |> Str.fromUtf8 is
                                Ok n ->
                                    Ok (n, value)

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
