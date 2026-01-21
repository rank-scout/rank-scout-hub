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
import { AdSenseBanner } from "@/components/ads/AdSenseBanner"; // NEU
import { AmazonBanner } from "@/components/ads/AmazonBanner"; // NEU
import { useGlobalAnalyticsCode } from "@/hooks/useGlobalAnalytics";
import { useSiteTitle, useSiteDescription } from "@/hooks/useSettings";

const Index = () => {
  const analyticsCode = useGlobalAnalyticsCode();
  const siteTitle = useSiteTitle();
  const siteDescription = useSiteDescription();

  useEffect(() => {
    document.title = siteTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", siteDescription);
  }, [siteTitle, siteDescription]);

  useEffect(() => {
    if (!analyticsCode) return;
    const existingScripts = document.querySelectorAll('script[data-analytics="global"]');
    existingScripts.forEach(script => script.remove());
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = analyticsCode;
    const scripts = tempDiv.querySelectorAll("script");
    scripts.forEach((script) => {
      const newScript = document.createElement("script");
      newScript.setAttribute("data-analytics", "global");
      Array.from(script.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      if (script.innerHTML) {
        newScript.innerHTML = script.innerHTML;
      }
      document.head.appendChild(newScript);
    });
    return () => {
      const addedScripts = document.querySelectorAll('script[data-analytics="global"]');
      addedScripts.forEach(script => script.remove());
    };
  }, [analyticsCode]);

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <Header />
      
      <main className="flex-grow">
        <HeroSection />
        
        {/* Strategische Werbung: Amazon oben (für Sales) */}
        <AmazonBanner format="horizontal" />
        
        <TrustSection />
        <BigThreeSection />
        
        {/* Strategische Werbung: Google Mitte (für Views) */}
        <AdSenseBanner slotId="placeholder-1" />
        
        <CategoriesSection />
        <NewsSection />
      </main>

      <Footer />
      
      {/* Floating Elements */}
      <ScrollToTop />
      <MascotWidget />
    </div>
  );
};

export default Index;