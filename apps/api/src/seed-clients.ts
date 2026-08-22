import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { PrismaClient } from "@prisma/client";
import type { ClientStatus, ProjectPriority, ProjectStatus } from "./domain/types.js";
import { logInfo } from "./logger.js";
import { createPrismaStore } from "./store/prisma.js";

type SeedProjectInput = {
  nome: string;
  descricao?: string | null;
  status?: string | null;
  prioridade?: string | null;
  workflow?: string | null;
  inicio?: string | null;
  prazo?: string | null;
  observacoes?: string | null;
};

type SeedClientInput = {
  nome: string;
  empresa?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  status?: string | null;
  ultimoContato?: string | null;
  proximoFollowUp?: string | null;
  observacoes?: string | null;
  projetos?: SeedProjectInput[];
};

type SeedFile = {
  clientes?: SeedClientInput[];
};

const WORKFLOW_ALIASES: Record<string, string> = {
  saas: "saas_delivery",
  "saas_delivery": "saas_delivery",
  landing: "landing",
  lp: "landing",
  "lp (landing page)": "landing",
  institutional: "institutional",
  institucional: "institutional",
  app: "app",
  ecommerce: "ecommerce",
  "e-commerce": "ecommerce",
  maintenance: "maintenance",
  manutencao: "maintenance",
  manutenção: "maintenance",
};

const PROJECT_STATUS_ALIASES: Record<string, ProjectStatus> = {
  draft: "draft",
  rascunho: "draft",
  active: "active",
  ativo: "active",
  on_hold: "on_hold",
  espera: "on_hold",
  completed: "completed",
  done: "completed",
  concluido: "completed",
  concluído: "completed",
  entregue: "completed",
  cancelled: "cancelled",
  cancelado: "cancelled",
};

const PRIORITY_ALIASES: Record<string, ProjectPriority> = {
  low: "low",
  baixa: "low",
  medium: "medium",
  media: "medium",
  média: "medium",
  high: "high",
  alta: "high",
  urgent: "urgent",
  urgente: "urgent",
};

const CLIENT_STATUS_ALIASES: Record<string, ClientStatus> = {
  lead: "lead",
  active: "active",
  ativo: "active",
  inactive: "inactive",
  inativo: "inactive",
  archived: "archived",
  arquivado: "archived",
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value || !value.trim()) return null;
  const parsed = new Date(`${value.trim()}T12:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function mapWorkflowKey(raw: string | null | undefined): string {
  const key = normalizeKey(raw ?? "saas_delivery");
  return WORKFLOW_ALIASES[key] ?? "saas_delivery";
}

function mapProjectStatus(raw: string | null | undefined): ProjectStatus {
  return PROJECT_STATUS_ALIASES[normalizeKey(raw ?? "draft")] ?? "draft";
}

function mapPriority(raw: string | null | undefined): ProjectPriority {
  return PRIORITY_ALIASES[normalizeKey(raw ?? "medium")] ?? "medium";
}

function mapClientStatus(raw: string | null | undefined): ClientStatus {
  return CLIENT_STATUS_ALIASES[normalizeKey(raw ?? "lead")] ?? "lead";
}

async function completeProjectStages(prisma: PrismaClient, projectId: string, now: Date) {
  const stages = await prisma.stage.findMany({
    where: { projectId },
    orderBy: { order: "asc" },
  });
  const last = stages.at(-1);
  for (const stage of stages) {
    await prisma.stage.update({
      where: { id: stage.id },
      data: {
        status: "completed",
        startedAt: stage.startedAt ?? now,
        completedAt: stage.completedAt ?? now,
      },
    });
  }
  if (last) {
    await prisma.project.update({
      where: { id: projectId },
      data: { currentStageId: last.id, progress: 100 },
    });
  }
}

export async function seedClientsFromInputFile(
  prisma: PrismaClient,
  workspaceId: string,
  ownerUserId: string,
  filePath = resolve(process.cwd(), "../../data/clientes-seed.input.json"),
): Promise<{ clients: number; projects: number }> {
  if (!existsSync(filePath)) {
    logInfo("seed clientes ignorado", { reason: "arquivo ausente", filePath });
    return { clients: 0, projects: 0 };
  }
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw) as SeedFile;
  const clients = (parsed.clientes ?? []).filter(
    (client) => client.nome.trim() && !client.nome.startsWith("EXEMPLO"),
  );

  const store = createPrismaStore(prisma);
  let clientCount = 0;
  let projectCount = 0;
  const now = new Date();

  for (const item of clients) {
    const existingClient = await prisma.client.findFirst({
      where: { workspaceId, name: item.nome.trim() },
    });
    const clientPayload = {
      workspaceId,
      name: item.nome.trim(),
      company: item.empresa?.trim() || null,
      whatsapp: item.whatsapp?.trim() || null,
      email: item.email?.trim() || null,
      ownerUserId,
      notes: item.observacoes?.trim() || null,
      status: mapClientStatus(item.status),
      lastContactAt: parseDate(item.ultimoContato),
      nextFollowUpAt: parseDate(item.proximoFollowUp),
      lastInteractionAt: parseDate(item.ultimoContato) ?? now,
    };
    const client = existingClient
      ? await prisma.client.update({ where: { id: existingClient.id }, data: clientPayload })
      : await store.createClient(clientPayload);
    clientCount += 1;

    for (const project of item.projetos ?? []) {
      if (!project.nome.trim()) continue;
      const workflowKey = mapWorkflowKey(project.workflow);
      const template = await prisma.workflowTemplate.findUnique({
        where: { workspaceId_key: { workspaceId, key: workflowKey } },
      });
      if (!template) {
        throw new Error(`workflow ausente: ${workflowKey}`);
      }
      const status = mapProjectStatus(project.status);
      const existingProject = await prisma.project.findFirst({
        where: { workspaceId, clientId: client.id, name: project.nome.trim() },
      });
      const patch = {
        description: project.descricao?.trim() || null,
        ownerUserId,
        status,
        startDate: parseDate(project.inicio),
        dueDate: parseDate(project.prazo),
        priority: mapPriority(project.prioridade),
        progress: status === "completed" ? 100 : 0,
        notes: project.observacoes?.trim() || null,
        lastInteractionAt: parseDate(project.inicio) ?? now,
      };
      if (existingProject) {
        await prisma.project.update({ where: { id: existingProject.id }, data: patch });
        if (status === "completed") {
          await completeProjectStages(prisma, existingProject.id, now);
        }
      } else {
        const created = await store.createProject({
          workspaceId,
          clientId: client.id,
          name: project.nome.trim(),
          workflowTemplateId: template.id,
          ...patch,
        });
        if (status === "completed") {
          await completeProjectStages(prisma, created.id, now);
        }
      }
      projectCount += 1;
    }
  }

  logInfo("seed clientes ok", { clients: clientCount, projects: projectCount });
  return { clients: clientCount, projects: projectCount };
}
