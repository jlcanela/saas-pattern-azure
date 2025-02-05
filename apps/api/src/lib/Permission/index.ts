import { Context, Effect, Layer, Schema } from "effect"
import { generateSchema } from "./Cedar.js"
import { ActionContext, CedarSchema  } from "./Config.js"

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
  resource: Resource,
  context: ActionContext
})
export type AuthRequest = typeof AuthRequest.Type

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
      yield* Effect.log("Permission.live")

      const cedar = yield* Effect.promise(() =>
        import('@cedar-policy/cedar-wasm')
      )

      const schema = generateSchema(CedarSchema)

      const policies = {
        staticPolicies: 'permit(principal, action, resource);',
        templates: {},
        templateLinks: [],
      }

      const perm = Permission.of({
        version: () => Effect.succeed(cedar.getCedarVersion()), // TODO : get version from cedar
        auth: (authRequest: AuthRequest) => Effect.gen(function* (_) {
          const call = {
            principal: authRequest.principal,
            action: authRequest.action,
            resource: authRequest.resource,
            context: authRequest.context,
            schema,
            policies,
            entities: []
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
