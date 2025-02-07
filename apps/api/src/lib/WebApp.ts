import { FileSystem, HttpServerResponse } from "@effect/platform"
import { Router } from "@effect/platform/HttpApiBuilder"
import { Effect } from "effect"

export const basePath = process.argv.slice(2)[0] || "dist"

const listFiles = Effect.gen(function*() {
  const fs = yield* FileSystem.FileSystem
  const files = yield* fs.readDirectory(basePath, { recursive: true })
  return files.filter((file) => file.includes("."))
})

export const WebAppRoutes = Router.use((router) =>
  Effect.gen(function*() {
    yield* router.get(`/`, HttpServerResponse.file(`${basePath}/index.html`))
    const files = yield* listFiles
    for (const file of files) {
      yield* router.get(`/${file}`, HttpServerResponse.file(`${basePath}/${file}`))
    }
  })
)
