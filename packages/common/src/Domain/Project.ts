import type { FastCheck } from "effect";
import { Schema } from "effect"
import { faker} from "@faker-js/faker";
import type { LazyArbitrary } from "effect/Arbitrary";

export const ProjectId = Schema.String.pipe(Schema.brand("ProjectId"))
export type ProjectId = typeof ProjectId.Type

type F<A> = (f: typeof faker) => A;

function g<A>(f: F<A>): () => LazyArbitrary<A> {
  return () => (fc: typeof FastCheck) => fc.constant(null).map(() => f(faker)) 
} 

export const ProjectRequest = Schema.Struct({
  project_name: Schema.String.annotations({ 
    title: "Project Name",
    arbitrary: g((faker) => faker.lorem.words(2)) 
  }),
  project_description: Schema.String.annotations({ 
    title: "Project Description",
    arbitrary: g((faker) => faker.lorem.sentence())
  }),
  project_objective: Schema.String.annotations({ 
    title: "Project Objective",
    arbitrary: g((faker) => faker.lorem.words(3))
  }),
  project_stakeholders: Schema.String.annotations({ 
    title: "Project Stakeholders",
    arbitrary: g((faker) => `${faker.person.fullName()}, ${faker.person.fullName()}`)
   })
})

export type ProjectRequest = typeof ProjectRequest.Type

export const ProjectResponse = Schema.Struct({
  id: ProjectId.annotations({ 
    title: "Project Id",
    arbitrary: g((faker) => ProjectId.make(faker.animal.petName()))
  }),
  ...ProjectRequest.fields
})
export type ProjectResponse = typeof ProjectResponse.Type

export const Project = Schema.Struct({
  ...ProjectResponse.fields
})
export type Project = typeof Project.Type

export const ProjectsResponse = Schema.Struct({
  projects: Schema.Array(ProjectResponse)
})
export type ProjectsResponse = typeof ProjectsResponse.Type

export const ProjectUpdate = Schema.Struct({
  timestamp: Schema.Date,
  reason: Schema.String,
  userId: Schema.String,
  changes: Schema.Array(Schema.Struct({
    field: Schema.String,
    oldValue: Schema.String,
    newValue: Schema.String
  }))
})
export type ProjectUpdate = typeof ProjectUpdate.Type

export class ProjectNotFound extends Schema.TaggedError<ProjectNotFound>()(
  "ProjectNotFound",
  {
    id: ProjectId
  }
) { }

export class NotAvailable extends Schema.TaggedError<NotAvailable>()(
  "NotAvailable",
  {
  }
) { }



export const ProjectInfo = Schema.Struct({
  name: Schema.String.pipe(Schema.minLength(1)).annotations({ title: "Name" }),
  description: Schema.String.pipe(Schema.minLength(1)).annotations({ title: "Description" }),
})

export type ProjectInfo = typeof ProjectInfo.Type

export const ProjectObjective = Schema.Struct({
  objectives: Schema.String.pipe(Schema.minLength(1)).annotations({ title: "Objectives" }),
  stakeholders: Schema.String.pipe(Schema.minLength(1)).annotations({ title: "Stakeholders" }),
})

export type ProjectObjective = typeof ProjectObjective.Type
