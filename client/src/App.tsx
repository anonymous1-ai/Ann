import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, Switch } from "wouter";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-amber-950/20 to-slate-950 flex items-center justify-center">
    <div className="animated-bg">
      <div className="particles">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="particle"></div>
        ))}
      </div>
      <div className="circuit-pattern"></div>
      <div className="geometric-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>
    </div>
    <div className="text-center relative z-10">
      <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4 golden-glow"></div>
      <div className="text-gold text-xl font-semibold">Loading...</div>
      <div className="text-yellow-200/70 text-sm mt-2">Initializing your luxury workspace</div>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return user ? <>{children}</> : <Auth />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return user ? <Dashboard /> : <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Switch>
      <Route path="/">
        <PublicRoute>
          <Index />
        </PublicRoute>
      </Route>
      <Route path="/auth">
        <PublicRoute>
          <Auth />
        </PublicRoute>
      </Route>
      <Route path="/pricing" component={Pricing} />
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <AppRoutes />
        </Router>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
