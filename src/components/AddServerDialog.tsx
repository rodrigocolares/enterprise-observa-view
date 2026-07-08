import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Layers, HeartPulse, Save } from "lucide-react";

import { useAppStore } from "@/store/AppStore";
import { emptyServerForm, serverFormSchema, ServerFormValues } from "@/schemas/serverSchema";
import { serverRepository } from "@/repository/ServerRepository";
import { SERVER_TEMPLATES, findTemplate } from "@/services/serverTemplates";
import { TagsInput } from "./TagsInput";
import { SummaryDialog } from "./SummaryDialog";
import { computeHealthScore, osIconFor } from "@/lib/health";
import { cn } from "@/lib/utils";
import type { CreateServerInput } from "@/lib/mockData";

const OS_OPTS = ["Windows", "Linux"] as const;
const ENV_OPTS = ["Production", "Homologation", "Development"] as const;
const CRIT_OPTS = ["High", "Medium", "Low"] as const;
const DC_OPTS = ["SP01", "SP02", "DR01"] as const;
const STATUS_OPTS = [
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
  { value: "warning", label: "Maintenance" },
] as const;

const WIN_VERSIONS = ["Windows Server 2016", "Windows Server 2019", "Windows Server 2022", "Windows Server 2025"];
const LINUX_VERSIONS = ["CentOS 7", "CentOS 8", "CentOS Stream", "Ubuntu 22.04 LTS", "RHEL 9"];

const HEALTH_CLASSES: Record<string, string> = {
  healthy: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  critical: "bg-critical/15 text-critical border-critical/30",
};

export function AddServerDialog() {
  const { addServer } = useAppStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("general");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ServerFormValues>({
    resolver: zodResolver(serverFormSchema),
    defaultValues: emptyServerForm,
    mode: "onChange",
  });
  const { control, register, handleSubmit, reset, setValue, setError, clearErrors, getValues, formState } = form;
  const { errors, isDirty, isValid } = formState;

  const values = useWatch({ control });

  // Real-time duplicate validation
  useEffect(() => {
    const h = values.hostname?.trim();
    if (h && serverRepository.existsHostname(h)) {
      setError("hostname", { type: "duplicate", message: "Hostname already exists" });
    } else if (h) {
      clearErrors("hostname");
    }
  }, [values.hostname, setError, clearErrors]);

  useEffect(() => {
    const ip = values.ipAddress?.trim();
    if (ip && serverRepository.existsIp(ip)) {
      setError("ipAddress", { type: "duplicate", message: "IP address already assigned" });
    }
  }, [values.ipAddress, setError]);

  // Derived: disk usage & health
  const diskUsagePct = useMemo(() => {
    const t = Number(values.diskTotalGB || 0);
    const f = Number(values.diskFreeGB || 0);
    if (!t) return null;
    return Math.max(0, Math.min(100, Math.round(((t - f) / t) * 100)));
  }, [values.diskTotalGB, values.diskFreeGB]);

  useEffect(() => {
    if (diskUsagePct != null) setValue("disk", diskUsagePct, { shouldValidate: true });
  }, [diskUsagePct, setValue]);

  const health = useMemo(() => computeHealthScore({
    cpu: values.cpu, memory: values.memory, disk: values.disk,
    status: values.status as never, latency: 0,
  }), [values.cpu, values.memory, values.disk, values.status]);

  const OsIcon = osIconFor(values.os, values.tags as string[] | undefined);

  // Keyboard shortcuts (ESC + Ctrl/Cmd+S)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSubmit(openSummary, focusFirstError)();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleSubmit]);

  const focusFirstError = useCallback((errs: typeof errors) => {
    const first = Object.keys(errs)[0];
    if (!first) return;
    const map: Record<string, string> = {
      hostname: "general", fqdn: "general", alias: "general", os: "general", version: "general",
      environment: "general", application: "general", datacenter: "general", status: "general", criticality: "general",
      cpuCount: "hardware", cores: "hardware", ramGB: "hardware", diskTotalGB: "hardware", diskFreeGB: "hardware",
      cpu: "hardware", memory: "hardware", disk: "hardware",
      ipAddress: "network", ipv6: "network", gateway: "network", vlan: "network",
      dnsPrimary: "network", dnsSecondary: "network", macAddress: "network",
      owner: "owners", squad: "owners", team: "owners", manager: "owners", costCenter: "owners",
      notes: "notes",
    };
    setTab(map[first] ?? "general");
  }, []);

  const openSummary = () => setSummaryOpen(true);

  const persist = async () => {
    setSubmitting(true);
    try {
      const v = getValues();
      const input: CreateServerInput = {
        hostname: v.hostname, fqdn: v.fqdn, alias: v.alias,
        os: v.os, version: v.version, environment: v.environment,
        application: v.application, datacenter: v.datacenter, status: v.status,
        criticality: v.criticality,
        cpu: v.cpu ?? 10, memory: v.memory ?? 10, disk: v.disk ?? 10,
        cpuCount: v.cpuCount, cores: v.cores, ramGB: v.ramGB,
        diskTotalGB: v.diskTotalGB, diskFreeGB: v.diskFreeGB,
        ipAddress: v.ipAddress, ipv6: v.ipv6, gateway: v.gateway, vlan: v.vlan,
        dnsPrimary: v.dnsPrimary, dnsSecondary: v.dnsSecondary, macAddress: v.macAddress,
        owner: v.owner, squad: v.squad, team: v.team, manager: v.manager, costCenter: v.costCenter,
        notes: v.notes, tags: v.tags,
      };
      const created = addServer(input);
      toast.success("Server created successfully", {
        description: `${created.hostname} · ${created.id}`,
        action: { label: "View Details", onClick: () => navigate(`/inventory/server/${created.id}`) },
      });
      setSummaryOpen(false);
      setOpen(false);
      reset(emptyServerForm);
      setTab("general");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unexpected error";
      toast.error("Failed to create server", { description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const requestClose = () => {
    if (isDirty && !submitting) setConfirmClose(true);
    else { setOpen(false); reset(emptyServerForm); setTab("general"); }
  };

  const applyTemplate = (key: string) => {
    const tpl = findTemplate(key as never);
    if (!tpl) return;
    const current = getValues();
    reset({ ...current, ...tpl.values, tags: [...(current.tags ?? []), ...(tpl.values.tags ?? []).filter((t) => !(current.tags ?? []).includes(t))] } as ServerFormValues, { keepDirty: true });
    toast("Template applied", { description: tpl.label });
  };

  return (
    <>
      <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Add Server
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) requestClose(); else setOpen(true); }}>
        <DialogContent
          className="max-w-3xl w-[calc(100vw-1.5rem)] p-0 gap-0 bg-gradient-card border-border animate-in fade-in-0 zoom-in-95"
          onEscapeKeyDown={(e) => { e.preventDefault(); requestClose(); }}
          onInteractOutside={(e) => { if (isDirty) e.preventDefault(); }}
        >
          <DialogHeader className="px-5 py-4 border-b border-border">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md border border-border bg-background/60 flex items-center justify-center">
                  <OsIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <DialogTitle className="text-base font-semibold tracking-tight">Register New Server</DialogTitle>
                  <DialogDescription className="text-xs">
                    Enterprise CI record — organized in tabs. Press <kbd className="px-1 py-0.5 rounded border border-border text-[10px]">Ctrl+S</kbd> to save, <kbd className="px-1 py-0.5 rounded border border-border text-[10px]">Esc</kbd> to close.
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("border gap-1", HEALTH_CLASSES[health.level])}>
                  <HeartPulse className="h-3 w-3" />
                  {health.score} · {health.label}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Layers className="h-4 w-4" /> Load Template
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel className="text-xs">Prefill from template</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {SERVER_TEMPLATES.map((t) => (
                      <DropdownMenuItem key={t.key} onClick={() => applyTemplate(t.key)}>
                        {t.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit(openSummary, focusFirstError)}>
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <div className="px-5 pt-3">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="hardware">Hardware</TabsTrigger>
                  <TabsTrigger value="network">Network</TabsTrigger>
                  <TabsTrigger value="owners">Owners</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>
              </div>

              <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
                <TabsContent value="general" className="mt-0 space-y-4">
                  <div className="grid md:grid-cols-2 gap-3">
                    <Field label="Hostname *" error={errors.hostname?.message}>
                      <Input {...register("hostname")} placeholder="lnx-app-sp01-1234" className="font-mono" autoFocus />
                    </Field>
                    <Field label="FQDN" error={errors.fqdn?.message}>
                      <Input {...register("fqdn")} placeholder="host.corp.example.com" className="font-mono" />
                    </Field>
                    <Field label="Alias" error={errors.alias?.message}>
                      <Input {...register("alias")} placeholder="Friendly name" />
                    </Field>
                    <Field label="OS *" error={errors.os?.message}>
                      <ControlledSelect name="os" control={control} options={OS_OPTS as unknown as string[]} placeholder="Select OS"
                        onAfterChange={() => setValue("version", "" as never, { shouldValidate: true })} />
                    </Field>
                    <Field label="Version *" error={errors.version?.message}>
                      <ControlledSelect
                        name="version" control={control}
                        options={values.os === "Linux" ? LINUX_VERSIONS : values.os === "Windows" ? WIN_VERSIONS : []}
                        placeholder={values.os ? "Select version" : "Select OS first"}
                      />
                    </Field>
                    <Field label="Environment *" error={errors.environment?.message}>
                      <ControlledSelect name="environment" control={control} options={ENV_OPTS as unknown as string[]} placeholder="Select environment" />
                    </Field>
                    <Field label="Application *" error={errors.application?.message}>
                      <Input {...register("application")} placeholder="SAP, Oracle, IIS…" />
                    </Field>
                    <Field label="Datacenter *" error={errors.datacenter?.message}>
                      <ControlledSelect name="datacenter" control={control} options={DC_OPTS as unknown as string[]} placeholder="Select DC" />
                    </Field>
                    <Field label="Status *" error={errors.status?.message}>
                      <Controller name="status" control={control} render={({ field }) => (
                        <Select value={field.value ?? ""} onValueChange={field.onChange}>
                          <SelectTrigger className="h-9"><SelectValue placeholder="Select status" /></SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )} />
                    </Field>
                    <Field label="Criticality *" error={errors.criticality?.message}>
                      <ControlledSelect name="criticality" control={control} options={CRIT_OPTS as unknown as string[]} placeholder="Select criticality" />
                    </Field>
                  </div>
                </TabsContent>

                <TabsContent value="hardware" className="mt-0 space-y-4">
                  <div className="grid md:grid-cols-3 gap-3">
                    <Field label="CPUs" error={errors.cpuCount?.message}>
                      <Input type="number" min={0} {...register("cpuCount")} />
                    </Field>
                    <Field label="Cores" error={errors.cores?.message}>
                      <Input type="number" min={0} {...register("cores")} />
                    </Field>
                    <Field label="RAM (GB)" error={errors.ramGB?.message}>
                      <Input type="number" min={0} {...register("ramGB")} />
                    </Field>
                    <Field label="Disk Total (GB)" error={errors.diskTotalGB?.message}>
                      <Input type="number" min={0} {...register("diskTotalGB")} />
                    </Field>
                    <Field label="Disk Free (GB)" error={errors.diskFreeGB?.message}>
                      <Input type="number" min={0} {...register("diskFreeGB")} />
                    </Field>
                    <Field label="Disk Usage (auto)">
                      <div className="h-9 px-3 flex items-center rounded-md border border-input bg-background/40 text-sm tabular-nums">
                        {diskUsagePct != null ? `${diskUsagePct}%` : "—"}
                      </div>
                    </Field>
                  </div>
                  <div className="grid md:grid-cols-3 gap-3 pt-2 border-t border-border">
                    <Field label="Baseline CPU %"><Input type="number" min={0} max={100} {...register("cpu")} /></Field>
                    <Field label="Baseline Memory %"><Input type="number" min={0} max={100} {...register("memory")} /></Field>
                    <Field label="Baseline Disk %"><Input type="number" min={0} max={100} {...register("disk")} /></Field>
                  </div>
                </TabsContent>

                <TabsContent value="network" className="mt-0 space-y-4">
                  <div className="grid md:grid-cols-2 gap-3">
                    <Field label="IPv4" error={errors.ipAddress?.message}>
                      <Input {...register("ipAddress")} placeholder="10.20.30.40" className="font-mono" />
                    </Field>
                    <Field label="IPv6" error={errors.ipv6?.message}>
                      <Input {...register("ipv6")} placeholder="2001:db8::1" className="font-mono" />
                    </Field>
                    <Field label="Gateway" error={errors.gateway?.message}>
                      <Input {...register("gateway")} placeholder="10.20.30.1" className="font-mono" />
                    </Field>
                    <Field label="VLAN" error={errors.vlan?.message}>
                      <Input {...register("vlan")} placeholder="1042" />
                    </Field>
                    <Field label="DNS Primary" error={errors.dnsPrimary?.message}>
                      <Input {...register("dnsPrimary")} placeholder="8.8.8.8" className="font-mono" />
                    </Field>
                    <Field label="DNS Secondary" error={errors.dnsSecondary?.message}>
                      <Input {...register("dnsSecondary")} placeholder="1.1.1.1" className="font-mono" />
                    </Field>
                    <Field label="MAC Address" error={errors.macAddress?.message}>
                      <Input {...register("macAddress")} placeholder="aa:bb:cc:dd:ee:ff" className="font-mono" />
                    </Field>
                  </div>
                </TabsContent>

                <TabsContent value="owners" className="mt-0 space-y-4">
                  <div className="grid md:grid-cols-2 gap-3">
                    <Field label="Owner" error={errors.owner?.message}>
                      <Input {...register("owner")} placeholder="John Doe" />
                    </Field>
                    <Field label="Squad" error={errors.squad?.message}>
                      <Input {...register("squad")} placeholder="Platform Squad" />
                    </Field>
                    <Field label="Responsible Team" error={errors.team?.message}>
                      <Input {...register("team")} placeholder="Infrastructure" />
                    </Field>
                    <Field label="Manager" error={errors.manager?.message}>
                      <Input {...register("manager")} placeholder="Jane Manager" />
                    </Field>
                    <Field label="Cost Center" error={errors.costCenter?.message}>
                      <Input {...register("costCenter")} placeholder="CC-1042" />
                    </Field>
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="mt-0 space-y-4">
                  <Field label="Notes (Markdown supported)" error={errors.notes?.message}>
                    <Textarea rows={8} {...register("notes")} placeholder="**Runbook:** …&#10;- Backup at 02:00&#10;- Contact: ops@corp" />
                  </Field>
                  <Field label="Tags">
                    <Controller name="tags" control={control} render={({ field }) => (
                      <TagsInput value={field.value ?? []} onChange={field.onChange} />
                    )} />
                  </Field>
                </TabsContent>
              </div>
            </Tabs>

            <DialogFooter className="px-5 py-3 border-t border-border gap-2 sm:gap-2">
              <div className="mr-auto text-[11px] text-muted-foreground">
                {Object.keys(errors).length > 0
                  ? <span className="text-critical">{Object.keys(errors).length} field(s) need attention</span>
                  : isValid ? <span className="text-success">Ready to save</span> : "Fill required fields to enable Save"}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={requestClose}>Cancel</Button>
              <Button type="submit" size="sm" disabled={!isValid || submitting} className="gap-1.5">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Server
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <SummaryDialog
        open={summaryOpen}
        values={summaryOpen ? (getValues() as ServerFormValues) : null}
        onCancel={() => setSummaryOpen(false)}
        onConfirm={persist}
        submitting={submitting}
      />

      <AlertDialog open={confirmClose} onOpenChange={setConfirmClose}>
        <AlertDialogContent className="bg-gradient-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>You have unsaved changes. Closing now will lose them.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setConfirmClose(false); setOpen(false); reset(emptyServerForm); setTab("general"); }}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
      {error && <div className="text-[11px] text-critical" role="alert">{error}</div>}
    </div>
  );
}

function ControlledSelect({
  name, control, options, placeholder, onAfterChange,
}: { name: keyof ServerFormValues; control: ReturnType<typeof useForm<ServerFormValues>>["control"]; options: string[]; placeholder: string; onAfterChange?: () => void }) {
  return (
    <Controller
      name={name as never}
      control={control}
      render={({ field }) => (
        <Select value={(field.value as string) ?? ""} onValueChange={(v) => { field.onChange(v); onAfterChange?.(); }} disabled={options.length === 0}>
          <SelectTrigger className="h-9"><SelectValue placeholder={placeholder} /></SelectTrigger>
          <SelectContent>
            {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      )}
    />
  );
}
