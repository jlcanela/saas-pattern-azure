import { queryOptions } from "@tanstack/react-query";
import { projectFindById, ProjectId, projectsList } from "common";
import { Effect } from "effect";

export const fetchProjects = async () => {
  const { projects } = await Effect.runPromise(projectsList)
  return projects;
};


export const projectsQueryOptions = queryOptions({
  queryKey: ['projects'],
  queryFn: fetchProjects, // Your data fetching function
});

export const findProject = async (id: ProjectId) => {
  const project = await Effect.runPromise(projectFindById(id))
  return project;
};


export function findProjectQueryOption(id: ProjectId) {
  return queryOptions({
    queryKey: ['projets', id],
    queryFn: () => findProject(id),
  })
}
