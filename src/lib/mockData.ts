// Deterministic seeded mock data generator for 1,100 enterprise servers
import { useEffect, useState } from "react";

export type OS = "Windows" | "Linux";
export type Environment = "Production" | "Homologation" | "Development";
export type Criticality = "High" | "Medium" | "Low";
export type Datacenter = "SP01" | "SP02" | "DR01";
export type Status = "online" | "warning" | "critical" | "offline";

export interface Server {
  id: string;
  hostname: string;
  os: OS;
  version: string;
  environment: Environment;
  application: string;
  criticality: Criticality;
  datacenter: Datacenter;
  cpu: number;
  memory: number;
  disk: number;
  network: number; // Mbps
  latency: number; // ms
  uptimeDays: number;
  availability: number; // %
  incidents: number;
  alerts: number;
  lastCheckIn: number; // epoch ms
  status: Status;
  ipAddress?: string;
  owner?: string;
  notes?: string;
}

// Service-layer factory. Ready to be swapped for a real API call later.
export interface CreateServerInput {
  hostname: string;
  os: OS;
  version: string;
  environment: Environment;
  application: string;
  criticality: Criticality;
  datacenter: Datacenter;
  status: Status;
  cpu: number;
  memory: number;
  disk: number;
  ipAddress?: string;
  owner?: string;
  notes?: string;
}

export function createServer(input: CreateServerInput): Server {
  const now = Date.now();
  const idSuffix = Math.floor(Math.random() * 90000 + 10000);
  return {
    id: `srv-${idSuffix}`,
    hostname: input.hostname,
    os: input.os,
    version: input.version,
    environment: input.environment,
    application: input.application,
    criticality: input.criticality,
    datacenter: input.datacenter,
    cpu: input.cpu,
    memory: input.memory,
    disk: input.disk,
    network: 200,
    latency: 40,
    uptimeDays: 0,
    availability: input.status === "offline" ? 0 : 99.9,
    incidents: 0,
    alerts: 0,
    lastCheckIn: now,
    status: input.status,
    ipAddress: input.ipAddress,
    owner: input.owner,
    notes: input.notes,
  };
}

const APPS = [
  "SAP", "Oracle Database", "SQL Server", "IIS", "Apache", "Nginx",
  "Kubernetes Worker", "Kubernetes Master", "Active Directory", "File Server",
  "Backup Server", "Monitoring Server", "Web Applications", "APIs", "Middleware",
];

// Simple LCG for deterministic seeded random
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };
}

function pick<T>(rand: () => number, arr: T[]) { return arr[Math.floor(rand() * arr.length)]; }

function distribute<T>(rand: () => number, n: number, options: { value: T; pct: number }[]): T[] {
  const out: T[] = [];
  options.forEach((opt) => {
    const count = Math.round((opt.pct / 100) * n);
    for (let i = 0; i < count; i++) out.push(opt.value);
  });
  while (out.length < n) out.push(options[0].value);
  // shuffle
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.slice(0, n);
}

let _servers: Server[] | null = null;
const TOTAL = 1100;

export function buildServers(): Server[] {
  if (_servers) return _servers;
  const rand = lcg(20260611);

  // Windows 550 split
  const winVersions = distribute(rand, 550, [
    { value: "Windows Server 2003", pct: 10 },
    { value: "Windows Server 2016", pct: 20 },
    { value: "Windows Server 2022", pct: 40 },
    { value: "Windows Server 2025", pct: 30 },
  ]);
  const linVersions = distribute(rand, 550, [
    { value: "CentOS 7", pct: 30 },
    { value: "CentOS 8", pct: 40 },
    { value: "CentOS Stream", pct: 30 },
  ]);

  const envs = distribute(rand, TOTAL, [
    { value: "Production" as Environment, pct: 70 },
    { value: "Homologation" as Environment, pct: 20 },
    { value: "Development" as Environment, pct: 10 },
  ]);
  const crits = distribute(rand, TOTAL, [
    { value: "High" as Criticality, pct: 20 },
    { value: "Medium" as Criticality, pct: 50 },
    { value: "Low" as Criticality, pct: 30 },
  ]);
  const dcs = distribute(rand, TOTAL, [
    { value: "SP01" as Datacenter, pct: 45 },
    { value: "SP02" as Datacenter, pct: 35 },
    { value: "DR01" as Datacenter, pct: 20 },
  ]);

  const servers: Server[] = [];
  for (let i = 0; i < TOTAL; i++) {
    const isWin = i < 550;
    const os: OS = isWin ? "Windows" : "Linux";
    const version = isWin ? winVersions[i] : linVersions[i - 550];
    const app = pick(rand, APPS);
    const env = envs[i];
    const crit = crits[i];
    const dc = dcs[i];

    // base load skews by criticality + EOL versions
    const eol = version === "Windows Server 2003" || version === "CentOS 7" || version === "CentOS 8";
    const base = 30 + rand() * 30 + (crit === "High" ? 15 : crit === "Medium" ? 5 : 0) + (eol ? 10 : 0);
    const cpu = clamp(base + (rand() - 0.5) * 30);
    const memory = clamp(base + (rand() - 0.5) * 28);
    const disk = clamp(40 + rand() * 50 + (eol ? 10 : 0));
    const latency = Math.round(15 + rand() * 90 + (eol ? 60 : 0) + (rand() < 0.05 ? rand() * 400 : 0));
    const offline = rand() < 0.015;
    const critical = !offline && (cpu > 92 || memory > 92 || latency > 250 || rand() < 0.025);
    const warning = !offline && !critical && (cpu > 78 || memory > 80 || latency > 120 || rand() < 0.08);
    const status: Status = offline ? "offline" : critical ? "critical" : warning ? "warning" : "online";
    const availability = offline ? 0 : 95 + rand() * 4.999;

    servers.push({
      id: `srv-${String(i + 1).padStart(4, "0")}`,
      hostname: hostnameFor(os, app, dc, i),
      os, version, environment: env, application: app, criticality: crit, datacenter: dc,
      cpu, memory, disk,
      network: Math.round(100 + rand() * 900),
      latency,
      uptimeDays: Math.round(rand() * 720),
      availability,
      incidents: status === "online" ? 0 : Math.floor(rand() * 4),
      alerts: status === "online" ? Math.floor(rand() * 2) : Math.floor(rand() * 6) + 1,
      lastCheckIn: Date.now() - Math.floor(rand() * 600_000),
      status,
    });
  }
  _servers = servers;
  return servers;
}

function clamp(n: number, min = 2, max = 99) { return Math.max(min, Math.min(max, n)); }
function hostnameFor(os: OS, app: string, dc: Datacenter, i: number) {
  const slug = app.toLowerCase().replace(/[^a-z]/g, "").slice(0, 6) || "app";
  const prefix = os === "Windows" ? "win" : "lnx";
  return `${prefix}-${slug}-${dc.toLowerCase()}-${String(i + 1).padStart(4, "0")}`;
}

// In-place tick: gradually mutate metrics & statuses
export function tickServers(servers: Server[]) {
  const now = Date.now();
  for (const s of servers) {
    if (s.status === "offline" && Math.random() < 0.1) {
      s.status = "warning";
    }
    const drift = (target: number) => target + (Math.random() - 0.5) * 6;
    s.cpu = clamp(drift(s.cpu));
    s.memory = clamp(drift(s.memory));
    s.disk = clamp(s.disk + (Math.random() - 0.45) * 0.4, 5, 99);
    s.network = Math.max(20, Math.round(s.network + (Math.random() - 0.5) * 100));
    s.latency = Math.max(8, Math.round(s.latency + (Math.random() - 0.5) * 25));
    if (Math.random() < 0.005) s.status = "offline";
    else if (s.cpu > 92 || s.memory > 92 || s.latency > 250) s.status = "critical";
    else if (s.cpu > 78 || s.memory > 80 || s.latency > 120) s.status = "warning";
    else s.status = "online";

    if (s.status === "critical" && Math.random() < 0.15) s.incidents += 1;
    s.alerts = s.status === "online" ? Math.max(0, s.alerts - (Math.random() < 0.2 ? 1 : 0))
                                     : s.alerts + (Math.random() < 0.3 ? 1 : 0);
    s.lastCheckIn = s.status === "offline" ? s.lastCheckIn : now;
    s.availability = s.status === "offline" ? Math.max(0, s.availability - 0.05) : Math.min(99.999, s.availability + 0.01);
  }
}

// Aggregations
export interface Aggregates {
  total: number;
  windows: number; linux: number;
  prod: number; hom: number; dev: number;
  online: number; warning: number; critical: number; offline: number;
  sla: number;
  availability: number;
  openIncidents: number;
  criticalIncidents: number;
  envHealth: number;
  healthScore: number;
  byDC: Record<Datacenter, { total: number; online: number; warning: number; critical: number; offline: number; sla: number }>;
  byEnv: Record<Environment, { availability: number; total: number }>;
}

export function aggregate(servers: Server[]): Aggregates {
  const a: Aggregates = {
    total: servers.length,
    windows: 0, linux: 0, prod: 0, hom: 0, dev: 0,
    online: 0, warning: 0, critical: 0, offline: 0,
    sla: 0, availability: 0, openIncidents: 0, criticalIncidents: 0,
    envHealth: 0, healthScore: 0,
    byDC: {
      SP01: { total: 0, online: 0, warning: 0, critical: 0, offline: 0, sla: 0 },
      SP02: { total: 0, online: 0, warning: 0, critical: 0, offline: 0, sla: 0 },
      DR01: { total: 0, online: 0, warning: 0, critical: 0, offline: 0, sla: 0 },
    },
    byEnv: {
      Production: { availability: 0, total: 0 },
      Homologation: { availability: 0, total: 0 },
      Development: { availability: 0, total: 0 },
    },
  };
  let availSum = 0;
  for (const s of servers) {
    if (s.os === "Windows") a.windows++; else a.linux++;
    if (s.environment === "Production") a.prod++;
    else if (s.environment === "Homologation") a.hom++;
    else a.dev++;
    a[s.status]++;
    a.openIncidents += s.incidents;
    if (s.status === "critical") a.criticalIncidents += s.incidents;
    availSum += s.availability;
    const dc = a.byDC[s.datacenter];
    dc.total++; dc[s.status]++; dc.sla += s.availability;
    const ev = a.byEnv[s.environment];
    ev.availability += s.availability; ev.total++;
  }
  a.availability = availSum / servers.length;
  a.sla = a.availability;
  (Object.keys(a.byDC) as Datacenter[]).forEach((k) => { const d = a.byDC[k]; d.sla = d.total ? d.sla / d.total : 0; });
  const totalNonOffline = a.total - a.offline;
  a.envHealth = totalNonOffline ? ((a.online + a.warning * 0.6) / a.total) * 100 : 0;
  a.healthScore = Math.round(Math.max(0, Math.min(100,
    100 - (a.critical / a.total) * 180 - (a.offline / a.total) * 220 - (a.warning / a.total) * 40
  )));
  return a;
}

// ---- Time-series stores (rolling window)
export interface SeriesPoint { t: number; cpu: number; memory: number; disk: number; incidents: number; }
const _series: SeriesPoint[] = [];

export function pushSeries(servers: Server[]) {
  const avg = (k: keyof Server) => servers.reduce((s, x) => s + (x[k] as number), 0) / servers.length;
  _series.push({
    t: Date.now(),
    cpu: +avg("cpu").toFixed(1),
    memory: +avg("memory").toFixed(1),
    disk: +avg("disk").toFixed(1),
    incidents: servers.reduce((s, x) => s + x.incidents, 0),
  });
  if (_series.length > 60) _series.shift();
}
export function getSeries() { return _series.slice(); }

// Hook for forcing component re-render on tick
export function useTick(intervalMs: number, enabled: boolean) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
  return tick;
}
