import { AppShell } from "@/components/app-shell";
import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton({
  title,
  pathname,
  kind = "list",
}: {
  title: string;
  pathname: string;
  kind?: "list" | "board" | "detail";
}) {
  return (
    <AppShell title={title} pathname={pathname}>
      {kind === "board" ? <BoardSkeleton /> : kind === "detail" ? <DetailSkeleton /> : <ListSkeleton />}
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

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Carregando">
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
