"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import type { StagePhase, WorkflowTemplateDto } from "@/lib/domain-types";
import { stagePhaseLabel } from "@/lib/labels";
import { WORKFLOWS_EMPTY, WORKFLOWS_NO_CANVAS } from "@/lib/workflow-copy";

const phases: StagePhase[] = ["commercial", "design", "development"];

type StageDraft = {
  key: string;
  label: string;
  phase: StagePhase;
  order: number;
  entryCriteria: string;
  exitCriteria: string;
};

function toDrafts(template: WorkflowTemplateDto | null): StageDraft[] {
  if (!template) {
    return [
      { key: "start", label: "Início", phase: "commercial", order: 1, entryCriteria: "", exitCriteria: "" },
      { key: "end", label: "Fim", phase: "development", order: 2, entryCriteria: "", exitCriteria: "" },
    ];
  }
  return template.stages.map((stage) => ({
    key: stage.key,
    label: stage.label,
    phase: stage.phase,
    order: stage.order,
    entryCriteria: stage.entryCriteria,
    exitCriteria: stage.exitCriteria,
  }));
}

export function WorkflowManager({ templates }: { templates: WorkflowTemplateDto[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(templates[0]?.id ?? "");
  const selected = useMemo(
    () => templates.find((row) => row.id === selectedId) ?? null,
    [templates, selectedId],
  );
  const [name, setName] = useState(selected?.name ?? "");
  const [key, setKey] = useState("");
  const [isDefault, setIsDefault] = useState(selected?.isDefault ?? false);
  const [creating, setCreating] = useState(false);
  const [stages, setStages] = useState<StageDraft[]>(toDrafts(selected));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function pick(id: string) {
    const next = templates.find((row) => row.id === id) ?? null;
    setSelectedId(id);
    setCreating(false);
    setName(next?.name ?? "");
    setIsDefault(next?.isDefault ?? false);
    setStages(toDrafts(next));
    setError(null);
  }

  function startCreate() {
    setCreating(true);
    setSelectedId("");
    setName("");
    setKey("");
    setIsDefault(false);
    setStages(toDrafts(null));
    setError(null);
  }

  function updateStage(index: number, patch: Partial<StageDraft>) {
    setStages((current) => current.map((stage, i) => (i === index ? { ...stage, ...patch } : stage)));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const payload = {
      name,
      isDefault,
      stages: stages.map((stage, index) => ({
        key: stage.key,
        label: stage.label,
        phase: stage.phase,
        order: index + 1,
        entryCriteria: stage.entryCriteria,
        exitCriteria: stage.exitCriteria,
      })),
    };
    const response = creating
      ? await apiRequest<WorkflowTemplateDto>("/api/workflow-templates", {
          method: "POST",
          body: JSON.stringify({ ...payload, key }),
        })
      : await apiRequest<WorkflowTemplateDto>(`/api/workflow-templates/${selectedId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
    setPending(false);
    if (response.status !== 200 && response.status !== 201) {
      setError("Não foi possível salvar o modelo");
      return;
    }
    router.refresh();
  }

  async function onDelete() {
    if (!selected || selected.isCatalog) return;
    setPending(true);
    const response = await apiRequest(`/api/workflow-templates/${selected.id}`, { method: "DELETE" });
    setPending(false);
    if (response.status !== 204) {
      setError("Não foi possível excluir o modelo");
      return;
    }
    router.refresh();
  }

  if (templates.length === 0 && !creating) {
    return <p className="text-sm text-notes-muted">{WORKFLOWS_EMPTY}</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-[220px_1fr]">
      <Card>
        <div className="flex flex-col gap-2">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              className={`rounded px-2 py-1 text-left text-sm ${
                template.id === selectedId ? "bg-notes-raised text-semantic-blue" : "text-notes-muted"
              }`}
              onClick={() => pick(template.id)}
            >
              {template.name}
              {template.isDefault ? " · padrão" : ""}
            </button>
          ))}
          <Button type="button" onClick={startCreate}>
            Novo modelo
          </Button>
        </div>
      </Card>
      <Card>
        <p className="mb-4 text-sm text-notes-muted">{WORKFLOWS_NO_CANVAS}</p>
        <form className="grid gap-3" onSubmit={(event) => void onSubmit(event)}>
          {creating ? (
            <label className="flex flex-col gap-1 text-sm">
              Chave
              <Input value={key} onChange={(event) => setKey(event.target.value)} required />
            </label>
          ) : (
            <p className="text-sm text-notes-muted">Chave: {selected?.key}</p>
          )}
          <label className="flex flex-col gap-1 text-sm">
            Nome
            <Input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(event) => setIsDefault(event.target.checked)}
            />
            Modelo padrão do workspace
          </label>
          <div className="grid gap-3">
            {stages.map((stage, index) => (
              <div key={`${stage.key}-${index}`} className="grid gap-2 rounded border border-notes-border p-3 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm">
                  Key
                  <Input value={stage.key} onChange={(event) => updateStage(index, { key: event.target.value })} required />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Label
                  <Input value={stage.label} onChange={(event) => updateStage(index, { label: event.target.value })} required />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Fase
                  <Select
                    value={stage.phase}
                    onChange={(event) => updateStage(index, { phase: event.target.value as StagePhase })}
                  >
                    {phases.map((phase) => (
                      <option key={phase} value={phase}>
                        {stagePhaseLabel[phase]}
                      </option>
                    ))}
                  </Select>
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Critério de entrada
                  <Textarea
                    value={stage.entryCriteria}
                    onChange={(event) => updateStage(index, { entryCriteria: event.target.value })}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm md:col-span-2">
                  Critério de saída
                  <Textarea
                    value={stage.exitCriteria}
                    onChange={(event) => updateStage(index, { exitCriteria: event.target.value })}
                  />
                </label>
                <div>
                  <Button
                    type="button"
                    disabled={stages.length <= 1}
                    onClick={() => setStages((current) => current.filter((_, i) => i !== index))}
                  >
                    Remover etapa
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button
            type="button"
            onClick={() =>
              setStages((current) => [
                ...current,
                {
                  key: `etapa_${current.length + 1}`,
                  label: "Nova etapa",
                  phase: "development",
                  order: current.length + 1,
                  entryCriteria: "",
                  exitCriteria: "",
                },
              ])
            }
          >
            Adicionar etapa
          </Button>
          {error ? <p className="text-sm text-semantic-red">{error}</p> : null}
          <div className="flex gap-2">
            <Button type="submit" pending={pending}>
              {creating ? "Criar modelo" : "Salvar modelo"}
            </Button>
            {selected && !selected.isCatalog ? (
              <Button type="button" variant="ghost" pending={pending} onClick={() => void onDelete()}>
                Excluir
              </Button>
            ) : null}
          </div>
        </form>
      </Card>
    </div>
  );
}
