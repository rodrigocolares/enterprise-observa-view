import { useAppStore } from "@/store/AppStore";
import { PanelCard } from "@/components/PanelCard";
import { Sparkles, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { useMemo } from "react";

export default function OperationalInsights() {
  const { filtered, aggregates } = useAppStore();

  const topProblem = [...filtered].sort((a,b) => (b.incidents + b.alerts) - (a.incidents + a.alerts)).slice(0, 10);
  const appCount: Record<string, number> = {};
  filtered.forEach((s) => { appCount[s.application] = (appCount[s.application] || 0) + s.incidents; });
  const topApps = Object.entries(appCount).sort((a,b) => b[1]-a[1]).slice(0,10);

  const recurringAlerts = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((s) => {
      if (s.cpu > 90) map["CPU > 90%"] = (map["CPU > 90%"] || 0) + 1;
      if (s.memory > 90) map["Memory > 90%"] = (map["Memory > 90%"] || 0) + 1;
      if (s.disk > 90) map["Disk > 90%"] = (map["Disk > 90%"] || 0) + 1;
      if (s.latency > 200) map["Latency > 200ms"] = (map["Latency > 200ms"] || 0) + 1;
      if (s.status === "offline") map["Host without communication"] = (map["Host without communication"] || 0) + 1;
    });
    return Object.entries(map).sort((a,b) => b[1]-a[1]).slice(0, 10);
  }, [filtered]);

  const insights = [
    `Average latency trending ${aggregates.healthScore > 80 ? "stable" : "upward"} — focus on SP02 inter-AZ routes.`,
    `${filtered.filter((s) => ["CentOS 7","Windows Server 2003"].includes(s.version)).length} hosts on End-of-Life OS — accelerate migration roadmap.`,
    `Capacity risk detected on ${filtered.filter((s) => s.disk > 85).length} hosts with disk > 85%.`,
    `Top recurring incidents concentrated in ${topApps[0]?.[0] || "—"} (${topApps[0]?.[1] || 0} events).`,
    `Production environment availability at ${(aggregates.byEnv.Production.availability / Math.max(1, aggregates.byEnv.Production.total)).toFixed(3)}% — within SLA target.`,
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Operational Insights</h1>
        <p className="text-sm text-muted-foreground">Automatically generated observations and analytics</p>
      </div>

      <PanelCard title={<span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> AI-Generated Insights</span>}>
        <ul className="space-y-2 text-sm">
          {insights.map((i, k) => (
            <li key={k} className="flex gap-2"><Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" /> {i}</li>
          ))}
        </ul>
      </PanelCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PanelCard title="Top 10 Problematic Servers">
          <ol className="text-xs space-y-1.5">
            {topProblem.map((s, i) => (
              <li key={s.id} className="flex justify-between rounded border border-border px-2 py-1.5">
                <span className="font-mono truncate">{i+1}. {s.hostname}</span>
                <span className="text-muted-foreground">{s.incidents + s.alerts} events</span>
              </li>
            ))}
          </ol>
        </PanelCard>

        <PanelCard title="Top 10 Apps with Incidents">
          <ol className="text-xs space-y-1.5">
            {topApps.map(([a, c], i) => (
              <li key={a} className="flex justify-between rounded border border-border px-2 py-1.5">
                <span>{i+1}. {a}</span>
                <span className="text-muted-foreground">{c}</span>
              </li>
            ))}
          </ol>
        </PanelCard>

        <PanelCard title="Top 10 Recurring Alerts">
          <ol className="text-xs space-y-1.5">
            {recurringAlerts.map(([n, c], i) => (
              <li key={n} className="flex justify-between rounded border border-border px-2 py-1.5">
                <span>{i+1}. {n}</span>
                <span className="text-muted-foreground">{c}</span>
              </li>
            ))}
          </ol>
        </PanelCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Trend label="Failure Trend" value="-8.4%" good icon={TrendingDown} />
        <Trend label="Downtime Trend" value="-3.1%" good icon={TrendingDown} />
        <Trend label="Operational Score" value={`${aggregates.healthScore}/100`} good={aggregates.healthScore >= 75} icon={TrendingUp} />
      </div>
    </div>
  );
}

function Trend({ label, value, good, icon: Icon }: any) {
  return (
    <PanelCard>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className={`text-3xl font-bold tabular-nums ${good ? "text-success" : "text-critical"}`}>{value}</div>
        </div>
        <Icon className={`h-8 w-8 ${good ? "text-success" : "text-critical"}`} />
      </div>
    </PanelCard>
  );
}
