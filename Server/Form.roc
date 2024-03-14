interface Server.Form
    exposes [x]
    imports []

x = 42

# serve = \url, model ->
#     when url is
#         ["addCampaign"] -> addCampaignForm
#         ["editCampaign", objId] -> editCampaign objId model
#         _ -> Err NotFound

# editCampaign = \objId, model ->
#     model
#     |> List.findFirst
#         \campaign -> campaign.id == objId
#     |> Result.try
#         \campaign ->
#             formAttributes = [
#                 (attribute "hx-post") "/editCampaign/$(objId)",
#                 (attribute "hx-disabled-elt") "button",
#                 (attribute "hx-target") "closest .modal",
#                 (attribute "hx-swap") "delete",
#             ]
#             node =
#                 div [class "modal is-active"] [
#                     div [class "modal-background", onClickCloseModal] [],
#                     div [class "modal-card"] [
#                         form formAttributes [
#                             header [class "modal-card-head"] [
#                                 p [class "modal-card-title"] [text "Einstellungen für Kampagnen"],
#                                 button [class "delete", type "button", ariaLabel "close", onClickCloseModal] [],
#                             ],
#                             section [class "modal-card-body"] [
#                                 div [class "field"] [
#                                     div [class "control"] [
#                                         input
#                                             [
#                                                 class "input",
#                                                 type "text",
#                                                 placeholder "Titel",
#                                                 ariaLabel "Titel",
#                                                 required "",
#                                                 name "title",
#                                                 value campaign.title,
#                                             ]
#                                             [],
#                                     ],
#                                 ],
#                             ],
#                             footer [class "modal-card-foot"] [
#                                 button [class "button is-success", type "submit"] [text "Speichern"],
#                                 button [class "button", type "button", onClickCloseModal] [text "Abbrechen"],
#                             ],
#                         ],
#                     ],
#                 ]
#             Ok (renderWithoutDocType node)
