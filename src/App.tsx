import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SEOProvider } from "@/components/SEOProvider";
import { ThemeProvider } from "@/hooks/useTheme";
import AdminPublisher from "./pages/admin/MultiPublisher";
import { useSettings } from "@/hooks/useSettings"; // WICHTIG: useSettings statt useActiveTheme
import { useEffect, useLayoutEffect } from "react"; // useLayoutEffect für sofortiges Update

// Pages
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import GoRedirect from "./pages/GoRedirect";
import NotFound from "./pages/NotFound";
import Welcome from "./pages/Welcome";
import C4FRegistration from "./components/external/C4FRegistration";

// Forum Pages
import Forum from "./pages/Forum";
import ForumThread from "./pages/ForumThread";

// Legal Pages
import Impressum from "./pages/Impressum";
import AGB from "./pages/AGB";
import Datenschutz from "./pages/Datenschutz";

// Admin Pages
import AdminLogin from "./pages/admin/Login";
import AdminLayout from "./pages/admin/Layout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCategories from "./pages/admin/Categories";
import AdminProjects from "./pages/admin/Projects";
import AdminRedirects from "./pages/admin/Redirects";
import AdminFooterLinks from "./pages/admin/FooterLinks";
import AdminLeads from "./pages/admin/Leads";
import AdminSettings from "./pages/admin/Settings";
import AdminForum from "./pages/admin/Forum";

// Components
import { CookieBanner } from "./components/layout/CookieBanner";
import { ScrollToTopHandler } from "@/components/ScrollToTopHandler";
import { MascotWidget } from "@/components/layout/MascotWidget"; // NEU: Scouty importiert

const queryClient = new QueryClient();

// --- THEME MANAGER COMPONENT (OPTIMIERT) ---
const ThemeManager = () => {
  const { data: settings, isLoading } = useSettings();
  const activeTheme = settings?.active_theme as string;

  useLayoutEffect(() => {
    const cachedTheme = localStorage.getItem("app-theme");
    if (cachedTheme) {
      document.documentElement.setAttribute("data-theme", cachedTheme);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && activeTheme) {
      document.documentElement.setAttribute("data-theme", activeTheme);
      localStorage.setItem("app-theme", activeTheme);
    }
  }, [activeTheme, isLoading]);

  return null;
};

// --- SCOUTY WRAPPER ---
// Prüft die Settings, bevor Scouty gerendert wird
const ScoutyWrapper = () => {
  const { data: settings } = useSettings();
  const config = settings?.scouty_config as any || {};
  // Standardmäßig AN, wenn nicht explizit ausgeschaltet
  const isEnabled = config.enabled !== false;

  if (!isEnabled) return null;
  return <MascotWidget />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider defaultTheme="dark">
        {/* ThemeManager MUSS innerhalb der Provider stehen */}
        <ThemeManager /> 
        
        <SEOProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {/* Flags für v7 aktivieren -> Entfernt Warnungen */}
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <CookieBanner /> 
              <ScoutyWrapper /> {/* NEU: Hier ist Scouty eingebunden */}
              <ScrollToTopHandler />
              
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/kategorien" element={<Categories />} />
                <Route path="/kategorien/:slug" element={<CategoryDetail />} />
                <Route path="/go/:slug" element={<GoRedirect />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/test-register" element={<C4FRegistration />} />
                
                {/* Forum Routes */}
                <Route path="/forum" element={<Forum />} />
                <Route path="/forum/kategorie/:categorySlug" element={<Forum />} />
                <Route path="/forum/:slug" element={<ForumThread />} />
                
                {/* Legal Routes */}
                <Route path="/impressum" element={<Impressum />} />
                <Route path="/agb" element={<AGB />} />
                <Route path="/datenschutz" element={<Datenschutz />} />
                
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
                  <Route path="forum" element={<AdminForum />} />
                  <Route path="multi-publisher" element={<AdminPublisher />} />
                </Route>
                
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