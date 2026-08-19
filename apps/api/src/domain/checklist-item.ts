export type ChecklistItemState = {
  completedAt: Date | null;
  completedByUserId: string | null;
  note: string | null;
};

export type ChecklistItemPatch = {
  completed: boolean;
  note?: string | null;
};

export function applyChecklistItemState(input: {
  current: ChecklistItemState;
  patch: ChecklistItemPatch;
  actorUserId: string;
  now: Date;
}): { next: ChecklistItemState; completedEvent: boolean } {
  const note =
    input.patch.note !== undefined ? input.patch.note : input.current.note;
  if (!input.patch.completed) {
    return {
      next: {
        completedAt: null,
        completedByUserId: null,
        note,
      },
      completedEvent: false,
    };
  }
  const wasOpen = input.current.completedAt === null;
  return {
    next: {
      completedAt: input.current.completedAt ?? input.now,
      completedByUserId: input.current.completedByUserId ?? input.actorUserId,
      note,
    },
    completedEvent: wasOpen,
  };
}
