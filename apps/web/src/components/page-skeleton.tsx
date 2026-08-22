import { AppShell } from "@/components/app-shell";
import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton({
  title,
  pathname,
  kind = "list",
}: {
  title: string;
  pathname: string;
  kind?: "list" | "board" | "detail" | "timeline";
}) {
  return (
    <AppShell title={title} pathname={pathname}>
      {kind === "board" ? (
        <BoardSkeleton />
      ) : kind === "detail" ? (
        <DetailSkeleton />
      ) : kind === "timeline" ? (
        <TimelineSkeleton />
      ) : (
        <ListSkeleton />
      )}
    </AppShell>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Carregando">
      <Skeleton className="h-14 w-full" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden px-8 pb-8 pt-4" aria-busy="true" aria-label="Carregando">
      {Array.from({ length: 4 }, (_, column) => (
        <div key={column} className="flex w-72 shrink-0 flex-col gap-3">
          <Skeleton className="h-4 w-32" />
          {Array.from({ length: 3 }, (_, row) => (
            <Skeleton key={row} className="h-24 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Carregando">
      <Skeleton className="h-14 w-full" />
      <div className="flex flex-col">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex w-5 flex-col items-center">
              <Skeleton className="mt-1.5 size-2.5" />
              {index < 5 ? <span className="w-px flex-1 bg-notes-border" /> : null}
            </div>
            <div className="min-w-0 flex-1 pb-6">
              <Skeleton className="mb-2 h-4 w-40" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Carregando">
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
