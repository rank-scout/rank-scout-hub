import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { BigThreeSection } from "@/components/home/BigThreeSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { useGlobalAnalyticsCode } from "@/hooks/useGlobalAnalytics";

const Index = () => {
  const analyticsCode = useGlobalAnalyticsCode();

  // Inject analytics code into head
  useEffect(() => {
    if (!analyticsCode) return;
    
    // Create a unique identifier for our analytics script container
    const containerId = "global-analytics-scripts";
    
    // Remove existing analytics scripts if any
    const existingContainer = document.getElementById(containerId);
    if (existingContainer) {
      existingContainer.remove();
    }
    
    // Create container for analytics scripts
    const container = document.createElement("div");
    container.id = containerId;
    container.innerHTML = analyticsCode;
    
    // Move script tags to head (they need to be recreated to execute)
    const scripts = container.querySelectorAll("script");
    scripts.forEach((script) => {
      const newScript = document.createElement("script");
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
      // Cleanup: remove added scripts
      scripts.forEach((_, index) => {
        const addedScript = document.head.querySelector(`script[data-analytics-index="${index}"]`);
        addedScript?.remove();
      });
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
