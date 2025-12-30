import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import TrackingScripts from "@/components/tracking/TrackingScripts";
import CookieConsent from "@/components/tracking/CookieConsent";
import Index from "./pages/Index";
import Inventory from "./pages/Inventory";
import VehicleDetail from "./pages/VehicleDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import SellYourCar from "./pages/SellYourCar";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import InventoryManagement from "./pages/admin/InventoryManagement";
import LeadsManagement from "./pages/admin/LeadsManagement";
import SellRequestsManagement from "./pages/admin/SellRequestsManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import FAQManagement from "./pages/admin/FAQManagement";
import NotFound from "./pages/NotFound";
import { Suspense, lazy } from "react";

// Global Styles & Fonts
import './index.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// Lazy load the heaviest page
const PreApproval = lazy(() => import("./pages/PreApproval"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <ScrollToTop />
        <TrackingScripts />
        <CookieConsent />
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/vehicle/:id" element={<VehicleDetail />} />
            <Route path="/pre-approval" element={<PreApproval />} />
            <Route path="/sell-your-car" element={<SellYourCar />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />

            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="inventory" element={<InventoryManagement />} />
              <Route path="leads" element={<LeadsManagement />} />
              <Route path="sell-requests" element={<SellRequestsManagement />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="faqs" element={<FAQManagement />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
