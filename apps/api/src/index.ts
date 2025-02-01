// src/main.ts
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { Context, Effect, Layer } from "effect"

import { HttpApiBuilder, HttpApiSwagger, HttpMiddleware, KeyValueStore } from "@effect/platform"

import { createServer } from "node:http"
import { TracingLive } from "./Tracing.js"
import { WebAppRoutes } from "./WebApp.js"

import { MyApiLive } from "./Api.js"
import { HistoryRepo } from "./Projects/HistoryRepo.js"
import { ProjectsRepo } from "./Projects/ProjectsRepo.js"

class InitService extends Context.Tag("InitService")<
InitService,
  { info: () => void}
>() {
  static live = Layer.effect(InitService,
    Effect.gen(function*(_) {
      const projectRepo = yield* ProjectsRepo
      yield* projectRepo.fake()
      return ({
        info: () => {}
      });
    }))
}

export const ServerLive = NodeHttpServer.layer(createServer, { port: 8000 })

export const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(InitService.live),
  Layer.provide(TracingLive),
  Layer.provide(HttpApiSwagger.layer()),
  Layer.provide(MyApiLive),
  Layer.provide(ProjectsRepo.live),
  Layer.provide(HistoryRepo.live),
  Layer.provide(KeyValueStore.layerMemory),
  Layer.provide(WebAppRoutes),
  Layer.provide(ServerLive),
)

const httpServer = Layer.launch(HttpLive)

NodeRuntime.runMain(httpServer, { disablePrettyLogger: true })

