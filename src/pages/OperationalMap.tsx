import { useAppStore } from "@/store/AppStore";
import { PanelCard } from "@/components/PanelCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Datacenter } from "@/lib/mockData";
import { Server, Wifi, AlertTriangle, ShieldAlert } from "lucide-react";

export default function OperationalMap() {
  const { filtered, aggregates } = useAppStore();
  const dcs: Datacenter[] = ["SP01","SP02","DR01"];
  const labels: Record<Datacenter, { name: string; region: string }> = {
    SP01: { name: "São Paulo Primary", region: "SP — Tier IV" },
    SP02: { name: "São Paulo Secondary", region: "SP — Tier III" },
    DR01: { name: "Disaster Recovery", region: "Campinas — Tier III" },
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Operational Map</h1>
        <p className="text-sm text-muted-foreground">Live NOC view across all datacenters</p>
      </div>

      <PanelCard padded={false} className="overflow-hidden">
        <div className="relative grid-bg h-72 md:h-96">
          <svg viewBox="0 0 800 320" className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="link" x1="0" x2="1"><stop offset="0%" stopColor="hsl(var(--primary))" /><stop offset="100%" stopColor="hsl(var(--accent))" /></linearGradient>
            </defs>
            <line x1="200" y1="160" x2="400" y2="160" stroke="url(#link)" strokeWidth="2" strokeDasharray="6 6" />
            <line x1="400" y1="160" x2="620" y2="160" stroke="url(#link)" strokeWidth="2" strokeDasharray="6 6" />
            {dcs.map((dc, i) => {
              const x = 200 + i * 220;
              const d = aggregates.byDC[dc];
              const overall = d.critical > 0 ? "critical" : d.warning > 0 ? "warning" : "online";
              const color = overall === "critical" ? "hsl(var(--critical))" : overall === "warning" ? "hsl(var(--warning))" : "hsl(var(--success))";
              return (
                <g key={dc}>
                  <circle cx={x} cy={160} r="44" fill="hsl(var(--card))" stroke={color} strokeWidth="2" />
                  {overall === "critical" && <circle cx={x} cy={160} r="44" fill="none" stroke={color} strokeWidth="2" opacity="0.5">
                    <animate attributeName="r" from="44" to="70" dur="1.6s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.6" to="0" dur="1.6s" repeatCount="indefinite" />
                  </circle>}
                  <text x={x} y={156} textAnchor="middle" fontSize="14" fontWeight="700" fill="hsl(var(--foreground))">{dc}</text>
                  <text x={x} y={174} textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))">{d.total} hosts</text>
                </g>
              );
            })}
          </svg>
        </div>
      </PanelCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dcs.map((dc) => {
          const d = aggregates.byDC[dc];
          const overall = d.critical > 0 ? "critical" : d.warning > 0 ? "warning" : "online";
          const topApps = filtered.filter((s) => s.datacenter === dc && (s.status === "critical" || s.status === "warning"))
            .reduce<Record<string, number>>((acc, s) => { acc[s.application] = (acc[s.application] || 0) + 1; return acc; }, {});
          const top = Object.entries(topApps).sort((a,b) => b[1]-a[1]).slice(0,4);
          return (
            <PanelCard key={dc} title={<span className="flex items-center justify-between gap-2"><span>{dc}</span><StatusBadge status={overall as any} /></span>} subtitle={labels[dc].region}>
              <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                <Tile icon={Wifi} label="Online" v={d.online} color="success" />
                <Tile icon={AlertTriangle} label="Warning" v={d.warning} color="warning" />
                <Tile icon={ShieldAlert} label="Critical" v={d.critical} color="critical" />
                <Tile icon={Server} label="Offline" v={d.offline} color="muted" />
              </div>
              <div className="mt-3 text-xs text-muted-foreground">SLA: <span className="text-foreground font-semibold tabular-nums">{d.sla.toFixed(3)}%</span></div>
              <div className="mt-3">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Top Affected Apps</div>
                <ul className="text-xs space-y-1">
                  {top.length ? top.map(([a,c]) => <li key={a} className="flex justify-between"><span>{a}</span><span className="text-muted-foreground">{c}</span></li>) : <li className="text-muted-foreground">All clear.</li>}
                </ul>
              </div>
            </PanelCard>
          );
        })}
      </div>
    </div>
  );
}

function Tile({ icon: Icon, label, v, color }: any) {
  return (
    <div className={`rounded border border-border p-2 text-${color}`}>
      <Icon className="h-3.5 w-3.5 mx-auto mb-0.5" />
      <div className="font-semibold tabular-nums">{v}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
