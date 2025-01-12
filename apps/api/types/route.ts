import { Hono } from "../deps.ts";

// Define a base Hono app type without environment
export type HonoApp = Hono<Record<string | number | symbol, never>, Record<string | number | symbol, never>, "/">;
