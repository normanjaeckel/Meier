interface Server.Modeling
    exposes [Model, init]
    imports []

Model : List Campaign

Campaign : {
    id : Str,
    title : Str,
    days : List Day,
}

Day : {
    title : Str,
}

init : Model
init =
    []
