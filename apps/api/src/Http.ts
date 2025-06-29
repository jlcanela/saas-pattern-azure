import { HttpApiBuilder, HttpApiSwagger, HttpMiddleware, HttpServer, KeyValueStore } from "@effect/platform"
import { NodeHttpServer, NodeSocket } from "@effect/platform-node"
import { Layer} from "effect"
import { createServer } from "http"
import { HttpMonitoringLive } from "./Monitoring/Http.js"
import { HttpProjectLive } from "./Project/Http.js"
import { WebAppRoutes } from "./lib/WebApp.js"
import { Api } from "./Api.js"
import { ProjectRepo } from "./Project/Repo.js"
import { HistoryRepo } from "./History/Repo.js"
import { DevTools } from "@effect/experimental"
import { Cosmos } from "./lib/CosmosDb.js"
import { TracingLive } from "./lib/tracing.js"
import { OTLPLoggingLive } from "./lib/oltplogging.ts"

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

const portEnv = process.env.PORT;
const port = Number.isInteger(Number(portEnv)) && Number(portEnv) > 0 ? Number(portEnv) : 8000;

export const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(OTLPLoggingLive),
  Layer.provide(TracingLive),
  Layer.provide(DevToolsLive),
  Layer.provide(HttpApiSwagger.layer()),
  Layer.provide(HttpApiBuilder.middlewareOpenApi()),
  Layer.provide(HttpApiBuilder.middlewareCors()),
  Layer.provide(ApiLive),
  Layer.provide(ProjectRepo.live),
  Layer.provide(HistoryRepo.live),
  Layer.provide(KeyValueStore.layerMemory),
  Layer.provide(WebAppRoutes),
  Layer.provide(Cosmos.Default),
  HttpServer.withLogAddress,
//  Layer.provide(Logger.json),
  Layer.provide(NodeHttpServer.layer(createServer, { port })),
  //Logger.withMinimumLogLevel(LogLevel.Info)
)
