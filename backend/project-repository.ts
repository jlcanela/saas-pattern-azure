export interface ProjectRequest {
  project_name: string;
  project_description: string;
  project_objective: string;
  project_stakeholders: string;
}
export interface Project {
  project_id: string;
  project_name: string;
  project_description: string;
  project_objective: string;
  project_stakeholders: string;
}

export class ProjectRepository {
  private projects: Map<string, Project>;

  constructor() {
    this.projects = new Map();
  }

  create(project: ProjectRequest): Project {
    const project_id = Math.random().toString(36).substring(7);
    const newProject = Object.assign({}, project, {project_id});
    this.projects.set(project_id,newProject);
    return newProject;
  }

  read(project_id: string): Project | null {
    return this.projects.get(project_id) || null;
  }

  update(project_id: string, updatedProject: Partial<Project>): Project | null {
    const existingProject = this.projects.get(project_id);
    if (existingProject) {
      const mergedProject = { ...existingProject, ...updatedProject };
      this.projects.set(project_id, mergedProject);
      return mergedProject;
    }
    return null;
  }

  delete(project_id: string): boolean {
    return this.projects.delete(project_id);
  }

  list(): Project[] {
    return Array.from(this.projects.values());
  }
}
