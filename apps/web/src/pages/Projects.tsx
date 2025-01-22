import { Component, createEffect, createResource, For, Show } from "solid-js";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Stack,
} from "@suid/material";

import { Effect } from "effect";

import { projectsList } from "common";

interface ProjectsProps {}

export const Projects: Component<ProjectsProps> = (props) => {
  const [projects] = createResource(async () =>
    Effect.runPromise(projectsList)
  );

  createEffect(() => {
    console.log(projects());
  });

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
            </Card>
          )}
        </For>
      </Show>
    </Stack>
  );
};

export default Projects;
