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
import { useForceSEO } from "@/hooks/useForceSEO"; 
import { AppTicker } from "@/components/home/AppTicker"; 
import { HowItWorksSection } from "@/components/home/HowItWorksSection"; 
import { HomeSEOText } from "@/components/home/HomeSEOText"; 

const Index = () => {
  const analyticsCode = useGlobalAnalyticsCode();
  const { isLoading: isLoadingSettings } = useSettings();
  const globalSiteTitle = useSiteTitle(); 
  const globalSiteDescription = useSiteDescription(); 
  
  // Layout Config laden
  const { sections, layout } = useHomeLayout();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const canonicalUrl = window.location.origin;

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!analyticsCode) return;
  }, [analyticsCode]);

  const finalTitle = globalSiteTitle || "Rank-Scout";
  const finalDescription = globalSiteDescription && globalSiteDescription.trim() !== "" 
    ? globalSiteDescription 
    : "Rank-Scout - Dein Vergleichsportal für Software, Finanzen und Dienstleistungen.";

  useForceSEO(finalDescription);

  // KYRA UPDATE: SEO-Metadaten isoliert, damit sie immer laden
  const seoHead = (
    <Helmet>
      <title>{finalTitle}</title>
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
    </Helmet>
  );

  if (!minTimeElapsed || isLoadingSettings) {
      // KYRA FIX: SEO Head wird jetzt AUCH während des Ladens ausgegeben
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
        {/* 1. Der Einstieg: Authority & Vertrauen */}
        <HeroSection />
        <AppTicker />
        <HowItWorksSection /> 

        {/* 2. Die Auswahl: Big Three */}
        <BigThreeSection />

        {/* 3. Der Content: Redaktioneller Text (Jetzt hier platziert!) */}
        {layout.seo_text && <HomeSEOText />}

        {/* 4. Der Deep Dive: Kategorien, News etc. */}
        {sections
          .filter(section => 
            section.enabled && 
            section.id !== 'mascot' && 
            section.id !== 'hero' && 
            section.id !== 'trust' &&
            section.id !== 'big_three' // Auch rausfiltern, da oben fest verbaut
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