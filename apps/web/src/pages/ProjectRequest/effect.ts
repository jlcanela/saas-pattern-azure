import { Effect } from "effect";
import { projectsCreate } from "common";

interface OnCreateProjectParams {
    project_name: string;
    project_description: string;
    project_objective: string;
    project_stakeholders: string;
}

export const onCreateProject = (params: OnCreateProjectParams): Effect.Effect<boolean, never, never> =>
    Effect.gen(function* (_) {
        yield* projectsCreate(params);
        return true;
    }).pipe(Effect.catchAll(() => Effect.succeed(false)));
