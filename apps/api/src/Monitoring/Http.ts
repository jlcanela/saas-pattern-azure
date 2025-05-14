import { HttpApiBuilder } from "@effect/platform";
import { Effect, Layer } from "effect";
import type { AuthRequest } from "../lib/Permission/index.js";
import { Permission } from "../lib/Permission/index.js";
import { Api } from "../Api.js";
import { AuthorizationLive, CurrentSecurityContext } from "../Middleware/Authorization.js";
import { ApiMetadata } from "../lib/ApiMetadata.js";
//import {  AuthorizationLive, CurrentSecurityContext } from "../Middleware/Authorization";

const pong = Effect.gen(function*(_) { 
  const ctx = yield* CurrentSecurityContext
  yield* Effect.log(`SecurityContext: ${ctx}`)
  return yield* Effect.succeed("pong")
})

const config = () => Effect.gen(function*(_) {
  const perm = yield* Permission
  return yield* perm.version()
})

const auth = (authRequest: AuthRequest) => Effect.gen(function*(_) {
  const perm = yield* Permission
  return yield* perm.auth(authRequest)
})

export const HttpMonitoringLive = HttpApiBuilder.group(Api, "monitoring", (handlers) =>
  handlers
    .handle("ping", (_req) => pong)
    .handle("config", config)
    .handle("auth", (req) => auth(req.payload)))
    .pipe(
      Layer.provide(AuthorizationLive), 
      Layer.provide(Permission.live), 
      Layer.provide(ApiMetadata.live)
    )
