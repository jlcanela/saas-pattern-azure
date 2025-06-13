import { Arbitrary, Effect, FastCheck } from "effect"
import type { Project as ProjectT } from "common"
import { ProjectRequest, ProjectResponse, ProjectsResponse } from "common"
import { ProjectRepo } from "./Project/Repo.js"
import { HttpApiError, KeyValueStore } from "@effect/platform"
import { HistoryRepo } from "./History/Repo.js"
import { Cosmos } from "./lib/CosmosDb.js"
import { v4 as uuidv4 } from 'uuid';

export class Project extends Effect.Service<Project>()("Project", {
  effect: Effect.gen(function* () {
    const cosmos = yield* Cosmos
    const projectRepo = yield* ProjectRepo
    const historyRepo = yield* HistoryRepo

    const createProject = (payload: ProjectRequest) => Effect.gen(function* (_) {
      const id = uuidv4()
      return yield* cosmos.writeDocument({ id, project_id: id, ...payload })
    })

    const findById = (id: string) => Effect.gen(function* (_) {
      yield* Effect.log(`findProjectById: ${id}`)
      const { resource } = yield* cosmos.readDocument(id)
      return ProjectResponse.make(resource)
    }).pipe(
      Effect.withSpan("findProjectById")
    )

    const update = (payload: ProjectT) =>
      Effect.gen(function* (_) {
        yield* Effect.log(`updateProject: ${payload.id}`)  
        return (yield* projectRepo.update(payload)) as ProjectResponse
      }).pipe(
        Effect.withSpan("updateProject"),
        Effect.catchTag("ParseError", (error) => Effect.flip(HttpApiError.HttpApiDecodeError.fromParseError(error))),
        Effect.catchTag("BadArgument", () => Effect.fail(new HttpApiError.BadRequest())),
        Effect.catchTag("SystemError", () => Effect.fail(new HttpApiError.InternalServerError)))

    const findProjectHistoryById = (id: string) => Effect.gen(function* (_) {
      yield* Effect.log(`findProjectHistoryById: ${id}`)  
      return yield* historyRepo.findById(id).pipe(
        Effect.flatMap((history) => history),
        Effect.withSpan("findProjectHistoryById"),
        Effect.catchTag("ParseError", (error) => Effect.flip(HttpApiError.HttpApiDecodeError.fromParseError(error))),
        Effect.catchTag("BadArgument", () => Effect.fail(new HttpApiError.BadRequest())),
        Effect.catchTag("SystemError", () => Effect.fail(new HttpApiError.InternalServerError())),
        Effect.catchTag("NoSuchElementException", () => Effect.fail(new HttpApiError.NotFound()))
      )
    })

    const listProject = () => Effect.gen(function* (_) {
      yield* Effect.log(`listProject`)  
      const projects = yield* cosmos.query()
      return ProjectsResponse.make({ projects })
    }).pipe(
      Effect.withSpan("listProjects")
    )

    const nb = (yield* listProject()).projects.length
    if (nb == 0) {
      yield* Effect.log("No project found, creating 4 sample projects")
      const ProjectArbitrary = Arbitrary.make(ProjectRequest)
      const sampleProjects = FastCheck.sample(ProjectArbitrary, 4)
      yield* Effect.forEach(sampleProjects, createProject)
    }
    return { createProject, findById, update, findProjectHistoryById, listProject } as const
  }),
  dependencies: [ProjectRepo.live, HistoryRepo.live, KeyValueStore.layerMemory]
}) { }
