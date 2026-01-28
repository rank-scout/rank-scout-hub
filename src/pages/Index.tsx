import { useEffect, Fragment } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustSection } from "@/components/home/TrustSection";
import { BigThreeSection } from "@/components/home/BigThreeSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { NewsSection } from "@/components/home/NewsSection";
import { ForumSection } from "@/components/home/ForumSection";
import { SEOContentSection } from "@/components/home/SEOContentSection";
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
  
  // Holt das CMS Layout
  const { sections } = useHomeLayout();

  useEffect(() => {
    document.title = siteTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", siteDescription);
  }, [siteTitle, siteDescription]);

  useEffect(() => {
    if (!analyticsCode) return;
  }, [analyticsCode]);

  // Mapping: ID -> Komponente
  const sectionComponents: Record<string, React.ReactNode> = {
    hero: <HeroSection />,
    amazon_top: <AmazonBanner format="horizontal" />,
    trust: <TrustSection />,
    big_three: <BigThreeSection />,
    adsense_middle: <AdSenseBanner slotId="placeholder-1" />,
    categories: <CategoriesSection />,
    forum: <ForumSection />,
    news: <NewsSection />,
    seo: <SEOContentSection />,
    mascot: <MascotWidget />
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-transparent">
      <Header />
      
      <main className="flex-grow">
        {/* Dynamische CMS Rendering Schleife */}
        {sections
          .filter(section => section.enabled) // Nur aktive anzeigen
          .map(section => (
            <Fragment key={section.id}>
              {sectionComponents[section.id] || null}
            </Fragment>
          ))
        }
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;