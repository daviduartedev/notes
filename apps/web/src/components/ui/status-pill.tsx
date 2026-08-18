import type { HTMLAttributes } from "react";

export type StatusTone = "green" | "yellow" | "red" | "blue" | "purple";

const tones: Record<StatusTone, string> = {
  green: "bg-semantic-green/15 text-semantic-green",
  yellow: "bg-semantic-yellow/15 text-semantic-yellow",
  red: "bg-semantic-red/15 text-semantic-red",
  blue: "bg-semantic-blue/15 text-semantic-blue",
  purple: "bg-semantic-purple/15 text-semantic-purple",
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
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
      {...props}
    />
  );
}
