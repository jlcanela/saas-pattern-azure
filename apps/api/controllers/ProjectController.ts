// controllers/ProjectController.ts
import { Layer } from "@effect";
import { HonoContext, Effect, Schema, Context } from "../deps.ts";

// Domain Types
export const ProjectSchema = Schema.Struct({
    id: Schema.String,
    name: Schema.String,
    description: Schema.String,
    createdAt: Schema.Date
});

export interface Project {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
}

export class ProjectController extends Context.Tag("ProjectController")<
    ProjectController,
    {
        readonly listProjects: (c: HonoContext) => Effect.Effect<Response, Error>;
        readonly getProject: (c: HonoContext) => Effect.Effect<Response, Error>;
        readonly createProject: (c: HonoContext) => Effect.Effect<Response, Error>;
        readonly updateProject: (c: HonoContext) => Effect.Effect<Response, Error>;
        readonly deleteProject: (c: HonoContext) => Effect.Effect<Response, Error>;
    }
>() { }

export const ProjectControllerLive = Layer.succeed(
    ProjectController,
    ProjectController.of({
        listProjects: (c: HonoContext) => {
            return Effect.try({
                try: () => c.json({ projects: [] }),
                catch: (e) => new Error(`Failed to list projects: ${e}`)
            });
        },
        getProject: (c: HonoContext) => {
            return Effect.gen(function* (_) {
                const id = c.req.param('id');
                const project: Project = {
                    id,
                    name: "Sample Project",
                    description: "Description",
                    createdAt: new Date()
                };
                return yield* _(Effect.try({
                    try: () => c.json(project),
                    catch: (e) => new Error(`Failed to get project: ${e}`)
                }));
            });
        },

        createProject: (c: HonoContext) => {
            return Effect.gen(function* (_) {
                const body = yield* _(Effect.tryPromise({
                    try: () => c.req.json(),
                    catch: (e) => new Error(`Invalid project data: ${e}`)
                }));
                const project = { ...body, id: crypto.randomUUID() };
                return yield* _(Effect.try({
                    try: () => c.json(project, 201),
                    catch: (e) => new Error(`Failed to create project: ${e}`)
                }));
            });
        },

        updateProject: (c: HonoContext) => {
            return Effect.gen(function* (_) {
                const id = c.req.param('id');
                const body = yield* _(Effect.tryPromise({
                    try: () => c.req.json(),
                    catch: (e) => new Error(`Invalid project data: ${e}`)
                }));
                return yield* _(Effect.try({
                    try: () => c.json({ ...body, id }),
                    catch: (e) => new Error(`Failed to update project: ${e}`)
                }));
            });
        },

        deleteProject: (c: HonoContext) => {
            return Effect.gen(function* (_) {
                const id = c.req.param('id');
                return yield* _(Effect.try({
                    try: () => c.json({ deleted: id }),
                    catch: (e) => new Error(`Failed to delete project: ${e}`)
                }));
            });
        }
    })
)
