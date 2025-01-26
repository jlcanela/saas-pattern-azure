import { Console, Effect } from "effect";
import { projectsCreate } from "common";

interface OnCreateProjectParams {
    project_name: string;
    project_description: string;
    project_objective: string;
    project_stakeholders: string;
}

export const onCreateProject = (params: OnCreateProjectParams): Effect.Effect<boolean, never, never> =>
    Effect.gen(function* (_) {
        // if (audioRef === null) {
        //     return yield* _(Effect.die("Missing audio ref" as const));
        // }

        yield* projectsCreate(params);
        yield* Console.log(`submitting project`);
        //yield
        return true;
        //return yield* _(Effect.sync(() => audioRef.pause()));
    }).pipe(Effect.catchAll(() => Effect.succeed(false)));
// {
//     "HttpApiDecodeError": (_) => Effect.succeed(true),
//     "HttpClientError": (_) => Effect.succeed(true)
// }));
