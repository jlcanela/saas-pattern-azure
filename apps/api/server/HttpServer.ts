// src/server/HttpServer.ts
import { HttpMiddleware, HttpApiSwagger, HttpApiBuilder } from "@effect/platform"
import { NodeHttpServer } from "@effect/platform-node"
import { Layer } from "effect"
import { createServer } from "node:http"
import { WebAppRoutes } from "../web/WebApp.ts"
import { MyApiLive } from "../api/StatusApi.ts"

export const ServerLive = NodeHttpServer.layer(createServer, { port: 8000 })

export const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
    Layer.provide(HttpApiSwagger.layer()),
    Layer.provide(WebAppRoutes),
    Layer.provide(MyApiLive),
    Layer.provide(ServerLive)
)
