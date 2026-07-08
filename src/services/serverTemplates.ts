import type { CreateServerInput } from "@/lib/mockData";

export type TemplateKey =
  | "windows-server" | "linux" | "oracle" | "sql-server"
  | "iis" | "file-server" | "sap";

export interface ServerTemplate {
  key: TemplateKey;
  label: string;
  values: Partial<CreateServerInput>;
}

export const SERVER_TEMPLATES: ServerTemplate[] = [
  {
    key: "windows-server", label: "Windows Server",
    values: {
      os: "Windows", version: "Windows Server 2022",
      environment: "Production", application: "Web Applications",
      criticality: "Medium", status: "online",
      cpu: 25, memory: 35, disk: 50,
      cpuCount: 4, cores: 8, ramGB: 32, diskTotalGB: 500, diskFreeGB: 250,
      tags: ["Windows", "Produção"],
    },
  },
  {
    key: "linux", label: "Linux",
    values: {
      os: "Linux", version: "CentOS Stream",
      environment: "Production", application: "APIs",
      criticality: "Medium", status: "online",
      cpu: 20, memory: 30, disk: 40,
      cpuCount: 4, cores: 8, ramGB: 16, diskTotalGB: 250, diskFreeGB: 150,
      tags: ["Linux", "Produção"],
    },
  },
  {
    key: "oracle", label: "Oracle Database",
    values: {
      os: "Linux", version: "CentOS 8",
      environment: "Production", application: "Oracle Database",
      criticality: "High", status: "online",
      cpu: 55, memory: 70, disk: 65,
      cpuCount: 16, cores: 32, ramGB: 256, diskTotalGB: 4000, diskFreeGB: 1400,
      tags: ["Oracle", "Database", "Critical", "Produção"],
    },
  },
  {
    key: "sql-server", label: "SQL Server",
    values: {
      os: "Windows", version: "Windows Server 2022",
      environment: "Production", application: "SQL Server",
      criticality: "High", status: "online",
      cpu: 50, memory: 68, disk: 60,
      cpuCount: 12, cores: 24, ramGB: 192, diskTotalGB: 3000, diskFreeGB: 1200,
      tags: ["Windows", "SQL", "Database", "Critical"],
    },
  },
  {
    key: "iis", label: "IIS Web Server",
    values: {
      os: "Windows", version: "Windows Server 2022",
      environment: "Production", application: "IIS",
      criticality: "Medium", status: "online",
      cpu: 30, memory: 40, disk: 35,
      cpuCount: 4, cores: 8, ramGB: 32, diskTotalGB: 300, diskFreeGB: 200,
      tags: ["Windows", "Web", "DMZ"],
    },
  },
  {
    key: "file-server", label: "File Server",
    values: {
      os: "Windows", version: "Windows Server 2019",
      environment: "Production", application: "File Server",
      criticality: "Medium", status: "online",
      cpu: 15, memory: 25, disk: 82,
      cpuCount: 4, cores: 8, ramGB: 32, diskTotalGB: 10000, diskFreeGB: 1800,
      tags: ["Windows", "Storage", "Backup"],
    },
  },
  {
    key: "sap", label: "SAP Application",
    values: {
      os: "Linux", version: "CentOS 8",
      environment: "Production", application: "SAP",
      criticality: "High", status: "online",
      cpu: 60, memory: 75, disk: 55,
      cpuCount: 24, cores: 48, ramGB: 512, diskTotalGB: 5000, diskFreeGB: 2200,
      tags: ["SAP", "Linux", "Critical", "Produção"],
    },
  },
];

export function findTemplate(key: TemplateKey): ServerTemplate | undefined {
  return SERVER_TEMPLATES.find((t) => t.key === key);
}
