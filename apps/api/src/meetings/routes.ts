import { Hono } from "hono";
import { recordActivity } from "../activity/record.js";
import type { AppDeps } from "../deps.js";
import {
  EXTERNAL_PARTICIPANT_REASON,
  validateMeetingParticipants,
} from "../domain/meeting-type.js";
import { emptyNotFound, requireMember } from "../http/session-guard.js";
import type { MeetingCreateInput, MeetingUpdateInput } from "../store/types.js";
import { lookupForSession } from "../workspace/lookup.js";
import { workspaceIdFromSession } from "../workspace/scope.js";
import { serializeMeeting } from "./dto.js";
import { createMeetingSchema, meetingTypeSchema, patchMeetingSchema } from "./schema.js";

async function membersOf(deps: AppDeps, workspaceId: string) {
  return deps.store.listMembers(workspaceId);
}

async function memberIdSet(deps: AppDeps, workspaceId: string) {
  const members = await membersOf(deps, workspaceId);
  return new Set(members.map((member) => member.userId));
}

export function meetingRoutes(deps: AppDeps) {
  const routes = new Hono();

  routes.get("/meetings", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const workspaceId = workspaceIdFromSession(gate.session, { query: c.req.query() });
    if (!workspaceId) {
      return c.json({ error: "Sem permissão" }, 403);
    }
    const typeQuery = c.req.query("type");
    const typeParsed = typeQuery ? meetingTypeSchema.safeParse(typeQuery) : null;
    if (typeParsed && !typeParsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    const [rows, members] = await Promise.all([
      deps.store.listMeetings(workspaceId, {
        type: typeParsed?.success ? typeParsed.data : undefined,
        projectId: c.req.query("projectId") || undefined,
        clientId: c.req.query("clientId") || undefined,
        validationId: c.req.query("validationId") || undefined,
      }),
      membersOf(deps, workspaceId),
    ]);
    return c.json(rows.map((row) => serializeMeeting(row, members)));
  });

  routes.get("/projects/:id/meetings", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const project = await lookupForSession(
      gate.session,
      c.req.param("id"),
      (id) => deps.store.getProject(id),
      (row) => row.workspaceId,
    );
    if (!project) {
      return emptyNotFound(c);
    }
    const [rows, members] = await Promise.all([
      deps.store.listProjectMeetings(project.id),
      membersOf(deps, project.workspaceId),
    ]);
    return c.json(rows.map((row) => serializeMeeting(row, members)));
  });

  routes.get("/clients/:id/meetings", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const client = await lookupForSession(
      gate.session,
      c.req.param("id"),
      (id) => deps.store.getClient(id),
      (row) => row.workspaceId,
    );
    if (!client) {
      return emptyNotFound(c);
    }
    const [rows, members] = await Promise.all([
      deps.store.listClientMeetings(client.id),
      membersOf(deps, client.workspaceId),
    ]);
    return c.json(rows.map((row) => serializeMeeting(row, members)));
  });

  routes.post("/meetings", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const body: unknown = await c.req.json().catch(() => null);
    const workspaceId = workspaceIdFromSession(gate.session, { body });
    if (!workspaceId) {
      return c.json({ error: "Sem permissão" }, 403);
    }
    const parsed = createMeetingSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }
    const projectId = parsed.data.projectId ?? null;
    const requestedClientId = parsed.data.clientId ?? null;
    if (!projectId && !requestedClientId) {
      return c.json({ error: "Dados inválidos" }, 400);
    }

    let clientId: string | null = requestedClientId;
    if (projectId) {
      const project = await lookupForSession(
        gate.session,
        projectId,
        (id) => deps.store.getProject(id),
        (row) => row.workspaceId,
      );
      if (!project) {
        return emptyNotFound(c);
      }
      if (requestedClientId && requestedClientId !== project.clientId) {
        return c.json({ error: "Dados inválidos" }, 400);
      }
      clientId = project.clientId;
    } else if (requestedClientId) {
      const client = await lookupForSession(
        gate.session,
        requestedClientId,
        (id) => deps.store.getClient(id),
        (row) => row.workspaceId,
      );
      if (!client) {
        return emptyNotFound(c);
      }
    }

    const stageId = parsed.data.stageId ?? null;
    if (stageId) {
      if (!projectId) {
        return c.json({ error: "Dados inválidos" }, 400);
      }
      const stage = await deps.store.getStage(stageId);
      if (!stage || stage.workspaceId !== workspaceId || stage.projectId !== projectId) {
        return c.json({ error: "Dados inválidos" }, 400);
      }
    }

    const validationId = parsed.data.validationId ?? null;
    if (validationId) {
      const validation = await lookupForSession(
        gate.session,
        validationId,
        (id) => deps.store.getValidation(id),
        (row) => row.workspaceId,
      );
      if (!validation) {
        return emptyNotFound(c);
      }
      if (projectId && validation.projectId !== projectId) {
        return c.json({ error: "Dados inválidos" }, 400);
      }
      if (clientId && validation.clientId !== clientId) {
        return c.json({ error: "Dados inválidos" }, 400);
      }
    }

    const participants = validateMeetingParticipants(
      parsed.data.participantUserIds,
      await memberIdSet(deps, workspaceId),
    );
    if (!participants.ok) {
      return c.json({ error: "Dados inválidos", reason: EXTERNAL_PARTICIPANT_REASON }, 400);
    }

    const input: MeetingCreateInput = {
      workspaceId,
      title: parsed.data.title,
      type: parsed.data.type,
      startsAt: parsed.data.startsAt,
      participantUserIds: participants.participantUserIds,
      notes: parsed.data.notes ?? null,
      decisions: parsed.data.decisions ?? null,
      nextSteps: parsed.data.nextSteps ?? null,
      clientId,
      projectId,
      stageId,
      validationId,
      now: deps.now(),
    };
    const created = await deps.store.createMeeting(input);
    if (!created) {
      return emptyNotFound(c);
    }

    const entityType = created.projectId ? "project" : "client";
    const entityId = created.projectId ?? created.clientId;
    if (entityId) {
      await recordActivity(deps, {
        workspaceId,
        actorId: gate.session.sub,
        entityType,
        entityId,
        action: "meeting.created",
        payload: {
          meetingId: created.id,
          type: created.type,
          title: created.title,
        },
      });
    }
    const members = await membersOf(deps, workspaceId);
    return c.json(serializeMeeting(created, members), 201);
  });

  routes.get("/meetings/:id", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const row = await lookupForSession(
      gate.session,
      c.req.param("id"),
      (id) => deps.store.getMeeting(id),
      (item) => item.workspaceId,
    );
    if (!row) {
      return emptyNotFound(c);
    }
    const members = await membersOf(deps, row.workspaceId);
    return c.json(serializeMeeting(row, members));
  });

  routes.patch("/meetings/:id", async (c) => {
    const gate = await requireMember(c, deps);
    if (!gate.ok) return gate.response;
    const body: unknown = await c.req.json().catch(() => null);
    void workspaceIdFromSession(gate.session, { body });
    const current = await lookupForSession(
      gate.session,
      c.req.param("id"),
      (id) => deps.store.getMeeting(id),
      (item) => item.workspaceId,
    );
    if (!current) {
      return emptyNotFound(c);
    }
    const parsed = patchMeetingSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Dados inválidos" }, 400);
    }

    const patch: MeetingUpdateInput = {};
    if (parsed.data.title !== undefined) patch.title = parsed.data.title;
    if (parsed.data.type !== undefined) patch.type = parsed.data.type;
    if (parsed.data.startsAt !== undefined && parsed.data.startsAt !== null) {
      patch.startsAt = parsed.data.startsAt;
    }
    if (parsed.data.notes !== undefined) patch.notes = parsed.data.notes;
    if (parsed.data.decisions !== undefined) patch.decisions = parsed.data.decisions;
    if (parsed.data.nextSteps !== undefined) patch.nextSteps = parsed.data.nextSteps;
    if (parsed.data.participantUserIds !== undefined) {
      const participants = validateMeetingParticipants(
        parsed.data.participantUserIds,
        await memberIdSet(deps, current.workspaceId),
      );
      if (!participants.ok) {
        return c.json({ error: "Dados inválidos", reason: EXTERNAL_PARTICIPANT_REASON }, 400);
      }
      patch.participantUserIds = participants.participantUserIds;
    }

    const updated = await deps.store.updateMeeting(current.id, patch);
    if (!updated) {
      return emptyNotFound(c);
    }
    const members = await membersOf(deps, current.workspaceId);
    return c.json(serializeMeeting(updated, members));
  });

  return routes;
}
