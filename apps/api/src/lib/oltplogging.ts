// src/OTLPLogging.ts
import * as Otlp from "@effect/opentelemetry/Otlp"
import { NodeHttpClient } from "@effect/platform-node"
import { Layer } from "effect"

export const OTLPLoggingLive = Otlp.layer({
  baseUrl: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:18890", // Aspire's OTLP endpoint (default)
  resource: { serviceName: "Api" }
}).pipe(
  Layer.provide(NodeHttpClient.layer)
)