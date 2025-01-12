import { Effect, Hono } from "../deps.ts";
import { assertEquals } from "jsr:@std/assert";
import { Routes, RoutesLive } from "./Routes.ts";
import { ProjectControllerLive } from "../controllers/ProjectController.ts";

Deno.test("Routes", async (t) => {
    const program = Effect.gen(function* (_) {
        const routes = yield* Routes;

        yield* Effect.tryPromise(() => t.step("addAllRoutes add all routes", () =>
            Effect.gen(function* (_) {
                const app = new Hono();
                const routedApp = yield* _(routes.addAllRoutes(app));
                const allRoutes = routedApp.routes.map((route) => [route.path, route.method]);
                const expectedRoutes = [
                    ["/api", "GET"],
                    ["/api/status", "GET"],
                    ["/api/projects", "GET"],
                    ["/api/projects/:id", "GET"],
                    ["/api/projects", "POST"],
                    ["/api/projects/:id", "PUT"],
                    ["/api/projects/:id", "DELETE"],
                    ["/assets/*", "ALL"],
                    ["/*", "ALL"],
                    ["/*", "GET"],
                ];

                assertEquals(allRoutes, expectedRoutes);
            }).pipe(Effect.runPromise)
        ));
    });

    await Effect.runPromise(Effect.provide(Effect.provide(program, RoutesLive), ProjectControllerLive));
});
