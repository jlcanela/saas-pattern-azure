import { NodeRuntime } from "@effect/platform-node"
import { Layer } from "effect"
import { HttpLive } from "./Http.js"
import type { Effect } from "effect/Effect"
import type { ServeError } from "@effect/platform/HttpServerError"

const httpServer = Layer.launch(HttpLive) as Effect<never, ServeError, never>
NodeRuntime.runMain(httpServer, { disablePrettyLogger: true })
