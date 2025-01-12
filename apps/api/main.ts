// main.ts
import { ProjectControllerLive } from "./controllers/ProjectController.ts";
import { Effect, Hono } from "./deps.ts";
import { Routes, RoutesLive } from "./routes/Routes.ts";

const app = new Hono();

const program = Effect.gen(function* (_) {
    const routes = yield* Routes;
    const routedApp = yield* routes.addAllRoutes(app);

    Deno.serve(routedApp.fetch);
    console.log("Server running on http://localhost:8000");
});

const runnable = Effect.provide(Effect.provide(program, RoutesLive), ProjectControllerLive);

Effect.runPromise(runnable);
