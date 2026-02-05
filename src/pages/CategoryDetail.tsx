import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCategoryBySlug } from "@/hooks/useCategories";
import { useProjects } from "@/hooks/useProjects";
import { useCategoryProjects } from "@/hooks/useCategoryProjects";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react"; 
// Solar Icons Importe
import { 
    ShieldCheck, 
    ClockCircle, 
    UsersGroupTwoRounded, 
    LockKeyhole, 
    Cup, 
    Star, 
    CheckCircle, 
    ArrowRight, 
    Home, 
    Lightbulb, 
    Bolt 
} from '@solar-icons/react';

import CustomHtmlRenderer from "@/components/templates/CustomHtmlRenderer";
import CityLandingTemplate from "@/components/templates/CityLandingTemplate";
import { ReviewTemplate } from "@/components/templates/ReviewTemplate";
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const currentMonthYear = new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });

// --- HELPER: STABLE RANDOM RATING GENERATOR ---
const generateStableRating = (slug: string) => {
    let hash = 0;
    for (let i = 0; i < slug.length; i++) {
        hash = slug.charCodeAt(i) + ((hash << 5) - hash);
    }
    const ratingValue = (Math.abs(hash % 5) / 10 + 4.5).toFixed(1);
    const reviewCount = Math.abs(hash % 308) + 42;
    return { ratingValue, reviewCount };
};

// Premium Projekt Card Komponente
const ProjectCard = ({ project, index }: { project: any, index: number }) => {
    const isWinner = index === 0;
    
    return (
        <div className={`relative flex flex-col md:flex-row bg-card rounded-2xl border ${isWinner ? 'border-primary ring-1 ring-primary/20 shadow-lg' : 'border-border'} shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden mb-4 group`}>
            {isWinner && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl z-10 flex items-center gap-1 shadow-md">
                    {/* Winner Icon: Gold/Orange */}
                    <Cup weight="Bold" className="w-3 h-3 text-secondary mr-1" /> TESTSIEGER
                </div>
            )}
            
            <div className="md:hidden absolute top-4 left-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground shadow-inner">
                #{index + 1}
            </div>

            <div className="p-6 md:w-1/4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border bg-muted/20">
                <div className="transform group-hover:scale-105 transition-transform duration-300">
                    {project.logo_url ? (
                        <img src={project.logo_url} alt={project.name} className="h-14 w-auto object-contain mb-3" />
                    ) : (
                        <div className="h-14 w-14 bg-card rounded-full flex items-center justify-center font-bold text-muted-foreground text-xl border border-border shadow-sm">
                            {project.name.charAt(0)}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1 mb-1">
                    <div className="font-extrabold text-3xl text-foreground tracking-tighter">{project.rating || "9.5"}</div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">/ 10</div>
                </div>
                <div className="flex text-secondary gap-0.5">
                    {/* Sterne: Gold/Orange */}
                    {[...Array(5)].map((_, i) => <Star key={i} weight="Bold" className="w-3.5 h-3.5 fill-current" />)}
                </div>
            </div>

            <div className="p-6 md:w-2/4 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                    <span className="hidden md:flex w-7 h-7 rounded-full bg-muted items-center justify-center font-bold text-xs text-muted-foreground shadow-sm border border-border">#{index + 1}</span>
                    <h3 className="text-xl font-bold text-foreground">{project.name}</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">{project.short_description || "Hervorragender Anbieter mit starken Leistungen im Test."}</p>
                
                <div className="flex flex-wrap gap-2">
                    {(project.features || ["Top Support", "Schnelle Auszahlung", "Sicher"]).slice(0, 3).map((feat: string, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs font-medium text-foreground bg-accent/50 border border-border px-2.5 py-1 rounded-md">
                            {/* Feature Haken: GRÜN wie gewünscht */}
                            <CheckCircle weight="Bold" className="w-3.5 h-3.5 text-green-600" /> {feat}
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 md:w-1/4 flex flex-col justify-center items-center gap-3 bg-muted/5">
                <Button asChild size="lg" className={`w-full font-bold shadow-md hover:translate-y-[-2px] transition-all duration-200 ${isWinner ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-secondary hover:bg-secondary/90 text-secondary-foreground'}`}>
                    <a href={project.affiliate_link} target="_blank" rel="nofollow noreferrer">
                        Zum Anbieter <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
                </Button>
                <span className="text-[10px] text-muted-foreground font-medium">Sichere Weiterleitung</span>
            </div>
        </div>
    );
};

export default function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: category, isLoading: isCatLoading } = useCategoryBySlug(slug || "");
  const { data: projectsData, isLoading: isProjLoading } = useProjects();
  const { data: categoryProjects } = useCategoryProjects(category?.id);
  
  const projects = useMemo(() => {
    if (!projectsData || !categoryProjects) return [];
    return categoryProjects
      .map(cp => {
        const proj = projectsData.find(p => p.id === cp.project_id);
        if (!proj) return null;
        return { ...proj, sort_order: cp.sort_order, features: proj.features || [] };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [projectsData, categoryProjects]);

  const topPick = projects[0];

  const schemaRating = useMemo(() => {
      if (!slug) return { ratingValue: "4.8", reviewCount: 120 };
      return generateStableRating(slug);
  }, [slug]);

  useEffect(() => {
      if (category && category.meta_description) {
          let meta = document.querySelector("meta[name='description']");
          if (!meta) {
              meta = document.createElement("meta");
              meta.setAttribute("name", "description");
              document.head.appendChild(meta);
          }
          meta.setAttribute("content", category.meta_description);
      }
      document.documentElement.style.scrollBehavior = "smooth";
      return () => {
          document.documentElement.style.scrollBehavior = "";
      };
  }, [category]);

  const extractHeadings = (html: string) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const h2s = Array.from(doc.querySelectorAll('h2'));
      return h2s.map(h2 => ({
          id: h2.id || h2.textContent?.toLowerCase().replace(/ /g, '-') || '',
          text: h2.textContent || ''
      }));
  };

  const headings = useMemo(() => {
      return category?.long_content_top ? extractHeadings(category.long_content_top) : [];
  }, [category?.long_content_top]);

  const contentTopRef = useRef<HTMLDivElement | null>(null);
  const isInternalPage = (category as any)?.is_internal_generated === true;

  if (isCatLoading || isProjLoading) {
    return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  if (!category) {
    return (
      <div className="flex flex-col h-screen items-center justify-center space-y-4 bg-background">
        <h1 className="text-2xl font-bold text-foreground">Seite nicht gefunden</h1>
        <Link to="/"><Button variant="outline">Zurück zur Startseite</Button></Link>
      </div>
    );
  }

  const currentUrl = `${window.location.origin}/${category.slug}`;

  // SCHEMA MARKUP
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "Product", 
    "name": `${category.name} Vergleich & Test ${new Date().getFullYear()}`,
    "description": category.meta_description,
    "image": category.image_url || `${window.location.origin}/og-image.jpg`,
    "brand": {
        "@type": "Brand",
        "name": "Rank-Scout"
    },
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": schemaRating.ratingValue,
        "reviewCount": schemaRating.reviewCount,
        "bestRating": "5",
        "worstRating": "1"
    },
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock"
    }
  };

  const faqSchema = category.faq_data ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": category.faq_data.map((faq: any) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
          }
      }))
  } : null;

  // =========================================================================
  // DESIGN A: RATGEBER / MODERN (CLEAN MIT FARBEN)
  // =========================================================================
  if (isInternalPage) {
    const updatedAt = new Date(category.updated_at || new Date()).toLocaleDateString('de-DE', { month: 'long', day: 'numeric' });
    const adHtml = (category as any).sidebar_ad_html;
    const adImage = (category as any).sidebar_ad_image;

    return (
      <div className="min-h-screen flex flex-col font-sans text-foreground bg-background">
        <Helmet>
          <title>{category.meta_title || `${category.name} | Vergleich`}</title>
          <meta name="description" content={category.meta_description || ""} />
          <link rel="canonical" href={currentUrl} />
          <script type="application/ld+json">{JSON.stringify(jsonLdSchema)}</script>
          {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
        </Helmet>

        <Header />

        <main className="flex-1">
          {/* Breadcrumb */}
          <div className="border-b border-border bg-background/80 sticky top-[60px] z-10 backdrop-blur-md">
            <div className="container mx-auto px-4 h-10 flex items-center text-xs font-medium text-muted-foreground overflow-hidden">
                <Link to="/" className="hover:text-primary flex items-center gap-1 transition-colors"><Home className="w-3 h-3"/> Home</Link>
                <span className="mx-2 text-muted-foreground/50">/</span>
                <span className="text-foreground truncate">{category.name}</span>
            </div>
          </div>

          {/* Hero Section */}
          <section className="relative pt-20 pb-16 border-b border-border bg-gradient-to-b from-background to-muted/30">
            <div className="container mx-auto px-4 max-w-4xl text-center">
              
              <div className="flex justify-center mb-6">
                <Badge variant="secondary" className="bg-card text-primary hover:bg-accent border border-border px-4 py-1.5 text-xs font-bold uppercase tracking-wider shadow-sm">
                  {category.hero_pretitle || "Redaktionell geprüft"}
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight mb-6 leading-[1.1]">
                {category.h1_title || category.name}
              </h1>

              {category.hero_headline && (
                <p className="text-lg md:text-xl text-muted-foreground font-medium mb-10 leading-relaxed max-w-2xl mx-auto">
                  {category.hero_headline}
                </p>
              )}

              {/* Trust Bar (Clean mit Semantic Colors) */}
              <div className="inline-grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground bg-card rounded-2xl p-4 shadow-lg shadow-black/5 border border-border max-w-3xl mx-auto">
                <div className="flex items-center justify-center gap-2 px-2">
                    {/* HIER: Schild ist GRÜN (Verified) */}
                    <ShieldCheck weight="Bold" size={24} className="text-green-600" /> Redaktionell geprüft
                </div>
                <div className="flex items-center justify-center gap-2 px-2">
                    {/* Uhr: Blau (Neutral/Info) */}
                    <ClockCircle weight="Bold" size={24} className="text-primary" /> Stand: {currentMonthYear}
                </div>
                <div className="flex items-center justify-center gap-2 px-2">
                    {/* User: Blau (Neutral/Info) */}
                    <UsersGroupTwoRounded weight="Bold" size={24} className="text-primary" /> Unabhängig
                </div>
                <div className="flex items-center justify-center gap-2 px-2">
                    {/* Lock: Blau (oder auch Grün möglich, aber Blau wirkt technischer) */}
                    <LockKeyhole weight="Bold" size={24} className="text-primary" /> SSL Verschlüsselt
                </div>
              </div>

            </div>
          </section>

          {/* Main Content */}
          <div className="container mx-auto px-4 py-12 max-w-7xl lg:flex lg:gap-10">
              
              {/* LEFT: Content */}
              <div className="lg:w-2/3" ref={contentTopRef}>
                <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border mb-8 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
                        {/* HIER: Glühbirne ist GELB (Idee) */}
                        <Lightbulb weight="Bold" className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground text-lg mb-2">Das Wichtigste in Kürze</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Wir haben die Anbieter in dieser Kategorie auf Herz und Nieren geprüft. 
                            In diesem Vergleich findest du die besten Optionen für deine Bedürfnisse – sortiert nach Leistung, Sicherheit und Preis.
                        </p>
                    </div>
                  </div>
                </div>

                {category.long_content_top && (
                  <div className="bg-card rounded-2xl p-6 md:p-10 shadow-sm border border-border mb-12">
                      <article id="content-top" className="scroll-mt-32 prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-img:rounded-2xl prose-img:shadow-md prose-a:text-primary hover:prose-a:text-primary/80">
                        <div dangerouslySetInnerHTML={{ __html: category.long_content_top }} />
                      </article>
                  </div>
                )}

                {/* === COMPARISON TABLE === */}
                {projects.length > 0 && (
                    <div id="vergleich" className="scroll-mt-32 mb-16">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                                    {/* Pokal: Gold/Orange */}
                                    <Cup weight="Bold" className="w-7 h-7 text-secondary" />
                                    Alle Anbieter im Vergleich
                                </h2>
                                <p className="text-muted-foreground mt-1">Das Gesamtergebnis unseres Tests.</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {projects.map((proj, idx) => (
                                <ProjectCard key={proj.id} project={proj} index={idx} />
                            ))}
                        </div>
                    </div>
                )}

                {category.long_content_bottom && (
                  <div className="bg-card rounded-2xl p-6 md:p-10 shadow-sm border border-border mb-12">
                      <article id="content-bottom" className="scroll-mt-32 prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-img:rounded-2xl prose-img:shadow-md prose-a:text-primary hover:prose-a:text-primary/80">
                        <div dangerouslySetInnerHTML={{ __html: category.long_content_bottom }} />
                      </article>
                  </div>
                )}

                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm flex items-center gap-6 mb-16">
                  <Avatar className="w-16 h-16 border-2 border-card shadow-md">
                    <AvatarImage src="/images/avatar-placeholder.jpg" />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">RS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-foreground text-lg">Redaktion Rank-Scout</p>
                    <p className="text-sm text-muted-foreground">Unser Experten-Team analysiert täglich den Markt, um dir transparente und unabhängige Vergleiche zu liefern.</p>
                  </div>
                </div>

                {/* FAQ Section */}
                {category.faq_data && Array.isArray(category.faq_data) && category.faq_data.length > 0 && (
                    <section id="faq" className="scroll-mt-32 mb-20">
                        <div className="mb-8 px-2">
                            <Badge variant="outline" className="mb-3 bg-card border-primary/20 text-primary">Wissen</Badge>
                            <h2 className="text-3xl font-bold text-foreground">Häufige Fragen</h2>
                        </div>
                        <div className="space-y-4">
                            <Accordion type="single" collapsible className="w-full space-y-4">
                                {category.faq_data.map((faq: any, index: number) => (
                                    <AccordionItem key={index} value={`item-${index}`} className="bg-card border border-border shadow-sm rounded-xl px-2 overflow-hidden">
                                        <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline hover:text-primary px-4 py-4 text-lg">
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground leading-relaxed px-4 pb-6 pt-0 text-base border-t border-muted">
                                            <div dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\n/g, '<br/>') }} />
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </section>
                )}
              </div>

              {/* RIGHT: Sidebar */}
              <aside className="lg:w-1/3 lg:sticky top-24 self-start hidden lg:block max-h-[calc(100vh-120px)] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none] pb-10">

                {topPick && (
                  <div className="bg-card rounded-2xl p-6 border border-primary/20 shadow-lg shadow-primary/5 mb-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm">TESTSIEGER</div>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                          <Cup weight="Bold" className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-foreground">Unsere Empfehlung</p>
                    </div>
                    <div className="flex items-center gap-4 mb-5">
                      {topPick.logo_url ? (
                          <img src={topPick.logo_url} alt={topPick.name} className="w-16 h-16 object-contain rounded-xl border border-border p-1" />
                      ) : (
                          <div className="w-16 h-16 bg-muted/30 rounded-xl flex items-center justify-center font-bold text-muted-foreground border">{topPick.name.charAt(0)}</div>
                      )}
                      <div className="flex-1">
                        <p className="font-bold text-lg text-foreground leading-tight mb-1">{topPick.name}</p>
                        <div className="flex text-secondary gap-0.5">
                            {[...Array(5)].map((_, i) => <Star key={i} weight="Bold" className="w-3.5 h-3.5 fill-current" />)}
                        </div>
                      </div>
                    </div>
                    <ul className="space-y-2.5 mb-6">
                        {(topPick.features || []).slice(0, 3).map((feat: string, i: number) => (
                            <li key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                {/* Haken: Grün */}
                                <CheckCircle weight="Bold" className="w-4 h-4 text-green-600 shrink-0" /> {feat}
                            </li>
                        ))}
                    </ul>
                    <Button asChild className="w-full font-bold bg-primary hover:bg-primary/90 text-primary-foreground h-12 shadow-md transition-all rounded-xl">
                        <a href={topPick.affiliate_link} target="_blank" rel="nofollow noreferrer">
                            Jetzt ansehen <ArrowRight className="w-4 h-4 ml-2" />
                        </a>
                    </Button>
                  </div>
                )}

                <div className="bg-card rounded-2xl p-6 border border-border shadow-sm mb-6">
                  <p className="font-bold text-foreground mb-4 flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground">
                      {/* Blitz: Gelb (Energie/Inhalt) */}
                      <Bolt weight="Bold" className="w-4 h-4 text-yellow-500"/> Inhalt
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-3">
                    {category.long_content_top && (
                        <li><a href="#content-top" className="flex items-center gap-2 hover:text-primary transition-colors group"><div className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-full group-hover:bg-primary transition-colors"></div> Einleitung</a></li>
                    )}
                    <li><a href="#vergleich" className="flex items-center gap-2 hover:text-primary transition-colors font-medium text-foreground"><div className="w-1.5 h-1.5 bg-primary rounded-full"></div> Vergleichstabelle</a></li>
                    {category.long_content_bottom && (
                        <li><a href="#content-bottom" className="flex items-center gap-2 hover:text-primary transition-colors group"><div className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-full group-hover:bg-primary transition-colors"></div> Details & Ratgeber</a></li>
                    )}
                    {category.faq_data && (
                        <li><a href="#faq" className="flex items-center gap-2 hover:text-primary transition-colors group"><div className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-full group-hover:bg-primary transition-colors"></div> Häufige Fragen</a></li>
                    )}
                  </ul>
                </div>

                {(adHtml || adImage) && (
                    <div className="relative bg-card rounded-2xl border border-border shadow-sm overflow-hidden mb-6 group transition-all hover:shadow-md">
                        <div className="absolute top-0 right-0 bg-muted px-2.5 py-1 rounded-bl-xl border-b border-l border-border z-10">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Anzeige</span>
                        </div>
                        <div className="p-1">
                            {adHtml ? (
                                <div className="prose prose-sm max-w-none p-4 dark:prose-invert" dangerouslySetInnerHTML={{ __html: adHtml }} />
                            ) : (
                                adImage && (
                                    <a href="#" className="block relative overflow-hidden rounded-xl">
                                        <img src={adImage} alt="Partner" className="w-full h-auto transform group-hover:scale-[1.02] transition-transform duration-500" />
                                    </a>
                                )
                            )}
                        </div>
                    </div>
                )}

                <div className="bg-card rounded-2xl p-6 border border-border shadow-sm mb-6">
                  <p className="font-bold text-foreground mb-4 text-[10px] uppercase tracking-wider text-center text-muted-foreground">Wir garantieren</p>
                  <div className="grid grid-cols-1 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-green-500/10 rounded-full text-green-500">
                            {/* Garantie-Schild: GRÜN */}
                            <ShieldCheck weight="Bold" className="w-4 h-4 text-green-600" />
                        </div> Redaktionell geprüft
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-primary/10 rounded-full text-primary">
                            <UsersGroupTwoRounded weight="Bold" className="w-4 h-4" />
                        </div> 100% Unabhängig
                    </div>
                  </div>
                </div>

              </aside>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // DESIGN B: LEGACY LANDINGPAGES
  return (
    <>
        <Helmet>
          <title>{category.meta_title || category.name}</title>
          <meta name="description" content={category.meta_description || ""} />
          <link rel="canonical" href={currentUrl} />
        </Helmet>
        
        {category.custom_html_override ? (
             <><Header /><CustomHtmlRenderer html={category.custom_html_override} /><Footer /></>
        ) : (category.template === 'comparison' && category.theme === 'DATING' && category.slug.includes('stadt')) ? (
             <><Header /><CityLandingTemplate category={category} projects={projects} /><Footer /></>
        ) : (
            <div className="min-h-screen bg-[#0a0a0a] text-white"><Header /><ReviewTemplate category={category} projects={projects} /></div>
        )}
    </>
  );
}