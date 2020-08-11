import * as t from "io-ts";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
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
        AnagramResponse.decode(body),
        TE.fromEither,
        TE.mapLeft(
          (err) => new Error(PathReporter.report(E.left(err)).join(", "))
        )
      )
    ),
    TE.map((resp) => ({ name: name, anagram: resp.best[0] }))
  );

const namesRegex = /<span class=\"name u-link-color\">(.*?)</g;

const findNames = (raw: string): string[] =>
  raw.match(namesRegex).map((el) => el.split(">")[1].split("<")[0]);

pipe(
  getRawPeopleSite,
  TE.map(findNames),
  TE.map((names) => names.slice(0, 5)), //pick first 5 names
  //   TE.map((names) => names[0]), //pick first name
  TE.map((names) => pipe(names, A.map(getBestAnagram))),
  TE.chain(A.array.sequence(TE.taskEither))
  //   TE.chain(getBestAnagram)
)().then((res) =>
  pipe(
    res,
    E.fold(
      (err) => console.log("Error", err),
      (anagrams) => console.log(anagrams)
    )
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

const jsonStringToContact = (rawJson: string): E.Either<string, Contact> =>
  pipe(
    rawJson,
    parseJson,
    E.chain(validateEmail),
    E.chain(validatePhone),
    E.map(createContact)
  );

const loop = (asd) => {
  let input = [1, 2, 3];

  let sum = 0;

  for (let i = 0; i < input.length; i++) {
    sum += input[i];
  }

  return sum;
};

//   E.map(createContact)(
//     E.chain(validatePhone)(E.chain(validateEmail)(parseJson(rawJson)))
//   );

/*
    Result         == E.Either
    Ok value       == Right value
    Err "Boom"     == Left "Boom"

    Result.map     == E.map
    Result.andThen == E.chain

   a |> b |> c            == pipe(a, b, c)
*/
