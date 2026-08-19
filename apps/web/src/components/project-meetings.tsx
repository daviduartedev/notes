"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusPill } from "@/components/ui/status-pill";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import type { MeetingDto, MeetingType, MemberDto, ProjectDto, ValidationDto } from "@/lib/domain-types";
import { meetingTypeLabel } from "@/lib/labels";
import {
  MEETING_CREATE_ERROR,
  MEETING_CREATE_LABEL,
  MEETINGS_EMPTY,
  meetingHref,
} from "@/lib/meeting-copy";
import { meetingTypeTone } from "@/lib/status-tone";

const types: MeetingType[] = [
  "kickoff",
  "scope_alignment",
  "prototype_review",
  "staging_validation",
  "production_validation",
  "delivery",
];

export function ProjectMeetings({
  project,
  members,
  validations,
  meetings,
}: {
  project: ProjectDto;
  members: MemberDto[];
  validations: ValidationDto[];
  meetings: MeetingDto[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<MeetingType>("kickoff");
  const [startsAt, setStartsAt] = useState("");
  const [selected, setSelected] = useState<string[]>(members[0] ? [members[0].id] : []);
  const [validationId, setValidationId] = useState("");
  const [notes, setNotes] = useState("");
  const [decisions, setDecisions] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function toggleMember(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function createMeeting() {
    setPending(true);
    setError(null);
    const response = await apiRequest<MeetingDto>("/api/meetings", {
      method: "POST",
      body: JSON.stringify({
        projectId: project.id,
        title: title.trim(),
        type,
        startsAt: startsAt ? new Date(startsAt).toISOString() : new Date().toISOString(),
        participantUserIds: selected,
        validationId: validationId || undefined,
        notes: notes.trim() || undefined,
        decisions: decisions.trim() || undefined,
        nextSteps: nextSteps.trim() || undefined,
      }),
    });
    setPending(false);
    if (response.status !== 201) {
      setError(MEETING_CREATE_ERROR);
      return;
    }
    setTitle("");
    setNotes("");
    setDecisions("");
    setNextSteps("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 md:grid-cols-2">
        <Input placeholder="Título" value={title} onChange={(event) => setTitle(event.target.value)} />
        <Select value={type} onChange={(event) => setType(event.target.value as MeetingType)}>
          {types.map((value) => (
            <option key={value} value={value}>
              {meetingTypeLabel[value]}
            </option>
          ))}
        </Select>
        <Input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
        <Select value={validationId} onChange={(event) => setValidationId(event.target.value)}>
          <option value="">Sem validação</option>
          {validations.map((item) => (
            <option key={item.id} value={item.id}>
              {item.type}
            </option>
          ))}
        </Select>
        <Textarea
          className="md:col-span-2"
          placeholder="Notas"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
        <Textarea
          placeholder="Decisões"
          value={decisions}
          onChange={(event) => setDecisions(event.target.value)}
        />
        <Textarea
          placeholder="Próximos passos"
          value={nextSteps}
          onChange={(event) => setNextSteps(event.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        {members.map((member) => (
          <label key={member.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(member.id)}
              onChange={() => toggleMember(member.id)}
            />
            {member.name ?? member.email}
          </label>
        ))}
      </div>
      {error ? <p className="text-sm text-semantic-red">{error}</p> : null}
      <Button type="button" disabled={pending || !title.trim()} onClick={() => void createMeeting()}>
        {MEETING_CREATE_LABEL}
      </Button>
      {meetings.length === 0 ? (
        <p className="text-sm text-notes-muted">{MEETINGS_EMPTY}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {meetings.map((meeting) => (
            <a key={meeting.id} href={meetingHref(meeting.id)} className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone={meetingTypeTone[meeting.type]}>
                  {meetingTypeLabel[meeting.type]}
                </StatusPill>
                <span className="font-medium">{meeting.title}</span>
              </div>
              {meeting.decisions ? (
                <p className="text-sm text-notes-muted">{meeting.decisions}</p>
              ) : null}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
