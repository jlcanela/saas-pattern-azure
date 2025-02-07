import { HttpApiMiddleware, HttpApiSchema, HttpApiSecurity, OpenApi } from "@effect/platform";
import { Context, Effect, Layer, Redacted, Schema } from "effect";

// Define a schema for the "User"
class User extends Schema.Class<User>("User")({ id: Schema.Number }) {}

// Define a schema for the "Unauthorized" error
class Unauthorized extends Schema.TaggedError<Unauthorized>()(
  "Unauthorized",
  {},
  // Specify the HTTP status code for unauthorized errors
  HttpApiSchema.annotations({ status: 401 })
) {}

// Define a Context.Tag for the authenticated user
export class CurrentUser extends Context.Tag("CurrentUser")<CurrentUser, User>() {}

// Create the Authorization middleware
export class Authorization extends HttpApiMiddleware.Tag<Authorization>()(
  "Authorization",
  {
    // Define the error schema for unauthorized access
    failure: Unauthorized,
    // Specify the resource this middleware will provide
    provides: CurrentUser,
    // Add security definitions
    security: {
      // ┌─── Custom name for the security definition
      // ▼
      myBearer: HttpApiSecurity.bearer.pipe(
        // Add a description to the security definition
        HttpApiSecurity.annotate(OpenApi.Description, "my description"))
      // Additional security definitions can be added here.
      // They will attempt to be resolved in the order they are defined.
    }
  }
) {}

export const AuthorizationLive = Layer.effect(
    Authorization,
    Effect.gen(function* () {
      yield* Effect.log("creating Authorization middleware")
  
      // Return the security handlers for the middleware
      return {
        // Define the handler for the Bearer token
        // The Bearer token is redacted for security
        myBearer: (bearerToken) =>
          Effect.gen(function* () {
            yield* Effect.log(
              "checking bearer token",
              Redacted.value(bearerToken)
            )
  
            return Redacted.value(bearerToken) === "fake" ? new User({ id: 1 }) : yield* Effect.fail(new Unauthorized()) 
            //Effect.fail(new HttpApiError.BadRequest())),
            // Return a mock User object as the CurrentUser
            //return new User({ id: 1 })
          })
      }
    })
  )