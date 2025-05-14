import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform";
import { Schema } from "effect";
import { AuthorizationResult, AuthRequest } from "../lib/Permission/index.js";
import { Unauthorized } from "@effect/platform/HttpApiError";
import { Authorization } from "../Middleware/Authorization.js";

// TOFIX: This is a workaround for typescript error when importing API from common
export const MonitoringApi = HttpApiGroup.make("monitoring")
  .add(HttpApiEndpoint.get("ping")`/ping`.addSuccess(Schema.String).addError(Unauthorized).middleware(Authorization).annotate(OpenApi.Description, `Requires **read** permission`))
  .add(HttpApiEndpoint.get("config")`/config`.addSuccess(Schema.String).annotate(OpenApi.Description, `Requires **read** permission`))
  .add(HttpApiEndpoint.post("auth")`/auth`.setPayload(AuthRequest).addSuccess(AuthorizationResult).annotate(OpenApi.Description, `Requires **auth** permission`)) 
