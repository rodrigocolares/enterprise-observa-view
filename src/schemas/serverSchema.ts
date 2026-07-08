import { z } from "zod";

const IPV4 = /^(25[0-5]|2[0-4]\d|[01]?\d?\d)(\.(25[0-5]|2[0-4]\d|[01]?\d?\d)){3}$/;
const IPV6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|::([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,6}(:[0-9a-fA-F]{1,4})+)$/;
const MAC = /^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/;

const optionalString = z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined));

export const serverFormSchema = z.object({
  // General
  hostname: z.string().trim().min(1, "Hostname is required").max(120),
  fqdn: optionalString,
  alias: optionalString,
  os: z.enum(["Windows", "Linux"], { required_error: "OS is required" }),
  version: z.string().trim().min(1, "Version is required").max(80),
  environment: z.enum(["Production", "Homologation", "Development"], { required_error: "Environment is required" }),
  application: z.string().trim().min(1, "Application is required").max(80),
  datacenter: z.enum(["SP01", "SP02", "DR01"], { required_error: "Datacenter is required" }),
  status: z.enum(["online", "offline", "warning"], { required_error: "Status is required" }),
  criticality: z.enum(["High", "Medium", "Low"], { required_error: "Criticality is required" }),

  // Hardware
  cpuCount: z.coerce.number().int().min(0).max(1024).optional(),
  cores: z.coerce.number().int().min(0).max(4096).optional(),
  ramGB: z.coerce.number().min(0).max(16384).optional(),
  diskTotalGB: z.coerce.number().min(0).max(1_000_000).optional(),
  diskFreeGB: z.coerce.number().min(0).max(1_000_000).optional(),
  cpu: z.coerce.number().min(0).max(100).default(10),
  memory: z.coerce.number().min(0).max(100).default(10),
  disk: z.coerce.number().min(0).max(100).default(10),

  // Network
  ipAddress: z.string().trim().regex(IPV4, "Invalid IPv4 address").optional().or(z.literal("").transform(() => undefined)),
  ipv6: z.string().trim().regex(IPV6, "Invalid IPv6 address").optional().or(z.literal("").transform(() => undefined)),
  gateway: z.string().trim().regex(IPV4, "Invalid gateway (IPv4)").optional().or(z.literal("").transform(() => undefined)),
  vlan: optionalString,
  dnsPrimary: z.string().trim().regex(IPV4, "Invalid IPv4 address").optional().or(z.literal("").transform(() => undefined)),
  dnsSecondary: z.string().trim().regex(IPV4, "Invalid IPv4 address").optional().or(z.literal("").transform(() => undefined)),
  macAddress: z.string().trim().regex(MAC, "Invalid MAC address (aa:bb:cc:dd:ee:ff)").optional().or(z.literal("").transform(() => undefined)),

  // Owners
  owner: optionalString,
  squad: optionalString,
  team: optionalString,
  manager: optionalString,
  costCenter: optionalString,

  // Notes + tags
  notes: z.string().trim().max(5000).optional().or(z.literal("").transform(() => undefined)),
  tags: z.array(z.string().min(1).max(40)).max(30).default([]),
}).superRefine((data, ctx) => {
  if (data.diskTotalGB != null && data.diskFreeGB != null && data.diskFreeGB > data.diskTotalGB) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["diskFreeGB"],
      message: "Free disk cannot exceed total disk",
    });
  }
});

export type ServerFormValues = z.infer<typeof serverFormSchema>;

export const emptyServerForm: ServerFormValues = {
  hostname: "", fqdn: undefined, alias: undefined,
  os: undefined as unknown as ServerFormValues["os"],
  version: "",
  environment: undefined as unknown as ServerFormValues["environment"],
  application: "",
  datacenter: undefined as unknown as ServerFormValues["datacenter"],
  status: undefined as unknown as ServerFormValues["status"],
  criticality: undefined as unknown as ServerFormValues["criticality"],
  cpuCount: undefined, cores: undefined, ramGB: undefined,
  diskTotalGB: undefined, diskFreeGB: undefined,
  cpu: 10, memory: 10, disk: 10,
  ipAddress: undefined, ipv6: undefined, gateway: undefined,
  vlan: undefined, dnsPrimary: undefined, dnsSecondary: undefined, macAddress: undefined,
  owner: undefined, squad: undefined, team: undefined, manager: undefined, costCenter: undefined,
  notes: undefined,
  tags: [],
};
