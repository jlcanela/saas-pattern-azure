import { FetchHttpClient, HttpApi, HttpApiClient, HttpApiEndpoint, HttpApiGroup } from "@effect/platform";

import { Effect, Schema } from "effect"
export { ProjectRequest, ProjectsResponse } from "./Domain/Project.js";
import { ProjectRequest, ProjectsResponse } from "./Domain/Project.js";
import { PingResponse } from "./Domain/Health.js";


export const monitoringApi = HttpApiGroup.make("monitoring")
    .add(HttpApiEndpoint.get("ping")`/ping`.addSuccess(PingResponse))

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

export const projectsCreate = (payload: ProjectRequest) => Effect.gen(function* () {
    const client = yield* HttpApiClient.make(api, {
        baseUrl: "/",
    });
    return yield* client.projects.create({ payload });
}).pipe(Effect.provide(FetchHttpClient.layer));



export const ProjectInfo = Schema.Struct({
    name: Schema.String.pipe(Schema.minLength(1)).annotations({ title: "Name" }),
    description: Schema.String.pipe(Schema.minLength(1)).annotations({ title: "Description" }),
})

export type ProjectInfo = typeof ProjectInfo.Type

export const ProjectObjective = Schema.Struct({
    objectives: Schema.String.pipe(Schema.minLength(1)).annotations({ title: "Objectives" }),
    stakeholders: Schema.String.pipe(Schema.minLength(1)).annotations({ title: "Stakeholders" }),
})

export type ProjectObjective = typeof ProjectObjective.Type