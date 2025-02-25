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
} from "@suid/material";

import { Effect } from "effect";

import { projectsList } from "common";
import { useNavigate } from "@solidjs/router";

export const Projects: Component = () => {
  const [projects] = createResource(async () =>
    Effect.runPromise(projectsList)
  );
  const navigate = useNavigate();

  return (
    <Stack spacing={2} sx={{ padding: 2 }}>
      <Typography variant="h4" component="h1">
        Projects
      </Typography>

      <Show when={projects()} fallback={<div>Loading...</div>}>
        <For each={projects()?.projects}>
          {(project) => (
            <Card>
              <CardHeader
                title={project.project_name}
                subheader={`ID: ${project.id}`}
              />
              <CardContent>
                <Typography variant="body1" gutterBottom>
                  <strong>Description:</strong> {project.project_description}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Objective:</strong> {project.project_objective}
                </Typography>
                <Typography variant="body1">
                  <strong>Stakeholders:</strong> {project.project_stakeholders}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => navigate(`/projects/${project.id}/edit`)}
                >
                  Edit Project
                </Button>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => navigate(`/projects/${project.id}/history`)}
                >
                  View Project History
                </Button>
              </CardActions>
            </Card>
          )}
        </For>
      </Show>
    </Stack>
  );
};

export default Projects;
