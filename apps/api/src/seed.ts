import { config as loadDotenv } from "dotenv";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";
import { loadEnv } from "./env.js";
import { logInfo } from "./logger.js";
import { prisma } from "./prisma.js";

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

  if (!existing) {
    await prisma.workspace.create({
      data: {
        name: env.SEED_WORKSPACE_NAME,
        members: {
          create: { userId: user.id, role: "owner" },
        },
      },
    });
  }

  logInfo("seed ok", { email: env.SEED_OWNER_EMAIL });
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
