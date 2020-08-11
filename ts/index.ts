import * as t from "io-ts";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import * as A from "fp-ts/lib/Array";
import { pipe, flow } from "fp-ts/lib/function";
import { PathReporter } from "io-ts/lib/PathReporter";
import got, { Response } from "got";

const getRawPeopleSite: TE.TaskEither<Error, string> = pipe(
  TE.tryCatch(
    () =>
      got(
        "https://cors-anywhere.herokuapp.com/https://jobb.insurello.se/people/",
        { headers: { Origin: "" } }
      ),
    (reason: any) => new Error(reason)
  ),
  TE.map((res) => res.body)
);

type AnagramResponse = t.TypeOf<typeof AnagramResponse>;

const AnagramResponse = t.type({
  best: t.array(t.string),
});

const getBestAnagram = (
  name: string
): TE.TaskEither<Error, { name: string; anagram: string }> =>
  pipe(
    TE.tryCatch(
      () =>
        got("http://www.anagramica.com/best/" + name, {
          responseType: "json",
          headers: { Origin: "" },
        }),
      (reason: any) => new Error(reason)
    ),
    TE.map((res) => res.body),
    TE.chain((body: unknown) =>
      pipe(
        body,
        AnagramResponse.decode,
        E.mapLeft(
          (err) => new Error(PathReporter.report(E.left(err)).join(", "))
        ),
        TE.fromEither
      )
    ),
    TE.map((resp) => ({ name: name, anagram: resp.best[0] }))
  );

const namesRegex = /<span class=\"name u-link-color\">(.*?)</g;

const findNames = (raw: string): string[] =>
  raw.match(namesRegex).map((el) => el.split(">")[1].split("<")[0]);

const firstName = (names) => names[0];

const workflow = pipe(
  getRawPeopleSite,
  //   TE.map(flow(findNames, firstName)),
  TE.map(findNames),
  TE.map((names) => names.slice(0, 5)), //pick first 5 names
  TE.map((names) => pipe(names, A.map(getBestAnagram))),
  (a) => a,
  TE.chain(A.array.sequence(TE.taskEither)),

  (a) => a
  //   TE.map((raw) => pipe(raw, findNames, firstName)),
  //   TE.chain(getBestAnagram)
);

workflow().then(
  // (res) => {
  //   switch (res._tag) {
  //     case "Left":
  //       return console.log("Error", res.left);
  //     case "Right":
  //       return console.log(res.right);
  //   }
  // }
  E.fold(
    (err) => console.log("Error", err),
    (anagrams) => console.log(anagrams)
  )
);

// type Json = {
//   email: string;
//   phone: string;
// };

type Json = t.TypeOf<typeof Json>;
const Json = t.type({
  email: t.string,
  phone: t.string,
});

type Email = string;
type Phone = string;

type Contact = {
  email: Email;
  phone: Phone;
};

const input = `
{
    "email": "whatever@mailemetrash.com",
    "phone": "1234567000"
}
`;

const todo = {} as E.Either<string, Json>;

const parseJson = (raw: string): E.Either<string, Json> => todo;

const validateEmail = (json: Json): E.Either<string, Json> => todo;

const validatePhone = (json: Json): E.Either<string, Json> => todo;

const createContact = (json: Json): Contact => ({
  email: json.email,
  phone: json.phone,
});

const fetch = (url: string): TE.TaskEither<string, string> => {
  return {} as TE.TaskEither<string, string>;
};

const jsonStringToContact = (raw: string): E.Either<string, Contact> =>
  pipe(
    raw,
    parseJson,
    E.chain(validateEmail),
    E.chain(validatePhone),
    E.map(createContact)
  );

const fetchAndjsonStringToContact = (
  url: string
): TE.TaskEither<string, Contact> =>
  pipe(fetch(url), TE.chain(flow(jsonStringToContact, TE.fromEither)));

//   E.map(createContact)(
//     E.chain(validatePhone)(E.chain(validateEmail)(parseJson(rawJson)))
//   );

/*
https://ellie-app.com/7wm7ZfVySLRa1

http://www.anagramica.com/api
    Result         == E.Either
    Ok value       == Right value
    Err "Boom"     == Left "Boom"

    Result.map     == E.map
    Result.andThen == E.chain

   a |> b |> c            == pipe(a, b, c)

   Maybe           == Option
   Maybe.map       == O.map
*/
