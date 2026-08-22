import type { TextareaHTMLAttributes } from "react";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={`min-h-24 w-full rounded-none border border-notes-border bg-notes-raised px-3 py-2 text-sm text-notes-text placeholder:text-notes-muted outline-none focus:border-notes-ink ${className}`}
      {...props}
    />
  );
}
