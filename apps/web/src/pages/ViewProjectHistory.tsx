import type { Component } from "solid-js";
import { createResource, For, Match, Switch } from "solid-js";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Stack,
  CardActions,
  Button,
  Divider,
} from "@suid/material";
import { Effect } from "effect";
import { projectFindHistoryById, ProjectId } from "common";
import { useNavigate, useParams } from "@solidjs/router";

function ProjectNotFound({id}: { id: string}) {
  const navigate = useNavigate();
  return (
    <Card>
      <CardHeader title="No Project History" subheader={`ID: ${id}`} />
      <CardContent>
        <Typography variant="body1" gutterBottom>
          <strong>Error:</strong> The requested project history could not be found.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This might happen if the project has not yet any project history.
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          color="primary"
          onClick={() => navigate("/projects")}
        >
          Back to Projects
        </Button>
        <Button
          size="small"
          color="secondary"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </CardActions>
    </Card>
  );
}
export const ViewProjectHistory: Component = () => {
  const params = useParams();
  const navigate = useNavigate();

  const [history] = createResource(async () =>
    Effect.runPromise(projectFindHistoryById(ProjectId.make(params.id ?? "1")))
  );

  return (
    <Stack spacing={2} sx={{ padding: 2 }}>
      <Typography variant="h4" component="h1">
        Project History
      </Typography>
      <Switch>
        <Match when={history.loading}>
          <div>Loading...</div>
        </Match>
        <Match when={history.state === "errored"}>
          <ProjectNotFound id={params.id} />
        </Match>
        <Match when={history.error}>
          <div>Error: {history.error.message}</div>
        </Match>
        <Match when={history()}>
          <For each={history()?.changes}>
            {(change) => (
              <Card>
                <CardHeader
                  title={`Change on ${new Date(change.timestamp).toLocaleString()}`}
                  subheader={`By: ${change.userId}`}
                />
                <CardContent>
                  <Typography variant="body1" gutterBottom>
                    <strong>Reason:</strong> {change.reason}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body1">
                    <strong>Changes:</strong>
                  </Typography>
                  <pre
                    style={{
                      "background-color": "#f5f5f5",
                      padding: "1rem",
                      "border-radius": "4px",
                      overflow: "auto",
                    }}
                  >
                    {JSON.stringify(JSON.parse(change.content), null, 4)}
                  </pre>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/projects/${params.id}/edit`)}
                  >
                    Back to Project
                  </Button>
                </CardActions>
              </Card>
            )}
          </For>
        </Match>
      </Switch>
    </Stack>
  );
};

export default ViewProjectHistory;
