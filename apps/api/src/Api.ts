import { HttpApi, OpenApi } from "@effect/platform"
import { MonitoringApi } from "./Monitoring/Api.js";
import { ProjectApi } from "./Project/Api.js";

export const Api = HttpApi.make("MainApi")
  .add(MonitoringApi)
  .add(ProjectApi)
  .annotate(OpenApi.Title, "Groups API").prefix("/api")
