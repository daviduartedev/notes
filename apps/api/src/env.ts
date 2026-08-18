import { z } from "zod";

const envSchema = z.object({
  AUTH_SECRET: z.string().min(32),
  WEB_ORIGIN: z.string().default("http://localhost:3015"),
  API_PORT: z.coerce.number().default(3014),
  SEED_OWNER_EMAIL: z.string().email(),
  SEED_OWNER_PASSWORD: z.string().min(1),
  DATABASE_URL: z.string().optional(),
  SEED_WORKSPACE_NAME: z.string().default("Notes"),
});

export type AppEnv = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv): AppEnv {
  return envSchema.parse(source);
}
