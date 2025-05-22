import { Context, Effect, Layer, Schema } from "effect"
import { Api } from "../Api.js"
import { OpenApi } from "@effect/platform"
import type { OpenAPISpecMethodName } from "@effect/platform/OpenApi"

export const Method = Schema.Union(Schema.Literal("GET"), Schema.Literal("POST"), Schema.Literal("PUT"), Schema.Literal("DELETE"),  Schema.Literal("PATCH"), Schema.Literal("HEAD"), Schema.Literal("OPTIONS"))
export const AccessMetadata = Schema.Struct({
    method: Method,
    url: Schema.String,
    permission: Schema.String.pipe(Schema.optional)
})

export class ApiMetadata extends Context.Tag("ApiMetadata")<
    ApiMetadata,
    {
        currentAction: (method: typeof Method.Type, uri: string) => Effect.Effect<string>,
        spec: () => Effect.Effect<OpenApi.OpenAPISpec, never>
    }
>() {
    static live = Layer.effect(
        ApiMetadata,
        Effect.gen(function* (_) {

            const spec = OpenApi.fromApi(Api)
            const paths = Object.keys(spec.paths)
            
            const infos = Object.fromEntries(paths.flatMap((url) => Object.keys(spec.paths[url]).map(key=> {
                const metadata = spec.paths[url][key as OpenAPISpecMethodName]
                const permission = metadata?.description?.match(/\*\*(update|read|create)\*\*/)?.[1];
                const method = key.toUpperCase() as typeof Method.Type
                
                return [[method, url], AccessMetadata.make({
                    method,
                    url,
                    permission: permission || ""
                })]
            })))
            
            const am = ApiMetadata.of({
                currentAction: (method: typeof Method.Type, uri: string) => Effect.gen(function* (_) {
                  
                    Effect.log("infos:", JSON.stringify(infos, null, 4))
                    const metadata = infos[`${method},${uri}`]
                    const action: string = metadata?.permission || "-"
                    return yield* Effect.succeed(action)   
                }),
                spec: () => Effect.succeed(spec)                    
            }) 
            

            yield* Effect.succeed(0)     
            //const fs = yield* FileSystem.FileSystem
            //yield* fs.writeFileString("./openapi.json", JSON.stringify(spec, null, 2))
            //console.log(JSON.stringify(spec, null, 4))
            
            return am
        })

    )
}
