import {
  projectFindById,
  projectFindUpdatesById,
  ProjectId,
  ProjectRequest,
  projectUpdate,
} from "common";
import { Effect } from "effect";
import { createResource } from "solid-js";
import BpmnForm from "../components/FormJs";
import { useNavigate } from "@solidjs/router";

export const EditProject = () => {
  const navigate = useNavigate();
  const [project] = createResource(async () =>
    Effect.runPromise(projectFindById(ProjectId.make("1")))
  );

  const [projectUpdates] = createResource(async () =>
    Effect.runPromise(projectFindUpdatesById(ProjectId.make("1")))
  );

  const onSubmit = async (data: any, errors: any) => {
    await projectUpdate({ id: "1", ...data }).pipe(Effect.runPromise);
    navigate(`/projects`);
  };
  return (
    <div>
      <BpmnForm
        key={"none"}
        title="Edit Project"
        schema={ProjectRequest}
        data={project()}
        onSubmit={onSubmit}
      />
      <pre>{JSON.stringify(projectUpdates(), null, 4)}</pre>
    </div>
  );
};
