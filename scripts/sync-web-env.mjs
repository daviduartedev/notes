import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceEnv = path.join(root, ".env");
const targetEnv = path.join(root, "apps/web/.env.local");

if (!existsSync(sourceEnv)) {
  console.warn("[sync-web-env] .env na raiz não encontrado; apps/web/.env.local não atualizado.");
  process.exit(0);
}

const wanted = new Set(["AUTH_SECRET", "API_ORIGIN"]);
const values = new Map();

for (const line of readFileSync(sourceEnv, "utf8").split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    continue;
  }
  const eq = trimmed.indexOf("=");
  if (eq === -1) {
    continue;
  }
  const key = trimmed.slice(0, eq).trim();
  if (!wanted.has(key)) {
    continue;
  }
  values.set(key, trimmed.slice(eq + 1).trim());
}

if (!values.has("AUTH_SECRET")) {
  console.warn("[sync-web-env] AUTH_SECRET ausente em .env; apps/web/.env.local não atualizado.");
  process.exit(0);
}

const lines = [
  "# Gerado por scripts/sync-web-env.mjs — não editar manualmente.",
  `# Fonte: ${path.relative(root, sourceEnv)}`,
  `AUTH_SECRET=${values.get("AUTH_SECRET")}`,
];

if (values.has("API_ORIGIN")) {
  lines.push(`API_ORIGIN=${values.get("API_ORIGIN")}`);
}

writeFileSync(targetEnv, `${lines.join("\n")}\n`, "utf8");
console.log(`[sync-web-env] Atualizado ${path.relative(root, targetEnv)}`);
