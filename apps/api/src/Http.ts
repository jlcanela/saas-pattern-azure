import { HttpApiBuilder, HttpApiSwagger, HttpMiddleware, HttpServer, KeyValueStore } from "@effect/platform"
import { NodeHttpServer, NodeSocket } from "@effect/platform-node"
import { Layer } from "effect"
import { createServer } from "http"
import { HttpMonitoringLive } from "./Monitoring/Http.js"
import { HttpProjectLive } from "./Project/Http.js"
// import { WebAppRoutes } from "./lib/WebApp.js"
import { Api } from "./Api.js"
import { ProjectRepo } from "./Project/Repo.js"
import { HistoryRepo } from "./History/Repo.js"
import { DevTools } from "@effect/experimental"
import { Cosmos } from "./lib/CosmosDb.js"
import { TracingLive } from "./lib/tracing.js"

const DevToolsLive = DevTools.layerWebSocket().pipe(
    Layer.provide(NodeSocket.layerWebSocketConstructor),
  )

const ApiLive = Layer.provide(HttpApiBuilder.api(Api), [
  HttpMonitoringLive,
  HttpProjectLive,
])

//   Layer.provide(InitService.live),
//   Layer.provide(TracingLive),
//   Layer.provide(ServerLive),
//   Layer.provide(Permission.live),

export const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(TracingLive),
  Layer.provide(DevToolsLive),
  Layer.provide(HttpApiSwagger.layer()),
  Layer.provide(HttpApiBuilder.middlewareOpenApi()),
  Layer.provide(HttpApiBuilder.middlewareCors()),
  Layer.provide(ApiLive),
  Layer.provide(ProjectRepo.live),
  Layer.provide(HistoryRepo.live),
  Layer.provide(KeyValueStore.layerMemory),
  // Layer.provide(WebAppRoutes),
  Layer.provide(Cosmos.Default),
  HttpServer.withLogAddress,
  Layer.provide(NodeHttpServer.layer(createServer, { port: 8000 }))
)
