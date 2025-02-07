import { HttpApiEndpoint, HttpApiError, HttpApiGroup, HttpApiSchema } from "@effect/platform";
import { History, Project, ProjectRequest, ProjectResponse, ProjectsResponse } from "common";
import { Schema } from "effect";

const idParam = HttpApiSchema.param("id", Schema.String.pipe(Schema.brand("ProjectId")))

export const ProjectApi = HttpApiGroup.make("projects")
  .addError(HttpApiError.InternalServerError, { status: 503 })
  .add(
    HttpApiEndpoint.post("create")`/projects`
      .setPayload(ProjectRequest)
      .addSuccess(Schema.String)
      .addError(HttpApiError.HttpApiDecodeError)
      .addError(HttpApiError.BadRequest)
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.get("findById")`/projects/${idParam}`
      .addSuccess(ProjectResponse)
      .addError(HttpApiError.NotFound)
      .addError(HttpApiError.HttpApiDecodeError)
      .addError(HttpApiError.BadRequest)
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.post("update")`/projects/${idParam}`
      .setPayload(Project)
      .addSuccess(ProjectResponse)
      .addError(HttpApiError.HttpApiDecodeError)
      .addError(HttpApiError.BadRequest)
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.get("findProjectHistoryById")`/projects/${idParam}/history`
      .addSuccess(History)
      .addError(HttpApiError.HttpApiDecodeError)
      .addError(HttpApiError.BadRequest)
      .addError(HttpApiError.InternalServerError)
      .addError(HttpApiError.NotFound)
  )
  .add(
    HttpApiEndpoint.get("list")`/projects`
      .addSuccess(ProjectsResponse)
      .addError(HttpApiError.HttpApiDecodeError)
      .addError(HttpApiError.BadRequest)
      .addError(HttpApiError.InternalServerError)
  )

  