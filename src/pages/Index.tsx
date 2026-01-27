import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustSection } from "@/components/home/TrustSection";
import { BigThreeSection } from "@/components/home/BigThreeSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { NewsSection } from "@/components/home/NewsSection";
import { ForumSection } from "@/components/home/ForumSection";
import { ArcadeSection } from "@/components/home/ArcadeSection";
import { MascotWidget } from "@/components/layout/MascotWidget";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { AdSenseBanner } from "@/components/ads/AdSenseBanner";
import { AmazonBanner } from "@/components/ads/AmazonBanner";
import { useGlobalAnalyticsCode } from "@/hooks/useGlobalAnalytics";
import { useSiteTitle, useSiteDescription, useHomeLayout } from "@/hooks/useSettings";

const Index = () => {
  const analyticsCode = useGlobalAnalyticsCode();
  const siteTitle = useSiteTitle();
  const siteDescription = useSiteDescription();
  
  // Layout-Einstellungen
  const { layout } = useHomeLayout();

  useEffect(() => {
    document.title = siteTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", siteDescription);
  }, [siteTitle, siteDescription]);

  useEffect(() => {
    if (!analyticsCode) return;
  }, [analyticsCode]);

  return (
    <div className="min-h-screen flex flex-col relative bg-transparent">
      <Header />
      
      <main className="flex-grow">
        {/* 1. HERO: Conversion Start */}
        {layout.hero && <HeroSection />}
        
        {/* 2. MONEY TILES: Sofortiger Revenue-Fokus (Dating, KI, Apps) - Overlaps Hero */}
        {layout.big_three && <BigThreeSection />}
        
        {/* 3. TRUST: Social Proof */}
        {layout.trust && <TrustSection />}

        {/* 4. ARCADE LOUNGE: Retention & Stickiness */}
        <ArcadeSection />
        
        {/* 5. AMAZON: Monetarisierung */}
        {layout.amazon_top && <AmazonBanner format="horizontal" />}
        
        {/* 6. KATEGORIEN: SEO Verteiler */}
        {layout.categories && <CategoriesSection />}
        
        {/* 7. LIVE PULSE: Erst Content (News), dann Interaktion (Forum) */}
        <div className="bg-slate-50 border-t border-slate-200">
             {layout.news && <NewsSection />}
             {layout.forum && <ForumSection />}
        </div>
        
        {/* 8. ADSENSE: Rest-Monetarisierung */}
        {layout.adsense_middle && <AdSenseBanner slotId="placeholder-1" />}
      </main>

      <Footer />
      
      <ScrollToTop />
      {layout.mascot && <MascotWidget />}
    </div>
  );
};

export default Index;