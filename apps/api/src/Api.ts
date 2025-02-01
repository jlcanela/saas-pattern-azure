// src/main.ts
import { Effect, Layer, Option, Schema } from "effect"

import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiError, HttpApiGroup, HttpApiSchema } from "@effect/platform"

import { History, Project, ProjectRequest, ProjectResponse, ProjectsResponse } from "common"

import { HistoryRepo } from "./Projects/HistoryRepo.js"
import { ProjectsRepo } from "./Projects/ProjectsRepo.js"

// TOFIX: This is a workaround for typescript error when importing API from common
const monitoringApi = HttpApiGroup.make("monitoring")
  .add(HttpApiEndpoint.get("ping")`/ping`.addSuccess(Schema.String))

const idParam = HttpApiSchema.param("id", Schema.String.pipe(Schema.brand("ProjectId")))

//  HttpApiDecodeError | BadRequest | InternalServerError
const projectsApi = HttpApiGroup.make("projects")
  .addError(HttpApiError.InternalServerError, { status: 503 })
  .add(
    HttpApiEndpoint.post("create")`/projects`
      .setPayload(ProjectRequest)
      .addSuccess(Schema.String)
      .addError(HttpApiError.HttpApiDecodeError)
      .addError(HttpApiError.BadRequest)
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.get("findById")`/projects/${idParam}/edit`
      .addSuccess(ProjectResponse)
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.HttpApiDecodeError)
      .addError(HttpApiError.BadRequest)
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.post("update")`/projects/${idParam}`
      .setPayload(Project)
      .addSuccess(ProjectResponse)
      .addError(HttpApiError.HttpApiDecodeError)
      .addError(HttpApiError.BadRequest)
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.get("findProjectHistoryById")`/projects/${idParam}/history`
      .addSuccess(History)
      .addError(HttpApiError.HttpApiDecodeError)
      .addError(HttpApiError.BadRequest)
      .addError(HttpApiError.InternalServerError)
      .addError(HttpApiError.NotFound)
  )
  .add(
    HttpApiEndpoint.get("list")`/projects`
      .addSuccess(ProjectsResponse)
      .addError(HttpApiError.HttpApiDecodeError)
      .addError(HttpApiError.BadRequest)
      .addError(HttpApiError.InternalServerError)
  )

export const api = HttpApi.make("MainApi").add(projectsApi).add(monitoringApi).prefix("/api")

const createProject = (payload: ProjectRequest) => Effect.gen(function*(_) {
  const repo = yield* ProjectsRepo
  return yield* repo.create(payload).pipe(
    Effect.map(() => `Project '${payload.project_name}' created`))
}).pipe(
  Effect.catchTag("ParseError", (error) => Effect.flip(HttpApiError.HttpApiDecodeError.fromParseError(error))),
  Effect.catchTag("BadArgument", () => Effect.fail(new HttpApiError.BadRequest())),
  Effect.catchTag("SystemError", () => Effect.fail(new HttpApiError.InternalServerError())),
)

const findById = (id: string) => Effect.gen(function*(_) {
  const repo = yield* ProjectsRepo
  const project = yield* repo.findById(id)
  return yield* Option.match(project, {
      onNone: () => Effect.fail(new HttpApiError.NotFound()),
      onSome: (project) => Effect.succeed(project)
    })
  }).pipe(
    Effect.catchTag("ParseError", (error) => Effect.flip(HttpApiError.HttpApiDecodeError.fromParseError(error))),
    Effect.catchTag("BadArgument", () => Effect.fail(new HttpApiError.BadRequest())),
    Effect.catchTag("SystemError", () => Effect.fail(new HttpApiError.InternalServerError())),
  )

const update = (payload: Project) =>
    Effect.gen(function*(_) {
      const repo = yield* ProjectsRepo
      return yield* repo.update(payload)
    }).pipe(
      Effect.catchTag("ParseError", (error) => Effect.flip(HttpApiError.HttpApiDecodeError.fromParseError(error))),
      Effect.catchTag("BadArgument", () => Effect.fail(new HttpApiError.BadRequest())),
      Effect.catchTag("SystemError", () => Effect.fail(new HttpApiError.InternalServerError())),
  )

const findProjectHistoryById = (id: string) => Effect.gen(function*(_) {
  const repo = yield* HistoryRepo
  return yield* repo.findById(id).pipe(
    Effect.flatMap((history) => history)
    //  Option.isSome(history) ? Effect.succeed(history) : Effect.fail(HttpApiError.NotFound)
    )
}).pipe(
  Effect.catchTag("ParseError", (error) => Effect.flip(HttpApiError.HttpApiDecodeError.fromParseError(error))),
  Effect.catchTag("BadArgument", () => Effect.fail(new HttpApiError.BadRequest())),
  Effect.catchTag("SystemError", () => Effect.fail(new HttpApiError.InternalServerError())),
  Effect.catchTag("NoSuchElementException", () => Effect.fail(new HttpApiError.NotFound()))
)

const listProject = () => Effect.gen(function*(_) {
  const repo = yield* ProjectsRepo
  const projects = yield* repo.list()
  return ProjectsResponse.make({ projects })

}).pipe(
  Effect.catchTag("ParseError", (error) => Effect.flip(HttpApiError.HttpApiDecodeError.fromParseError(error))),
  Effect.catchTag("BadArgument", () => Effect.fail(new HttpApiError.BadRequest())),
  Effect.catchTag("SystemError", () => Effect.fail(new HttpApiError.InternalServerError())),
)

const ProjectsApiLive = HttpApiBuilder.group(api, "projects", (handlers) =>
  handlers
    .handle("create", (req) => createProject(req.payload))
    .handle("findById", ({ path: { id } }) => findById(id))
    .handle("update", (req) => update(req.payload))
    .handle("findProjectHistoryById", ({ path: { id } }) => findProjectHistoryById(id))
    .handle("list", () => listProject())
  )      

const MonitoringApiLive = HttpApiBuilder.group(api, "monitoring", (handlers) =>
  handlers
    .handle("ping", (_req) => Effect.succeed("pong")))

export const MyApiLive = HttpApiBuilder.api(api).pipe(
  Layer.provide(ProjectsApiLive),
  Layer.provide(MonitoringApiLive)
)
