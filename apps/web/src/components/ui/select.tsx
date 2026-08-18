import type { SelectHTMLAttributes } from "react";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className = "", children, ...props }: SelectProps) {
  return (
    <select
      className={`w-full rounded-md border border-notes-border bg-notes-raised px-3 py-2 text-sm text-notes-text outline-none focus:border-semantic-blue ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
