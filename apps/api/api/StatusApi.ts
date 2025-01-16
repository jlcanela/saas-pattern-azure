// src/api/StatusApi.ts
import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Effect, Layer, Schema } from "effect"

class ProjectRequest extends Schema.Class<ProjectRequest>("ProjectRequest")({
    project_name: Schema.String,
    project_description: Schema.String,
    project_objective: Schema.String,
    project_stakeholders: Schema.String
}) { }

export const MainApi = HttpApi.make("MainApi").add(
    HttpApiGroup.make("StatusApi")
        .add(HttpApiEndpoint.get("ping")`/ping`.addSuccess(Schema.String))
        .add(HttpApiEndpoint.post("projects")`/projects`.setPayload(ProjectRequest).addSuccess(Schema.String))
).prefix("/api")

export const StatusApiLive = HttpApiBuilder.group(MainApi, "StatusApi", (handlers) =>
    handlers
        .handle("ping", () => Effect.succeed("pong"))
        .handle("projects", (req) => Effect.succeed(`Project ${req.payload} created`))
)

export const MyApiLive = HttpApiBuilder.api(MainApi).pipe(Layer.provide(StatusApiLive))
