import { useAppStore } from "@/store/AppStore";
import { PanelCard } from "@/components/PanelCard";
import { StatusBadge } from "@/components/StatusBadge";
import { KpiCard } from "@/components/KpiCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertOctagon, AlertTriangle, BellRing, Flame, Info, ShieldAlert } from "lucide-react";
import { useMemo } from "react";

type Sev = "Critical" | "Warning" | "Info" | "Emergency";

function classify(s: any): { sev: Sev; category: string; reason: string } | null {
  if (s.status === "offline") return { sev: "Emergency", category: "Availability", reason: "Host without communication > 15 min" };
  if (s.cpu > 95) return { sev: "Emergency", category: "CPU", reason: "CPU > 95% for 10 minutes" };
  if (s.cpu > 90) return { sev: "Critical", category: "CPU", reason: "CPU > 90% for 5 minutes" };
  if (s.cpu > 75) return { sev: "Warning", category: "CPU", reason: "CPU > 75% for 5 minutes" };
  if (s.memory > 95) return { sev: "Emergency", category: "Memory", reason: "Memory > 95%" };
  if (s.memory > 90) return { sev: "Critical", category: "Memory", reason: "Memory > 90%" };
  if (s.memory > 80) return { sev: "Warning", category: "Memory", reason: "Memory > 80%" };
  if (s.disk > 95) return { sev: "Emergency", category: "Disk", reason: "Disk > 95%" };
  if (s.disk > 90) return { sev: "Critical", category: "Disk", reason: "Disk > 90%" };
  if (s.disk > 80) return { sev: "Warning", category: "Disk", reason: "Disk > 80%" };
  if (s.latency > 500) return { sev: "Emergency", category: "Latency", reason: "Latency > 500ms" };
  if (s.latency > 200) return { sev: "Critical", category: "Latency", reason: "Latency > 200ms" };
  if (s.latency > 100) return { sev: "Warning", category: "Latency", reason: "Latency > 100ms" };
  if (s.alerts > 0) return { sev: "Info", category: "Service", reason: "Service degraded signals detected" };
  return null;
}

const runbookFor = (cat: string, host: string) => ({
  rootCause: {
    CPU: "Sustained workload spike or runaway process consuming CPU resources.",
    Memory: "Memory leak in application, insufficient heap/cache sizing, or zombie processes.",
    Disk: "Log/data growth without rotation; possible backup retention misconfiguration.",
    Latency: "Network congestion, DNS, or upstream dependency degradation.",
    Availability: "Host network isolation, agent crash or hardware failure.",
    Service: "Service-level error rate or saturation increased above baseline.",
  }[cat] || "Unknown root cause.",
  businessImpact: "Potential SLA breach for dependent applications; user-facing latency increase likely.",
  validation: [
    `Verify telemetry from agent on ${host}`,
    "Cross-check with synthetic monitors and SLOs",
    "Review last deployment / change record",
    "Inspect top processes and recent log entries",
  ],
  resolution: [
    "Apply automated remediation playbook (PB-" + Math.floor(Math.random() * 9000 + 1000) + ")",
    "Failover to standby node if available",
    "Open change ticket if persistent",
    "Notify application owner and on-call SRE",
  ],
  eta: cat === "Availability" ? "15-30 minutes" : "10-20 minutes",
});

export default function AlertCenter() {
  const { filtered } = useAppStore();
  const alerts = useMemo(() => filtered.map((s) => {
    const c = classify(s); if (!c) return null;
    return {
      id: `ALT-${s.id.slice(-4)}-${c.category.slice(0,2).toUpperCase()}`,
      host: s.hostname, sev: c.sev, category: c.category, reason: c.reason,
      timestamp: new Date(Date.now() - Math.random()*3600000).toLocaleTimeString(),
      status: ["Open","Acknowledged","Investigating"][Math.floor(Math.random()*3)],
      action: "Run automated playbook · escalate to on-call",
      server: s,
    };
  }).filter(Boolean) as any[], [filtered]);

  const by = (sev: Sev) => alerts.filter((a) => a.sev === sev);
  const sevs: { key: Sev; icon: any; accent: any }[] = [
    { key: "Emergency", icon: Flame, accent: "emergency" },
    { key: "Critical", icon: ShieldAlert, accent: "critical" },
    { key: "Warning", icon: AlertTriangle, accent: "warning" },
    { key: "Info", icon: Info, accent: "info" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Alert Center</h1>
        <p className="text-sm text-muted-foreground">Trigger engine · {alerts.length} active alerts</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {sevs.map((s) => (
          <KpiCard key={s.key} label={s.key} value={by(s.key).length} icon={s.icon} accent={s.accent} />
        ))}
      </div>

      <Tabs defaultValue="All">
        <TabsList>
          <TabsTrigger value="All">All ({alerts.length})</TabsTrigger>
          {sevs.map((s) => <TabsTrigger key={s.key} value={s.key}>{s.key} ({by(s.key).length})</TabsTrigger>)}
        </TabsList>
        <TabsContent value="All"><AlertList items={alerts} /></TabsContent>
        {sevs.map((s) => <TabsContent key={s.key} value={s.key}><AlertList items={by(s.key)} /></TabsContent>)}
      </Tabs>

      <PanelCard title="Configured Triggers" subtitle="CPU · Memory · Disk · Latency · Services · Certificates · Backup">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {[
            ["CPU", ["Warning: > 75% / 5m", "Critical: > 90% / 5m", "Emergency: > 95% / 10m"]],
            ["Memory", ["Warning: > 80%", "Critical: > 90%", "Emergency: > 95%"]],
            ["Disk", ["Warning: > 80%", "Critical: > 90%", "Emergency: > 95%"]],
            ["Latency", ["Warning: > 100ms", "Critical: > 200ms", "Emergency: > 500ms"]],
            ["Availability", ["Critical: no comm 5m", "Emergency: no comm 15m"]],
            ["Certificates", ["Warning: 30d", "Critical: 15d", "Emergency: 7d"]],
            ["Backup", ["Warning: 24h", "Critical: 48h", "Emergency: 72h"]],
            ["Windows Services", ["AD, DNS, DHCP, IIS, MSSQL, Print Spooler, Backup Agent"]],
            ["Linux Services", ["Apache, Nginx, Docker, Kubernetes, SSH, MySQL, PostgreSQL, Backup Agent"]],
          ].map(([title, rules]: any) => (
            <div key={title} className="rounded border border-border p-3 bg-secondary/30">
              <div className="font-semibold mb-2 flex items-center gap-1.5"><BellRing className="h-3.5 w-3.5 text-primary" />{title}</div>
              <ul className="space-y-1 text-muted-foreground">{rules.map((r: string) => <li key={r}>• {r}</li>)}</ul>
            </div>
          ))}
        </div>
      </PanelCard>
    </div>
  );
}

function AlertList({ items }: { items: any[] }) {
  return (
    <div className="space-y-1.5 mt-2">
      {items.slice(0, 80).map((a) => (
        <Dialog key={a.id}>
          <div className="flex flex-col md:flex-row md:items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 hover:bg-secondary/40 transition">
            <div className="flex items-center gap-2 min-w-[200px]">
              <StatusBadge status={a.sev.toLowerCase() as any} />
              <span className="font-mono text-xs">{a.id}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{a.host} · {a.category}</div>
              <div className="text-[11px] text-muted-foreground truncate">{a.reason}</div>
            </div>
            <div className="text-[11px] text-muted-foreground">{a.timestamp}</div>
            <div className="text-[11px] px-2 py-0.5 rounded border border-border">{a.status}</div>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">Runbook</Button>
            </DialogTrigger>
          </div>
          <RunbookDialog alert={a} />
        </Dialog>
      ))}
      {!items.length && <div className="text-sm text-muted-foreground p-4">No alerts.</div>}
    </div>
  );
}

function RunbookDialog({ alert }: { alert: any }) {
  const rb = runbookFor(alert.category, alert.host);
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2"><AlertOctagon className="h-5 w-5 text-primary" /> Runbook · {alert.id}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 text-sm">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={alert.sev.toLowerCase() as any} />
          <span className="px-2 py-0.5 rounded border border-border text-xs">{alert.category}</span>
          <span className="text-xs text-muted-foreground">Host: <span className="font-mono">{alert.host}</span></span>
        </div>
        <Section title="Root Cause">{rb.rootCause}</Section>
        <Section title="Business Impact">{rb.businessImpact}</Section>
        <Section title="Validation Steps"><ul className="list-disc pl-5 space-y-0.5">{rb.validation.map((v) => <li key={v}>{v}</li>)}</ul></Section>
        <Section title="Resolution Steps"><ol className="list-decimal pl-5 space-y-0.5">{rb.resolution.map((v) => <li key={v}>{v}</li>)}</ol></Section>
        <Section title="Estimated Resolution Time">{rb.eta}</Section>
      </div>
    </DialogContent>
  );
}
function Section({ title, children }: any) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">{title}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}
