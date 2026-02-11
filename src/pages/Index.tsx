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
// useForceSEO entfernt, da es den Crash verursacht hat
import { AppTicker } from "@/components/home/AppTicker"; 
import { HowItWorksSection } from "@/components/home/HowItWorksSection"; 
import { HomeSEOText } from "@/components/home/HomeSEOText"; 

const Index = () => {
  const analyticsCode = useGlobalAnalyticsCode();
  const { isLoading: isLoadingSettings } = useSettings();
  const siteTitle = useSiteTitle(); 
  const siteDescription = useSiteDescription();
  const { layout, sections, isLoading: isLoadingLayout } = useHomeLayout();

  // --- CRASH FIX START ---
  // Wir bauen den Seitentitel sicher zusammen, ohne useForceSEO
  const safeTitle = (typeof siteTitle === 'string' && siteTitle.length > 0) 
    ? siteTitle 
    : "Rank-Scout | Dein Vergleichsportal";
    
  const safeDescription = (typeof siteDescription === 'string' && siteDescription.length > 0) 
    ? siteDescription 
    : "Finde die besten Tools, Software und Finanzprodukte.";
  // --- CRASH FIX END ---

  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 500); 
    return () => clearTimeout(timer);
  }, []);

  const seoHead = (
    <Helmet>
      <title>{safeTitle}</title>
      <meta name="description" content={safeDescription} />
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

        <BigThreeSection />

        {layout.seo_text && <HomeSEOText />}

        {sections
          .filter(section => 
            section.enabled && 
            section.id !== 'mascot' && 
            section.id !== 'hero' && 
            section.id !== 'trust' &&
            section.id !== 'big_three'
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