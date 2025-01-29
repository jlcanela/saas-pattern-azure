// ProjectRepo.ts
import { Effect, Context, Layer } from "effect"
import { KeyValueStore } from "@effect/platform"
import { PlatformError } from "@effect/platform/Error"
import { ParseError } from "effect/ParseResult"
import { ProjectUpdate, ProjectResponse, History } from "common"
import { BaseRepo } from "../lib/BaseRepo.js"
import { HistoryRepo } from "./HistoryRepo.js"

type Project = typeof ProjectResponse.Type

const fakeProject: Omit<Project, "id"> = {
    project_name: "Demo Project",
    project_description: "This is an automatically created demo project",
    project_objective: "Demonstrate the application features",
    project_stakeholders: "Development team"
}

export class ProjectsRepo extends Context.Tag("ProjectsRepo")<
    ProjectsRepo,
    {
        create: (project: Omit<Project, "id">) => Effect.Effect<Project, PlatformError | ParseError>
        findById: (id: string) => Effect.Effect<Project | null, PlatformError | ParseError>
        update: (project: Project) => Effect.Effect<Project, PlatformError | ParseError>
        findHistoryById: (id: string) => Effect.Effect<History | null, PlatformError | ParseError>
        list: () => Effect.Effect<Project[], PlatformError | ParseError>
    }
>() {
    static live = Layer.effect(
        ProjectsRepo,
        Effect.gen(function* (_) {
            const store = yield* KeyValueStore.KeyValueStore
            const baseRepo = new BaseRepo("project", store, ProjectResponse)
            const history = yield* HistoryRepo;

            const repo = ProjectsRepo.of({
                create: baseRepo.create,
                findById: baseRepo.findById,
                list: baseRepo.list,
                update: (project: Project) => Effect.gen(function* (_) {
                    const oldValue = yield* baseRepo.findById(project.id)
                    yield* history.create({
                        userId: "user",
                        reason: "Update project"
                    }, oldValue || { id: project.id }, project);
                    return yield* baseRepo.update(project)
                }),
                findHistoryById: history.findById
            })

            // Create fake project if store is empty
            const size = yield* baseRepo.size()
            if (size === 0) {
                yield* repo.create(fakeProject)
            }

            return repo
        })
    )
}
