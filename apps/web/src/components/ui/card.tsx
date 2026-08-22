import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-none border border-notes-border bg-notes-panel p-4 ${className}`}
      {...props}
    />
  );
}
