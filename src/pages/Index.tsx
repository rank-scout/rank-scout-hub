import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustSection } from "@/components/home/TrustSection";
import { BigThreeSection } from "@/components/home/BigThreeSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { NewsSection } from "@/components/home/NewsSection";
import { MascotWidget } from "@/components/layout/MascotWidget";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { AdSenseBanner } from "@/components/ads/AdSenseBanner";
import { AmazonBanner } from "@/components/ads/AmazonBanner";
import { useGlobalAnalyticsCode } from "@/hooks/useGlobalAnalytics";
import { useSiteTitle, useSiteDescription, useHomeLayout } from "@/hooks/useSettings"; // Layout Hook
import { Loader2 } from "lucide-react"; // Lade-Icon

const Index = () => {
  const analyticsCode = useGlobalAnalyticsCode();
  const siteTitle = useSiteTitle();
  const siteDescription = useSiteDescription();
  
  // Layout laden
  const { layout } = useHomeLayout();

  useEffect(() => {
    document.title = siteTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", siteDescription);
  }, [siteTitle, siteDescription]);

  useEffect(() => {
    if (!analyticsCode) return;
    // ... Analytics Code Logik ...
  }, [analyticsCode]);

  return (
    <div className="min-h-screen flex flex-col relative bg-transparent">
      <Header />
      
      <main className="flex-grow">
        {layout.hero && <HeroSection />}
        
        {/* Strategische Werbung: Amazon oben */}
        {layout.amazon_top && <AmazonBanner format="horizontal" />}
        
        {layout.trust && <TrustSection />}
        {layout.big_three && <BigThreeSection />}
        
        {/* Strategische Werbung: Google Mitte */}
        {layout.adsense_middle && <AdSenseBanner slotId="placeholder-1" />}
        
        {layout.categories && <CategoriesSection />}
        {layout.news && <NewsSection />}
      </main>

      <Footer />
      
      {/* Floating Elements */}
      <ScrollToTop />
      {layout.mascot && <MascotWidget />}
    </div>
  );
};

export default Index;