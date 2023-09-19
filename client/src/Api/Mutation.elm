-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Api.Mutation exposing (..)

import Api.InputObject
import Api.Interface
import Api.Object
import Api.Scalar
import Api.ScalarCodecs
import Api.Union
import Graphql.Internal.Builder.Argument as Argument exposing (Argument)
import Graphql.Internal.Builder.Object as Object
import Graphql.Internal.Encode as Encode exposing (Value)
import Graphql.Operation exposing (RootMutation, RootQuery, RootSubscription)
import Graphql.OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet exposing (SelectionSet)
import Json.Decode as Decode exposing (Decoder)


type alias AddCampaignOptionalArguments =
    { days : OptionalArgument (List String)
    , loginToken : OptionalArgument String
    }


type alias AddCampaignRequiredArguments =
    { title : String }


addCampaign :
    (AddCampaignOptionalArguments -> AddCampaignOptionalArguments)
    -> AddCampaignRequiredArguments
    -> SelectionSet decodesTo Api.Object.Campaign
    -> SelectionSet decodesTo RootMutation
addCampaign fillInOptionals____ requiredArgs____ object____ =
    let
        filledInOptionals____ =
            fillInOptionals____ { days = Absent, loginToken = Absent }

        optionalArgs____ =
            [ Argument.optional "days" filledInOptionals____.days (Encode.string |> Encode.list), Argument.optional "loginToken" filledInOptionals____.loginToken Encode.string ]
                |> List.filterMap Basics.identity
    in
    Object.selectionForCompositeField "addCampaign" (optionalArgs____ ++ [ Argument.required "title" requiredArgs____.title Encode.string ]) object____ Basics.identity


type alias UpdateCampaignOptionalArguments =
    { title : OptionalArgument String
    , loginToken : OptionalArgument String
    }


type alias UpdateCampaignRequiredArguments =
    { id : Api.ScalarCodecs.Id }


updateCampaign :
    (UpdateCampaignOptionalArguments -> UpdateCampaignOptionalArguments)
    -> UpdateCampaignRequiredArguments
    -> SelectionSet decodesTo Api.Object.Campaign
    -> SelectionSet decodesTo RootMutation
updateCampaign fillInOptionals____ requiredArgs____ object____ =
    let
        filledInOptionals____ =
            fillInOptionals____ { title = Absent, loginToken = Absent }

        optionalArgs____ =
            [ Argument.optional "title" filledInOptionals____.title Encode.string, Argument.optional "loginToken" filledInOptionals____.loginToken Encode.string ]
                |> List.filterMap Basics.identity
    in
    Object.selectionForCompositeField "updateCampaign" (optionalArgs____ ++ [ Argument.required "id" requiredArgs____.id (Api.ScalarCodecs.codecs |> Api.Scalar.unwrapEncoder .codecId) ]) object____ Basics.identity


type alias DeleteCampaignRequiredArguments =
    { id : Api.ScalarCodecs.Id }


deleteCampaign :
    DeleteCampaignRequiredArguments
    -> SelectionSet Bool RootMutation
deleteCampaign requiredArgs____ =
    Object.selectionForField "Bool" "deleteCampaign" [ Argument.required "id" requiredArgs____.id (Api.ScalarCodecs.codecs |> Api.Scalar.unwrapEncoder .codecId) ] Decode.bool


type alias AddDayRequiredArguments =
    { campaignID : Api.ScalarCodecs.Id
    , title : String
    }


addDay :
    AddDayRequiredArguments
    -> SelectionSet decodesTo Api.Object.Day
    -> SelectionSet decodesTo RootMutation
addDay requiredArgs____ object____ =
    Object.selectionForCompositeField "addDay" [ Argument.required "campaignID" requiredArgs____.campaignID (Api.ScalarCodecs.codecs |> Api.Scalar.unwrapEncoder .codecId), Argument.required "title" requiredArgs____.title Encode.string ] object____ Basics.identity


type alias UpdateDayRequiredArguments =
    { id : Api.ScalarCodecs.Id
    , title : String
    }


updateDay :
    UpdateDayRequiredArguments
    -> SelectionSet decodesTo Api.Object.Day
    -> SelectionSet decodesTo RootMutation
updateDay requiredArgs____ object____ =
    Object.selectionForCompositeField "updateDay" [ Argument.required "id" requiredArgs____.id (Api.ScalarCodecs.codecs |> Api.Scalar.unwrapEncoder .codecId), Argument.required "title" requiredArgs____.title Encode.string ] object____ Basics.identity


type alias DeleteDayRequiredArguments =
    { id : Api.ScalarCodecs.Id }


deleteDay :
    DeleteDayRequiredArguments
    -> SelectionSet Bool RootMutation
deleteDay requiredArgs____ =
    Object.selectionForField "Bool" "deleteDay" [ Argument.required "id" requiredArgs____.id (Api.ScalarCodecs.codecs |> Api.Scalar.unwrapEncoder .codecId) ] Decode.bool


type alias AddEventRequiredArguments =
    { campaignID : Api.ScalarCodecs.Id
    , title : String
    , dayIDs : List Api.ScalarCodecs.Id
    , capacity : Int
    , maxSpecialPupils : Int
    }


addEvent :
    AddEventRequiredArguments
    -> SelectionSet decodesTo Api.Object.Event
    -> SelectionSet decodesTo RootMutation
addEvent requiredArgs____ object____ =
    Object.selectionForCompositeField "addEvent" [ Argument.required "campaignID" requiredArgs____.campaignID (Api.ScalarCodecs.codecs |> Api.Scalar.unwrapEncoder .codecId), Argument.required "title" requiredArgs____.title Encode.string, Argument.required "dayIDs" requiredArgs____.dayIDs ((Api.ScalarCodecs.codecs |> Api.Scalar.unwrapEncoder .codecId) |> Encode.list), Argument.required "capacity" requiredArgs____.capacity Encode.int, Argument.required "maxSpecialPupils" requiredArgs____.maxSpecialPupils Encode.int ] object____ Basics.identity


type alias UpdateEventOptionalArguments =
    { title : OptionalArgument String
    , dayIDs : OptionalArgument (List Api.ScalarCodecs.Id)
    , capacity : OptionalArgument Int
    , maxSpecialPupils : OptionalArgument Int
    }


type alias UpdateEventRequiredArguments =
    { id : Api.ScalarCodecs.Id }


updateEvent :
    (UpdateEventOptionalArguments -> UpdateEventOptionalArguments)
    -> UpdateEventRequiredArguments
    -> SelectionSet decodesTo Api.Object.Event
    -> SelectionSet decodesTo RootMutation
updateEvent fillInOptionals____ requiredArgs____ object____ =
    let
        filledInOptionals____ =
            fillInOptionals____ { title = Absent, dayIDs = Absent, capacity = Absent, maxSpecialPupils = Absent }

        optionalArgs____ =
            [ Argument.optional "title" filledInOptionals____.title Encode.string, Argument.optional "dayIDs" filledInOptionals____.dayIDs ((Api.ScalarCodecs.codecs |> Api.Scalar.unwrapEncoder .codecId) |> Encode.list), Argument.optional "capacity" filledInOptionals____.capacity Encode.int, Argument.optional "maxSpecialPupils" filledInOptionals____.maxSpecialPupils Encode.int ]
                |> List.filterMap Basics.identity
    in
    Object.selectionForCompositeField "updateEvent" (optionalArgs____ ++ [ Argument.required "id" requiredArgs____.id (Api.ScalarCodecs.codecs |> Api.Scalar.unwrapEncoder .codecId) ]) object____ Basics.identity


type alias DeleteEventRequiredArguments =
    { id : Api.ScalarCodecs.Id }


deleteEvent :
    DeleteEventRequiredArguments
    -> SelectionSet Bool RootMutation
deleteEvent requiredArgs____ =
    Object.selectionForField "Bool" "deleteEvent" [ Argument.required "id" requiredArgs____.id (Api.ScalarCodecs.codecs |> Api.Scalar.unwrapEncoder .codecId) ] Decode.bool


type alias AddPupilOptionalArguments =
    { loginToken : OptionalArgument String
    , special : OptionalArgument Bool
    }


type alias AddPupilRequiredArguments =
    { campaignID : Api.ScalarCodecs.Id
    , name : String
    , class : String
    }


addPupil :
    (AddPupilOptionalArguments -> AddPupilOptionalArguments)
    -> AddPupilRequiredArguments
    -> SelectionSet decodesTo Api.Object.Pupil
    -> SelectionSet decodesTo RootMutation
addPupil fillInOptionals____ requiredArgs____ object____ =
    let
        filledInOptionals____ =
            fillInOptionals____ { loginToken = Absent, special = Absent }

        optionalArgs____ =
            [ Argument.optional "loginToken" filledInOptionals____.loginToken Encode.string, Argument.optional "special" filledInOptionals____.special Encode.bool ]
                |> List.filterMap Basics.identity
    in
    Object.selectionForCompositeField "addPupil" (optionalArgs____ ++ [ Argument.required "campaignID" requiredArgs____.campaignID (Api.ScalarCodecs.codecs |> Api.Scalar.unwrapEncoder .codecId), Argument.required "name" requiredArgs____.name Encode.string, Argument.required "class" requiredArgs____.class Encode.string ]) object____ Basics.identity


type alias UpdatePupilOptionalArguments =
    { name : OptionalArgument String
    , class : OptionalArgument String
    , special : OptionalArgument Bool
    , loginToken : OptionalArgument String
    }


type alias UpdatePupilRequiredArguments =
    { id : Api.ScalarCodecs.Id }


updatePupil :
    (UpdatePupilOptionalArguments -> UpdatePupilOptionalArguments)
    -> UpdatePupilRequiredArguments
    -> SelectionSet decodesTo Api.Object.Pupil
    -> SelectionSet decodesTo RootMutation
updatePupil fillInOptionals____ requiredArgs____ object____ =
    let
        filledInOptionals____ =
            fillInOptionals____ { name = Absent, class = Absent, special = Absent, loginToken = Absent }

        optionalArgs____ =
            [ Argument.optional "name" filledInOptionals____.name Encode.string, Argument.optional "class" filledInOptionals____.class Encode.string, Argument.optional "special" filledInOptionals____.special Encode.bool, Argument.optional "loginToken" filledInOptionals____.loginToken Encode.string ]
                |> List.filterMap Basics.identity
    in
    Object.selectionForCompositeField "updatePupil" (optionalArgs____ ++ [ Argument.required "id" requiredArgs____.id (Api.ScalarCodecs.codecs |> Api.Scalar.unwrapEncoder .codecId) ]) object____ Basics.identity


type alias DeletePupilRequiredArguments =
    { id : Api.ScalarCodecs.Id }


deletePupil :
    DeletePupilRequiredArguments
    -> SelectionSet Bool RootMutation
deletePupil requiredArgs____ =
    Object.selectionForField "Bool" "deletePupil" [ Argument.required "id" requiredArgs____.id (Api.ScalarCodecs.codecs |> Api.Scalar.unwrapEncoder .codecId) ] Decode.bool


type alias AssignPupilRequiredArguments =
    { pupilID : Api.ScalarCodecs.Id
    , eventID : Api.ScalarCodecs.Id
    , dayID : Api.ScalarCodecs.Id
    }


assignPupil :
    AssignPupilRequiredArguments
    -> SelectionSet decodesTo Api.Object.Day
    -> SelectionSet decodesTo RootMutation
assignPupil requiredArgs____ object____ =
    Object.selectionForCompositeField "assignPupil" [ Argument.required "pupilID" requiredArgs____.pupilID (Api.ScalarCodecs.codecs |> Api.Scalar.unwrapEncoder .codecId), Argument.required "eventID" requiredArgs____.eventID (Api.ScalarCodecs.codecs |> Api.Scalar.unwrapEncoder .codecId), Argument.required "dayID" requiredArgs____.dayID (Api.ScalarCodecs.codecs |> Api.Scalar.unwrapEncoder .codecId) ] object____ Basics.identity


type alias PupilChoiceRequiredArguments =
    { pupilID : Api.ScalarCodecs.Id
    , choices : List Api.InputObject.EventChoiceInput
    }


{-| assignAll(campaignID: ID!): Campaign!
-}
pupilChoice :
    PupilChoiceRequiredArguments
    -> SelectionSet Bool RootMutation
pupilChoice requiredArgs____ =
    Object.selectionForField "Bool" "pupilChoice" [ Argument.required "pupilID" requiredArgs____.pupilID (Api.ScalarCodecs.codecs |> Api.Scalar.unwrapEncoder .codecId), Argument.required "choices" requiredArgs____.choices (Api.InputObject.encodeEventChoiceInput |> Encode.list) ] Decode.bool
