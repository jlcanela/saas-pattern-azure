import { HttpApiBuilder, HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import { Effect, Layer, Schema } from "effect";
import { AuthorizationResult, AuthRequest, Permission } from "../lib/Permission/index.js";
import { Unauthorized } from "@effect/platform/HttpApiError";
import { api } from "./index.js";
import { Authorization, AuthorizationLive, CurrentUser } from "./Authorization.js";

// TOFIX: This is a workaround for typescript error when importing API from common
export const monitoringApi = HttpApiGroup.make("monitoring")
  .add(HttpApiEndpoint.get("ping")`/ping`.addSuccess(Schema.String).addError(Unauthorized).middleware(Authorization))
  .add(HttpApiEndpoint.get("config")`/config`.addSuccess(Schema.String))
  .add(HttpApiEndpoint.post("auth")`/auth`.setPayload(AuthRequest).addSuccess(AuthorizationResult))

const pong = Effect.gen(function*(_) { 
  const user = yield* CurrentUser
  yield* Effect.log(`User: ${user.id}`)
  return yield* Effect.succeed("pong")
})

const config = () => Effect.gen(function*(_) {
  const perm = yield* Permission
  return yield* perm.version()
})

const auth = (authRequest: AuthRequest) => Effect.gen(function*(_) {
  const perm = yield* Permission
  // const principal: Principal = { type: "user", id: "1"}
  // const action: Action = { type: "read", id: "1"}
  // const resource: Resource = { type: "project", id: "1"}
  // const context = { }

  return yield* perm.auth(authRequest)
})

export const MonitoringApiLive = HttpApiBuilder.group(api, "monitoring", (handlers) =>
  handlers
    .handle("ping", (_req) => pong)
    .handle("config", config)
    .handle("auth", (req) => auth(req.payload))).pipe(Layer.provide(AuthorizationLive))
