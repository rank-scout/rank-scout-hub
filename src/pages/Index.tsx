import { useEffect, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustSection } from "@/components/home/TrustSection";
import { BigThreeSection } from "@/components/home/BigThreeSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { NewsSection } from "@/components/home/NewsSection";
import { ForumSection } from "@/components/home/ForumSection";
import { MascotWidget } from "@/components/layout/MascotWidget";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { AdSenseBanner } from "@/components/ads/AdSenseBanner";
import { AmazonBanner } from "@/components/ads/AmazonBanner";
import { useGlobalAnalyticsCode } from "@/hooks/useGlobalAnalytics";
import { 
  useSiteTitle, 
  useSiteDescription, 
  useHomeLayout 
} from "@/hooks/useSettings";

const Index = () => {
  const analyticsCode = useGlobalAnalyticsCode();
  const siteTitle = useSiteTitle();
  const siteDescription = useSiteDescription();
  
  // 1. Daten holen (Kommt als Array)
  const layoutData = useHomeLayout();

  // 2. Array in lesbares Objekt umwandeln (Map)
  const layout = useMemo(() => {
    // Standard: Alles AN (Fallback)
    const map: Record<string, boolean> = {
      hero: true,
      trust: true,
      big_three: true,
      categories: true,
      forum: true,
      news: true,
      mascot: true,
      seo: true,
      amazon_top: false,
      adsense_middle: false
    };

    // DB-Werte anwenden
    if (Array.isArray(layoutData)) {
      layoutData.forEach((item: any) => {
        if (item.id) {
          map[item.id] = item.is_active;
          
          // Kompatibilität: Falls in DB 'stats' steht, aktiviere 'big_three'
          if (item.id === 'stats') {
             map['big_three'] = item.is_active;
          }
        }
      });
    }

    return map;
  }, [layoutData]);

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
        
        {/* 7. Forum Teaser */}
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