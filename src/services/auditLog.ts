// In-memory audit log. Ready to be swapped for a persistent backend.
export type AuditAction = "create" | "update" | "delete";

export interface AuditEntry {
  id: string;
  timestamp: number;
  serverId: string;
  hostname: string;
  action: AuditAction;
  user: string;
}

class AuditLogService {
  private entries: AuditEntry[] = [];

  record(e: Omit<AuditEntry, "id" | "timestamp">): AuditEntry {
    const entry: AuditEntry = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      ...e,
    };
    this.entries.unshift(entry);
    return entry;
  }

  list(): AuditEntry[] { return this.entries; }
  listForServer(serverId: string): AuditEntry[] {
    return this.entries.filter((e) => e.serverId === serverId);
  }
}

export const auditLog = new AuditLogService();
