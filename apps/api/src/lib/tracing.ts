import { NodeSdk } from "@effect/opentelemetry"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base"
// import * as grpc from "@grpc/grpc-js"

const oltpExporter = new OTLPTraceExporter({
})

export const TracingLive = NodeSdk.layer(() => ({
  resource: { serviceName: "effect-api" },
  spanProcessor: new BatchSpanProcessor(
    oltpExporter
    //  new OTLPTraceExporter({
    //    url: "https://localhost:21067", // Must match mapped port
    //     credentials: grpc.credentials.createInsecure(), // For dev (no TLS)
    //     metadata: new grpc.Metadata()
    // }),
    ,
    {
      scheduledDelayMillis: 500, // Export every 0.5 second
      maxExportBatchSize: 5000, // Adjust based on expected load
      maxQueueSize: 10000
    }
  )
}))
