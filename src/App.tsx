import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { HelmetProvider, Helmet } from "react-helmet-async"; 
import { ThemeProvider } from "@/hooks/useTheme";
import { useSettings } from "@/hooks/useSettings"; 
import { useEffect, useLayoutEffect } from "react"; 
import TopApps from "./pages/TopApps"; 

// Pages
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import GoRedirect from "./pages/GoRedirect";
import NotFound from "./pages/NotFound";
import Welcome from "./pages/Welcome";
import C4FRegistration from "./components/external/C4FRegistration";
import Contact from "./pages/Contact"; // NEU IMPORTIERT

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
import AdminPublisher from "./pages/admin/MultiPublisher";
import AdminApps from "./pages/admin/Apps"; 

// Components
import { CookieBanner } from "./components/layout/CookieBanner";
import { ScrollToTopHandler } from "@/components/ScrollToTopHandler";
import { MascotWidget } from "@/components/layout/MascotWidget"; 
import { ScrollToAnchor } from "@/components/ScrollToAnchor";

const queryClient = new QueryClient();

// --- THEME MANAGER COMPONENT ---
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

// --- ANALYTICS WRAPPER (GA4 & GSC) ---
const AnalyticsWrapper = () => {
  const { data: settings } = useSettings();
  
  useEffect(() => {
    if (settings?.google_analytics_id) {
      const scriptId = 'ga4-script';
      if (!document.getElementById(scriptId)) {
        // Load GA4 Script
        const script = document.createElement('script');
        script.id = scriptId;
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`;
        document.head.appendChild(script);

        // Init GA4
        const inlineScript = document.createElement('script');
        inlineScript.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${settings.google_analytics_id}');
        `;
        document.head.appendChild(inlineScript);
      }
    }
  }, [settings?.google_analytics_id]);

  return (
    <>
      {settings?.google_search_console_verification && (
        <Helmet>
          <meta name="google-site-verification" content={settings.google_search_console_verification} />
        </Helmet>
      )}
    </>
  );
};

// --- SCOUTY WRAPPER ---
const ScoutyWrapper = () => {
  const { data: settings } = useSettings();
  const config = settings?.scouty_config as any || {};
  const isEnabled = config.enabled !== false;

  if (!isEnabled) return null;
  return <MascotWidget />;
};

// --- MAIN APP ---
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider defaultTheme="dark">
        <ThemeManager /> 
        
        {/* WICHTIG: Hier nutzen wir den originalen HelmetProvider. */}
        <HelmetProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            
            <AnalyticsWrapper /> {/* NEU: Analytics Injected Here */}

            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <CookieBanner /> 
              <ScoutyWrapper /> 
              
              <ScrollToTopHandler /> 
               
              
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/kategorien" element={<Categories />} />
                <Route path="/kategorien/:slug" element={<CategoryDetail />} />
                <Route path="/go/:slug" element={<GoRedirect />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/test-register" element={<C4FRegistration />} />
                
                {/* NEUE PUBLIC ROUTE: Kontakt & Top Apps */}
                <Route path="/kontakt" element={<Contact />} />
                <Route path="/top-apps" element={<TopApps />} />
                
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
                  <Route path="apps" element={<AdminApps />} />
                </Route>
                
                {/* WICHTIG: Catch-All für Interne Seiten (Root-Level Slugs) */}
                <Route path="/:slug" element={<CategoryDetail />} />

                {/* 404 Not Found */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </HelmetProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;