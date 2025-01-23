// src/main.ts
import { NodeRuntime } from "@effect/platform-node"
import { Effect, Layer, Schema } from "effect"

import { NodeHttpServer } from "@effect/platform-node"
import { HttpMiddleware, HttpApiSwagger, HttpApiBuilder, HttpApiGroup, HttpApiEndpoint, HttpApi, KeyValueStore, HttpApiError } from "@effect/platform"

import { createServer } from "node:http"
import { WebAppRoutes } from "./WebApp.js"
import { TracingLive } from "./Tracing.js"
import { ProjectsRepo } from "./Projects/ProjectsRepo.js"

import { NotAvailable } from "../../../packages/common/src/Domain/Project.js"

const ProjectRequest = Schema.Struct({
    project_name: Schema.String,
    project_description: Schema.String,
    project_objective: Schema.String,
    project_stakeholders: Schema.String
})

const ProjectResponse = Schema.Struct({
    id: Schema.UUID,
    project_name: Schema.String,
    project_description: Schema.String,
    project_objective: Schema.String,
    project_stakeholders: Schema.String
})

const ProjectsResponse = Schema.Struct({
    projects: Schema.Array(ProjectResponse)
})

const monitoringApi = HttpApiGroup.make("monitoring")
    .add(HttpApiEndpoint.get("ping")`/ping`.addSuccess(Schema.String))

const projectsApi = HttpApiGroup.make("projects")
    .add(HttpApiEndpoint.post("create")`/projects`
        .setPayload(ProjectRequest)
        .addSuccess(Schema.String)
        .addError(HttpApiError.HttpApiDecodeError, { status: 400 })
        .addError(HttpApiError.NotFound, { status: 404 })
        .addError(NotAvailable, { status: 503 })
    )
    .add(HttpApiEndpoint.get("list")`/projects`
        .addSuccess(ProjectsResponse)
        .addError(NotAvailable, { status: 503 })
    )

export const api = HttpApi.make("MainApi").add(projectsApi).add(monitoringApi).prefix("/api")

const ProjectsApiLive = HttpApiBuilder.group(api, "projects", (handlers) =>
    handlers
        .handle("create", (req) => Effect.gen(function* (_) {
            const repo = yield* ProjectsRepo;
            const message = yield* repo.create(req.payload).pipe(
                Effect.map(() => `Project '${req.payload.project_name}' created`),
                Effect.catchAll(() => Effect.fail(NotAvailable.make({})))
            );
            return message;
        }))
        .handle("list", () => Effect.gen(function* (_) {
            const repo = yield* ProjectsRepo;
            const p = yield* repo.list().pipe(Effect.catchAll(() => Effect.fail(NotAvailable.make({}))));
            return ProjectsResponse.make({ projects: p });
        }))
)

const MonitoringApiLive = HttpApiBuilder.group(api, "monitoring", (handlers) =>
    handlers
        .handle("ping", (_req) => Effect.succeed("pong"))
)

export const MyApiLive = HttpApiBuilder.api(api).pipe(
    Layer.provide(ProjectsApiLive),
    Layer.provide(MonitoringApiLive)
)

export const ServerLive = NodeHttpServer.layer(createServer, { port: 8000 })

export const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
    Layer.provide(TracingLive),
    Layer.provide(HttpApiSwagger.layer()),
    Layer.provide(MyApiLive),
    Layer.provide(ProjectsRepo.live),
    Layer.provide(KeyValueStore.layerMemory),
    Layer.provide(WebAppRoutes),
    Layer.provide(ServerLive)
)

const httpServer = Layer.launch(HttpLive)

NodeRuntime.runMain(httpServer, { disablePrettyLogger: true })
