import { Effect, pipe } from "effect"
import { Permission } from "./Permission/index.js"

import { it } from "@effect/vitest"

const TestLayer = Permission.live

it.skip("should allow access", () =>
  pipe(
    Effect.gen(function*(_) {
        const perm = yield* Permission
        const version = perm.version()
        return expect(version).toEqual("4.3.0")
    }),
    Effect.provide(TestLayer)
  ))
