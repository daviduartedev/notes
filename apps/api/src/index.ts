import { config as loadDotenv } from "dotenv";
import { resolve } from "node:path";
import { serve } from "@hono/node-server";
import { API_PORT, createApp } from "./app.js";
import { loadEnv } from "./env.js";
import { logInfo } from "./logger.js";
import { prisma } from "./prisma.js";
import { createPrismaAuthenticate, createPrismaSessionVersion, createPrismaWorkspaceLookup } from "./prisma-auth.js";

loadDotenv({ path: resolve(process.cwd(), "../../.env") });
loadDotenv();

const env = loadEnv(process.env);
const port = env.API_PORT || API_PORT;
const sessionVersion = createPrismaSessionVersion(prisma);

serve(
  {
    fetch: createApp({
      authSecret: env.AUTH_SECRET,
      webOrigin: env.WEB_ORIGIN,
      authenticate: createPrismaAuthenticate(prisma),
      getWorkspace: createPrismaWorkspaceLookup(prisma),
      getSessionVersion: sessionVersion.getSessionVersion,
      bumpSessionVersion: sessionVersion.bumpSessionVersion,
    }).fetch,
    port,
  },
  () => {
    logInfo(`API http://localhost:${port}`);
  },
);
