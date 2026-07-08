import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ServerFormValues } from "@/schemas/serverSchema";
import { computeHealthScore, osEmoji } from "@/lib/health";
import { Badge } from "@/components/ui/badge";
import { tagColorClass } from "./TagsInput";
import { cn } from "@/lib/utils";

const HEALTH_CLASSES: Record<string, string> = {
  healthy: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  critical: "bg-critical/15 text-critical border-critical/30",
};

export function SummaryDialog({
  open, values, onCancel, onConfirm, submitting,
}: {
  open: boolean;
  values: ServerFormValues | null;
  onCancel: () => void;
  onConfirm: () => void;
  submitting: boolean;
}) {
  const health = values ? computeHealthScore({ cpu: values.cpu, memory: values.memory, disk: values.disk, status: values.status, latency: 0 }) : null;

  return (
    <AlertDialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <AlertDialogContent className="max-w-lg bg-gradient-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base flex items-center gap-2">
            <span className="text-lg leading-none">{values ? osEmoji(values.os, values.tags) : "🖥"}</span>
            Confirm Server Registration
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs">
            Review the details below before adding this host to the inventory.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {values && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border border-border rounded-md p-3 bg-background/40">
            <Row label="Hostname" value={values.hostname} mono />
            <Row label="OS" value={`${values.os} · ${values.version}`} />
            <Row label="Datacenter" value={values.datacenter} />
            <Row label="Environment" value={values.environment} />
            <Row label="Application" value={values.application} />
            <Row label="Criticality" value={values.criticality} />
            <Row label="Owner" value={values.owner || "—"} />
            <Row label="IP" value={values.ipAddress || "—"} mono />
            {health && (
              <div className="col-span-2 flex items-center justify-between pt-2 mt-1 border-t border-border">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Health Score</span>
                <Badge variant="outline" className={cn("border", HEALTH_CLASSES[health.level])}>
                  {health.score} · {health.label}
                </Badge>
              </div>
            )}
            {values.tags?.length ? (
              <div className="col-span-2 flex flex-wrap gap-1.5">
                {values.tags.map((t) => (
                  <Badge key={t} variant="outline" className={cn("border", tagColorClass(t))}>{t}</Badge>
                ))}
              </div>
            ) : null}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={submitting} onClick={(e) => { e.preventDefault(); onConfirm(); }}>
            {submitting ? "Saving…" : "Confirm Registration"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={cn("text-xs", mono && "font-mono")}>{value}</span>
    </div>
  );
}
