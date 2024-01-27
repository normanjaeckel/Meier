interface Webserver
    exposes [
        Event,
        Request,
        Response,
    ]
    imports []

Event : List U8

# Request is the same as: https://github.com/roc-lang/basic-webserver/blob/main/platform/InternalHttp.roc
Request : {
    method : [Options, Get, Post, Put, Delete, Head, Trace, Connect, Patch],
    headers : List Header,
    url : Str,
    body : Body,
    timeout : [TimeoutMilliseconds U64, NoTimeout],
}

Response : { status : U16, headers : List Header, body : List U8 }

Header : { name : Str, value : List U8 }

Body : [
    Body { mimeType : Str, body : List U8 },
    EmptyBody,
]
