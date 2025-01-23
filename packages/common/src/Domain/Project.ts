import { Schema } from "effect"

export const ProjectId = Schema.UUID.pipe(Schema.brand("ProjectId"))
export type ProjectId = typeof ProjectId.Type

export const ProjectRequest = Schema.Struct({
  project_name: Schema.String,
  project_description: Schema.String,
  project_objective: Schema.String,
  project_stakeholders: Schema.String
})

export const ProjectResponse = Schema.Struct({
  id: ProjectId,
  project_name: Schema.String,
  project_description: Schema.String,
  project_objective: Schema.String,
  project_stakeholders: Schema.String
})

export const Project = Schema.Struct({
  id: ProjectId,
  project_name: Schema.String,
  project_description: Schema.String,
  project_objective: Schema.String,
  project_stakeholders: Schema.String
})
export const ProjectsResponse = Schema.Struct({
  projects: Schema.Array(ProjectResponse)
})

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
