import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";

export function KpiCard({
  label, value, icon: Icon, accent = "primary", sub, trend,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  accent?: "primary" | "success" | "warning" | "critical" | "info" | "emergency" | "muted";
  sub?: string;
  trend?: number;
}) {
  const accentMap: Record<string, string> = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    critical: "text-critical",
    emergency: "text-emergency",
    info: "text-info",
    muted: "text-muted-foreground",
  };
  return (
    <Card className="relative overflow-hidden bg-gradient-card border-border">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
          {Icon && <Icon className={cn("h-4 w-4", accentMap[accent])} />}
        </div>
        <div className={cn("mt-1 text-2xl font-semibold tabular-nums", accentMap[accent])}>{value}</div>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
          {sub && <span>{sub}</span>}
          {typeof trend === "number" && (
            <span className={cn("inline-flex items-center gap-0.5", trend >= 0 ? "text-success" : "text-critical")}>
              {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(trend).toFixed(1)}%
            </span>
          )}
        </div>
        <div className={cn("absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-20 blur-2xl", `bg-${accent}`)} />
      </CardContent>
    </Card>
  );
}
