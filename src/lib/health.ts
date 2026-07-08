import { Cloud, Monitor, Terminal } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import type { Server } from "@/lib/mockData";

export interface HealthScore {
  score: number; // 0-100
  level: "healthy" | "warning" | "critical";
  label: string;
}

export function computeHealthScore(s: Partial<Server>): HealthScore {
  let score = 100;
  const cpu = Number(s.cpu ?? 0);
  const memory = Number(s.memory ?? 0);
  const disk = Number(s.disk ?? 0);

  if (cpu > 60) score -= (cpu - 60) * 0.7;
  if (memory > 60) score -= (memory - 60) * 0.7;
  if (disk > 70) score -= (disk - 70) * 1.0;
  if (s.status === "warning") score -= 10;
  if (s.status === "critical") score -= 30;
  if (s.status === "offline") score -= 60;
  const latency = Number(s.latency ?? 0);
  if (latency > 150) score -= 8;

  score = Math.max(0, Math.min(100, Math.round(score)));
  const level: HealthScore["level"] = score >= 75 ? "healthy" : score >= 45 ? "warning" : "critical";
  const label = level === "healthy" ? "Healthy" : level === "warning" ? "Warning" : "Critical";
  return { score, level, label };
}

// OS icon resolution — supports future cloud variants inferred from tags/notes.
export function osIconFor(os?: string, tags?: string[]): ComponentType<SVGProps<SVGSVGElement>> {
  const t = (tags ?? []).map((x) => x.toLowerCase());
  if (t.some((x) => x === "azure" || x === "aws" || x === "gcp")) return Cloud;
  if (os === "Windows") return Monitor;
  if (os === "Linux") return Terminal;
  return Monitor;
}

export function osEmoji(os?: string, tags?: string[]): string {
  const t = (tags ?? []).map((x) => x.toLowerCase());
  if (t.includes("azure") || t.includes("aws") || t.includes("gcp")) return "☁";
  if (os === "Windows") return "🪟";
  if (os === "Linux") return "🐧";
  return "🖥";
}
