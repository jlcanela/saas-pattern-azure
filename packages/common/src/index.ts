import { FetchHttpClient, HttpApi, HttpApiClient, HttpApiEndpoint, HttpApiError, HttpApiGroup, HttpApiSchema } from "@effect/platform";

import { Effect, Schema } from "effect"
export * from "./Domain/Project.js";

import { NotAvailable, ProjectId, ProjectRequest, ProjectUpdate, Project, ProjectResponse, ProjectsResponse } from "./Domain/Project.js";
import { PingResponse } from "./Domain/Health.js";

export const monitoringApi = HttpApiGroup.make("monitoring")
    .add(HttpApiEndpoint.get("ping")`/ping`.addSuccess(PingResponse))

const idParam = HttpApiSchema.param("id", Schema.String.pipe(Schema.brand("ProjectId")))

export const projectsApi = HttpApiGroup.make("projects")
    .add(HttpApiEndpoint.post("create")`/projects`.setPayload(ProjectRequest).addSuccess(Schema.String))
    .add(HttpApiEndpoint.get("findById")`/projects/${idParam}/edit`
        .addSuccess(ProjectResponse)
        .addError(HttpApiError.NotFound, { status: 404 })
        .addError(NotAvailable, { status: 503 }))
    .add(HttpApiEndpoint.post("update")`/projects/${idParam}`
        .setPayload(Project)
        .addSuccess(Schema.String)
        .addError(HttpApiError.HttpApiDecodeError, { status: 400 })
        .addError(HttpApiError.NotFound, { status: 404 })
        .addError(NotAvailable, { status: 503 }))
    .add(HttpApiEndpoint.get("findProjectUpdatesById")`/projects/${idParam}/updates`
        .addSuccess(ProjectUpdate)
        .addError(HttpApiError.NotFound, { status: 404 })
        .addError(NotAvailable, { status: 503 }))
    .add(HttpApiEndpoint.get("list")`/projects`.addSuccess(ProjectsResponse))

export type projectApi = typeof projectsApi;

export const api = HttpApi.make("MainApi").add(projectsApi).add(monitoringApi).prefix("/api")
export type api = typeof api;

export const projectsList = Effect.gen(function* () {
    const client = yield* HttpApiClient.make(api, {
        baseUrl: "/",
    });
    return yield* client.projects.list({});
}).pipe(Effect.provide(FetchHttpClient.layer));

export const projectFindById = (id: ProjectId) => Effect.gen(function* () {
    const client = yield* HttpApiClient.make(api, {
        baseUrl: "/",
    });
    return yield* client.projects.findById({ path: { id } });
}).pipe(Effect.provide(FetchHttpClient.layer));

export const projectsCreate = (payload: ProjectRequest) => Effect.gen(function* () {
    const client = yield* HttpApiClient.make(api, {
        baseUrl: "/",
    });
    return yield* client.projects.create({ payload });
}).pipe(Effect.provide(FetchHttpClient.layer));

export const projectUpdate = (payload: Project) => Effect.gen(function* () {
    const client = yield* HttpApiClient.make(api, {
        baseUrl: "/",
    });
    return yield* client.projects.update({
        path: { id: payload.id }, payload
    });
}).pipe(Effect.provide(FetchHttpClient.layer));

export const projectFindUpdatesById = (id: ProjectId) => Effect.gen(function* () {
    const client = yield* HttpApiClient.make(api, {
        baseUrl: "/",
    });
    return yield* client.projects.findProjectUpdatesById({ path: { id } });
}).pipe(Effect.provide(FetchHttpClient.layer));