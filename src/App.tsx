import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import SEOProvider from "@/components/SEOProvider";
import { ScrollToTopHandler } from "@/components/ScrollToTopHandler";

// Pages Imports - Basierend auf Git-Struktur
import Index from "@/pages/Index";
import Forum from "@/pages/Forum";
import ForumThread from "@/pages/ForumThread";
import Categories from "@/pages/Categories";
import CategoryDetail from "@/pages/CategoryDetail";
import AGB from "@/pages/AGB";
import Impressum from "@/pages/Impressum";
import Datenschutz from "@/pages/Datenschutz";
import GoRedirect from "@/pages/GoRedirect";
import Welcome from "@/pages/Welcome";
import AdminLogin from "@/pages/admin/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminProjects from "@/pages/admin/Projects";
import AdminCategories from "@/pages/admin/Categories";
import AdminFooterLinks from "@/pages/admin/FooterLinks";
import AdminRedirects from "@/pages/admin/Redirects";
import AdminSettings from "@/pages/admin/Settings";
import AdminLayout from "@/pages/admin/Layout";
import AdminLeads from "@/pages/admin/Leads";
import AdminMultiPublisher from "@/pages/admin/MultiPublisher";
import AdminForum from "@/pages/admin/Forum";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

// Authentifizierungsschutz
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Laden...</div>;
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SEOProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter 
            future={{ 
              v7_startTransition: true, 
              v7_relativeSplatPath: true 
            }}
          >
            <ScrollToTopHandler />
            <Routes>
              {/* Public Area */}
              <Route path="/" element={<Index />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/forum/:slug" element={<ForumThread />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/category/:slug" element={<CategoryDetail />} />
              <Route path="/agb" element={<AGB />} />
              <Route path="/impressum" element={<Impressum />} />
              <Route path="/datenschutz" element={<Datenschutz />} />
              <Route path="/go/:slug" element={<GoRedirect />} />
              <Route path="/welcome" element={<Welcome />} />
              
              {/* Admin Area */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="projects" element={<AdminProjects />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="footer-links" element={<AdminFooterLinks />} />
                <Route path="redirects" element={<AdminRedirects />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="leads" element={<AdminLeads />} />
                <Route path="multi-publisher" element={<AdminMultiPublisher />} />
                <Route path="forum" element={<AdminForum />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SEOProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;