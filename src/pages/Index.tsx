import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustSection } from "@/components/home/TrustSection";
import { BigThreeSection } from "@/components/home/BigThreeSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { NewsSection } from "@/components/home/NewsSection";
import { ForumSection } from "@/components/home/ForumSection";
// import { SEOContentSection } from "@/components/home/SEOContentSection"; // VORSICHT: Hier könnte der Casino-Text im Body stehen!
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { AdSenseBanner } from "@/components/ads/AdSenseBanner";
import { AmazonBanner } from "@/components/ads/AmazonBanner";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useGlobalAnalyticsCode } from "@/hooks/useGlobalAnalytics";
import { 
  useSettings, 
  useSiteTitle, 
  useSiteDescription, 
  useHomeLayout,
  // useHomeContent // Brauchen wir nicht für SEO, das verseucht nur!
} from "@/hooks/useSettings";
import { SEO } from "@/components/SEO";

const Index = () => {
  const analyticsCode = useGlobalAnalyticsCode();
  
  const { isLoading: isLoadingSettings } = useSettings();
  
  // 1. HOL DIR NUR DIE SAUBEREN DATEN VOM ADMIN PANEL
  const globalSiteTitle = useSiteTitle();
  const globalSiteDescription = useSiteDescription();
  
  const { sections } = useHomeLayout();
  // const { content } = useHomeContent(); // Deaktiviert, damit keine alten Daten reinspucken
  
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!analyticsCode) return;
  }, [analyticsCode]);

  if (!minTimeElapsed || isLoadingSettings) {
      return <LoadingScreen />;
  }

  const sectionComponents: Record<string, React.ReactNode> = {
    hero: <HeroSection />,
    amazon_top: <AmazonBanner format="horizontal" />,
    trust: <TrustSection />,
    big_three: <BigThreeSection />,
    adsense_middle: <AdSenseBanner slotId="placeholder-1" />,
    categories: <CategoriesSection />,
    forum: <ForumSection />,
    news: <NewsSection />,
    // seo: <SEOContentSection /> // Deaktiviert, falls der Text unten auf der Seite steht
  };

  // --- DER ECHTE FIX ---
  // Wir ignorieren ALLES, was von der "Page Content" Logik kommt.
  // Wir zwingen React, NUR das zu nehmen, was du im Admin unter "Einstellungen" eingetippt hast.
  
  const finalTitle = globalSiteTitle || "Rank-Scout";
  const finalDescription = globalSiteDescription || "Dein unabhängiges Vergleichsportal.";

  return (
    <div className="min-h-screen flex flex-col relative bg-white animate-in fade-in duration-500">
      {/* Hier wird hart überschrieben */}
      <SEO 
        title={finalTitle} 
        description={finalDescription} 
        canonical={window.location.origin}
      />
      
      <Header />
      
      <main className="flex-grow">
        {sections
          .filter(section => section.enabled && section.id !== 'mascot')
          .map((section) => (
            <div id={section.id} key={section.id} className="scroll-mt-28">
               {/* Sicherstellen, dass die SEO Section nicht gerendert wird, wenn sie auskommentiert ist */}
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