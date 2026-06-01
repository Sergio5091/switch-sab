import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

import LoginPage from "@/pages/login";
import NotFound from "@/pages/not-found";

import SuperAdminDashboard from "@/pages/superadmin/dashboard";
import SuperAdminSalles from "@/pages/superadmin/salles";
import SuperAdminLicences from "@/pages/superadmin/licences";

const queryClient = new QueryClient();

function RoleRedirect() {
  const { currentUser, isLoading } = useApp();
  if (isLoading) return null;
  if (!currentUser) return <Redirect to="/login" />;
  switch (currentUser.role) {
    case "SUPERADMIN": return <Redirect to="/superadmin/dashboard" />;
    case "ADMIN":
    case "GERANT":
    case "CLIENT":
      return <Redirect to="/superadmin/dashboard" />;
    default: return <Redirect to="/login" />;
  }
}

function ProtectedRoute({
  component: Component,
  roles,
}: {
  component: React.ComponentType;
  roles: string[];
}) {
  const { currentUser, isLoading } = useApp();
  if (isLoading) return null;
  if (!currentUser) return <Redirect to="/login" />;
  if (!roles.includes(currentUser.role)) return <RoleRedirect />;
  return <Component />;
}

function LoginGuard() {
  const { currentUser, isLoading } = useApp();
  const [location] = useLocation();
  if (isLoading) return null;
  if (currentUser && location === "/login") return <RoleRedirect />;
  return <LoginPage />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RoleRedirect} />
      <Route path="/login" component={LoginGuard} />

      {/* Super Admin */}
      <Route path="/superadmin/dashboard">
        {() => <ProtectedRoute component={SuperAdminDashboard} roles={["SUPERADMIN"]} />}
      </Route>
      <Route path="/superadmin/salles">
        {() => <ProtectedRoute component={SuperAdminSalles} roles={["SUPERADMIN"]} />}
      </Route>
      <Route path="/superadmin/licences">
        {() => <ProtectedRoute component={SuperAdminLicences} roles={["SUPERADMIN"]} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AppProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
