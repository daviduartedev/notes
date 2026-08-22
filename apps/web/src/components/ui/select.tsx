import type { SelectHTMLAttributes } from "react";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className = "", children, ...props }: SelectProps) {
  return (
    <select
      className={`min-w-[16rem] max-w-full flex-1 rounded-none border border-notes-border bg-notes-raised px-3 py-2 text-sm text-notes-text outline-none focus:border-notes-ink ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
