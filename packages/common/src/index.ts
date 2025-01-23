import { FetchHttpClient, HttpApi, HttpApiClient, HttpApiEndpoint, HttpApiGroup } from "@effect/platform";

import { Effect, Schema } from "effect"
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

