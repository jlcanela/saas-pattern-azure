import { Effect, Schema, Context, Layer } from "effect"
import { KeyValueStore } from "@effect/platform"
import { PlatformError } from "@effect/platform/Error";
import { ParseError } from "effect/ParseResult";
import { randomUUID } from "node:crypto";
import { ProjectId, ProjectRequest, ProjectResponse } from "../../../../packages/common/src/Domain/Project.js";

type Project = typeof ProjectResponse.Type;

// Ugly hack to be able to list the values as KeyValueStore does not have a method to list all keys
export class ProjectsRepo extends Context.Tag("ProjectsRepo")<
    ProjectsRepo,
    {
        create: (project: Omit<Project, "id">) => Effect.Effect<Project, PlatformError | ParseError>
        // findById: (id: string) => Effect.Effect<Project | null>
        list: () => Effect.Effect<Project[], PlatformError | ParseError>
        // delete: (id: string) => Effect.Effect<void>
    }
>() {
    static live = Layer.effect(
        ProjectsRepo,
        Effect.gen(function* (_) {
            const store = yield* KeyValueStore.KeyValueStore
            const schemaStore = store.forSchema(ProjectResponse)

            return ProjectsRepo.of({
                create: (project) => Effect.gen(function* (_) {
                    const id = randomUUID()
                    const sz = yield* schemaStore.size
                    const newProject = { ...project, id: ProjectId.make(id) }
                    yield* schemaStore.set((sz + 1).toString(), newProject)
                    const size = yield* schemaStore.size
                    return newProject
                }),

                // findById: (id) => Effect.gen(function* (_) {
                //     const result = yield* schemaStore.get(id)
                //     return result._tag === "Some" ? result.value : null
                // }),

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
                }),

                //delete: (id) => schemaStore.remove(id)
            })
        })
    )
}

