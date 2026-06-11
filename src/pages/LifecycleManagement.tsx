import { useAppStore } from "@/store/AppStore";
import { PanelCard } from "@/components/PanelCard";
import { KpiCard } from "@/components/KpiCard";
import { AlertTriangle, History, ShieldCheck } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMemo } from "react";

const META: Record<string, { support: "Supported" | "Extended Support" | "End Of Life"; risk: "Low" | "Medium" | "High" | "Critical" }> = {
  "Windows Server 2003": { support: "End Of Life", risk: "Critical" },
  "Windows Server 2016": { support: "Extended Support", risk: "Medium" },
  "Windows Server 2022": { support: "Supported", risk: "Low" },
  "Windows Server 2025": { support: "Supported", risk: "Low" },
  "CentOS 7": { support: "End Of Life", risk: "Critical" },
  "CentOS 8": { support: "End Of Life", risk: "High" },
  "CentOS Stream": { support: "Supported", risk: "Low" },
};

const supColor: any = { "Supported": "hsl(var(--success))", "Extended Support": "hsl(var(--warning))", "End Of Life": "hsl(var(--critical))" };
const riskColor: any = { Low: "text-success", Medium: "text-info", High: "text-warning", Critical: "text-critical" };

export default function LifecycleManagement() {
  const { filtered } = useAppStore();

  const groups = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((s) => map.set(s.version, (map.get(s.version) || 0) + 1));
    return Array.from(map.entries()).map(([version, count]) => {
      const m = META[version] || { support: "Supported", risk: "Low" };
      return { version, count, pct: (count / filtered.length) * 100, ...m };
    }).sort((a, b) => b.count - a.count);
  }, [filtered]);

  const eolTotal = groups.filter((g) => g.support === "End Of Life").reduce((s, g) => s + g.count, 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Lifecycle Management</h1>
        <p className="text-sm text-muted-foreground">Operating system obsolescence and support posture</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Hosts" value={filtered.length} icon={History} accent="primary" />
        <KpiCard label="EOL Hosts" value={eolTotal} icon={AlertTriangle} accent="critical" sub={`${((eolTotal/filtered.length)*100).toFixed(1)}%`} />
        <KpiCard label="Supported" value={groups.filter((g) => g.support === "Supported").reduce((s,g)=>s+g.count,0)} icon={ShieldCheck} accent="success" />
        <KpiCard label="Extended" value={groups.filter((g) => g.support === "Extended Support").reduce((s,g)=>s+g.count,0)} icon={History} accent="warning" />
      </div>

      <PanelCard title="OS Distribution" subtitle="Quantity & support status per version">
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={groups}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="version" stroke="hsl(var(--muted-foreground))" fontSize={11} interval={0} angle={-12} textAnchor="end" height={70} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="count" radius={[4,4,0,0]}>
                {groups.map((g, i) => <Cell key={i} fill={supColor[g.support]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </PanelCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {groups.map((g) => (
          <div key={g.version} className="rounded-lg border border-border bg-gradient-card p-4 space-y-2 relative overflow-hidden">
            {g.support === "End Of Life" && <div className="absolute inset-x-0 top-0 h-1 bg-critical pulse-critical" />}
            <div className="flex items-start justify-between">
              <div className="font-semibold">{g.version}</div>
              <span className="text-[10px] px-2 py-0.5 rounded border" style={{ borderColor: supColor[g.support], color: supColor[g.support] }}>{g.support}</span>
            </div>
            <div className="text-3xl font-bold tabular-nums">{g.count}</div>
            <div className="text-xs text-muted-foreground">{g.pct.toFixed(1)}% of fleet</div>
            <div className="text-xs">Operational Risk: <span className={`font-semibold ${riskColor[g.risk]}`}>{g.risk}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}
