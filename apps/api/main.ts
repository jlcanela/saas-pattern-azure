// src/main.ts
import { NodeRuntime } from "@effect/platform-node"
import { Layer } from "effect"
import { HttpLive } from "./server/HttpServer.ts"

NodeRuntime.runMain(Layer.launch(HttpLive))
