import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, Switch } from "wouter";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { getLogoPath } from "@/assets/logo-config";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Pricing from "./pages/Pricing";
import BuyCredits from "./pages/BuyCredits";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animated-bg">
      <div className="static-graphics"></div>
      <div className="geometric-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
        <div className="shape shape-6"></div>
      </div>
    </div>
    <div className="text-center relative z-10">
      <img 
        src={getLogoPath()} 
        alt="Silently AI Logo" 
        className="w-16 h-16 object-contain mx-auto mb-4 animate-pulse"
      />
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
      <Route path="/buy-credits">
        <ProtectedRoute>
          <BuyCredits />
        </ProtectedRoute>
      </Route>
      <Route path="/payment-success">
        <ProtectedRoute>
          <PaymentSuccess />
        </ProtectedRoute>
      </Route>
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
