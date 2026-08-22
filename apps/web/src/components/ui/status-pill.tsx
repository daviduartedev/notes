import type { HTMLAttributes } from "react";

export type StatusTone = "green" | "yellow" | "red" | "blue" | "purple";

const tones: Record<StatusTone, string> = {
  green: "border-semantic-green/30 bg-semantic-green/10 text-semantic-green",
  yellow: "border-semantic-yellow/30 bg-semantic-yellow/10 text-semantic-yellow",
  red: "border-semantic-red/30 bg-semantic-red/10 text-semantic-red",
  blue: "border-notes-ink/30 bg-notes-ink/10 text-notes-ink",
  purple: "border-semantic-purple/30 bg-semantic-purple/10 text-semantic-purple",
};

export type StatusPillProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: StatusTone;
};

export function StatusPill({
  tone = "blue",
  className = "",
  ...props
}: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-none border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${tones[tone]} ${className}`}
      {...props}
    />
  );
}
