import { FetchHttpClient, HttpApi, HttpApiClient, HttpApiEndpoint, HttpApiGroup } from "@effect/platform";

import { Effect, Schema } from "effect"

// Define the schema without extending classes
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

export const monitoringApi = HttpApiGroup.make("monitoring")
    .add(HttpApiEndpoint.get("ping")`/ping`.addSuccess(Schema.String))

export const projectsApi = HttpApiGroup.make("projects")
    .add(HttpApiEndpoint.post("create")`/projects`.setPayload(ProjectRequest).addSuccess(Schema.String))
    .add(HttpApiEndpoint.get("list")`/projects`.addSuccess(ProjectsResponse))

export const api = HttpApi.make("MainApi").add(projectsApi).add(monitoringApi).prefix("/api")

export const projectsList = Effect.gen(function* () {
    const client = yield* HttpApiClient.make(api, {
        baseUrl: "/",
    });
    return yield* client.projects.list({});
}).pipe(Effect.provide(FetchHttpClient.layer));

