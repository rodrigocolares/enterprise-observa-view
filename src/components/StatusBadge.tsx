import { cn } from "@/lib/utils";
import { Status } from "@/lib/mockData";

const map: Record<Status | "emergency" | "info", { label: string; cls: string; dot: string }> = {
  online: { label: "Online", cls: "bg-success/15 text-success border-success/30", dot: "bg-success" },
  warning: { label: "Warning", cls: "bg-warning/15 text-warning border-warning/30", dot: "bg-warning" },
  critical: { label: "Critical", cls: "bg-critical/15 text-critical border-critical/40", dot: "bg-critical" },
  offline: { label: "Offline", cls: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" },
  emergency: { label: "Emergency", cls: "bg-emergency/15 text-emergency border-emergency/40", dot: "bg-emergency" },
  info: { label: "Info", cls: "bg-info/15 text-info border-info/30", dot: "bg-info" },
};

export function StatusBadge({ status, label, pulse, className }: {
  status: Status | "emergency" | "info";
  label?: string;
  pulse?: boolean;
  className?: string;
}) {
  const m = map[status];
  const shouldPulse = pulse ?? (status === "critical" || status === "emergency");
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium", m.cls, className)}>
      <span className={cn("relative inline-block h-1.5 w-1.5 rounded-full", m.dot, shouldPulse && "pulse-dot")} style={{ color: `hsl(var(--${status}))` }} />
      {label ?? m.label}
    </span>
  );
}
