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
import { AppTicker } from "@/components/home/AppTicker";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { HomeSEOText } from "@/components/home/HomeSEOText";
import { HomeFAQSection } from "@/components/home/HomeFAQSection";
import { useForceSEO } from "@/hooks/useForceSEO";
import { useTrackView } from "@/hooks/useTrackView";

const BOT_WINDOW_KEYS = ["__RS_IS_BOT__", "__RS_IS_PRERENDER__"] as const;

const isBotLikeRuntime = () => {
  if (typeof window === "undefined") return false;

  return BOT_WINDOW_KEYS.some((key) => Boolean(window[key]));
};

const Index = () => {
  useTrackView("home", "page");

  const analyticsCode = useGlobalAnalyticsCode();
  const { data: settings, isLoading: isLoadingSettings } = useSettings();
  const siteTitle = useSiteTitle();
  const siteDescription = useSiteDescription();
  const { sections } = useHomeLayout();
  const isBotRuntime = isBotLikeRuntime();
  const shouldShowInitialLoader = !isBotRuntime && (isLoadingSettings || sections.length === 0);

  const safeTitle = typeof siteTitle === "string" && siteTitle.length > 0
    ? siteTitle
    : "Rank-Scout | Dein Vergleichsportal";

  const safeDescription = typeof siteDescription === "string" && siteDescription.length > 0
    ? siteDescription
    : "Vergleiche, Rechner und Ratgeber zu Tools, Software und Finanzthemen im Überblick.";

  const safeKeywords = (settings?.seo_keywords as string) || "Vergleich, Finanzen, Software, Rank-Scout, Erfahrungen, Ratgeber, Überblick";

  useForceSEO(safeDescription);

  const seoHead = (
    <Helmet>
      <title>{safeTitle}</title>
      <meta name="description" content={safeDescription} />
      <link rel="canonical" href="https://rank-scout.com/" />
      <meta name="robots" content="index, follow" />
      <meta name="keywords" content={safeKeywords} />
      <meta name="author" content="Rank-Scout" />
      <meta name="publisher" content="Rank-Scout" />
      <meta property="og:title" content={safeTitle} />
      <meta property="og:description" content={safeDescription} />
      <meta property="og:url" content="https://rank-scout.com/" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Rank-Scout" />
      <meta property="og:locale" content="de_DE" />
      {analyticsCode ? <script async src={analyticsCode} /> : null}
    </Helmet>
  );

  const sectionComponents: Record<string, React.ReactNode> = {
    hero: <HeroSection />,
    how_it_works: <HowItWorksSection />,
    news: <NewsSection />,
    big_three: <BigThreeSection />,
    forum: <ForumSection />,
    trust: <AppTicker />,
    categories: <CategoriesSection />,
    amazon_top: <AmazonBanner format="horizontal" />,
    adsense_middle: <AdSenseBanner slotId="placeholder-1" />,
    home_faq: <HomeFAQSection />,
    seo: <HomeSEOText />,
    mascot: null,
  };

  if (shouldShowInitialLoader) {
    return (
      <>
        {seoHead}
        <LoadingScreen />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-white animate-in fade-in duration-500">
      {seoHead}
      <Header />
      <main className="flex-grow">
        {sections
          .filter((section) => section.enabled)
          .map((section) => (
            <div key={section.id} className="w-full">
              {sectionComponents[section.id] || null}
            </div>
          ))}
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;
