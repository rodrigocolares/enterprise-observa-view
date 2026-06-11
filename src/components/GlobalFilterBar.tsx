import { useAppStore, useManualRefresh } from "@/store/AppStore";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Search, Radio } from "lucide-react";
import { useEffect, useState } from "react";

export function GlobalFilterBar() {
  const { filter, setFilter, autoRefresh, intervalSec, lastRefresh } = useAppStore();
  const refresh = useManualRefresh();
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSecs(Math.max(0, Math.floor((Date.now() - lastRefresh) / 1000))), 500);
    return () => clearInterval(id);
  }, [lastRefresh]);

  return (
    <div className="flex flex-1 items-center gap-2 min-w-0">
      <div className="relative flex-1 min-w-0 max-w-xl">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search hosts, applications, IDs..."
          value={filter.search}
          onChange={(e) => setFilter({ search: e.target.value })}
          className="pl-8 h-9 bg-secondary/50 border-border"
        />
      </div>
      <div className="hidden md:flex items-center gap-2">
        <Select value={filter.environment} onValueChange={(v) => setFilter({ environment: v })}>
          <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Environment" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Environments</SelectItem>
            <SelectItem value="Production">Production</SelectItem>
            <SelectItem value="Homologation">Homologation</SelectItem>
            <SelectItem value="Development">Development</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filter.datacenter} onValueChange={(v) => setFilter({ datacenter: v })}>
          <SelectTrigger className="h-9 w-[120px]"><SelectValue placeholder="DC" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All DCs</SelectItem>
            <SelectItem value="SP01">SP01</SelectItem>
            <SelectItem value="SP02">SP02</SelectItem>
            <SelectItem value="DR01">DR01</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filter.os} onValueChange={(v) => setFilter({ os: v })}>
          <SelectTrigger className="h-9 w-[110px]"><SelectValue placeholder="OS" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All OS</SelectItem>
            <SelectItem value="Windows">Windows</SelectItem>
            <SelectItem value="Linux">Linux</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Badge variant="outline" className="hidden sm:inline-flex gap-1.5 border-success/40 text-success">
        <Radio className={`h-3 w-3 ${autoRefresh ? "animate-pulse" : ""}`} />
        <span className="font-mono text-[11px]">LIVE · {secs}s / {intervalSec}s</span>
      </Badge>
      <Button size="sm" variant="outline" onClick={refresh} className="h-9 gap-1.5">
        <RefreshCw className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Refresh</span>
      </Button>
    </div>
  );
}
