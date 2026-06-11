import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { aggregate, buildServers, getSeries, pushSeries, Server, tickServers, Aggregates } from "@/lib/mockData";
import { toast } from "sonner";

export interface GlobalFilter {
  search: string;
  environment: string; // "all" | env
  datacenter: string; // "all" | dc
  os: string; // "all" | os
}

interface AppCtxValue {
  servers: Server[];
  filtered: Server[];
  aggregates: Aggregates;
  series: ReturnType<typeof getSeries>;
  filter: GlobalFilter;
  setFilter: (p: Partial<GlobalFilter>) => void;
  autoRefresh: boolean;
  setAutoRefresh: (v: boolean) => void;
  intervalSec: number;
  setIntervalSec: (n: number) => void;
  lastRefresh: number;
  refreshNow: () => void;
  loading: boolean;
}

const AppCtx = createContext<AppCtxValue | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const serversRef = useRef<Server[]>([]);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [intervalSec, setIntervalSec] = useState(15);
  const [filter, setFilterState] = useState<GlobalFilter>({ search: "", environment: "all", datacenter: "all", os: "all" });
  const [, force] = useState(0);

  useEffect(() => {
    serversRef.current = buildServers();
    pushSeries(serversRef.current);
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const refreshNow = useCallback(() => {
    tickServers(serversRef.current);
    pushSeries(serversRef.current);
    setLastRefresh(Date.now());
    force((x) => x + 1);
  }, []);

  useEffect(() => {
    if (!autoRefresh || loading) return;
    const id = setInterval(refreshNow, intervalSec * 1000);
    return () => clearInterval(id);
  }, [autoRefresh, intervalSec, loading, refreshNow]);

  const setFilter = useCallback((p: Partial<GlobalFilter>) => setFilterState((f) => ({ ...f, ...p })), []);

  const value = useMemo<AppCtxValue>(() => {
    const servers = serversRef.current;
    const q = filter.search.trim().toLowerCase();
    const filtered = servers.filter((s) => {
      if (filter.environment !== "all" && s.environment !== filter.environment) return false;
      if (filter.datacenter !== "all" && s.datacenter !== filter.datacenter) return false;
      if (filter.os !== "all" && s.os !== filter.os) return false;
      if (q && !(s.hostname.includes(q) || s.application.toLowerCase().includes(q) || s.id.includes(q))) return false;
      return true;
    });
    return {
      servers, filtered,
      aggregates: aggregate(filtered.length ? filtered : servers),
      series: getSeries(),
      filter, setFilter,
      autoRefresh, setAutoRefresh, intervalSec, setIntervalSec,
      lastRefresh, refreshNow, loading,
    };
  }, [filter, autoRefresh, intervalSec, lastRefresh, loading, refreshNow, setFilter]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}

export function useManualRefresh() {
  const { refreshNow } = useAppStore();
  return () => { refreshNow(); toast.success("Metrics refreshed", { description: "All telemetry has been recalculated." }); };
}
