
import { Hono } from "@hono/hono";
import { serveStatic } from "@hono/hono/deno"
import { ProjectRepository } from "./project-repository.ts";

import data from "./data.json" with { type: "json" };

const app = new Hono();

const projectRepository = new ProjectRepository();

// Create a new project
app.post("/api/projects", async (c) => {
  try {
    const body = await c.req.json();
    const project = projectRepository.create(body);
    return c.json(project, 201);
  } catch (_error) {
    return c.json({ error: "Failed to create project" }, 400);
  }
});

// Get a project by ID
app.get("/api/projects/:project_id", (c) => {
  try {
    const projectId = c.req.param("project_id");
    const project = projectRepository.read(projectId);

    if (project) {
      return c.json(project);
    }
    return c.json({ error: "Project not found" }, 404);
  } catch (_error) {
    return c.json({ error: "Failed to fetch project" }, 500);
  }
});

// Update a project
app.put("/api/projects/:project_id", async (c) => {
  try {
    const projectId = c.req.param("project_id");
    const body = await c.req.json();
    const updatedProject = projectRepository.update(projectId, body);

    if (updatedProject) {
      return c.json(updatedProject);
    }
    return c.json({ error: "Project not found" }, 404);
  } catch (_error) {
    return c.json({ error: "Failed to update project" }, 400);
  }
});

// Delete a project
app.delete("/api/projects/:project_id", (c) => {
  try {
    const projectId = c.req.param("project_id");
    const deleted = projectRepository.delete(projectId);

    if (deleted) {
      return c.json({ message: "Project deleted" });
    }
    return c.json({ error: "Project not found" }, 404);
  } catch (_error) {
    return c.json({ error: "Failed to delete project" }, 500);
  }
});

// List all projects
app.get("/api/projects", (c) => {
  try {
    const projects = projectRepository.list();
    return c.json(projects);
  } catch (_error) {
    return c.json({ error: "Failed to fetch projects" }, 500);
  }
});

app.get("/api/dinosaurs", (c) => {
  return c.json(data);
});

app.get("/api/dinosaurs/:dinosaur", (c) => {
  try {
    const dinosaurParam = c.req.param("dinosaur")

    if (!dinosaurParam) {
      return c.json({
        error: "No dinosaur name provided"
      }, 400)
    }

    const dinosaur = data.find((item) =>
      item.name.toLowerCase() === dinosaurParam.toLowerCase()
    )

    if (dinosaur) {
      return c.json(dinosaur)
    }

    return c.json({
      error: `Dinosaur '${dinosaurParam}' not found`
    }, 404)
  } catch (error) {
    console.error(error)
    return c.json({ error: "Failed to fetch dinosaur" }, 500)
  }
});

// Serve static assets from the dist directory
app.use('/assets/*', serveStatic({ root: '../dist' }))

// Serve root static files
app.use('/*', serveStatic({
  root: './dist',
}))

// Serve index.html for all other routes (SPA fallback)
app.get('*', serveStatic({ path: './dist/index.html' }))

// Start the server
Deno.serve(app.fetch);
