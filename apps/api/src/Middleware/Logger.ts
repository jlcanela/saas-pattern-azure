import { HttpApiMiddleware, HttpServerRequest } from "@effect/platform"
import { Effect, Layer, Schema } from "effect"

// Define a schema for errors returned by the logger middleware
class LoggerError extends Schema.TaggedError<LoggerError>()(
  "LoggerError",
  {}
) {}

// Extend the HttpApiMiddleware.Tag class to define the logger middleware tag
export class Logger extends HttpApiMiddleware.Tag<Logger>()("Http/Logger", {
  // Optionally define the error schema for the middleware
  failure: LoggerError
}) {}

export const LoggerLive = Layer.effect(
  Logger,
  Effect.gen(function* () {
    yield* Effect.log("creating Logger middleware")

    // Middleware implementation as an Effect
    // that can access the `HttpServerRequest` context.
    return Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest
      yield* Effect.log(`Request: ${request.method} ${request.url} ***`)
    })
  })
)