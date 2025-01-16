// src/layers/WebRoutes.ts
import { Layer, Effect } from "effect"
import { HttpServerResponse } from "@effect/platform"
import { basePath, listFiles } from "../config.ts"
import { Router } from "@effect/platform/HttpApiBuilder"

function createRoute(file: string) {
    return Router.use((router) =>
        Effect.gen(function* () {
            yield* router.get(`/${file}`, HttpServerResponse.file(`${basePath}/${file}`))
        })
    )
}

const Redirect = Router.use((router) =>
    Effect.gen(function* () {
        yield* router.get(`/`, HttpServerResponse.file(`${basePath}/index.html`))
    }))

export const WebAppRoutes = Layer.mergeAll(Redirect, ...listFiles.map(createRoute));