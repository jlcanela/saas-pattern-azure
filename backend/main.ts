
import { Hono } from "@hono/hono";
import { serveStatic } from "@hono/hono/deno"


import data from "./data.json" with { type: "json" };

const app = new Hono();

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
            return c.json( dinosaur)
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
