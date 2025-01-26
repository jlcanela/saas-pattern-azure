import { Effect, Schema, Context, Layer } from "effect"
import { KeyValueStore } from "@effect/platform"
import { PlatformError } from "@effect/platform/Error";
import { ParseError } from "effect/ParseResult";
//import { randomUUID } from "node:crypto";
import { ProjectId, ProjectRequest, ProjectResponse } from "common";

type Project = typeof ProjectResponse.Type;

const fakeProject: Omit<Project, "id"> = {
    project_name: "Demo Project",
    project_description: "This is an automatically created demo project",
    project_objective: "Demonstrate the application features",
    project_stakeholders: "Development team"
};

export class ProjectsRepo extends Context.Tag("ProjectsRepo")<
    ProjectsRepo,
    {
        create: (project: Omit<Project, "id">) => Effect.Effect<Project, PlatformError | ParseError>
        findById: (id: string) => Effect.Effect<Project | null, PlatformError | ParseError>
        update: (project: Project) => Effect.Effect<Project, PlatformError | ParseError>
        list: () => Effect.Effect<Project[], PlatformError | ParseError>
        // delete: (id: string) => Effect.Effect<void>
    }
>() {
    static live = Layer.effect(
        ProjectsRepo,
        Effect.gen(function* (_) {
            const store = yield* KeyValueStore.KeyValueStore
            const schemaStore = store.forSchema(ProjectResponse)

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
                    yield* schemaStore.set(id, project)
                    return project
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
                }),

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

