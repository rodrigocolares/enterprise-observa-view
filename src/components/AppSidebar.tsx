import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Server, Activity, BellRing, AlertOctagon, History,
  ShieldCheck, Map, TrendingUp, Sparkles, Plug, Settings as SettingsIcon, Radar,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Executive Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Server Inventory", url: "/inventory", icon: Server },
  { title: "Datadog Observability", url: "/observability", icon: Activity },
  { title: "Alert Center", url: "/alerts", icon: BellRing },
  { title: "Incident Management", url: "/incidents", icon: AlertOctagon },
  { title: "Lifecycle Management", url: "/lifecycle", icon: History },
  { title: "Compliance Center", url: "/compliance", icon: ShieldCheck },
  { title: "Operational Map", url: "/map", icon: Map },
  { title: "Capacity Planning", url: "/capacity", icon: TrendingUp },
  { title: "Operational Insights", url: "/insights", icon: Sparkles },
  { title: "Datadog Configuration", url: "/datadog", icon: Plug },
  { title: "Settings", url: "/settings", icon: SettingsIcon },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="relative grid h-9 w-9 place-items-center rounded-md bg-gradient-primary shadow-glow">
            <Radar className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">DC Mission Control</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Observability Platform</div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>NOC</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <NavLink to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
