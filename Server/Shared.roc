interface Server.Shared
    exposes [
        ariaLabel,
        hyperscript,
        onClickCloseModal,
        response200,
        response400,
        response404,
    ]
    imports [
        html.Attribute.{ Attribute, attribute },
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

response200 : Str -> Response
response200 = \body ->
    { body: body |> Str.toUtf8, headers: [], status: 200 }

response400 : Response
response400 =
    { body: "400 Bad Request" |> Str.toUtf8, headers: [], status: 400 }

response404 : Response
response404 =
    { body: "404 Not Found" |> Str.toUtf8, headers: [], status: 404 }

