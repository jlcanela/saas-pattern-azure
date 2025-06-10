import { Context, Effect, Layer, Schema } from "effect"
import type { NamespaceType } from "./Cedar.js"
import { generateSchema } from "./Cedar.js"
import { ActionContext, App  } from "../../Domain/Permission.js"
import { type AuthorizationCall } from "@cedar-policy/cedar-wasm"

export const AuthorizationResult = Schema.Union(Schema.Literal("allow"), Schema.Literal("deny"), Schema.Literal("failure"))
export type AuthorizationResult = typeof AuthorizationResult.Type

const TypeId = Schema.Struct({
  type: Schema.String,
  id: Schema.String
})

const Principal = TypeId
// export type Principal = typeof TypeId.Type

const Action = TypeId
// export type Action = typeof TypeId.Type

const Resource = TypeId
// export type Resource = typeof TypeId.Type

type Context = typeof ActionContext.Type

export const AuthRequest = Schema.Struct({
  principal: Principal,
  action: Action,
  resource: Schema.optional(Schema.Union(Resource)),
  context: ActionContext
})
export type AuthRequest = typeof AuthRequest.Type

const staticPolicies = `
permit(principal, action, resource);
forbid (principal, action, resource)
when {
    principal.id == "deny-user"
};
`

export class Permission extends Context.Tag("Permission")<
  Permission,
  {
    version: () => Effect.Effect<string, never>,
    auth: (authRequest: AuthRequest) => Effect.Effect<AuthorizationResult, never>
  }
>() {
  static live = Layer.effect(
    Permission,
    Effect.gen(function* (_) {

      const cedar = yield* Effect.promise(() =>
        import('@cedar-policy/cedar-wasm')
      )

      const namespace = "App"

      const schema = generateSchema(Schema.Struct<Record<string, NamespaceType>>({
        [namespace]: App
      }))

      // console.log(JSON.stringify(schema, null, 4))

      const policies = {
        staticPolicies,
        templates: {},
        templateLinks: [],
      }

      const perm = Permission.of({
        version: () => Effect.succeed(cedar.getCedarVersion()),
        auth: (authRequest: AuthRequest) => Effect.gen(function* (_) {
          const entities = [  {
            uid: { type: `${namespace}::${authRequest.principal.type}`, id: authRequest.principal.id},
            attrs: {
              "id": authRequest.principal.id
            },
            parents: []
          }]
          
          if (authRequest.resource) {
            entities.push({
              uid: { type: `${namespace}::${authRequest.resource.type}`, id: authRequest.resource.id},
              attrs: {
                 "id": "unknown"
              },
              parents: []
            })
          } 
         
          const call: AuthorizationCall = {
            principal: { type: `${namespace}::${authRequest.principal.type}`, id: authRequest.principal.id},
            action:  { type: `${namespace}::${authRequest.action.type}`, id: authRequest.action.id},
            resource:  authRequest.resource && { type: `${namespace}::${authRequest.resource.type}`, id: authRequest.resource.id} || {type: `${namespace}::Project`, id: 'unknown'} ,
            context: authRequest.context,
            schema,
            policies,
            entities
          }

          const result = cedar.isAuthorized(call)
          yield* Effect.log(JSON.stringify(result, null, 4))
          const response: AuthorizationResult = (result.type === "failure") ? "failure" : (result.response.decision === "allow" ? "allow" : "deny")

          return yield* Effect.succeed(response)
        })
      })

      return perm
    })
  )
}
