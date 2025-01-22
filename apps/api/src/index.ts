// src/main.ts
import { NodeRuntime } from "@effect/platform-node"
import { Arbitrary, Effect, FastCheck, Layer, Schema } from "effect"

import { NodeHttpServer } from "@effect/platform-node"
import { HttpMiddleware, HttpApiSwagger, HttpApiBuilder, HttpApiGroup, HttpApiEndpoint, HttpApi } from "@effect/platform"

import { createServer } from "node:http"
import { WebAppRoutes } from "./WebApp.js"

export const PingResponse: Schema.Schema<string, string, never> = Schema.String

export const ProjectRequest = Schema.Struct({
    project_name: Schema.String,
    project_description: Schema.String,
    project_objective: Schema.String,
    project_stakeholders: Schema.String
})

export const ProjectResponse = Schema.Struct({
    id: Schema.UUID,
    project_name: Schema.String,
    project_description: Schema.String,
    project_objective: Schema.String,
    project_stakeholders: Schema.String
})

export const ProjectsResponse = Schema.Struct({
    projects: Schema.Array(ProjectResponse)
})

// Type inference from schemas
export type PingResponseType = typeof PingResponse.Type //Schema.Schema.Type<typeof PingResponse>
export type ProjectRequestType = Schema.Schema.Type<typeof ProjectRequest>
export type ProjectResponseType = Schema.Schema.Type<typeof ProjectResponse>
export type ProjectsResponseType = Schema.Schema.Type<typeof ProjectsResponse>

const monitoring = HttpApiGroup.make("monitoring")
    .add(HttpApiEndpoint.get("ping")`/ping`.addSuccess(Schema.String))

const projects = HttpApiGroup.make("projects")
    .add(HttpApiEndpoint.post("create")`/projects`.setPayload(ProjectRequest).addSuccess(Schema.String))
    .add(HttpApiEndpoint.get("list")`/projects`.addSuccess(ProjectsResponse))

export const api = HttpApi.make("MainApi").add(projects).add(monitoring).prefix("/api")

const arb = Arbitrary.make(ProjectResponse)

const ProjectsApiLive = HttpApiBuilder.group(api, "projects", (handlers) =>
    handlers
        .handle("create", (req) => Effect.succeed(`Project ${req.payload} created`))
        .handle("list", (_req) => Effect.succeed({ projects: FastCheck.sample(arb, 2) }))
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
    Layer.provide(HttpApiSwagger.layer()),
    Layer.provide(MyApiLive),
    Layer.provide(WebAppRoutes),
    Layer.provide(ServerLive)
)

const httpServer = Layer.launch(HttpLive)

NodeRuntime.runMain(httpServer)
