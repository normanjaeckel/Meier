interface Webserver
    exposes [
        Event,
        Request,
        Response,
    ]
    imports []

Event : List U8

# TODO: Request should be the same as: https://github.com/roc-lang/basic-webserver/blob/main/platform/InternalHttp.roc
Request : {
    method : [Options, Get, Post, Put, Delete, Head, Trace, Connect, Patch],
    headers : List Header,
    url : Str,
    body : List U8,
}

Response : { 
    status : U16, 
    headers : List Header, 
    body : List U8,
}

Header : { name : Str, value : List U8 }
