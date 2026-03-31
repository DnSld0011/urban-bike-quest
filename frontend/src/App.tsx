import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Stations from "@/pages/Stations";
import Bikes from "@/pages/Bikes";
import Trips from "@/pages/Trips";
import LiveMap from "@/pages/LiveMap";
import UsersPage from "@/pages/UsersPage";
import RolesPage from "@/pages/RolesPage";
import SettingsPage from "@/pages/SettingsPage";
import LoginPage from "@/pages/LoginPage";
import MaintenancePage from "@/pages/MaintenancePage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000, // 30 segundos
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Ruta pública */}
              <Route path="/login" element={<LoginPage />} />

              {/* Rutas protegidas dentro del layout */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/stations" element={<Stations />} />
                        <Route path="/bikes" element={<Bikes />} />
                        <Route path="/trips" element={<Trips />} />
                        <Route path="/map" element={<LiveMap />} />
                        <Route path="/users" element={<UsersPage />} />
                        <Route path="/roles" element={<RolesPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/maintenance" element={<MaintenancePage />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
