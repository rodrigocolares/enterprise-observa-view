import { PanelCard } from "@/components/PanelCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, CheckCircle2, KeyRound, Plug, RefreshCw, Save, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function DatadogConfiguration() {
  const [apiKey, setApiKey] = useState("dd_demo_•••••••••••••••••••••••6f4a");
  const [appKey, setAppKey] = useState("app_demo_•••••••••••••••••••••••a91c");
  const [env, setEnv] = useState("production");
  const [region, setRegion] = useState("us1");

  const sim = (label: string, ok = true) => () => {
    toast.loading(`${label}...`, { id: label });
    setTimeout(() => {
      ok ? toast.success(`${label} succeeded`, { id: label, description: "Mocked simulation — no external calls performed." })
         : toast.error(`${label} failed`, { id: label });
    }, 900);
  };

  const dashboards = [
    { name: "Infrastructure Overview", desc: "Host count, agent status, fleet utilization" },
    { name: "Hosts Map", desc: "Geographic distribution and live status" },
    { name: "Service Map", desc: "Application dependency topology" },
    { name: "Alert Management", desc: "Active monitors and triggers" },
    { name: "Incident Overview", desc: "Open and resolved incidents trend" },
    { name: "Capacity Planning", desc: "Forecast and saturation analytics" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Datadog Configuration</h1>
        <p className="text-sm text-muted-foreground">Simulated integration — no live API calls are performed.</p>
      </div>

      <PanelCard title={<span className="flex items-center gap-2"><Plug className="h-4 w-4 text-primary" /> Connection</span>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div><Label className="text-xs">API Key</Label><Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="font-mono" /></div>
          <div><Label className="text-xs">Application Key</Label><Input value={appKey} onChange={(e) => setAppKey(e.target.value)} className="font-mono" /></div>
          <div>
            <Label className="text-xs">Environment</Label>
            <Select value={env} onValueChange={setEnv}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["production","staging","development"].map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Region</Label>
            <Select value={region} onValueChange={setRegion}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["us1","us3","us5","eu1","ap1"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={sim("Test Connection")} variant="outline" className="gap-1.5"><Activity className="h-4 w-4" /> Test Connection</Button>
          <Button onClick={sim("Validate Keys")} variant="outline" className="gap-1.5"><Shield className="h-4 w-4" /> Validate Keys</Button>
          <Button onClick={sim("Sync Dashboards")} variant="outline" className="gap-1.5"><RefreshCw className="h-4 w-4" /> Sync Dashboards</Button>
          <Button onClick={sim("Save Configuration")} className="gap-1.5"><Save className="h-4 w-4" /> Save Configuration</Button>
        </div>
        <div className="mt-3 inline-flex items-center gap-2 text-xs rounded border border-warning/40 bg-warning/10 text-warning px-2 py-1">
          <KeyRound className="h-3 w-3" /> Mocked integration — keys above are placeholders for demonstration only.
        </div>
      </PanelCard>

      <PanelCard title="Simulated Dashboards">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {dashboards.map((d) => (
            <div key={d.name} className="rounded-lg border border-border bg-gradient-card p-3 hover:border-primary/40 transition cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-sm">{d.name}</div>
                <CheckCircle2 className="h-4 w-4 text-success" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">{d.desc}</div>
              <div className="mt-3 h-16 rounded bg-secondary/50 grid-bg grid place-items-center text-[10px] text-muted-foreground">PREVIEW</div>
            </div>
          ))}
        </div>
      </PanelCard>
    </div>
  );
}
