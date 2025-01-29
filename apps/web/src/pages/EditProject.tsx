import {
  projectFindById,
  projectFindHistoryById,
  ProjectId,
  ProjectRequest,
  projectUpdate,
} from "common";
import { Effect } from "effect";
import { createResource } from "solid-js";
import BpmnForm from "../components/FormJs";
import { useNavigate } from "@solidjs/router";
import { Button } from "@suid/material";

export const EditProject = () => {
  const navigate = useNavigate();
  const [project] = createResource(async () =>
    Effect.runPromise(projectFindById(ProjectId.make("1")))
  );

  const [history] = createResource(async () =>
    Effect.runPromise(projectFindHistoryById(ProjectId.make("1")))
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
      <Button
        size="small"
        color="primary"
        onClick={() => navigate(`/projects/1/history`)}
      >
        History
      </Button>
      <Button
        size="small"
        color="primary"
        onClick={() => navigate(`/projects`)}
      >
        Cancel
      </Button>
    </div>
  );
};
