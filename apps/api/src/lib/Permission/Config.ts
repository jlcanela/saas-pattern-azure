import { Schema } from "effect"
import type { ActionType, NamespaceType, SchemaType } from "./Cedar.js"

// Entities
export const User = Schema.Struct({}).annotations({ identifier: "User" })

export const Project = Schema.Struct({
  owner: Schema.String
}).annotations({ identifier: "Project" })

// Context
export const ActionContext = Schema.Struct({
  pwnLevel: Schema.Int,
  anotherField: Schema.String.pipe(Schema.optional),
  bool: Schema.Boolean,
  boolField: Schema.Boolean.pipe(Schema.optional),
}).annotations({ identifier: "ActionContext" })

// Actions
const Action: ActionType = Schema.Struct({
  principalTypes: Schema.Union(User),
  resourceTypes: Schema.Union(Project),
  context: ActionContext
})

const actions = Schema.Struct({
  read: Action,
  list: Action,
  create: Action,
  update: Action,
  delete: Action,
})

// Schema
const App: NamespaceType = Schema.Struct({
  commonTypes: Schema.Union(ActionContext),
  entityTypes: Schema.Union(User, Project),
  actions
}) as any as NamespaceType

export const CedarSchema: SchemaType = Schema.Struct<Record<string, NamespaceType>>({
  App
})