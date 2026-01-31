import { useEffect, Fragment, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustSection } from "@/components/home/TrustSection";
import { BigThreeSection } from "@/components/home/BigThreeSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { NewsSection } from "@/components/home/NewsSection";
import { ForumSection } from "@/components/home/ForumSection";
import { SEOContentSection } from "@/components/home/SEOContentSection";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { AdSenseBanner } from "@/components/ads/AdSenseBanner";
import { AmazonBanner } from "@/components/ads/AmazonBanner";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useGlobalAnalyticsCode } from "@/hooks/useGlobalAnalytics";
import { 
  useSiteTitle, 
  useSiteDescription, 
  useHomeLayout,
  useHomeContent 
} from "@/hooks/useSettings";

const Index = () => {
  const analyticsCode = useGlobalAnalyticsCode();
  const siteTitle = useSiteTitle();
  const siteDescription = useSiteDescription();
  
  const { sections } = useHomeLayout();
  const { content } = useHomeContent();
  
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    document.title = siteTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", siteDescription);
  }, [siteTitle, siteDescription]);

  useEffect(() => {
    if (sections.length > 0 && content) {
        const timer = setTimeout(() => setIsReady(true), 300);
        return () => clearTimeout(timer);
    }
  }, [sections, content]);

  useEffect(() => {
    if (!analyticsCode) return;
  }, [analyticsCode]);

  if (!isReady) {
      return <LoadingScreen />;
  }

  // Mapping: ID -> Komponente (MascotWidget entfernt, da jetzt global in App.tsx)
  const sectionComponents: Record<string, React.ReactNode> = {
    hero: <HeroSection />,
    amazon_top: <AmazonBanner format="horizontal" />,
    trust: <TrustSection />,
    big_three: <BigThreeSection />,
    adsense_middle: <AdSenseBanner slotId="placeholder-1" />,
    categories: <CategoriesSection />,
    forum: <ForumSection />,
    news: <NewsSection />,
    seo: <SEOContentSection />
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-white animate-in fade-in duration-500">
      <Header />
      
      <main className="flex-grow">
        {/* Dynamische CMS Rendering Schleife */}
        {sections
          .filter(section => section.enabled && section.id !== 'mascot')
          .map((section) => (
            // WICHTIG: Hier Fragment durch div ersetzt, damit IDs funktionieren!
            // 'id' ermöglicht das Anker-Scrollen (z.B. #forum)
            // 'scroll-mt-28' sorgt für Abstand zum fixierten Header beim Scrollen
            <div id={section.id} key={section.id} className="scroll-mt-28">
              {sectionComponents[section.id]}
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