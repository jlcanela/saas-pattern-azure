import { NodeSdk } from "@effect/opentelemetry"

import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base"

import type { HrTime } from "@opentelemetry/api"
import { ZipkinExporter } from "@opentelemetry/exporter-zipkin"
import { Console, Effect, pipe, Schedule } from "effect"

function truncToMicroseconds(time: HrTime): HrTime {
    const [seconds, nanoseconds] = time
    // Remove the nanoseconds below microsecond precision
    const truncatedNanoseconds = Math.floor(nanoseconds / 1e3) * 1e3
    return [seconds, truncatedNanoseconds]
}

function fixTimestamp(span: any) {
    span.startTime = truncToMicroseconds(span.startTime)
    span.endTime = truncToMicroseconds(span.endTime)
    return span
}

class RetryingZipkinExporter extends ZipkinExporter {
    private pendingExports = new Set<Promise<void>>()
    protected isShutdown = false

    async export(spans: Array<any>, _resultCallback: (result: any) => void) {
        if (this.isShutdown) {
            throw new Error("Exporter is shutdown")
        }

        const schedule = Schedule.exponential("100 millis", 2).pipe(
            Schedule.compose(Schedule.recurs(5))
        )

        const send = Effect.async<void, Error>((resume) => {
            super.export(spans.map(fixTimestamp), (result) => {
                if (result.code !== 0) {
                    resume(Effect.fail(new Error(result.error?.message)))
                } else {
                    resume(Effect.void)
                }
            })
        })

        const retrySend = pipe(
            send,
            Effect.retry(schedule),
            Effect.tapError((error: Error) => Console.error(`Export failed for ${spans.length} spans:`, error)),
            Effect.catchAll(() => Effect.void as Effect.Effect<void>)
        )

        const exportPromise = Effect.runPromise(retrySend)
        this.pendingExports.add(exportPromise)
        exportPromise.finally(() => this.pendingExports.delete(exportPromise))

        return exportPromise
    }

    async shutdown(): Promise<void> {
        this.isShutdown = true
        await Promise.allSettled([...this.pendingExports])
        await super.shutdown()
    }
}
export const TracingLive = NodeSdk.layer(() => ({
    resource: { serviceName: "effect-api" },
    spanProcessor: new BatchSpanProcessor(
        new RetryingZipkinExporter({
            url: "http://localhost:9411/api/v2/spans"
        }),
        {
            scheduledDelayMillis: 500, // Export every 0.5 second
            maxExportBatchSize: 5000, // Adjust based on expected load
            maxQueueSize: 10000
        }
    )
}))
