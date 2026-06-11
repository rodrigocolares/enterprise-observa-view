import { useAppStore } from "@/store/AppStore";
import { PanelCard } from "@/components/PanelCard";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Activity, Cpu, HardDrive, MemoryStick, Network, ServerCog, Signal, WifiOff } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart } from "recharts";
import { useMemo } from "react";

export default function DatadogObservability() {
  const { filtered, series } = useAppStore();

  const top = (k: "cpu" | "memory" | "disk") => [...filtered].sort((a,b) => b[k]-a[k]).slice(0, 20);
  const top20Cpu = top("cpu");
  const top20Mem = top("memory");
  const top20Disk = top("disk");
  const criticalHosts = filtered.filter((s) => s.status === "critical").slice(0, 12);
  const offlineHosts = filtered.filter((s) => s.status === "offline").slice(0, 12);
  const avgLatency = filtered.reduce((s,x) => s + x.latency, 0) / Math.max(1, filtered.length);
  const eventsPerMin = filtered.reduce((s,x) => s + x.alerts, 0);
  const services = new Set(filtered.map((s) => s.application)).size;

  // Heatmap: app x DC -> avg cpu
  const heatmap = useMemo(() => {
    const apps = Array.from(new Set(filtered.map((s) => s.application)));
    const dcs = ["SP01","SP02","DR01"] as const;
    return apps.map((app) => ({
      app,
      cells: dcs.map((dc) => {
        const arr = filtered.filter((s) => s.application === app && s.datacenter === dc);
        const v = arr.length ? arr.reduce((s,x) => s + x.cpu, 0) / arr.length : 0;
        return { dc, v, n: arr.length };
      }),
    }));
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Datadog Observability</h1>
        <p className="text-sm text-muted-foreground">Infrastructure overview, hosts and service performance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Average Latency" value={`${avgLatency.toFixed(0)}ms`} icon={Signal} accent={avgLatency > 200 ? "critical" : avgLatency > 100 ? "warning" : "success"} />
        <KpiCard label="Events / min" value={eventsPerMin} icon={Activity} accent="primary" />
        <KpiCard label="Services Monitored" value={services} icon={ServerCog} accent="info" />
        <KpiCard label="Hosts w/o Comm." value={offlineHosts.length} icon={WifiOff} accent="critical" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TopList title="Top 20 CPU" data={top20Cpu} k="cpu" icon={Cpu} />
        <TopList title="Top 20 Memory" data={top20Mem} k="memory" icon={MemoryStick} />
        <TopList title="Top 20 Disk" data={top20Disk} k="disk" icon={HardDrive} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PanelCard title="Average Latency" subtitle="Real-time aggregated">
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={series.map((p) => ({ time: new Date(p.t).toLocaleTimeString([], { hour12: false }), v: 40 + (p.cpu - 50) * 2 + 30 }))}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Line type="monotone" dataKey="v" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </PanelCard>

        <PanelCard title="Hosts with Critical Alerts">
          <div className="space-y-1.5 max-h-56 overflow-auto pr-1">
            {criticalHosts.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded border border-border bg-secondary/40 px-2 py-1.5">
                <div className="font-mono text-xs truncate">{s.hostname}</div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>CPU {Math.round(s.cpu)}%</span>
                  <span>Mem {Math.round(s.memory)}%</span>
                  <StatusBadge status={s.status} />
                </div>
              </div>
            ))}
            {!criticalHosts.length && <div className="text-xs text-muted-foreground p-2">No critical hosts.</div>}
          </div>
        </PanelCard>
      </div>

      <PanelCard title="Application × Datacenter — CPU Heatmap" subtitle="Average CPU utilization">
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="text-left py-1 pr-2">Application</th>
                {["SP01","SP02","DR01"].map((d) => <th key={d} className="px-2 py-1">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {heatmap.map((row) => (
                <tr key={row.app} className="border-t border-border">
                  <td className="py-1 pr-2 whitespace-nowrap">{row.app}</td>
                  {row.cells.map((c) => {
                    const intensity = Math.min(1, c.v / 100);
                    const hue = 140 - intensity * 140; // green -> red
                    return (
                      <td key={c.dc} className="px-1 py-1">
                        <div className="h-7 rounded-sm grid place-items-center tabular-nums text-[11px]"
                             style={{ background: `hsl(${hue} 80% ${30 + intensity*15}%)`, color: "white" }}>
                          {c.n ? `${Math.round(c.v)}%` : "—"}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </div>
  );
}

function TopList({ title, data, k, icon: Icon }: any) {
  return (
    <PanelCard title={<span className="flex items-center gap-2"><Icon className="h-4 w-4 text-primary" />{title}</span>}>
      <div className="h-64">
        <ResponsiveContainer>
          <BarChart data={data.map((s: any) => ({ name: s.hostname.slice(-10), v: Math.round(s[k]) }))} layout="vertical" margin={{ left: 0 }}>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0,100]} stroke="hsl(var(--muted-foreground))" fontSize={9} />
            <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={9} width={80} />
            <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
            <Bar dataKey="v" fill="hsl(var(--primary))" radius={[0,3,3,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </PanelCard>
  );
}
