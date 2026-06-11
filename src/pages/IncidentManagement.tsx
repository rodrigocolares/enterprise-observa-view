import { useAppStore } from "@/store/AppStore";
import { PanelCard } from "@/components/PanelCard";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertOctagon, CheckCircle2, Clock, Users } from "lucide-react";
import { useMemo, useState } from "react";

const STATUSES = ["New","Investigating","In Progress","Escalated","Resolved"] as const;
const SEVS = ["Critical","High","Medium","Low"] as const;
const ASSIGNEES = ["L. Pereira","M. Tanaka","R. Costa","S. Wang","J. Almeida","A. Souza","NOC Tier 1","NOC Tier 2"];

function genIncidents(servers: any[]) {
  const out: any[] = [];
  servers.forEach((s, i) => {
    for (let k = 0; k < s.incidents; k++) {
      const sev = s.status === "critical" || s.status === "offline" ? SEVS[Math.floor(Math.random()*2)] : SEVS[1 + Math.floor(Math.random()*3)];
      const status = s.status === "offline" ? "Escalated" : STATUSES[Math.floor(Math.random()*4)];
      out.push({
        id: `INC${(100000 + i*7 + k).toString().padStart(7,"0")}`,
        server: s.hostname, app: s.application, severity: sev, status,
        assigned: ASSIGNEES[(i+k) % ASSIGNEES.length],
        openTime: new Date(Date.now() - Math.random() * 86400000).toLocaleString(),
        impact: sev === "Critical" ? "Service-wide outage risk" : "Localized degradation",
        cause: ["High CPU saturation","Memory exhaustion","Disk full","Service flapping","Network latency"][Math.floor(Math.random()*5)],
        plan: "Apply remediation playbook, scale resources, restart service, validate SLOs.",
      });
    }
  });
  return out;
}

export default function IncidentManagement() {
  const { filtered } = useAppStore();
  const incidents = useMemo(() => genIncidents(filtered), [filtered]);
  const [fStatus, setFStatus] = useState("all");
  const [fSev, setFSev] = useState("all");
  const [fApp, setFApp] = useState("all");

  const apps = useMemo(() => Array.from(new Set(incidents.map((i) => i.app))).sort(), [incidents]);
  const rows = incidents.filter((i) =>
    (fStatus === "all" || i.status === fStatus) &&
    (fSev === "all" || i.severity === fSev) &&
    (fApp === "all" || i.app === fApp)
  ).slice(0, 200);

  const c = (st: string) => incidents.filter((i) => i.status === st).length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Incident Management</h1>
        <p className="text-sm text-muted-foreground">ServiceNow-style ticketing · {incidents.length} active incidents</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard label="New" value={c("New")} icon={AlertOctagon} accent="warning" />
        <KpiCard label="Investigating" value={c("Investigating")} icon={Clock} accent="info" />
        <KpiCard label="In Progress" value={c("In Progress")} icon={Users} accent="primary" />
        <KpiCard label="Escalated" value={c("Escalated")} icon={AlertOctagon} accent="critical" />
        <KpiCard label="Resolved" value={c("Resolved")} icon={CheckCircle2} accent="success" />
      </div>

      <PanelCard title="Filters">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Select value={fStatus} onValueChange={setFStatus}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Status</SelectItem>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={fSev} onValueChange={setFSev}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Severity" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Severity</SelectItem>{SEVS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={fApp} onValueChange={setFApp}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Application" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Applications</SelectItem>{apps.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </PanelCard>

      <PanelCard padded={false} className="hidden md:block">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                {["Incident ID","Server","App","Severity","Status","Assignee","Open","Impact","Probable Cause","Plan"].map((h) => (
                  <TableHead key={h} className="text-[11px] uppercase tracking-wider">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((i) => (
                <TableRow key={i.id} className="border-border">
                  <TableCell className="font-mono text-xs">{i.id}</TableCell>
                  <TableCell className="font-mono text-xs">{i.server}</TableCell>
                  <TableCell>{i.app}</TableCell>
                  <TableCell><SevBadge sev={i.severity} /></TableCell>
                  <TableCell><span className="text-xs">{i.status}</span></TableCell>
                  <TableCell className="text-xs">{i.assigned}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{i.openTime}</TableCell>
                  <TableCell className="text-xs">{i.impact}</TableCell>
                  <TableCell className="text-xs">{i.cause}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[280px] truncate">{i.plan}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </PanelCard>

      <div className="md:hidden space-y-2">
        {rows.map((i) => (
          <div key={i.id} className="rounded-lg border border-border bg-card p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs">{i.id}</span>
              <SevBadge sev={i.severity} />
            </div>
            <div className="text-sm">{i.server}</div>
            <div className="text-[11px] text-muted-foreground">{i.app} · {i.status} · {i.assigned}</div>
            <div className="text-[11px]">{i.cause}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SevBadge({ sev }: { sev: string }) {
  const map: any = { Critical: "critical", High: "warning", Medium: "info", Low: "online" };
  return <StatusBadge status={map[sev]} label={sev} />;
}
