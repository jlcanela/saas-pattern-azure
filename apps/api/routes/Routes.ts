// routes/index.ts
import { Context, Effect, Layer, Hono } from "../deps.ts";
import { HonoApp } from "../types/route.ts";
import { serveStatic } from "@hono/hono/deno"
import { ProjectController } from "../controllers/ProjectController.ts";

export class Routes extends Context.Tag("Routes")<
    Routes,
    {
        readonly getHealthRouter: Effect.Effect<HonoApp, never, never>;
        readonly getProjectRouter: Effect.Effect<HonoApp, never, never>;
        readonly getWebappRouter: Effect.Effect<HonoApp, never, never>;
        readonly addAllRoutes: (app: HonoApp) => Effect.Effect<HonoApp, never, never>;
    }
>() { }

const createHealthRouter = Effect.sync(() => {
    const router = new Hono();
    router.get("/", (c) => c.json({ status: "ok" }));
    router.get("/status", (c) => c.json({ status: "ready" }));
    return router;
});

const createProjectRouter = Effect.gen(function* (_) {
    const controller = yield* ProjectController;
    const router = new Hono();

    const handleEffect = (effect: Effect.Effect<Response, Error>) =>
        Effect.runPromise(effect);

    router.get("/", (c) => handleEffect(controller.listProjects(c)));
    router.get("/:id", (c) => handleEffect(controller.getProject(c)));
    router.post("/", (c) => handleEffect(controller.createProject(c)));
    router.put("/:id", (c) => handleEffect(controller.updateProject(c)));
    router.delete("/:id", (c) => handleEffect(controller.deleteProject(c)));

    return router;
}).pipe(Effect.map((router) => router as HonoApp));

const createWebappRouter = Effect.sync(() => {
    const router = new Hono();

    // Serve static assets from the dist directory
    router.use('/assets/*', serveStatic({ root: '../dist' }))

    // Serve root static files
    router.use('/*', serveStatic({
        root: './dist',
    }))

    // Serve index.html for all other routes (SPA fallback)
    router.get('*', serveStatic({
        root: './dist',
        rewriteRequestPath: () => '/index.html'
    }))
    return router;
});

export const createAddAllRoutes = (app: HonoApp) => Effect.gen(function* (_) {

    const healthRouter = yield* _(createHealthRouter);
    const projectRouter = yield* _(createProjectRouter);
    const webappRouter = yield* _(createWebappRouter);

    app.route("/api", healthRouter);
    app.route("/api/projects", projectRouter);
    app.route("/", webappRouter);

    return app;
});

export const RoutesLive = Layer.effect(
    Routes,
    Effect.gen(function* (_) {
        const projectController = yield* ProjectController;
        return {
            getHealthRouter: createHealthRouter,
            getProjectRouter: Effect.provideService(createProjectRouter, ProjectController, projectController),
            getWebappRouter: createWebappRouter,
            addAllRoutes: (app) => Effect.provideService(createAddAllRoutes(app), ProjectController, projectController)
        }
    })
);
