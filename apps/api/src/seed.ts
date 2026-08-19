import { config as loadDotenv } from "dotenv";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";
import { loadEnv } from "./env.js";
import { logInfo } from "./logger.js";
import { prisma } from "./prisma.js";
import { ensureDeployStagingForWorkspace } from "./checklists/seed.js";
import { ensureWorkflowCatalogForWorkspace } from "./workflows/seed.js";
import { createPrismaStore } from "./store/prisma.js";

loadDotenv({ path: resolve(process.cwd(), "../../.env") });
loadDotenv();

async function seed() {
  const env = loadEnv(process.env);
  const passwordHash = await bcrypt.hash(env.SEED_OWNER_PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: { email: env.SEED_OWNER_EMAIL },
    create: {
      email: env.SEED_OWNER_EMAIL,
      passwordHash,
      name: "Owner",
    },
    update: { passwordHash },
  });

  const existing = await prisma.member.findFirst({
    where: { userId: user.id },
    include: { workspace: true },
  });

  const workspaceId = existing
    ? existing.workspaceId
    : (
        await prisma.workspace.create({
          data: {
            name: env.SEED_WORKSPACE_NAME,
            members: {
              create: { userId: user.id, role: "owner" },
            },
          },
        })
      ).id;

  await ensureWorkflowCatalogForWorkspace(prisma, workspaceId);
  await ensureDeployStagingForWorkspace(prisma, workspaceId);
  await createPrismaStore(prisma).backfillMissingStages(workspaceId, new Date());

  logInfo("seed ok", { email: env.SEED_OWNER_EMAIL, workspaceId });
}

seed()
  .catch((error: unknown) => {
    console.error("seed failed");
    console.error(error instanceof Error ? error.message : "unknown");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
