import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SEOProvider } from "@/components/SEOProvider";
import { ThemeProvider } from "@/hooks/useTheme";
import AdminPublisher from "./pages/admin/Publisher";

// Pages
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import GoRedirect from "./pages/GoRedirect";
import NotFound from "./pages/NotFound";
import Welcome from "./pages/Welcome";
import C4FRegistration from "./components/external/C4FRegistration";
import AdminLogin from "./pages/admin/Login";
import AdminLayout from "./pages/admin/Layout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCategories from "./pages/admin/Categories";
import AdminProjects from "./pages/admin/Projects";
import AdminRedirects from "./pages/admin/Redirects";
import AdminFooterLinks from "./pages/admin/FooterLinks";
import AdminLeads from "./pages/admin/Leads";
import AdminSettings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider defaultTheme="dark">
        <SEOProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/kategorien" element={<Categories />} />
                <Route path="/kategorien/:slug" element={<CategoryDetail />} />
                <Route path="/go/:slug" element={<GoRedirect />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/test-register" element={<C4FRegistration />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="projects" element={<AdminProjects />} />
                  <Route path="redirects" element={<AdminRedirects />} />
                  <Route path="footer-links" element={<AdminFooterLinks />} />
                  <Route path="leads" element={<AdminLeads />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="/admin/publisher" element={<AdminPublisher />} />
                </Route>
                
                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SEOProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
