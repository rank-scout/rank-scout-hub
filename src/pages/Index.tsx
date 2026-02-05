import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
// TrustSection brauchen wir nicht mehr importieren, da AppTicker das übernimmt
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
import { useForceSEO } from "@/hooks/useForceSEO"; 
import { AppTicker } from "@/components/home/AppTicker"; 
import { HowItWorksSection } from "@/components/home/HowItWorksSection"; // <--- NEU IMPORTIERT

const Index = () => {
  const analyticsCode = useGlobalAnalyticsCode();
  
  // DATEN AUS DER DATENBANK LADEN
  const { isLoading: isLoadingSettings } = useSettings();
  const globalSiteTitle = useSiteTitle(); 
  const globalSiteDescription = useSiteDescription(); 
  
  const { sections } = useHomeLayout();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!analyticsCode) return;
  }, [analyticsCode]);

  // --- SEO LOGIK STARTSEITE ---
  const finalTitle = globalSiteTitle || "Rank-Scout";
  const finalDescription = globalSiteDescription && globalSiteDescription.trim() !== "" 
    ? globalSiteDescription 
    : "Rank-Scout - Dein Vergleichsportal für Software, Finanzen und Dienstleistungen.";

  // BRECHSTANGE:
  useForceSEO(finalDescription);
  // ---------------------------

  if (!minTimeElapsed || isLoadingSettings) {
      return <LoadingScreen />;
  }

  const sectionComponents: Record<string, React.ReactNode> = {
    hero: <HeroSection />,
    amazon_top: <AmazonBanner format="horizontal" />,
    trust: <AppTicker />,
    how_it_works: <HowItWorksSection />, // <--- Registriert für alle Fälle
    big_three: <BigThreeSection />,
    adsense_middle: <AdSenseBanner slotId="placeholder-1" />,
    categories: <CategoriesSection />,
    forum: <ForumSection />,
    news: <NewsSection />,
  };

  const canonicalUrl = window.location.origin;

  return (
    <div className="min-h-screen flex flex-col relative bg-white animate-in fade-in duration-500">
      
      {/* Basis Helmet */}
      <Helmet>
        <title>{finalTitle}</title>
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={finalTitle} />
        <meta property="og:description" content={finalDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <Header />
      
      <main className="flex-grow">
        {/* --- TEIL 1: FESTE STRUKTUR (Die Premium-Führung) --- */}
        {/* Wir erzwingen diese Reihenfolge für maximalen Impact, unabhängig von der DB-Sortierung */}
        <HeroSection />
        <AppTicker />
        <HowItWorksSection /> 

        {/* --- TEIL 2: DYNAMISCHE SEKTIONEN --- */}
        {sections
          .filter(section => 
            section.enabled && 
            section.id !== 'mascot' && 
            section.id !== 'hero' && // Rausfiltern, da oben schon fest eingebaut
            section.id !== 'trust'   // Rausfiltern (ist der AppTicker oben)
          )
          .map((section) => (
            <div id={section.id} key={section.id} className="scroll-mt-28">
               {section.id !== 'seo' && sectionComponents[section.id]}
            </div>
          ))}
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;