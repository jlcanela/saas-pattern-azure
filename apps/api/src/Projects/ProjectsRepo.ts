import { Effect, Schema, Context, Layer, Option } from "effect"
import { KeyValueStore } from "@effect/platform"
import { PlatformError } from "@effect/platform/Error";
import { ParseError } from "effect/ParseResult";
//import { randomUUID } from "node:crypto";
import { ProjectId, ProjectUpdate, ProjectResponse } from "common";

type Project = typeof ProjectResponse.Type;

const fakeProject: Omit<Project, "id"> = {
    project_name: "Demo Project",
    project_description: "This is an automatically created demo project",
    project_objective: "Demonstrate the application features",
    project_stakeholders: "Development team"
};

const diff = (old: Project, updated: Project) => ProjectUpdate.make({
    timestamp: new Date(),
    reason: "Update project",
    userId: "user",
    changes: []
})

export class ProjectsRepo extends Context.Tag("ProjectsRepo")<
    ProjectsRepo,
    {
        create: (project: Omit<Project, "id">) => Effect.Effect<Project, PlatformError | ParseError>
        findById: (id: string) => Effect.Effect<Project | null, PlatformError | ParseError>
        update: (project: Project) => Effect.Effect<Project, PlatformError | ParseError>
        findUpdatesById: (id: string) => Effect.Effect<ProjectUpdate | null, PlatformError | ParseError>
        list: () => Effect.Effect<Project[], PlatformError | ParseError>
        // delete: (id: string) => Effect.Effect<void>
    }
>() {
    static live = Layer.effect(
        ProjectsRepo,
        Effect.gen(function* (_) {
            const store = yield* KeyValueStore.KeyValueStore
            const schemaStore = store.forSchema(ProjectResponse)
            const diffStore = store.forSchema(ProjectUpdate)

            const repo = ProjectsRepo.of({
                create: (project) => Effect.gen(function* (_) {
                    const sz = yield* schemaStore.size
                    const id = (sz + 1).toString()
                    const newProject = { ...project, id: ProjectId.make(id) }
                    yield* schemaStore.set((sz + 1).toString(), newProject)
                    return newProject
                }),

                findById: (id) => Effect.gen(function* (_) {
                    const result = yield* schemaStore.get(id)
                    return result._tag === "Some" ? result.value : null
                }),

                update: (project) => Effect.gen(function* (_) {
                    const id = project.id
                    const oldValue = yield* schemaStore.get(id)

                    yield* Option.match(oldValue, {
                        "onNone": () => Effect.succeed(false),
                        "onSome": (value) => Effect.gen(function* (_) {
                            const update = diff(value, project);
                            yield* diffStore.set(`updates_${id}`, update)
                            return true
                        })
                    });
                    yield* schemaStore.set(id, project)
                    return project
                }),

                findUpdatesById: (id) => Effect.gen(function* (_) {
                    const result = yield* diffStore.get(`updates_${id}`).pipe(Effect.tapError(Effect.log))
                    return result._tag === "Some" ? result.value : null
                }),

                list: () => Effect.gen(function* (_) {
                    const size = yield* schemaStore.size
                    const projects: Project[] = []

                    for (let i = 0; i < size; i++) {
                        const result = yield* schemaStore.get(`${i + 1}`)
                        if (result._tag === "Some") {
                            projects.push(result.value)
                        }
                    }
                    return projects
                })

                //delete: (id) => schemaStore.remove(id)
            })

            // Create fake project if store is empty
            const size = yield* schemaStore.size
            if (size === 0) {
                yield* repo.create(fakeProject)
            }

            return repo;
        })
    )
}

