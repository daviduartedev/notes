"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import type { ValidationDto, ValidationStatus } from "@/lib/domain-types";
import { validationStatusLabel } from "@/lib/labels";

export function ValidationActions({ validation }: { validation: ValidationDto }) {
  const router = useRouter();
  const [resultNotes, setResultNotes] = useState(validation.resultNotes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pendingTo, setPendingTo] = useState<ValidationStatus | null>(null);

  async function run(to: ValidationStatus) {
    setPendingTo(to);
    setError(null);
    const response = await apiRequest<ValidationDto>(`/api/validations/${validation.id}/transition`, {
      method: "POST",
      body: JSON.stringify({
        to,
        resultNotes: resultNotes.trim() ? resultNotes : undefined,
      }),
    });
    setPendingTo(null);
    if (response.status !== 200) {
      setError("Transição não permitida");
      return;
    }
    router.refresh();
  }

  if (validation.allowedTransitions.length === 0) {
    return <p className="text-sm text-notes-muted">Estado terminal.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        placeholder="Notas de resultado"
        value={resultNotes}
        onChange={(event) => setResultNotes(event.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        {validation.allowedTransitions.map((to) => (
          <Button
            key={to}
            disabled={pendingTo !== null}
            pending={pendingTo === to}
            onClick={() => void run(to)}
          >
            {validationStatusLabel[to]}
          </Button>
        ))}
      </div>
      {error ? <p className="text-sm text-semantic-red">{error}</p> : null}
    </div>
  );
}
