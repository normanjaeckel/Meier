interface Webserver
    exposes [
        Event,
        Request,
        Response,
        Command,
    ]
    imports []

Event : Str

# TODO: Request should be the same as: https://github.com/roc-lang/basic-webserver/blob/main/platform/InternalHttp.roc
Request : {
    method : [Options, Get, Post, Put, Delete, Head, Trace, Connect, Patch],
    headers : List Header,
    url : Str,
    body : Str,
}

Response : {
    status : U16,
    headers : List Header,
    body : Str,
}

Header : { name : Str, value : Str }

Command : [AddEvent Event, PrintThisNumber I64]
