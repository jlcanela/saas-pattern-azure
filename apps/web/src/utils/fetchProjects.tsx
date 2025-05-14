import { projectsList } from "common";
import { Effect } from "effect";

export const fetchProjects = async () => {
  const {projects} = await Effect.runPromise(projectsList)
  
  return projects;
};
