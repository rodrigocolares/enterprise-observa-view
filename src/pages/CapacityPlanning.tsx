import { useAppStore } from "@/store/AppStore";
import { PanelCard } from "@/components/PanelCard";
import { KpiCard } from "@/components/KpiCard";
import { TrendingUp, AlertTriangle, Database } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";

function project(start: number, growthPct: number, days: number) {
  const out = [];
  let v = start;
  for (let i = 0; i <= days; i += Math.max(1, Math.floor(days/30))) {
    out.push({ day: `D+${i}`, value: +v.toFixed(2) });
    v = Math.min(100, v * (1 + growthPct / 100 / 30));
  }
  return out;
}

export default function CapacityPlanning() {
  const { filtered } = useAppStore();
  const avg = (k: "cpu"|"memory"|"disk") => filtered.reduce((s,x) => s + x[k], 0) / filtered.length;
  const cpu = avg("cpu"), memory = avg("memory"), disk = avg("disk");

  const horizons = [30, 60, 90];

  const risky = [...filtered].sort((a,b) => (b.cpu+b.memory+b.disk) - (a.cpu+a.memory+a.disk)).slice(0, 8);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Capacity Planning</h1>
        <p className="text-sm text-muted-foreground">30 / 60 / 90 day forecasts and risk identification</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <KpiCard label="Avg CPU Growth" value="+4.2%/mo" icon={TrendingUp} accent="primary" />
        <KpiCard label="Avg Memory Growth" value="+3.1%/mo" icon={TrendingUp} accent="info" />
        <KpiCard label="Avg Storage Growth" value="+6.8%/mo" icon={Database} accent="warning" />
      </div>

      {horizons.map((h) => (
        <div key={h} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Forecast title={`CPU — ${h} days`} data={project(cpu, 4.2, h)} threshold={85} color="hsl(var(--primary))" />
          <Forecast title={`Memory — ${h} days`} data={project(memory, 3.1, h)} threshold={85} color="hsl(var(--accent))" />
          <Forecast title={`Storage — ${h} days`} data={project(disk, 6.8, h)} threshold={90} color="hsl(var(--warning))" />
        </div>
      ))}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PanelCard title="Workloads at Risk" subtitle="Highest projected saturation">
          <div className="space-y-1.5">
            {risky.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded border border-border px-3 py-2">
                <div>
                  <div className="text-xs font-mono">{s.hostname}</div>
                  <div className="text-[11px] text-muted-foreground">{s.application} · {s.datacenter}</div>
                </div>
                <div className="text-[11px] tabular-nums text-warning">CPU {Math.round(s.cpu)}% · Mem {Math.round(s.memory)}% · Disk {Math.round(s.disk)}%</div>
              </div>
            ))}
          </div>
        </PanelCard>
        <PanelCard title="Recommendations">
          <ul className="text-sm space-y-2">
            <li className="flex gap-2"><AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" /> Scale out Kubernetes Worker pool in SP01 within 30 days to absorb projected CPU growth.</li>
            <li className="flex gap-2"><AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" /> Allocate +2 TB additional storage in SP02 — current trend hits 90% within 60 days.</li>
            <li className="flex gap-2"><AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" /> Migrate workloads off EOL CentOS 7 hosts to reduce operational risk.</li>
            <li className="flex gap-2"><AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" /> Right-size Oracle Database memory — recurring saturation observed in production tier.</li>
          </ul>
        </PanelCard>
      </div>
    </div>
  );
}

function Forecast({ title, data, threshold, color }: any) {
  return (
    <PanelCard title={title}>
      <div className="h-44">
        <ResponsiveContainer>
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`fc-${title}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.6} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={10} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} domain={[0,100]} />
            <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
            <ReferenceLine y={threshold} stroke="hsl(var(--critical))" strokeDasharray="4 4" />
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#fc-${title})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </PanelCard>
  );
}
