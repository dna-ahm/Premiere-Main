import { STATUS_META, type StatusCode } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const toneClass: Record<string, string> = {
  success: "bg-[oklch(0.96_0.04_150)] text-[oklch(0.4_0.12_150)] border-[oklch(0.85_0.06_150)]",
  warning: "bg-[oklch(0.97_0.05_75)] text-[oklch(0.45_0.12_75)] border-[oklch(0.88_0.08_75)]",
  danger: "bg-[oklch(0.96_0.05_25)] text-[oklch(0.45_0.18_25)] border-[oklch(0.85_0.1_25)]",
  pending: "bg-[oklch(0.96_0.04_280)] text-[oklch(0.45_0.15_280)] border-[oklch(0.85_0.08_280)]",
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
        "inline-flex items-center gap-2 rounded-sm border px-2.5 py-1 font-mono text-[11px]",
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
        "inline-flex items-center gap-2 rounded-sm border px-2.5 py-1 text-[10px] tracking-luxury",
        tone,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {label} · {value}
    </span>
  );
}
