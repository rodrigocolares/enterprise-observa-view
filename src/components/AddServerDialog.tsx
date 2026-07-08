import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { useAppStore } from "@/store/AppStore";
import { CreateServerInput, Criticality, Datacenter, Environment, OS, Status } from "@/lib/mockData";

type FormState = {
  hostname: string;
  os: "" | OS;
  version: string;
  environment: "" | Environment;
  application: string;
  criticality: "" | Criticality;
  // UI-level status choice — "Maintenance" maps to warning internally
  statusUi: "" | "Online" | "Offline" | "Maintenance";
  datacenter: "" | Datacenter;
  cpu: string;
  memory: string;
  disk: string;
  ipAddress: string;
  owner: string;
  notes: string;
};

const initial: FormState = {
  hostname: "", os: "", version: "", environment: "", application: "",
  criticality: "", statusUi: "", datacenter: "",
  cpu: "", memory: "", disk: "", ipAddress: "", owner: "", notes: "",
};

const IPV4 = /^(25[0-5]|2[0-4]\d|[01]?\d?\d)(\.(25[0-5]|2[0-4]\d|[01]?\d?\d)){3}$/;

function toStatus(ui: FormState["statusUi"]): Status {
  if (ui === "Online") return "online";
  if (ui === "Offline") return "offline";
  return "warning"; // Maintenance
}

function numOr(v: string, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : def;
}

export function AddServerDialog() {
  const { addServer } = useAppStore();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((p) => ({ ...p, [k]: v }));

  const requiredFilled =
    f.hostname.trim() && f.os && f.version.trim() && f.environment &&
    f.application.trim() && f.criticality && f.statusUi && f.datacenter;

  const ipValid = f.ipAddress === "" || IPV4.test(f.ipAddress.trim());
  const canSave = Boolean(requiredFilled) && ipValid && !submitting;

  const reset = () => setF(initial);

  const onOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) reset();
  };

  const onSubmit = async () => {
    if (!canSave) return;
    setSubmitting(true);
    try {
      const input: CreateServerInput = {
        hostname: f.hostname.trim(),
        os: f.os as OS,
        version: f.version.trim(),
        environment: f.environment as Environment,
        application: f.application.trim(),
        criticality: f.criticality as Criticality,
        datacenter: f.datacenter as Datacenter,
        status: toStatus(f.statusUi),
        cpu: numOr(f.cpu, 10),
        memory: numOr(f.memory, 10),
        disk: numOr(f.disk, 10),
        ipAddress: f.ipAddress.trim() || undefined,
        owner: f.owner.trim() || undefined,
        notes: f.notes.trim() || undefined,
      };
      const s = addServer(input);
      toast.success("Server registered", { description: `${s.hostname} added to inventory.` });
      onOpenChange(false);
    } catch (e) {
      toast.error("Failed to register server", { description: "Please review the fields and try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const linuxVersions = ["CentOS 7", "CentOS 8", "CentOS Stream", "Ubuntu 22.04 LTS", "RHEL 9"];
  const winVersions = ["Windows Server 2016", "Windows Server 2019", "Windows Server 2022", "Windows Server 2025"];
  const versionOptions = useMemo(
    () => (f.os === "Linux" ? linuxVersions : f.os === "Windows" ? winVersions : []),
    [f.os]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Button
        size="sm"
        className="gap-1.5"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" /> Add Server
      </Button>
      <DialogContent className="max-w-2xl w-[calc(100vw-1.5rem)] p-0 gap-0 bg-gradient-card border-border">
        <DialogHeader className="px-5 py-4 border-b border-border">
          <DialogTitle className="text-base font-semibold tracking-tight">Register New Server</DialogTitle>
          <DialogDescription className="text-xs">
            Add a host to the inventory. Required fields are marked with *.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4 space-y-4">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Hostname *">
              <Input value={f.hostname} onChange={(e) => set("hostname", e.target.value)} placeholder="lnx-app-sp01-1234" className="font-mono" />
            </Field>
            <Field label="IP Address" error={!ipValid ? "Invalid IPv4 address" : undefined}>
              <Input value={f.ipAddress} onChange={(e) => set("ipAddress", e.target.value)} placeholder="10.20.30.40" className="font-mono" />
            </Field>

            <Field label="OS *">
              <Sel value={f.os} onChange={(v) => { set("os", v as OS); set("version", ""); }} placeholder="Select OS"
                options={["Windows", "Linux"]} />
            </Field>
            <Field label="Version *">
              {versionOptions.length ? (
                <Sel value={f.version} onChange={(v) => set("version", v)} placeholder="Select version" options={versionOptions} />
              ) : (
                <Input value={f.version} onChange={(e) => set("version", e.target.value)} placeholder="Select OS first" />
              )}
            </Field>

            <Field label="Environment *">
              <Sel value={f.environment} onChange={(v) => set("environment", v as Environment)} placeholder="Select environment"
                options={["Production", "Homologation", "Development"]} />
            </Field>
            <Field label="Application *">
              <Input value={f.application} onChange={(e) => set("application", e.target.value)} placeholder="SAP, Oracle, IIS…" />
            </Field>

            <Field label="Criticality *">
              <Sel value={f.criticality} onChange={(v) => set("criticality", v as Criticality)} placeholder="Select criticality"
                options={["High", "Medium", "Low"]} />
            </Field>
            <Field label="Status *">
              <Sel value={f.statusUi} onChange={(v) => set("statusUi", v as FormState["statusUi"])} placeholder="Select status"
                options={["Online", "Offline", "Maintenance"]} />
            </Field>

            <Field label="Datacenter *">
              <Sel value={f.datacenter} onChange={(v) => set("datacenter", v as Datacenter)} placeholder="Select DC"
                options={["SP01", "SP02", "DR01"]} />
            </Field>
            <Field label="Owner / Responsible Team">
              <Input value={f.owner} onChange={(e) => set("owner", e.target.value)} placeholder="Platform Squad" />
            </Field>
          </section>

          <section className="grid grid-cols-3 gap-3">
            <Field label="CPU %">
              <Input type="number" min={0} max={100} value={f.cpu} onChange={(e) => set("cpu", e.target.value)} placeholder="0-100" />
            </Field>
            <Field label="Memory %">
              <Input type="number" min={0} max={100} value={f.memory} onChange={(e) => set("memory", e.target.value)} placeholder="0-100" />
            </Field>
            <Field label="Disk %">
              <Input type="number" min={0} max={100} value={f.disk} onChange={(e) => set("disk", e.target.value)} placeholder="0-100" />
            </Field>
          </section>

          <Field label="Notes">
            <Textarea rows={3} value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Optional context, tags, tickets…" />
          </Field>
        </div>

        <DialogFooter className="px-5 py-3 border-t border-border gap-2 sm:gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" disabled={!canSave} onClick={onSubmit} className="gap-1.5">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Save Server
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
      {error && <div className="text-[11px] text-critical">{error}</div>}
    </div>
  );
}

function Sel({ value, onChange, placeholder, options }:
  { value: string; onChange: (v: string) => void; placeholder: string; options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
