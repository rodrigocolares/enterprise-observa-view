import { useAppStore } from "@/store/AppStore";
import { PanelCard } from "@/components/PanelCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function ServerInventory() {
  const { filtered } = useAppStore();
  const [os, setOs] = useState("all");
  const [ver, setVer] = useState("all");
  const [env, setEnv] = useState("all");
  const [app, setApp] = useState("all");
  const [crit, setCrit] = useState("all");
  const [stat, setStat] = useState("all");
  const [dc, setDc] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const versions = useMemo(() => Array.from(new Set(filtered.map((s) => s.version))).sort(), [filtered]);
  const apps = useMemo(() => Array.from(new Set(filtered.map((s) => s.application))).sort(), [filtered]);

  const rows = useMemo(() => filtered.filter((s) =>
    (os === "all" || s.os === os) &&
    (ver === "all" || s.version === ver) &&
    (env === "all" || s.environment === env) &&
    (app === "all" || s.application === app) &&
    (crit === "all" || s.criticality === crit) &&
    (stat === "all" || s.status === stat) &&
    (dc === "all" || s.datacenter === dc)
  ), [filtered, os, ver, env, app, crit, stat, dc]);

  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const cur = Math.min(page, pages);
  const view = rows.slice((cur - 1) * pageSize, cur * pageSize);

  const exportCSV = () => {
    const head = ["hostname","os","version","environment","application","criticality","cpu","memory","disk","latency","status","uptimeDays","datacenter"];
    const csv = [head.join(","), ...rows.map((s) => head.map((k) => (s as any)[k]).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "server-inventory.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported", { description: `${rows.length} rows` });
  };

  const F = ({ value, onChange, options, label }: any) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-full md:w-[140px]"><SelectValue placeholder={label} /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {label}</SelectItem>
        {options.map((o: string) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Server Inventory</h1>
          <p className="text-sm text-muted-foreground">{rows.length.toLocaleString()} hosts after filters</p>
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm" className="gap-1.5"><Download className="h-4 w-4" /> Export CSV</Button>
      </div>

      <PanelCard title="Advanced Filters">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          <F value={os} onChange={setOs} options={["Windows","Linux"]} label="OS" />
          <F value={ver} onChange={setVer} options={versions} label="Version" />
          <F value={env} onChange={setEnv} options={["Production","Homologation","Development"]} label="Env" />
          <F value={app} onChange={setApp} options={apps} label="App" />
          <F value={crit} onChange={setCrit} options={["High","Medium","Low"]} label="Criticality" />
          <F value={stat} onChange={setStat} options={["online","warning","critical","offline"]} label="Status" />
          <F value={dc} onChange={setDc} options={["SP01","SP02","DR01"]} label="DC" />
        </div>
      </PanelCard>

      {/* Desktop table */}
      <PanelCard padded={false} className="hidden md:block">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                {["Hostname","OS","Version","Env","App","Crit.","CPU","Mem","Disk","Lat","Status","Uptime","Check-In","DC"].map((h) => (
                  <TableHead key={h} className="text-[11px] uppercase tracking-wider">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {view.map((s) => (
                <TableRow key={s.id} className="border-border">
                  <TableCell className="font-mono text-xs">{s.hostname}</TableCell>
                  <TableCell>{s.os}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.version}</TableCell>
                  <TableCell>{s.environment}</TableCell>
                  <TableCell className="text-xs">{s.application}</TableCell>
                  <TableCell>{s.criticality}</TableCell>
                  <TableCell><Bar v={s.cpu} /></TableCell>
                  <TableCell><Bar v={s.memory} /></TableCell>
                  <TableCell><Bar v={s.disk} /></TableCell>
                  <TableCell className={`tabular-nums text-xs ${s.latency > 200 ? "text-critical" : s.latency > 100 ? "text-warning" : ""}`}>{s.latency}ms</TableCell>
                  <TableCell><StatusBadge status={s.status} /></TableCell>
                  <TableCell className="tabular-nums text-xs">{s.uptimeDays}d</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{Math.round((Date.now()-s.lastCheckIn)/1000)}s ago</TableCell>
                  <TableCell><span className="text-xs font-mono">{s.datacenter}</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Pager page={cur} pages={pages} onPage={setPage} />
      </PanelCard>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {view.map((s) => (
          <div key={s.id} className="rounded-lg border border-border bg-card p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-mono text-xs">{s.hostname}</div>
              <StatusBadge status={s.status} />
            </div>
            <div className="text-[11px] text-muted-foreground">{s.os} · {s.version} · {s.datacenter} · {s.environment}</div>
            <div className="grid grid-cols-4 gap-2 text-[11px]">
              <div>CPU<Bar v={s.cpu} /></div>
              <div>Mem<Bar v={s.memory} /></div>
              <div>Disk<Bar v={s.disk} /></div>
              <div className="tabular-nums">Lat<br/>{s.latency}ms</div>
            </div>
          </div>
        ))}
        <Pager page={cur} pages={pages} onPage={setPage} />
      </div>
    </div>
  );
}

function Bar({ v }: { v: number }) {
  const c = v > 90 ? "hsl(var(--critical))" : v > 75 ? "hsl(var(--warning))" : "hsl(var(--success))";
  return (
    <div className="flex items-center gap-2 min-w-[70px]">
      <div className="h-1.5 flex-1 rounded-full bg-secondary overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${v}%`, background: c }} />
      </div>
      <span className="text-[10px] tabular-nums text-muted-foreground w-7 text-right">{Math.round(v)}%</span>
    </div>
  );
}

function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-t border-border">
      <div className="text-xs text-muted-foreground">Page {page} of {pages}</div>
      <div className="flex gap-1">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
        <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
