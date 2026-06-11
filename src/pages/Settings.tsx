import { PanelCard } from "@/components/PanelCard";
import { useAppStore } from "@/store/AppStore";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function Settings() {
  const { autoRefresh, setAutoRefresh, intervalSec, setIntervalSec, filter, setFilter } = useAppStore();
  const [theme, setTheme] = useState<"dark"|"light">(() => document.documentElement.classList.contains("light") ? "light" : "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const [t, setT] = useState({ cpuW: 75, cpuC: 90, memW: 80, memC: 90, diskW: 80, diskC: 90, latW: 100, latC: 200 });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Platform preferences and severity thresholds</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PanelCard title="Auto Refresh">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm">Enable auto refresh</div>
              <div className="text-xs text-muted-foreground">Periodically recalculate metrics, alerts and incidents.</div>
            </div>
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          </div>
          <div className="mt-5">
            <Label className="text-xs">Refresh interval: {intervalSec}s</Label>
            <Slider min={5} max={120} step={5} value={[intervalSec]} onValueChange={(v) => setIntervalSec(v[0])} className="mt-2" />
          </div>
        </PanelCard>

        <PanelCard title="Theme">
          <div className="flex items-center gap-3">
            <Label className="text-xs">Mode</Label>
            <Select value={theme} onValueChange={(v) => setTheme(v as any)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark (default)</SelectItem>
                <SelectItem value="light">Light</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </PanelCard>

        <PanelCard title="Severity Thresholds">
          <div className="grid grid-cols-2 gap-3 text-xs">
            {([
              ["CPU Warning %", "cpuW"], ["CPU Critical %", "cpuC"],
              ["Memory Warning %", "memW"], ["Memory Critical %", "memC"],
              ["Disk Warning %", "diskW"], ["Disk Critical %", "diskC"],
              ["Latency Warning ms", "latW"], ["Latency Critical ms", "latC"],
            ] as const).map(([label, k]) => (
              <div key={k}>
                <Label className="text-xs">{label}</Label>
                <Input type="number" value={(t as any)[k]} onChange={(e) => setT({ ...t, [k]: +e.target.value })} className="h-8" />
              </div>
            ))}
          </div>
          <Button size="sm" className="mt-3" onClick={() => toast.success("Thresholds saved", { description: "Triggers updated across the platform." })}>Save Thresholds</Button>
        </PanelCard>

        <PanelCard title="Global Filter Defaults">
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div>
              <Label>Default Environment</Label>
              <Select value={filter.environment} onValueChange={(v) => setFilter({ environment: v })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Production">Production</SelectItem>
                  <SelectItem value="Homologation">Homologation</SelectItem>
                  <SelectItem value="Development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Default Datacenter</Label>
              <Select value={filter.datacenter} onValueChange={(v) => setFilter({ datacenter: v })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="SP01">SP01</SelectItem>
                  <SelectItem value="SP02">SP02</SelectItem>
                  <SelectItem value="DR01">DR01</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </PanelCard>

        <PanelCard title="Notification Preferences" className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            {["Email digest","Slack channel","PagerDuty escalation","SMS critical only","Microsoft Teams","Webhook"].map((n) => (
              <label key={n} className="flex items-center justify-between rounded border border-border px-3 py-2">
                <span>{n}</span>
                <Switch defaultChecked={n.includes("Slack") || n.includes("Email")} />
              </label>
            ))}
          </div>
        </PanelCard>
      </div>
    </div>
  );
}
