import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { GlobalFilterBar } from "@/components/GlobalFilterBar";
import { useAppStore } from "@/store/AppStore";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppLayout() {
  const { loading } = useAppStore();
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 backdrop-blur px-3 md:px-4">
            <SidebarTrigger className="shrink-0" />
            <GlobalFilterBar />
          </header>
          <main className="flex-1 p-3 md:p-6 animate-fade-in">
            {loading ? <BootSkeleton /> : <Outlet />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function BootSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-72 rounded-lg" />
        <Skeleton className="h-72 rounded-lg" />
      </div>
    </div>
  );
}
