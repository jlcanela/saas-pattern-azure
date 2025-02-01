// ProjectRepo.ts
import { KeyValueStore } from "@effect/platform"
import type { PlatformError } from "@effect/platform/Error"
import type { History } from "common"
import { ProjectResponse } from "common"
import { Arbitrary, Context, Data, Effect, Equal, FastCheck, Layer, Option } from "effect"
import type { ParseError } from "effect/ParseResult"
import { BaseRepo } from "../lib/BaseRepo.js"
import { HistoryRepo } from "./HistoryRepo.js"

type Project = typeof ProjectResponse.Type

export class ProjectsRepo extends Context.Tag("ProjectsRepo")<
  ProjectsRepo,
  {
    create: (project: Omit<Project, "id">) => Effect.Effect<Project, PlatformError | ParseError>
    findById: (id: string) => Effect.Effect<Option.Option<Project>, PlatformError | ParseError>
    update: (project: Project) => Effect.Effect<Project, PlatformError | ParseError>
    findHistoryById: (id: string) => Effect.Effect<Option.Option<History>, PlatformError | ParseError>
    list: () => Effect.Effect<Array<Project>, PlatformError | ParseError>
  }
>() {
  static live = Layer.effect(
    ProjectsRepo,
    Effect.gen(function*(_) {
      const store = yield* KeyValueStore.KeyValueStore
      const baseRepo = new BaseRepo("project", store, ProjectResponse)
      const historyRepo = yield* HistoryRepo

      const repo = ProjectsRepo.of({
        create: baseRepo.create,
        findById: baseRepo.findById,
        list: baseRepo.list,
        update: (project: Project) =>
          Effect.gen(function*(_) {
            const oldValue = yield* baseRepo.findById(project.id)
            if (Option.isSome(oldValue) && !Equal.equals(Data.struct(Option.getOrThrow(oldValue))), Data.struct(project)) {
              const isEqual = Equal.equals(Data.struct(Option.getOrThrow(oldValue)), Data.struct(project))
              if (!isEqual) {
                yield* historyRepo.create(
                  {
                    userId: "user",
                    reason: "Update project"
                  },
                  Option.getOrThrow(oldValue),
                  project
                )
              }
            }
            return yield* baseRepo.update(project)
          }),
        findHistoryById: (id) => historyRepo.findById(id)
      })

      // Create fake project if store is empty
      const size = yield* baseRepo.size()
      if (size === 0) {
        const arb = Arbitrary.make(ProjectResponse)
        const fakeProject = FastCheck.sample(arb, 1)
        yield* repo.create(fakeProject[0])
      }

      return repo
    })
  )
}
