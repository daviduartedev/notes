import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-lg border border-notes-border bg-notes-panel p-6 ${className}`}
      {...props}
    />
  );
}
