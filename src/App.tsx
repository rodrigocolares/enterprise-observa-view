import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppStoreProvider } from "@/store/AppStore";
import AppLayout from "@/components/AppLayout";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import ServerInventory from "./pages/ServerInventory";
import ServerDetail from "./pages/ServerDetail";
import DatadogObservability from "./pages/DatadogObservability";
import AlertCenter from "./pages/AlertCenter";
import IncidentManagement from "./pages/IncidentManagement";
import LifecycleManagement from "./pages/LifecycleManagement";
import ComplianceCenter from "./pages/ComplianceCenter";
import OperationalMap from "./pages/OperationalMap";
import CapacityPlanning from "./pages/CapacityPlanning";
import OperationalInsights from "./pages/OperationalInsights";
import DatadogConfiguration from "./pages/DatadogConfiguration";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner theme="dark" position="top-right" richColors />
      <AppStoreProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<ExecutiveDashboard />} />
              <Route path="/inventory" element={<ServerInventory />} />
              <Route path="/observability" element={<DatadogObservability />} />
              <Route path="/alerts" element={<AlertCenter />} />
              <Route path="/incidents" element={<IncidentManagement />} />
              <Route path="/lifecycle" element={<LifecycleManagement />} />
              <Route path="/compliance" element={<ComplianceCenter />} />
              <Route path="/map" element={<OperationalMap />} />
              <Route path="/capacity" element={<CapacityPlanning />} />
              <Route path="/insights" element={<OperationalInsights />} />
              <Route path="/datadog" element={<DatadogConfiguration />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppStoreProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
