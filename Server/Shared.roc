interface Server.Shared
    exposes [
        addAttribute,
        ariaLabel,
        bodyToFields,
        hyperscript,
        onClickCloseModal,
        response200,
        response400,
        response404,
    ]
    imports [
        html.Attribute.{ Attribute, attribute },
        html.Html.{ Node, element },
        pf.Webserver.{ Response },
    ]

ariaLabel : Str -> Attribute
ariaLabel =
    attribute "aria-label"

hyperscript : Str -> Attribute
hyperscript =
    attribute "_"

onClickCloseModal =
    hyperscript "on click remove the closest .modal"

# onClickToggleIsActive =
#     hyperscript "on click toggle .is-active on <.navbar-burger, .navbar-menu/>"

addAttribute : Node, Attribute -> Node
addAttribute = \node, attr ->
    when node is
        Element tagName _ attrs children ->
            (element tagName) (attrs |> List.append attr) children

        _ -> node

expect
    node = (element "div") [] []
    got = node |> addAttribute (ariaLabel "title")
    got == (element "div") [ariaLabel "title"] []

response200 : Str -> Response
response200 = \body ->
    { body: body |> Str.toUtf8, headers: [], status: 200 }

response400 : Response
response400 =
    { body: "400 Bad Request" |> Str.toUtf8, headers: [], status: 400 }

response404 : Response
response404 =
    { body: "404 Not Found" |> Str.toUtf8, headers: [], status: 404 }

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

expect
    got = bodyToFields ("foo=bar&val=baz" |> Str.toUtf8)
    got == Ok ([("foo", "bar" |> Str.toUtf8), ("val", "baz" |> Str.toUtf8)])

expect
    got = bodyToFields ("invalid&val=baz" |> Str.toUtf8)
    got == Err InvalidInput

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
