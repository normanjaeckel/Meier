interface Server.Modeling
    exposes [CampaignID, Model, init]
    imports []

Model : Dict CampaignID Campaign

CampaignID : Str

Campaign : {
    title : Str,
    days : List Day,
}

Day : {
    title : Str,
}

init : Model
init =
    Dict.empty {}
