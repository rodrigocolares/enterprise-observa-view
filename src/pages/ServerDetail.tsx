import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, HeartPulse } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PanelCard } from "@/components/PanelCard";
import { StatusBadge } from "@/components/StatusBadge";
import { serverRepository } from "@/repository/ServerRepository";
import { auditLog } from "@/services/auditLog";
import { computeHealthScore, osIconFor } from "@/lib/health";
import { tagColorClass } from "@/components/server-form/TagsInput";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/AppStore";

const HEALTH_CLASSES: Record<string, string> = {
  healthy: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  critical: "bg-critical/15 text-critical border-critical/30",
};

export default function ServerDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { lastRefresh, loading } = useAppStore();
  const [ready, setReady] = useState(false);

  useEffect(() => { const t = setTimeout(() => setReady(true), 250); return () => clearTimeout(t); }, [id]);

  const server = useMemo(() => serverRepository.getServer(id), [id, lastRefresh]);
  const history = useMemo(() => auditLog.listForServer(id), [id, lastRefresh]);

  // Build a synthetic 30-point trend around current metrics.
  const trend = useMemo(() => {
    if (!server) return [];
    const seed = (n: number) => Math.sin(n * 0.7 + (server.id.length || 1)) * 6;
    return Array.from({ length: 30 }, (_, i) => ({
      t: i,
      cpu: clamp(server.cpu + seed(i) + (Math.random() - 0.5) * 4),
      memory: clamp(server.memory + seed(i + 3) + (Math.random() - 0.5) * 4),
      disk: clamp(server.disk + (Math.random() - 0.5) * 1.2),
    }));
  }, [server]);

  if (loading || !ready) return <SkeletonView />;

  if (!server) {
    return (
      <div className="space-y-4">
        <BackButton onClick={() => navigate("/inventory")} />
        <PanelCard title="Server not found">
          <p className="text-sm text-muted-foreground">No server with ID <code className="font-mono">{id}</code> exists in the inventory.</p>
        </PanelCard>
      </div>
    );
  }

  const health = computeHealthScore(server);
  const OsIcon = osIconFor(server.os, server.tags);
  const diskUsage = server.diskTotalGB
    ? Math.max(0, Math.min(100, Math.round(((server.diskTotalGB - (server.diskFreeGB ?? 0)) / server.diskTotalGB) * 100)))
    : Math.round(server.disk);

  return (
    <div className="space-y-4 animate-in fade-in-0">
      <BackButton onClick={() => navigate("/inventory")} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-md border border-border bg-background/60 flex items-center justify-center">
            <OsIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight font-mono">{server.hostname}</h1>
            <div className="text-xs text-muted-foreground mt-0.5">
              {server.id} · {server.os} {server.version} · {server.datacenter} · {server.environment}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={server.status} />
          <Badge variant="outline" className={cn("border gap-1", HEALTH_CLASSES[health.level])}>
            <HeartPulse className="h-3 w-3" /> {health.score} · {health.label}
          </Badge>
        </div>
      </div>

      {server.tags?.length ? (
        <div className="flex flex-wrap gap-1.5">
          {server.tags.map((t) => (
            <Badge key={t} variant="outline" className={cn("border", tagColorClass(t))}>{t}</Badge>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricTile label="CPU" value={`${Math.round(server.cpu)}%`} />
        <MetricTile label="Memory" value={`${Math.round(server.memory)}%`} />
        <MetricTile label="Disk" value={`${diskUsage}%`} />
        <MetricTile label="Latency" value={`${server.latency}ms`} />
      </div>

      <Tabs defaultValue="summary" className="space-y-3">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="hardware">Hardware</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="owners">Owners</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="history">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <PanelCard title="Overview">
            <dl className="grid md:grid-cols-3 gap-x-4 gap-y-3 text-sm">
              <Def label="FQDN" value={server.fqdn} mono />
              <Def label="Alias" value={server.alias} />
              <Def label="Application" value={server.application} />
              <Def label="Criticality" value={server.criticality} />
              <Def label="Availability" value={`${server.availability.toFixed(3)}%`} />
              <Def label="Uptime" value={`${server.uptimeDays} days`} />
            </dl>
          </PanelCard>
        </TabsContent>

        <TabsContent value="hardware">
          <PanelCard title="Hardware">
            <dl className="grid md:grid-cols-3 gap-x-4 gap-y-3 text-sm">
              <Def label="CPUs" value={server.cpuCount?.toString()} />
              <Def label="Cores" value={server.cores?.toString()} />
              <Def label="RAM" value={server.ramGB ? `${server.ramGB} GB` : undefined} />
              <Def label="Disk Total" value={server.diskTotalGB ? `${server.diskTotalGB} GB` : undefined} />
              <Def label="Disk Free" value={server.diskFreeGB != null ? `${server.diskFreeGB} GB` : undefined} />
              <Def label="Disk Usage" value={`${diskUsage}%`} />
            </dl>
          </PanelCard>
        </TabsContent>

        <TabsContent value="network">
          <PanelCard title="Network">
            <dl className="grid md:grid-cols-3 gap-x-4 gap-y-3 text-sm">
              <Def label="IPv4" value={server.ipAddress} mono />
              <Def label="IPv6" value={server.ipv6} mono />
              <Def label="Gateway" value={server.gateway} mono />
              <Def label="VLAN" value={server.vlan} />
              <Def label="DNS Primary" value={server.dnsPrimary} mono />
              <Def label="DNS Secondary" value={server.dnsSecondary} mono />
              <Def label="MAC" value={server.macAddress} mono />
            </dl>
          </PanelCard>
        </TabsContent>

        <TabsContent value="owners">
          <PanelCard title="Responsible Parties">
            <dl className="grid md:grid-cols-3 gap-x-4 gap-y-3 text-sm">
              <Def label="Owner" value={server.owner} />
              <Def label="Squad" value={server.squad} />
              <Def label="Team" value={server.team} />
              <Def label="Manager" value={server.manager} />
              <Def label="Cost Center" value={server.costCenter} />
            </dl>
            {server.notes && (
              <div className="mt-4 pt-3 border-t border-border">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Notes</div>
                <pre className="whitespace-pre-wrap text-xs text-foreground/90 font-sans">{server.notes}</pre>
              </div>
            )}
          </PanelCard>
        </TabsContent>

        <TabsContent value="charts" className="grid md:grid-cols-3 gap-3">
          <ChartTile title="CPU" data={trend} dataKey="cpu" color="hsl(var(--info))" />
          <ChartTile title="Memory" data={trend} dataKey="memory" color="hsl(var(--warning))" />
          <ChartTile title="Disk" data={trend} dataKey="disk" color="hsl(var(--success))" />
        </TabsContent>

        <TabsContent value="history">
          <PanelCard title="Audit Timeline" padded={false}>
            {history.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">No history yet.</div>
            ) : (
              <ul className="divide-y divide-border">
                {history.map((h) => (
                  <li key={h.id} className="p-3 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="capitalize">{h.action}</Badge>
                      <span className="font-mono text-xs">{h.hostname}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      by {h.user} · {new Date(h.timestamp).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </PanelCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function clamp(n: number) { return Math.max(1, Math.min(99, n)); }

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="gap-1.5 -ml-2">
      <ArrowLeft className="h-4 w-4" /> Back to Inventory
    </Button>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-gradient-card p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold tabular-nums mt-1">{value}</div>
    </div>
  );
}

function Def({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className={cn("text-sm mt-0.5", mono && "font-mono")}>{value || <span className="text-muted-foreground">—</span>}</dd>
    </div>
  );
}

function ChartTile({ title, data, dataKey, color }: { title: string; data: Array<Record<string, number>>; dataKey: string; color: string }) {
  return (
    <PanelCard title={title}>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`g-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="t" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
            <Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#g-${dataKey})`} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </PanelCard>
  );
}

function SkeletonView() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-14 w-72" />
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
      </div>
      <Skeleton className="h-48" />
    </div>
  );
}
