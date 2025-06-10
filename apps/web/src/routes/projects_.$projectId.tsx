import { findProjectQueryOption } from '@/utils/fetchProjects'
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'

import { Card, Title, Text, Group, Badge, Stack, Divider } from '@mantine/core';
import { ProjectId, type ProjectResponse } from 'common';

export function ProjectDetails({ project }: { project: ProjectResponse }) {
  return (
    <Card shadow="md" padding="xl" radius="md" withBorder maw={480} mx="auto">
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start">
          <Title order={2}>{project.project_name}</Title>
          <Badge color="blue" size="lg" variant="light">
            {project.id.slice(0, 8)}…
          </Badge>
        </Group>
        <Divider my="sm" />
        <Text size="md" c="dimmed" mb="xs">
          {project.project_description}
        </Text>
        <Text>
          <Text span fw={500}>Objective:</Text> {project.project_objective}
        </Text>
        <Text>
          <Text span fw={500}>Stakeholders:</Text> {project.project_stakeholders}
        </Text>
      </Stack>
    </Card>
  );
}

export const Route = createFileRoute('/projects_/$projectId')({
  loader: ({ context: { queryClient }, params: { projectId } }) => queryClient.ensureQueryData(findProjectQueryOption(ProjectId.make(projectId))),
  component: RouteComponent,
})

function RouteComponent() {
  const { projectId } = Route.useParams()
  const { data: project } = useSuspenseQuery(findProjectQueryOption(ProjectId.make(projectId)));

  return (
    <>
      <ProjectDetails project={project} />
    </>

  )
}
