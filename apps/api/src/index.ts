import { NodeRuntime } from "@effect/platform-node"
import { Layer } from "effect"
import { HttpLive } from "./Http.js"
import type { Effect } from "effect/Effect"
import type { ServeError } from "@effect/platform/HttpServerError"
import { NodeSdk } from "@effect/opentelemetry"
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base"
import { OTLPTraceExporter as OTLPTraceExporterGrpc  } from "@opentelemetry/exporter-trace-otlp-grpc"
import { OTLPLogExporter as OTLPLogExporterGrpc } from "@opentelemetry/exporter-logs-otlp-grpc"
import { OTLPTraceExporter as OTLPTraceExporterHttp  } from "@opentelemetry/exporter-trace-otlp-http"
import { OTLPLogExporter as OTLPLogExporterHttp } from "@opentelemetry/exporter-logs-otlp-http"
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs"

const oltp_grpc = process.env.OTEL_EXPORTER_OTLP_PROTOCOL === "grpc"

const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: process.env.OTEL_SERVICE_NAME || "Api" },
    spanProcessor: new BatchSpanProcessor(oltp_grpc ? new OTLPTraceExporterGrpc() : new OTLPTraceExporterHttp()),
    logRecordProcessor: new BatchLogRecordProcessor(oltp_grpc ? new OTLPLogExporterGrpc() : new OTLPLogExporterHttp()),
}))

const httpServer = Layer.launch(HttpLive.pipe(
    Layer.provide(NodeSdkLive),
)) as Effect<never, ServeError, never>
NodeRuntime.runMain(httpServer, { disablePrettyLogger: true })

