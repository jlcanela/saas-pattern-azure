import { Effect, Option } from "effect"
import type { Project as ProjectT, ProjectRequest } from "common"
import { ProjectsResponse } from "common"
import { ProjectRepo } from "./Project/Repo.js"
import { HttpApiError, KeyValueStore } from "@effect/platform"
import { HistoryRepo } from "./History/Repo.js"

export class Project extends Effect.Service<Project>()("Project", {
  effect: Effect.gen(function*() {
    const projectRepo = yield* ProjectRepo
    const historyRepo = yield* HistoryRepo
    
    const createProject = (payload: ProjectRequest) => Effect.gen(function*(_) {
      return yield* projectRepo.create(payload).pipe(
        Effect.map(() => `Project '${payload.project_name}' created`))
    }).pipe(
      Effect.catchTag("ParseError", (error) => Effect.flip(HttpApiError.HttpApiDecodeError.fromParseError(error))),
      Effect.catchTag("BadArgument", () => Effect.fail(new HttpApiError.BadRequest())),
      Effect.catchTag("SystemError", () => Effect.fail(new HttpApiError.InternalServerError())),
    )

    const findById = (id: string) => Effect.gen(function*(_) {      
      const project = yield* projectRepo.findById(id)
      return yield* Option.match(project, {
        onNone: () => Effect.fail(new HttpApiError.NotFound()),
        onSome: (project) => Effect.succeed(project)
      })
    }).pipe(
      Effect.catchTag("ParseError", (error) => Effect.flip(HttpApiError.HttpApiDecodeError.fromParseError(error))),
      Effect.catchTag("BadArgument", () => Effect.fail(new HttpApiError.BadRequest())),
      Effect.catchTag("SystemError", () => Effect.fail(new HttpApiError.InternalServerError())),
    )

    const update = (payload: ProjectT) =>
      Effect.gen(function*(_) {
        return yield* projectRepo.update(payload)
      }).pipe(
        Effect.catchTag("ParseError", (error) => Effect.flip(HttpApiError.HttpApiDecodeError.fromParseError(error))),
        Effect.catchTag("BadArgument", () => Effect.fail(new HttpApiError.BadRequest())),
        Effect.catchTag("SystemError", () => Effect.fail(new HttpApiError.InternalServerError)))

    const findProjectHistoryById = (id: string) => Effect.gen(function*(_) {
      return yield* historyRepo.findById(id).pipe(
        Effect.flatMap((history) => history),
        Effect.catchTag("ParseError", (error) => Effect.flip(HttpApiError.HttpApiDecodeError.fromParseError(error))),
        Effect.catchTag("BadArgument", () => Effect.fail(new HttpApiError.BadRequest())),
        Effect.catchTag("SystemError", () => Effect.fail(new HttpApiError.InternalServerError())),
        Effect.catchTag("NoSuchElementException", () => Effect.fail(new HttpApiError.NotFound()))
        )
    })

    const listProject = () => Effect.gen(function*(_) {
      const projects = yield* projectRepo.list()
      return ProjectsResponse.make({ projects })
    }).pipe(
      Effect.catchTag("ParseError", (error) => Effect.flip(HttpApiError.HttpApiDecodeError.fromParseError(error))),
      Effect.catchTag("BadArgument", () => Effect.fail(new HttpApiError.BadRequest())),
      Effect.catchTag("SystemError", () => Effect.fail(new HttpApiError.InternalServerError())),
    )

    return { createProject, findById, update, findProjectHistoryById, listProject } as const
  }),
  dependencies: [ProjectRepo.live, HistoryRepo.live, KeyValueStore.layerMemory]
}) {}
