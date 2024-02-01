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

newCampaign = \body, _model ->
    when body is
        EmptyBody ->
            Err BadRequest

        Body b ->
            when bodyToFields b.body |> Result.try parseNewCampaignFormFields is
                Err InvalidInput ->
                    Err BadRequest

                Ok { title, numOfDays } ->
                    Ok ("200 Ok", [AddEvent "Add a new campaign with title $(title) and $(Num.toStr numOfDays) days."])

parseNewCampaignFormFields : List (List U8, List U8) -> Result { title : Str, numOfDays : U64 } [InvalidInput]

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
                            Ok (name, value)

                        _ -> Err InvalidInput

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

                    Err _ ->
                        Err InvalidInput
            else
                percentDecodeHelper rest (result |> List.append first)

expect
    got = urlDecode ("foo%20bar" |> Str.toUtf8)
    got == Ok ("foo bar" |> Str.toUtf8)

expect
    got = urlDecode ("foo+bar" |> Str.toUtf8)
    got == Ok ("foo bar" |> Str.toUtf8)

expect
    got = urlDecode ("foo%" |> Str.toUtf8)
    got == Err InvalidInput

expect
    got = urlDecode ("foo%zz" |> Str.toUtf8)
    got == Err InvalidInput
