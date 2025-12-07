import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-1ba4d8f6/health", (c) => {
  return c.json({ status: "ok" });
});

// --- Report Endpoints ---

// Create or Update Report
app.post("/make-server-1ba4d8f6/report", async (c) => {
  try {
    const body = await c.req.json();
    if (!body) {
      return c.json({ error: "Missing request body" }, 400);
    }

    // Generate ID if not provided
    const id = body.id || crypto.randomUUID();
    const key = `report:${id}`;

    const dataToStore = {
      ...body,
      id,
      updatedAt: new Date().toISOString(),
      // Preserve creation date if exists, else set new
      createdAt: body.createdAt || new Date().toISOString(),
    };

    await kv.set(key, dataToStore);
    return c.json({ success: true, id, data: dataToStore });
  } catch (err) {
    console.error("Error saving report:", err);
    return c.json({ error: "Failed to save report" }, 500);
  }
});

// Get single report
app.get("/make-server-1ba4d8f6/report/:id", async (c) => {
  const id = c.req.param("id");
  const key = `report:${id}`;
  try {
    const report = await kv.get(key);
    if (!report) {
      return c.json({ error: "Report not found" }, 404);
    }
    return c.json(report);
  } catch (err) {
    console.error("Error fetching report:", err);
    return c.json({ error: "Failed to fetch report" }, 500);
  }
});

// List all reports
app.get("/make-server-1ba4d8f6/reports", async (c) => {
  try {
    // Returns array of values
    const reports = await kv.getByPrefix("report:");
    return c.json(reports);
  } catch (err) {
    console.error("Error listing reports:", err);
    return c.json({ error: "Failed to list reports" }, 500);
  }
});

Deno.serve(app.fetch);