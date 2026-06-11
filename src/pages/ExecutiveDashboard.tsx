import { useAppStore } from "@/store/AppStore";
import { KpiCard } from "@/components/KpiCard";
import { PanelCard } from "@/components/PanelCard";
import {
  Activity, AlertTriangle, CheckCircle2, Cpu, HardDrive, MemoryStick,
  Network, Server as ServerIcon, ShieldAlert, Signal, Wifi, WifiOff,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie,
} from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--critical))"];

function band(score: number) {
  if (score >= 90) return { label: "Healthy", color: "hsl(var(--success))" };
  if (score >= 70) return { label: "Attention", color: "hsl(var(--warning))" };
  if (score >= 50) return { label: "Risk", color: "hsl(var(--critical))" };
  return { label: "Critical", color: "hsl(var(--emergency))" };
}

export default function ExecutiveDashboard() {
  const { aggregates: a, series, filtered } = useAppStore();
  const b = band(a.healthScore);

  const envData = (["Production","Homologation","Development"] as const).map((k) => ({
    name: k, availability: +(a.byEnv[k].availability / Math.max(1, a.byEnv[k].total)).toFixed(2),
  }));
  const dcData = (["SP01","SP02","DR01"] as const).map((k) => ({
    name: k, online: a.byDC[k].online, warning: a.byDC[k].warning, critical: a.byDC[k].critical, offline: a.byDC[k].offline,
  }));
  const statusPie = [
    { name: "Online", value: a.online, color: "hsl(var(--success))" },
    { name: "Warning", value: a.warning, color: "hsl(var(--warning))" },
    { name: "Critical", value: a.critical, color: "hsl(var(--critical))" },
    { name: "Offline", value: a.offline, color: "hsl(var(--muted-foreground))" },
  ];
  const compliance = Math.max(0, 100 - (filtered.filter((s) => ["Windows Server 2003","CentOS 7","CentOS 8"].includes(s.version)).length / filtered.length) * 120);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Executive Dashboard</h1>
        <p className="text-sm text-muted-foreground">Real-time observability across 1,100 monitored hosts · SP01 / SP02 / DR01</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
        <KpiCard label="Total Hosts" value={a.total.toLocaleString()} icon={ServerIcon} accent="primary" />
        <KpiCard label="Windows" value={a.windows} icon={ServerIcon} accent="info" sub={`${((a.windows/a.total)*100).toFixed(0)}%`} />
        <KpiCard label="Linux" value={a.linux} icon={ServerIcon} accent="success" sub={`${((a.linux/a.total)*100).toFixed(0)}%`} />
        <KpiCard label="Production" value={a.prod} accent="primary" />
        <KpiCard label="Homologation" value={a.hom} accent="muted" />
        <KpiCard label="Development" value={a.dev} accent="muted" />
        <KpiCard label="Online" value={a.online} icon={Wifi} accent="success" />
        <KpiCard label="Warning" value={a.warning} icon={AlertTriangle} accent="warning" />
        <KpiCard label="Critical" value={a.critical} icon={ShieldAlert} accent="critical" />
        <KpiCard label="Offline" value={a.offline} icon={WifiOff} accent="muted" />
        <KpiCard label="Current SLA" value={`${a.sla.toFixed(3)}%`} icon={Signal} accent="success" />
        <KpiCard label="Overall Availability" value={`${a.availability.toFixed(3)}%`} icon={Activity} accent="primary" />
        <KpiCard label="Open Incidents" value={a.openIncidents} icon={AlertTriangle} accent="warning" />
        <KpiCard label="Critical Incidents" value={a.criticalIncidents} icon={ShieldAlert} accent="critical" />
        <KpiCard label="Environment Health" value={`${a.envHealth.toFixed(1)}%`} icon={CheckCircle2} accent="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PanelCard title="Data Center Health Score" subtitle="Composite weighted score" className="lg:col-span-1">
          <div className="h-56 relative">
            <ResponsiveContainer>
              <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: "score", value: a.healthScore, fill: b.color }]} startAngle={210} endAngle={-30}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "hsl(var(--secondary))" }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="text-center">
                <div className="text-4xl font-bold tabular-nums" style={{ color: b.color }}>{a.healthScore}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{b.label}</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1 text-[10px] text-center">
            {[{ l: "0-49", c: "hsl(var(--emergency))" },{ l: "50-69", c: "hsl(var(--critical))" },{ l: "70-89", c: "hsl(var(--warning))" },{ l: "90-100", c: "hsl(var(--success))" }].map((x) => (
              <div key={x.l} className="rounded px-1 py-0.5 border border-border" style={{ color: x.c }}>{x.l}</div>
            ))}
          </div>
        </PanelCard>

        <PanelCard title="Data Center Health" subtitle="Status distribution per DC" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={dcData}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="online" stackId="a" fill="hsl(var(--success))" />
                <Bar dataKey="warning" stackId="a" fill="hsl(var(--warning))" />
                <Bar dataKey="critical" stackId="a" fill="hsl(var(--critical))" />
                <Bar dataKey="offline" stackId="a" fill="hsl(var(--muted-foreground))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PanelCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PanelCard title="Resource Consumption" subtitle="CPU · Memory · Disk averages">
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={series.map((p) => ({ ...p, time: new Date(p.t).toLocaleTimeString([], { hour12: false }) }))}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} /><stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.5} /><stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} /></linearGradient>
                  <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity={0.4} /><stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} domain={[0,100]} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Area type="monotone" dataKey="cpu" stroke="hsl(var(--primary))" fill="url(#g1)" name="CPU %" />
                <Area type="monotone" dataKey="memory" stroke="hsl(var(--accent))" fill="url(#g2)" name="Memory %" />
                <Area type="monotone" dataKey="disk" stroke="hsl(var(--warning))" fill="url(#g3)" name="Disk %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </PanelCard>

        <PanelCard title="Incident Evolution" subtitle="Open incidents over time">
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={series.map((p) => ({ ...p, time: new Date(p.t).toLocaleTimeString([], { hour12: false }) }))}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Line type="monotone" dataKey="incidents" stroke="hsl(var(--critical))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </PanelCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PanelCard title="Availability by Environment">
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={envData} layout="vertical">
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[95, 100]} stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={100} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="availability" radius={[0,4,4,0]}>
                  {envData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PanelCard>
        <PanelCard title="Status Distribution">
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusPie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {statusPie.map((s, i) => <Cell key={i} fill={s.color} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </PanelCard>
        <PanelCard title="Compliance Score" subtitle="Based on EOL exposure & policy">
          <div className="h-56 grid place-items-center">
            <div className="text-center">
              <div className="text-5xl font-bold tabular-nums gradient-text">{compliance.toFixed(0)}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">of 100</div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-[10px]">
                <div className="rounded border border-success/40 text-success px-2 py-1">Patching</div>
                <div className="rounded border border-warning/40 text-warning px-2 py-1">EOL Risk</div>
                <div className="rounded border border-info/40 text-info px-2 py-1">Backup</div>
              </div>
            </div>
          </div>
        </PanelCard>
      </div>
    </div>
  );
}
