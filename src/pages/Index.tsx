import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
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
import {
  useSettings,
  useHomeLayout,
  useHomeContent,
  useSiteTitle,
  useSiteDescription,
} from "@/hooks/useSettings";
import { Helmet } from "react-helmet-async";
import { AppTicker } from "@/components/home/AppTicker";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { HomeSEOText } from "@/components/home/HomeSEOText";
import { HomeFAQSection } from "@/components/home/HomeFAQSection";
import { useForceSEO } from "@/hooks/useForceSEO";
import { useTrackView } from "@/hooks/useTrackView";
import { isBotLikeRuntime } from "@/lib/runtimeFlags";
import { SchemaInjector } from "@/components/seo/SchemaInjector";
import { buildCanonicalUrl, safeSchemaId, stripHtmlToPlainText } from "@/lib/seo";
import { setPrerenderBlocked, setPrerenderReady } from "@/lib/prerender";

const Index = () => {
  useTrackView("home", "page");

  const location = useLocation();
  const hasSignaledReadyRef = useRef(false);

  const analyticsCode = useGlobalAnalyticsCode();
  const { data: settings, isLoading: isLoadingSettings } = useSettings();
  const siteTitle = useSiteTitle();
  const siteDescription = useSiteDescription();
  const { sections } = useHomeLayout();
  const { content } = useHomeContent();
  const isBotRuntime = isBotLikeRuntime();
  const shouldShowInitialLoader = !isBotRuntime && (isLoadingSettings || sections.length === 0);

  const safeTitle = typeof siteTitle === "string" && siteTitle.length > 0
    ? siteTitle
    : "Rank-Scout | Dein Vergleichsportal";

  const safeDescription = typeof siteDescription === "string" && siteDescription.length > 0
    ? siteDescription
    : "Vergleiche, Rechner und Ratgeber zu Tools, Software und Finanzthemen im Überblick.";

  const safeKeywords = (settings?.seo_keywords as string) || "Vergleich, Finanzen, Software, Rank-Scout, Erfahrungen, Ratgeber, Überblick";
  const canonicalUrl = buildCanonicalUrl("/");
  const siteLogoUrl = typeof settings?.site_logo_url === "string" && settings.site_logo_url.trim().length > 0
    ? settings.site_logo_url.trim()
    : "https://rank-scout.com/favicon-32x32.png";

  const isHomeFaqSectionEnabled = sections.some((section) => section.id === "home_faq" && section.enabled);
  const homeFaqItems = useMemo(() => {
    const faqSection = (content as any)?.home_faq;
    if (!isHomeFaqSectionEnabled || !Array.isArray(faqSection?.items)) {
      return [] as Array<{ question: string; answer: string }>;
    }

    return faqSection.items
      .filter((item: any) => String(item?.question || "").trim() && String(item?.answer || "").trim())
      .map((item: any) => ({
        question: String(item.question || "").trim(),
        answer: stripHtmlToPlainText(String(item.answer || "")),
      }))
      .filter((item: { question: string; answer: string }) => item.question.length > 0 && item.answer.length > 0);
  }, [content, isHomeFaqSectionEnabled]);

  useForceSEO(safeDescription);

  useEffect(() => {
    hasSignaledReadyRef.current = false;
    setPrerenderBlocked({ routeKey: `index:${location.pathname}`, timeoutMs: 12000 });
  }, [location.pathname]);

  useEffect(() => {
    const hasSettledSettings = isLoadingSettings === false;
    const hasLoadedSections = sections.length > 0;

    if (!hasSettledSettings || !hasLoadedSections) return;
    if (hasSignaledReadyRef.current) return;

    const didSet = setPrerenderReady(`index:${location.pathname}`);
    if (didSet) {
      hasSignaledReadyRef.current = true;
    }
  }, [isLoadingSettings, sections.length, location.pathname]);

  const schemaPayloads = useMemo(() => {
    const payloads: Record<string, unknown>[] = [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": safeSchemaId(canonicalUrl, "#website"),
        url: canonicalUrl,
        name: "Rank-Scout",
        alternateName: safeTitle,
        description: safeDescription,
        inLanguage: "de-DE",
        publisher: {
          "@id": safeSchemaId(canonicalUrl, "#organization"),
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${canonicalUrl}?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": safeSchemaId(canonicalUrl, "#organization"),
        name: "Rank-Scout",
        url: canonicalUrl,
        logo: {
          "@type": "ImageObject",
          url: siteLogoUrl,
        },
        description: safeDescription,
        sameAs: [],
      },
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": safeSchemaId(canonicalUrl, "#webpage"),
        url: canonicalUrl,
        name: safeTitle,
        description: safeDescription,
        isPartOf: {
          "@id": safeSchemaId(canonicalUrl, "#website"),
        },
        about: {
          "@id": safeSchemaId(canonicalUrl, "#organization"),
        },
        inLanguage: "de-DE",
      },
    ];

    if (homeFaqItems.length > 0) {
      payloads.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": safeSchemaId(canonicalUrl, "#faq"),
        mainEntity: homeFaqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      });
    }

    return payloads;
  }, [canonicalUrl, homeFaqItems, safeDescription, safeTitle, siteLogoUrl]);

  const seoHead = (
    <>
      <Helmet prioritizeSeoTags defer={false}>
        <title>{safeTitle}</title>
        <meta name="description" content={safeDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow" />
        <meta name="keywords" content={safeKeywords} />
        <meta name="author" content="Rank-Scout" />
        <meta name="publisher" content="Rank-Scout" />
        <meta property="og:title" content={safeTitle} />
        <meta property="og:description" content={safeDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Rank-Scout" />
        <meta property="og:locale" content="de_DE" />
        {analyticsCode ? <script async src={analyticsCode} /> : null}
      </Helmet>
      <SchemaInjector schemas={schemaPayloads} />
    </>
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
