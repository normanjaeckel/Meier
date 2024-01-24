app "meier"
    packages {
        pf: "https://github.com/roc-lang/basic-cli/releases/download/0.7.1/Icc3xJoIixF3hCcfXrDwLCu4wQHtNdPyoJkEbkgIElA.tar.br",
        json: "https://github.com/lukewilliamboswell/roc-json/releases/download/0.6.0/hJySbEhJV026DlVCHXGOZNOeoOl7468y9F9Buhj0J18.tar.br",
    }
    imports [
        pf.Stdout,
        json.Core.{ Json },
    ]
    provides [main] to pf

# Move these types to the platform

Config : Str

Request : Str

Response : Str

# Done here

main =
    Stdout.line ""

Model : Str

Event : Json

createModel : Model

applyEvents : List Event, Model -> Model

handleReadRequest : Config, Request, Model -> Response

handleWriteRequest : Config, Request, Model -> (Response, List Event)
