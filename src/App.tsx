import { lazy, Suspense, useEffect, useLayoutEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { HelmetProvider, Helmet } from "react-helmet-async"; 
import { ThemeProvider } from "@/hooks/useTheme";
import { useSettings } from "@/hooks/useSettings"; 
import { LoadingScreen } from "./components/ui/LoadingScreen";
import { supabase } from "@/integrations/supabase/client"; // Hebel C Import

// --- LAYOUT KOMPONENTEN ---
import { CookieBanner } from "./components/layout/CookieBanner";
import { ScrollToTopHandler } from "@/components/ScrollToTopHandler";
import { MascotWidget } from "@/components/layout/MascotWidget"; 

// --- KRITISCHE SEITE ---
import Index from "./pages/Index";

// --- LAZY LOADED SEITEN ---
const Categories = lazy(() => import("./pages/Categories"));
const CategoryDetail = lazy(() => import("./pages/CategoryDetail"));
const TopApps = lazy(() => import("./pages/TopApps"));
const Forum = lazy(() => import("./pages/Forum"));
const ForumThread = lazy(() => import("./pages/ForumThread"));
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminLayout = lazy(() => import("./pages/admin/Layout"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminCategories = lazy(() => import("./pages/admin/Categories"));
const AdminProjects = lazy(() => import("./pages/admin/Projects"));
const AdminRedirects = lazy(() => import("./pages/admin/Redirects"));
const AdminFooterLinks = lazy(() => import("./pages/admin/FooterLinks"));
const AdminLeads = lazy(() => import("./pages/admin/Leads"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminForum = lazy(() => import("./pages/admin/Forum"));
const AdminPublisher = lazy(() => import("./pages/admin/MultiPublisher"));
const AdminApps = lazy(() => import("./pages/admin/Apps"));
const Contact = lazy(() => import("./pages/Contact"));
const Impressum = lazy(() => import("./pages/Impressum"));
const AGB = lazy(() => import("./pages/AGB"));
const Datenschutz = lazy(() => import("./pages/Datenschutz"));
const HowWeCompare = lazy(() => import("./pages/HowWeCompare")); // <-- NEU: Trust-Seite
const GoRedirect = lazy(() => import("./pages/GoRedirect"));
const Welcome = lazy(() => import("./pages/Welcome"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// --- THEME MANAGER ---
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

// --- ANALYTICS WRAPPER ---
const AnalyticsWrapper = () => {
  const { data: settings } = useSettings();
  
  useEffect(() => {
    if (settings?.google_analytics_id) {
      const timer = setTimeout(() => {
        const scriptId = 'ga4-script';
        if (!document.getElementById(scriptId)) {
          const script = document.createElement('script');
          script.id = scriptId;
          script.async = true;
          script.src = `https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`;
          document.head.appendChild(script);

          const inlineScript = document.createElement('script');
          inlineScript.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${settings.google_analytics_id}');
          `;
          document.head.appendChild(inlineScript);
        }
      }, 3500);

      return () => clearTimeout(timer);
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
const App = () => {
  // HEBEL C: PARALLEL LOADING LOGIK
  useEffect(() => {
    // 1. Settings sofort parallel ziehen
    queryClient.prefetchQuery({
      queryKey: ["settings"],
      queryFn: async () => {
        const { data, error } = await supabase.from("settings").select("*");
        if (error) throw error;
        const settings: Record<string, any> = {};
        data?.forEach((row) => { settings[row.key] = row.value; });
        return settings;
      }
    });

    // 2. Kategorien sofort parallel ziehen
    queryClient.prefetchQuery({
      queryKey: ["categories", false],
      queryFn: async () => {
        const { data, error } = await supabase.from("categories").select("*").eq("is_active", true).order("sort_order");
        if (error) throw error;
        return data;
      }
    });

    // 3. Promoted Apps sofort parallel ziehen (Limit 15 wie im Ticker)
    queryClient.prefetchQuery({
      queryKey: ["promoted-apps-weighted", 15],
      queryFn: async () => {
        const { data, error } = await supabase.from("promoted_apps").select("*").eq("is_active", true);
        if (error) throw error;
        return data; 
      }
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark">
          <ThemeManager /> 
          <HelmetProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AnalyticsWrapper /> 

              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <CookieBanner /> 
                <ScoutyWrapper /> 
                <ScrollToTopHandler /> 
                
                <Suspense fallback={<LoadingScreen />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/kategorien" element={<Categories />} />
                    <Route path="/top-apps" element={<TopApps />} />
                    <Route path="/go/:slug" element={<GoRedirect />} />
                    <Route path="/welcome" element={<Welcome />} />
                    
                    <Route path="/forum" element={<Forum />} />
                    <Route path="/forum/kategorie/:categorySlug" element={<Forum />} />
                    <Route path="/forum/:slug" element={<ForumThread />} />
                    
                    <Route path="/kontakt" element={<Contact />} />
                    <Route path="/impressum" element={<Impressum />} />
                    <Route path="/agb" element={<AGB />} />
                    <Route path="/datenschutz" element={<Datenschutz />} />
                    <Route path="/wie-wir-vergleichen" element={<HowWeCompare />} /> {/* <-- NEU: Trust-Seite */}
                    
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
                    
                    <Route path="/:slug" element={<CategoryDetail />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </HelmetProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;