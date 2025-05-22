import { queryOptions } from "@tanstack/react-query";
import { projectsList } from "common";
import { Effect } from "effect";

export const fetchProjects = async () => {
  const { projects } = await Effect.runPromise(projectsList)
  
  return projects;
};


export const projectsQueryOptions = queryOptions({
  queryKey: ['projects'],
  queryFn: fetchProjects, // Your data fetching function
});