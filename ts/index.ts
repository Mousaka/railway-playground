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
