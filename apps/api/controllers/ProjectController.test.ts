// controllers/ProjectController.test.ts
import { Effect, HonoContext } from "../deps.ts";
import { assertEquals } from "jsr:@std/assert";
import { ProjectController, ProjectControllerLive } from "./ProjectController.ts";

// Mock HonoContext factory
const createMockContext = (params: Record<string, string> = {}, body: unknown = {}) => ({
    req: {
        param: (key: string) => params[key],
        json: () => Promise.resolve(body)
    },
    json: (data: unknown, status: number | undefined) => new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" }
    })
}) as HonoContext;

Deno.test("ProjectController", async (t) => {
    const program = Effect.gen(function* (_) {
        const controller = yield* ProjectController;

        yield* Effect.tryPromise(() => t.step("listProjects returns empty array", () =>
            Effect.gen(function* (_) {
                const ctx = createMockContext();
                const response = yield* _(controller.listProjects(ctx));
                const data = yield* _(Effect.promise(() => response.json()));
                assertEquals(data, { projects: [] });
            }).pipe(Effect.runPromise)
        ));

        yield* Effect.tryPromise(() => t.step("getProject returns project by id", () =>
            Effect.gen(function* (_) {
                const ctx = createMockContext({ id: "test-id" });
                const response = yield* _(controller.getProject(ctx));
                const data = yield* _(Effect.promise(() => response.json()));
                assertEquals(data.id, "test-id");
                assertEquals(data.name, "Sample Project");
                assertEquals(data.description, "Description");
                assertEquals(typeof data.createdAt, "string");
            }).pipe(Effect.runPromise)
        ));

        yield* Effect.tryPromise(() => t.step("createProject creates new project", () =>
            Effect.gen(function* (_) {
                const newProject = {
                    name: "New Project",
                    description: "New Description"
                };
                const ctx = createMockContext({}, newProject);
                const response = yield* _(controller.createProject(ctx));
                assertEquals(response.status, 201);
                const data = yield* _(Effect.promise(() => response.json()));
                assertEquals(data.name, newProject.name);
                assertEquals(data.description, newProject.description);
                assertEquals(typeof data.id, "string");
            }).pipe(Effect.runPromise)
        ));

        yield* Effect.tryPromise(() => t.step("updateProject updates existing project", () =>
            Effect.gen(function* (_) {
                const updateData = {
                    name: "Updated Project",
                    description: "Updated Description"
                };
                const ctx = createMockContext({ id: "test-id" }, updateData);
                const response = yield* _(controller.updateProject(ctx));
                const data = yield* _(Effect.promise(() => response.json()));
                assertEquals(data.id, "test-id");
                assertEquals(data.name, updateData.name);
                assertEquals(data.description, updateData.description);
            }).pipe(Effect.runPromise)
        ));

        yield* Effect.tryPromise(() => t.step("deleteProject removes project", () =>
            Effect.gen(function* (_) {
                const ctx = createMockContext({ id: "test-id" });
                const response = yield* _(controller.deleteProject(ctx));
                const data = yield* _(Effect.promise(() => response.json()));
                assertEquals(data, { deleted: "test-id" });
            }).pipe(Effect.runPromise)
        ));
    });

    await Effect.runPromise(Effect.provide(program, ProjectControllerLive));
});
