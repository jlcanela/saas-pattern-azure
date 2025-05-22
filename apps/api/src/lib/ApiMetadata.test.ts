import { it } from "@effect/vitest"
import { AccessMetadata, ApiMetadata, type Method } from "./ApiMetadata.js"
import { Effect, pipe } from "effect"
import { NodeContext } from "@effect/platform-node"
import { type OpenAPISpecMethodName, type OpenAPISpecPathItem } from "@effect/platform/OpenApi"

// const TestLayer = pipe(
//     Layer.provide(ApiMetadata.live),
//    // Effect.provide(NodeContext.layer),
//    // Layer.provide(NodeHttpPlatform.layer
// )
// const createProject = Effect.gen(function*(_) {
//   const _repo = yield* ProjectRepo
//   const arb = Arbitrary.make(ProjectRequest)
//   const project = FastCheck.sample(arb, 1)[0]
//   return { _1: project, _2: yield* _repo.create(project) }
// })

it.skip("should identify the current action", () =>
  pipe(
    Effect.gen(function*(_) {
        const am = yield* ApiMetadata
        const action = yield* am.currentAction("GET", "/projects")
        const spec = yield* am.spec()
       // yield* Effect.log("spec:", spec.paths)
        const paths = Object.keys(spec.paths)
            
        const infos = Object.fromEntries(paths.flatMap((url) => Object.keys(spec.paths[url]).map(key=> {
            const pathItem: OpenAPISpecPathItem = spec.paths[url]
            //const method = key as OpenAPISpecMethodName
            const metadata = pathItem[key as OpenAPISpecMethodName]
            const permission = metadata?.description?.match(/\*\*(update|read|create)\*\*/)?.[1];
            const method = key.toUpperCase() as typeof Method.Type
            
            return [{ method, url}, AccessMetadata.make({
                method,
                url,
                permission: permission || ""
            })]
        })))

      yield* Effect.log("action:", infos)
       return expect(action).toBe("read")
    }),
    Effect.provide(ApiMetadata.live),
    Effect.provide(NodeContext.layer)
  ))
