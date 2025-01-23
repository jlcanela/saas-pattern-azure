import { Schema } from "effect"

// Define the schema without extending classes
export const PingResponse: Schema.Schema<string, string, never> = Schema.String

// Type inference from schemas
export type PingResponseType = typeof PingResponse.Type
