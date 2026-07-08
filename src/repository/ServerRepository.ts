// Repository layer for Server entities. In-memory implementation today,
// ready to be swapped for an HTTP/database backend without touching callers.
import { createServer, CreateServerInput, Server } from "@/lib/mockData";
import { auditLog } from "@/services/auditLog";

export interface ServerPatch extends Partial<CreateServerInput> {}

class ServerRepositoryImpl {
  private data: Server[] = [];
  private counter = 0;

  seed(servers: Server[]) {
    this.data = servers;
    // Advance counter past any existing SRV-###### ids
    for (const s of servers) {
      const m = /^SRV-(\d+)$/.exec(s.id);
      if (m) this.counter = Math.max(this.counter, parseInt(m[1], 10));
    }
  }

  list(): Server[] { return this.data; }

  getById(id: string): Server | undefined {
    return this.data.find((s) => s.id === id);
  }

  private nextId(): string {
    this.counter += 1;
    return `SRV-${String(this.counter).padStart(6, "0")}`;
  }

  existsHostname(hostname: string, excludeId?: string): boolean {
    const h = hostname.trim().toLowerCase();
    return this.data.some((s) => s.hostname.toLowerCase() === h && s.id !== excludeId);
  }

  existsIp(ip: string, excludeId?: string): boolean {
    if (!ip) return false;
    return this.data.some((s) => s.ipAddress === ip && s.id !== excludeId);
  }

  createServer(input: CreateServerInput, user = "system"): Server {
    if (this.existsHostname(input.hostname)) {
      throw new Error(`Hostname "${input.hostname}" already exists`);
    }
    if (input.ipAddress && this.existsIp(input.ipAddress)) {
      throw new Error(`IP address "${input.ipAddress}" already exists`);
    }
    const base = createServer(input);
    const server: Server = { ...base, id: this.nextId() };
    this.data.unshift(server);
    auditLog.record({ serverId: server.id, hostname: server.hostname, action: "create", user });
    return server;
  }

  updateServer(id: string, patch: ServerPatch, user = "system"): Server {
    const idx = this.data.findIndex((s) => s.id === id);
    if (idx < 0) throw new Error("Server not found");
    const next: Server = { ...this.data[idx], ...patch, updatedAt: Date.now() } as Server;
    this.data[idx] = next;
    auditLog.record({ serverId: id, hostname: next.hostname, action: "update", user });
    return next;
  }

  deleteServer(id: string, user = "system"): void {
    const idx = this.data.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const [removed] = this.data.splice(idx, 1);
    auditLog.record({ serverId: id, hostname: removed.hostname, action: "delete", user });
  }

  listServers(): Server[] { return this.list(); }
  getServer(id: string): Server | undefined { return this.getById(id); }
}

export const serverRepository = new ServerRepositoryImpl();
export type ServerRepository = typeof serverRepository;
