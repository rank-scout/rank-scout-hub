import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { BigThreeSection } from "@/components/home/BigThreeSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { useGlobalAnalyticsCode } from "@/hooks/useGlobalAnalytics";

const Index = () => {
  const analyticsCode = useGlobalAnalyticsCode();

  // Inject global analytics code into <head> - only for main page (rank-scout)
  useEffect(() => {
    if (!analyticsCode) return;
    
    // Remove existing global analytics scripts
    const existingScripts = document.querySelectorAll('script[data-analytics="global"]');
    existingScripts.forEach(script => script.remove());
    
    // Parse the analytics code
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = analyticsCode;
    
    // Extract and inject script tags into head
    const scripts = tempDiv.querySelectorAll("script");
    scripts.forEach((script) => {
      const newScript = document.createElement("script");
      newScript.setAttribute("data-analytics", "global");
      
      // Copy all attributes
      Array.from(script.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      // Copy inline content
      if (script.innerHTML) {
        newScript.innerHTML = script.innerHTML;
      }
      
      document.head.appendChild(newScript);
    });
    
    return () => {
      // Cleanup on unmount
      const addedScripts = document.querySelectorAll('script[data-analytics="global"]');
      addedScripts.forEach(script => script.remove());
    };
  }, [analyticsCode]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <BigThreeSection />
        <CategoriesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
