import type { Component } from "solid-js";
import { createResource, For, Show } from "solid-js";
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

      <Show when={history()} fallback={<div>Loading...</div>}>
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
      </Show>
    </Stack>
  );
};

export default ViewProjectHistory;
