import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRoutes } from "./auth/routes.js";
import { checklistRoutes } from "./checklists/routes.js";
import { clientRoutes } from "./clients/routes.js";
import { pipelineRoutes } from "./pipeline/routes.js";
import { projectRoutes } from "./projects/routes.js";
import type { AppDeps } from "./deps.js";
import { clientErrorBody } from "./http/errors.js";
import { validationRoutes } from "./validations/routes.js";
import { workspaceRoutes } from "./workspace/routes.js";

export const API_PORT = 3014;

export function createApp(deps: AppDeps) {
  const app = new Hono();

  app.use(
    "*",
    cors({
      origin: deps.webOrigin,
      credentials: true,
      allowHeaders: ["Content-Type"],
      allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    }),
  );

  app.onError((_err, c) => c.json(clientErrorBody("Erro interno"), 500));

  app.get("/", (c) => c.json({ service: "notes-api" }));
  app.get("/health", (c) => c.json({ status: "ok" }));
  app.route("/api/auth", authRoutes(deps));
  app.route("/api", workspaceRoutes(deps));
  app.route("/api/clients", clientRoutes(deps));
  app.route("/api/pipeline", pipelineRoutes(deps));
  app.route("/api", checklistRoutes(deps));
  app.route("/api", validationRoutes(deps));
  app.route("/api/projects", projectRoutes(deps));

  return app;
}
