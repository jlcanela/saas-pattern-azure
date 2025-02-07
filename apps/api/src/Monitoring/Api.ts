import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";
import { AuthorizationResult, AuthRequest } from "../lib/Permission/index.js";
import { Unauthorized } from "@effect/platform/HttpApiError";
import { Authorization } from "../Api/Authorization.js";

// TOFIX: This is a workaround for typescript error when importing API from common
export const MonitoringApi = HttpApiGroup.make("monitoring")
  .add(HttpApiEndpoint.get("ping")`/ping`.addSuccess(Schema.String).addError(Unauthorized).middleware(Authorization))
  .add(HttpApiEndpoint.get("config")`/config`.addSuccess(Schema.String))
  .add(HttpApiEndpoint.post("auth")`/auth`.setPayload(AuthRequest).addSuccess(AuthorizationResult)) 
