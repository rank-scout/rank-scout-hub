import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { BigThreeSection } from "@/components/home/BigThreeSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { NewsSection } from "@/components/home/NewsSection";
import { ForumSection } from "@/components/home/ForumSection";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { AdSenseBanner } from "@/components/ads/AdSenseBanner";
import { AmazonBanner } from "@/components/ads/AmazonBanner";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useGlobalAnalyticsCode } from "@/hooks/useGlobalAnalytics";
import { useSettings, useHomeLayout, useSiteTitle, useSiteDescription } from "@/hooks/useSettings";
import { Helmet } from "react-helmet-async"; 
import { AppTicker } from "@/components/home/AppTicker"; 
import { HowItWorksSection } from "@/components/home/HowItWorksSection"; 
import { HomeSEOText } from "@/components/home/HomeSEOText"; 
// KYRA FIX: Die Brechstange ist zurück.
import { useForceSEO } from "@/hooks/useForceSEO"; 

const Index = () => {
  const analyticsCode = useGlobalAnalyticsCode();
  const { data: settings, isLoading: isLoadingSettings } = useSettings();
  const siteTitle = useSiteTitle(); 
  const siteDescription = useSiteDescription();
  const { layout, sections, isLoading: isLoadingLayout } = useHomeLayout();

  // --- SAFE SEO DATA CONSTRUCTION ---
  const safeTitle = (typeof siteTitle === 'string' && siteTitle.length > 0) 
    ? siteTitle 
    : "Rank-Scout | Dein Vergleichsportal";
    
  const safeDescription = (typeof siteDescription === 'string' && siteDescription.length > 0) 
    ? siteDescription 
    : "Finde die besten Tools, Software und Finanzprodukte im unabhängigen Vergleich.";

  // Keywords: Versuche aus Settings zu laden, sonst Fallback
  // HINWEIS: Prüfe im Admin-Panel, ob der Key 'seo_keywords' wirklich gefüllt ist!
  const safeKeywords = (settings?.seo_keywords as string) || "Vergleich, Finanzen, Software, Testsieger, Rank-Scout, Erfahrungen, Test";

  // --- KYRA FIX: USE FORCE SEO ---
  // Wir rufen den Hook auf, um die Description hart in den DOM zu schreiben.
  // Das löst das Problem, dass Tools die Description manchmal "übersehen".
  useForceSEO(safeDescription);

  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 500); 
    return () => clearTimeout(timer);
  }, []);

  const seoHead = (
    <Helmet>
      {/* 1. Titel (Description wird zusätzlich durch useForceSEO gesetzt) */}
      <title>{safeTitle}</title>
      
      {/* Helmet Description als Backup/Standard React Weg */}
      <meta name="description" content={safeDescription} />
      
      {/* 2. Canonical (Fest auf Production Domain) */}
      <link rel="canonical" href="https://rank-scout.com/" />
      
      {/* 3. Robots */}
      <meta name="robots" content="index, follow" />
      
      {/* 4. Keywords & Autor */}
      <meta name="keywords" content={safeKeywords} />
      <meta name="author" content="Rank-Scout" />
      <meta name="publisher" content="Rank-Scout" />
      
      {/* 5. Open Graph */}
      <meta property="og:title" content={safeTitle} />
      <meta property="og:description" content={safeDescription} />
      <meta property="og:url" content="https://rank-scout.com/" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Rank-Scout" />
      <meta property="og:locale" content="de_DE" />

      {/* Analytics */}
      {analyticsCode && <script async src={`https://www.googletagmanager.com/gtag/js?id=${analyticsCode}`}></script>}
      {analyticsCode && (
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${analyticsCode}');
          `}
        </script>
      )}
    </Helmet>
  );

  if (isLoadingLayout || !minTimeElapsed || isLoadingSettings) {
      return (
        <>
          {seoHead}
          <LoadingScreen />
        </>
      );
  }

  const sectionComponents: Record<string, React.ReactNode> = {
    hero: <HeroSection />,
    amazon_top: <AmazonBanner format="horizontal" />,
    trust: <AppTicker />,
    how_it_works: <HowItWorksSection />, 
    big_three: <BigThreeSection />,
    adsense_middle: <AdSenseBanner slotId="placeholder-1" />,
    categories: <CategoriesSection />,
    forum: <ForumSection />,
    news: <NewsSection />,
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-white animate-in fade-in duration-500">
      {seoHead}
       
      <Header />
       
      <main className="flex-grow">
        <HeroSection />
        <AppTicker />
        <HowItWorksSection /> 

        {sections.find(s => s.id === 'news')?.enabled && <NewsSection />}

        <BigThreeSection />

        {layout.seo_text && <HomeSEOText />}

        {sections
          .filter(section => 
            section.enabled && 
            section.id !== 'mascot' && 
            section.id !== 'hero' && 
            section.id !== 'trust' &&
            section.id !== 'big_three' &&
            section.id !== 'how_it_works' && 
            section.id !== 'news' 
          )
          .map((section) => (
            <div key={section.id} className="w-full">
               {sectionComponents[section.id] || null}
            </div>
          ))
        }
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;