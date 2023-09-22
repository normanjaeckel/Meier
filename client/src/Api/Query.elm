-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Api.Query exposing (..)

import Api.InputObject
import Api.Interface
import Api.Object
import Api.Scalar
import Api.Union
import Graphql.Internal.Builder.Argument as Argument exposing (Argument)
import Graphql.Internal.Builder.Object as Object
import Graphql.Internal.Encode as Encode exposing (Value)
import Graphql.Operation exposing (RootMutation, RootQuery, RootSubscription)
import Graphql.OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet exposing (SelectionSet)
import IdScalarCodecs
import Json.Decode as Decode exposing (Decoder)


type alias CampaignRequiredArguments =
    { id : IdScalarCodecs.Id }


campaign :
    CampaignRequiredArguments
    -> SelectionSet decodesTo Api.Object.Campaign
    -> SelectionSet decodesTo RootQuery
campaign requiredArgs____ object____ =
    Object.selectionForCompositeField "campaign" [ Argument.required "id" requiredArgs____.id (IdScalarCodecs.codecs |> Api.Scalar.unwrapEncoder .codecId) ] object____ Basics.identity


campaignList :
    SelectionSet decodesTo Api.Object.Campaign
    -> SelectionSet (List decodesTo) RootQuery
campaignList object____ =
    Object.selectionForCompositeField "campaignList" [] object____ (Basics.identity >> Decode.list)
