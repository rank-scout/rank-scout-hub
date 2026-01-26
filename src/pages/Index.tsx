import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustSection } from "@/components/home/TrustSection";
import { BigThreeSection } from "@/components/home/BigThreeSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { NewsSection } from "@/components/home/NewsSection";
import { ForumSection } from "@/components/home/ForumSection"; // <--- WICHTIG: Der Import
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
  
  // Layout-Einstellungen aus der Datenbank laden
  const { layout } = useHomeLayout();

  useEffect(() => {
    // Seitentitel und Meta-Description setzen
    document.title = siteTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", siteDescription);
  }, [siteTitle, siteDescription]);

  useEffect(() => {
    if (!analyticsCode) return;
    // Hier könnte Analytics-Logik stehen
  }, [analyticsCode]);

  return (
    <div className="min-h-screen flex flex-col relative bg-transparent">
      <Header />
      
      <main className="flex-grow">
        {/* 1. Hero Bereich */}
        {layout.hero && <HeroSection />}
        
        {/* 2. Amazon Werbung (Top) */}
        {layout.amazon_top && <AmazonBanner format="horizontal" />}
        
        {/* 3. Trust Elemente (Siegel etc.) */}
        {layout.trust && <TrustSection />}

        {/* 4. Die großen Drei (Top Features) */}
        {layout.big_three && <BigThreeSection />}
        
        {/* 5. Google AdSense (Mitte) */}
        {layout.adsense_middle && <AdSenseBanner slotId="placeholder-1" />}
        
        {/* 6. Kategorien-Übersicht */}
        {layout.categories && <CategoriesSection />}
        
        {/* 7. NEU: Forum Teaser (Community Beiträge) */}
        {/* Wird angezeigt, wenn 'Forum' im Layout-Admin aktiv ist */}
        {layout.forum && <ForumSection />}
        
        {/* 8. SEO News & Text */}
        {layout.news && <NewsSection />}
      </main>

      <Footer />
      
      {/* Schwebende Elemente */}
      <ScrollToTop />
      {layout.mascot && <MascotWidget />}
    </div>
  );
};

export default Index;