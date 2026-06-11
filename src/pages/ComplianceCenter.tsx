import { useAppStore } from "@/store/AppStore";
import { PanelCard } from "@/components/PanelCard";
import { KpiCard } from "@/components/KpiCard";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CheckCircle2, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";

export default function ComplianceCenter() {
  const { filtered } = useAppStore();
  const eol = filtered.filter((s) => ["Windows Server 2003","CentOS 7","CentOS 8"].includes(s.version));
  const missingPatches = Math.floor(filtered.length * 0.18);
  const missingAntivirus = Math.floor(filtered.length * 0.06);
  const missingMonitoring = Math.floor(filtered.length * 0.03);
  const missingBackup = Math.floor(filtered.length * 0.08);

  const score = Math.max(0, Math.round(100
    - (eol.length / filtered.length) * 80
    - (missingPatches / filtered.length) * 40
    - (missingAntivirus / filtered.length) * 30
    - (missingMonitoring / filtered.length) * 20
    - (missingBackup / filtered.length) * 25));

  const band = score >= 80 ? { label: "Green", color: "hsl(var(--success))" } : score >= 60 ? { label: "Yellow", color: "hsl(var(--warning))" } : { label: "Red", color: "hsl(var(--critical))" };

  const breakdown = [
    { name: "EOL Servers", v: eol.length, color: "hsl(var(--critical))" },
    { name: "Missing Patches", v: missingPatches, color: "hsl(var(--warning))" },
    { name: "Missing Antivirus", v: missingAntivirus, color: "hsl(var(--emergency))" },
    { name: "Missing Monitoring", v: missingMonitoring, color: "hsl(var(--info))" },
    { name: "Missing Backup", v: missingBackup, color: "hsl(var(--accent))" },
  ];

  const nonCompliances = filtered.slice(0, 30).map((s, i) => ({
    host: s.hostname,
    finding: ["Missing OS patch KB-7891","Antivirus signatures > 14d","Backup last success > 48h","No monitoring agent reporting","EOL operating system"][i % 5],
    severity: i % 3 === 0 ? "Critical" : i % 3 === 1 ? "High" : "Medium",
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Compliance Center</h1>
        <p className="text-sm text-muted-foreground">Policy compliance & configuration drift</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PanelCard title="Compliance Score">
          <div className="grid place-items-center py-4">
            <div className="text-6xl font-bold tabular-nums" style={{ color: band.color }}>{score}</div>
            <div className="text-xs uppercase tracking-widest mt-1" style={{ color: band.color }}>{band.label} Zone</div>
            <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div className="h-full" style={{ width: `${score}%`, background: band.color }} />
            </div>
          </div>
        </PanelCard>
        <PanelCard title="Breakdown" className="lg:col-span-2">
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={breakdown}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="v" radius={[4,4,0,0]}>
                  {breakdown.map((b, i) => <Cell key={i} fill={b.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PanelCard>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard label="EOL Servers" value={eol.length} icon={ShieldX} accent="critical" />
        <KpiCard label="Missing Patches" value={missingPatches} icon={ShieldAlert} accent="warning" />
        <KpiCard label="Missing Antivirus" value={missingAntivirus} icon={ShieldAlert} accent="emergency" />
        <KpiCard label="Missing Monitoring" value={missingMonitoring} icon={ShieldAlert} accent="info" />
        <KpiCard label="Missing Backup" value={missingBackup} icon={ShieldAlert} accent="warning" />
      </div>

      <PanelCard title="Non-Conformances" subtitle="Simulated findings sample">
        <div className="space-y-1.5 max-h-80 overflow-auto">
          {nonCompliances.map((n, i) => (
            <div key={i} className="flex items-center justify-between rounded border border-border bg-secondary/30 px-3 py-2">
              <div className="flex items-center gap-2">
                <ShieldX className="h-4 w-4 text-critical" />
                <div>
                  <div className="text-xs font-mono">{n.host}</div>
                  <div className="text-[11px] text-muted-foreground">{n.finding}</div>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded border ${n.severity === "Critical" ? "text-critical border-critical/30" : n.severity === "High" ? "text-warning border-warning/30" : "text-info border-info/30"}`}>{n.severity}</span>
            </div>
          ))}
        </div>
      </PanelCard>
    </div>
  );
}
