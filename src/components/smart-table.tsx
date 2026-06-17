import { useState } from "react";
import { StatusPill } from "@/components/status-badge";
import { STATUS_META, type CheckRow, type StatusCode } from "@/lib/mock-data";

const TABLE_GRID = "grid grid-cols-[60px_1fr_140px_220px_200px_50px] gap-4";

type SmartTableProps = {
  rows: CheckRow[];
  readOnly?: boolean;
  expanded?: Record<string, boolean>;
  setExpanded?: (fn: (e: Record<string, boolean>) => Record<string, boolean>) => void;
  setStatus?: (rowId: string, parentId: string | null, status: StatusCode) => void;
  setChatRow?: (r: CheckRow) => void;
  setZoom?: (url: string) => void;
};

export function SmartTable({
  rows,
  readOnly = false,
  expanded = {},
  setExpanded,
  setStatus,
  setChatRow,
  setZoom,
}: SmartTableProps) {
  return (
    <div>
      <div
        className={`${TABLE_GRID} border-b hairline px-6 py-3 tracking-luxury text-[10px] text-muted-foreground`}
      >
        <span>#</span>
        <span>Checkpoint</span>
        <span>Status</span>
        <span>Note</span>
        <span>Media</span>
        <span className="text-right">Chat</span>
      </div>
      {rows.map((row) => (
        <SmartTableRow
          key={row.id}
          row={row}
          readOnly={readOnly}
          expanded={!!expanded[row.id]}
          onToggle={() => setExpanded?.((e) => ({ ...e, [row.id]: !e[row.id] }))}
          onStatus={(s) => setStatus?.(row.id, null, s)}
          onChat={() => setChatRow?.(row)}
          onZoom={(url) => setZoom?.(url)}
          onSubStatus={(subId, s) => setStatus?.(subId, row.id, s)}
          onSubChat={(sub) => setChatRow?.(sub)}
        />
      ))}
    </div>
  );
}

function MediaCell({ src, onZoom }: { src?: string; onZoom?: (url: string) => void }) {
  if (!src) {
    return <span className="text-[10px] text-muted-foreground">—</span>;
  }

  return (
    <img
      src={src}
      alt=""
      className={`w-full max-w-[180px] border hairline object-contain bg-muted/30 ${
        onZoom ? "cursor-zoom-in" : ""
      }`}
      onClick={onZoom ? () => onZoom(src) : undefined}
    />
  );
}

function SmartTableRow({
  row,
  readOnly,
  expanded,
  onToggle,
  onStatus,
  onChat,
  onZoom,
  onSubStatus,
  onSubChat,
}: {
  row: CheckRow;
  readOnly: boolean;
  expanded: boolean;
  onToggle: () => void;
  onStatus: (s: StatusCode) => void;
  onChat: () => void;
  onZoom: (url: string) => void;
  onSubStatus: (subId: string, s: StatusCode) => void;
  onSubChat: (sub: CheckRow) => void;
}) {
  const hasSubs = !!row.subRows?.length;

  return (
    <>
      <div
        className={`${TABLE_GRID} items-start border-b hairline px-6 py-4 transition-colors hover:bg-muted/50`}
      >
        <span className="pt-1 font-mono text-[12px] text-muted-foreground">{row.index}</span>
        <div className="flex items-start gap-3 pt-0.5">
          {hasSubs && !readOnly && (
            <button
              type="button"
              onClick={onToggle}
              className="grid h-6 w-6 shrink-0 place-items-center border hairline text-[10px] text-primary"
            >
              {expanded ? "−" : "+"}
            </button>
          )}
          <span className="font-serif text-lg">{row.label}</span>
        </div>
        <div className="pt-1">
          {readOnly ? (
            <StatusPill status={row.status} />
          ) : (
            <StatusSelector value={row.status} onChange={onStatus} />
          )}
        </div>
        <span className="pt-1 text-[12px] text-muted-foreground">{row.note ?? "—"}</span>
        <MediaCell src={row.media} onZoom={onZoom} />
        {readOnly ? (
          <span className="justify-self-end pt-1 text-[10px] text-muted-foreground">
            {row.comments.length > 0 ? row.comments.length : "—"}
          </span>
        ) : (
          <button
            type="button"
            onClick={onChat}
            className="relative justify-self-end pt-1 text-muted-foreground hover:text-foreground"
            aria-label="Open chat"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            {row.comments.length > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-foreground text-[9px] text-primary-foreground">
                {row.comments.length}
              </span>
            )}
          </button>
        )}
      </div>

      {hasSubs &&
        expanded &&
        row.subRows!.map((sub) => (
          <div
            key={sub.id}
            className={`${TABLE_GRID} items-start border-b hairline bg-muted/30 px-6 py-3 pl-10`}
          >
            <span className="pt-1 font-mono text-[11px] text-muted-foreground">{sub.index}</span>
            <span className="pt-0.5 text-sm">{sub.label}</span>
            <div className="pt-1">
              {readOnly ? (
                <StatusPill status={sub.status} />
              ) : (
                <StatusSelector value={sub.status} onChange={(s) => onSubStatus(sub.id, s)} />
              )}
            </div>
            <span className="pt-1 text-[12px] text-muted-foreground">{sub.note ?? "—"}</span>
            <MediaCell src={sub.media} onZoom={onZoom} />
            {readOnly ? (
              <span className="justify-self-end pt-1 text-[10px] text-muted-foreground">
                {sub.comments.length > 0 ? sub.comments.length : "—"}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onSubChat(sub)}
                className="justify-self-end pt-1 text-muted-foreground hover:text-foreground"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </button>
            )}
          </div>
        ))}
    </>
  );
}

function StatusSelector({ value, onChange }: { value: StatusCode; onChange: (s: StatusCode) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="inline-flex items-center gap-2"
      >
        <StatusPill status={value} />
        <span className="text-[10px] text-muted-foreground">▾</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-80 border hairline bg-popover p-2 shadow-xl">
          {(["triangle", "ok", "ko", "delta", "empty"] as StatusCode[]).map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(s);
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-[12px] hover:bg-muted"
            >
              <StatusPill status={s} />
              <span className="text-muted-foreground">{STATUS_META[s].label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
