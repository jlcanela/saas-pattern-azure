import { HttpApiMiddleware, HttpApiSchema, HttpApiSecurity, OpenApi } from "@effect/platform";
import { Context, Effect, Layer, Redacted, Schema } from "effect";
import { SecurityContext } from "../Domain/Permission.js";
import type { AuthRequest } from "../lib/Permission/index.js";
import { Permission } from "../lib/Permission/index.js";

// Define a schema for the "User"
//class User extends Schema.Class<User>("User")({ id: Schema.Number }) {}
export const ActionTag = Context.GenericTag<{ action: string }>("ActionTag")
export class ActionValue extends Schema.Class<ActionValue>("ActionValue")({ action: Schema.String }) {}

enum AuthorizationFailedReason {
  // Token Missing or Invalid
  NoBearerToken = "No authentication token provided",
  ExpiredToken = "Authentication token has expired",
  MalformedToken = "Token format is invalid",
  InvalidTokenSignature = "Token signature verification failed",
  
  // Token Validation Issues
  NoValidationCertificate = "Certificate for token validation not found",
  ExpiredCertificate = "Certificate has expired",
  InvalidCertificate = "Certificate is invalid or corrupted",
  CertificateRevoked = "Certificate has been revoked",
  
  // Permission Issues
  InsufficientPermissions = "User lacks required permissions",
  ResourceNotFound = "Requested resource does not exist",
  AccountDisabled = "User account is disabled",
  AccountLocked = "User account is locked",
  
  // Session Issues
  SessionExpired = "User session has expired",
  SessionRevoked = "Session has been revoked",
  ConcurrentSessionLimit = "Maximum concurrent sessions reached",
  
  // IP/Location Issues
  IPBlocked = "Access denied from current IP address",
  GeographicRestriction = "Access denied from current location",
  
  // Rate Limiting
  RateLimitExceeded = "Too many requests",
  QuotaExceeded = "API quota exceeded"
}

// Define a schema for the
//  "Unauthorized" error
class AuthorizationFailed extends Schema.TaggedError<AuthorizationFailed>()(
  "AuthorizationFailed",
  {
    reason: Schema.Enums(AuthorizationFailedReason)
  },
  // Specify the HTTP status code for unauthorized errors
  HttpApiSchema.annotations({ status: 401 })
) {}

// Define a Context.Tag for the authenticated user
export class CurrentSecurityContext extends Context.Tag("CurrentSecurityContext")<CurrentSecurityContext, SecurityContext>() {}

// Create the Authorization middleware
export class Authorization extends HttpApiMiddleware.Tag<Authorization>()(
  "Authorization",
  {
    // Define the error schema for unauthorized access
    failure: AuthorizationFailed,
    // Specify the resource this middleware will provide
    provides: CurrentSecurityContext,
    // Add security definitions
    security: {
      // ┌─── Custom name for the security definition
      // ▼
      oauth2: HttpApiSecurity.bearer.pipe(
        // Add a description to the security definition
        HttpApiSecurity.annotate(OpenApi.Description, "OAuth2 Bearer Token"))
      // Additional security definitions can be added here.
      // They will attempt to be resolved in the order they are defined.
    }
  }
) {}

export const AuthorizationLive = Layer.effect(
    Authorization,
    Effect.gen(function* () {

      const perm = yield* Permission
      return {
        oauth2: (bearerToken) =>
          Effect.gen(function* () {

            if (Redacted.value(bearerToken).length === 0) {
              return yield* Effect.fail(new AuthorizationFailed({ reason: AuthorizationFailedReason.NoBearerToken }))
            }

            const principalId = Redacted.value(bearerToken)
            const action = "read"

            const request: AuthRequest = {  
              principal: {
                type: "App::User",
                id: principalId
              },
              action: {
                 type: "App::Action",
                 id: "read"
              },
              resource: {
                type: "App::Project",
                id: "1234",
                
              },
              context: {
                pwnLevel: 0,
                anotherField: "string",
                bool: true,
                boolField: false
              }
              
            }

            const result = yield* perm.auth(request)
            switch (result) {
              case "allow":
                break
              case "deny":
                return yield* Effect.fail(new AuthorizationFailed({ reason: AuthorizationFailedReason.InsufficientPermissions }))
              case "failure":
                return yield* Effect.fail(new AuthorizationFailed({ reason: AuthorizationFailedReason.InvalidTokenSignature }))
            }

            return new SecurityContext({
              principalId,
              action
            })
          })
      }
    })
  )