// src/main.ts
import { Layer } from "effect"

import { HttpApi, HttpApiBuilder } from "@effect/platform"

import { Permission } from "../lib/Permission/index.js"
//import { projectsApi, ProjectsApiLive } from "./ProjectApi.js"
import { monitoringApi, MonitoringApiLive } from "./MonitoringApi.js"

// export const api = HttpApi.make("MainApi").add(projectsApi).add(monitoringApi).prefix("/api")

// export const MyApiLive = HttpApiBuilder.api(api).pipe(
//   Layer.provide(ProjectsApiLive),
//   Layer.provide(MonitoringApiLive),
//   Layer.provide(Permission.live)
// )


export const api = HttpApi.make("MainApi").add(monitoringApi).prefix("/api")

export const MyApiLive = HttpApiBuilder.api(api).pipe(
  Layer.provide(MonitoringApiLive),
  Layer.provide(Permission.live)
)
