import { STATUS_META, type StatusCode } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const toneClass: Record<string, string> = {
  success:
    "bg-[color-mix(in_oklab,var(--lime)_14%,transparent)] text-[var(--lime)] border-[color-mix(in_oklab,var(--lime)_35%,transparent)]",
  warning:
    "bg-[color-mix(in_oklab,var(--warning)_12%,transparent)] text-[var(--warning)] border-[color-mix(in_oklab,var(--warning)_30%,transparent)]",
  danger:
    "bg-[color-mix(in_oklab,var(--danger)_14%,transparent)] text-[var(--danger)] border-[color-mix(in_oklab,var(--danger)_35%,transparent)]",
  pending:
    "bg-[color-mix(in_oklab,var(--pending)_14%,transparent)] text-[var(--pending)] border-[color-mix(in_oklab,var(--pending)_30%,transparent)]",
  muted: "bg-muted text-muted-foreground border-border",
};

export function StatusPill({
  status,
  showLabel = false,
  className,
}: {
  status: StatusCode;
  showLabel?: boolean;
  className?: string;
}) {
  const m = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] backdrop-blur",
        toneClass[m.tone],
        className,
      )}
      title={m.label}
    >
      <span className="text-sm leading-none">{m.symbol}</span>
      {showLabel && <span className="font-sans tracking-wide">{m.label}</span>}
    </span>
  );
}

export function GoBadge({ value, label }: { value: "GO" | "PENDING" | "KO"; label: string }) {
  const tone =
    value === "GO" ? toneClass.success : value === "KO" ? toneClass.danger : toneClass.warning;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] tracking-luxury",
        tone,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {label} · {value}
    </span>
  );
}
