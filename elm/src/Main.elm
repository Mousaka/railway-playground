module Main exposing (..)

import Browser
import Html exposing (Html, text, div, h1, img)
import Html.Attributes exposing (src)


---- MODEL ----


type alias Model =
    {}


init : ( Model, Cmd Msg )
init =
    ( {}, Cmd.none )



type alias Json =
    {
        email: String,
        phone: String
    }

type Email = Email String
type Phone = Phone String

type alias Contact = {
    email: Email
    ,phone: Phone

    }


-- workflow Input json as a string -> Result String String

input : String
input = """
    {
        "email": "whatever@mailemetrash.com",
        "phone": "1234567000"
    }
"""


parseJson : String -> Result String Json
parseJson raw =
    Debug.todo ""


validateEmail : Json -> Result String Json
validateEmail json =
    Debug.todo ""


validatePhone : Json -> Result String Json
validatePhone json =
    Debug.todo ""

createContact: Json -> Contact
createContact json =
        {
            email = Email json.email,
            phone = Phone json.phone
        }




jsonStringToContact : String -> Result String Contact
jsonStringToContact rawJson =
    rawJson
    |> parseJson
    |> Result.andThen validateEmail
    |> Result.andThen validatePhone
    |> Result.map createContact




stuff = [ 1,2,3 ]        -- [ [1], [2,2], [3,3,3] ]   [1,2,2,3,3,3]

---- UPDATE ----

repeatItem: Int -> List Int
repeatItem item =
    List.repeat item item

workflow =
    stuff
    |> List.map repeatItem
    |> List.concat

type Msg
    = NoOp


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    ( model, Cmd.none )



---- VIEW ----


view : Model -> Html Msg
view model =
    let
        _ = Debug.log "" workflow

    in

    div []
        [ img [ src "/logo.svg" ] []
        , h1 [] [ text "Your Elm App is working!" ]
        ]



---- PROGRAM ----


main : Program () Model Msg
main =
    Browser.element
        { view = view
        , init = \_ -> init
        , update = update
        , subscriptions = always Sub.none
        }
