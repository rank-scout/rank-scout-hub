import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCategoryBySlug } from "@/hooks/useCategories";
import { useProjects } from "@/hooks/useProjects";
import { useCategoryProjects } from "@/hooks/useCategoryProjects";
import { Button } from "@/components/ui/button";
import { 
    Loader2, 
    ShieldCheck, 
    Clock, 
    Users, 
    Lock, 
    Trophy, 
    Star, 
    CheckCircle2, 
    ArrowRight, 
    Home, 
    Lightbulb, 
    Zap
} from "lucide-react"; 

import CustomHtmlRenderer from "@/components/templates/CustomHtmlRenderer";
import CityLandingTemplate from "@/components/templates/CityLandingTemplate";
import { ReviewTemplate } from "@/components/templates/ReviewTemplate";
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForceSEO } from "@/hooks/useForceSEO";

const currentMonthYear = new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });

// --- KYRA LOGIC: SMART IMAGE MATCHING + ADMIN SUPPORT ---
const getCategoryHeroImage = (category: any) => {
    // 1. ADMIN-POWER: Wenn du im Backend ein Bild hinterlegt hast, nimm das!
    if (category.hero_image_url) return category.hero_image_url;

    const slug = category.slug.toLowerCase();

    // Smart-Fallback, falls kein Admin-Bild da ist:
    if (slug.includes('krypto') || slug.includes('bitcoin') || slug.includes('crypto')) {
        return "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2072&auto=format&fit=crop";
    }
    if (slug.includes('dating') || slug.includes('single') || slug.includes('partner')) {
        return "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=2072&auto=format&fit=crop";
    }
    if (slug.includes('finanz') || slug.includes('kredit') || slug.includes('konto')) {
        return "https://images.unsplash.com/photo-1565514020176-dbf2277478d3?q=80&w=2072&auto=format&fit=crop";
    }
    if (slug.includes('vpn') || slug.includes('hosting') || slug.includes('software')) {
        return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop";
    }

    // Default Tech
    return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop";
};

const generateStableRating = (slug: string) => {
    let hash = 0;
    for (let i = 0; i < slug.length; i++) {
        hash = slug.charCodeAt(i) + ((hash << 5) - hash);
    }
    const ratingValue = (Math.abs(hash % 5) / 10 + 4.5).toFixed(1);
    const reviewCount = Math.abs(hash % 308) + 42;
    return { ratingValue, reviewCount };
};

const ProjectCard = ({ project, index }: { project: any, index: number }) => {
    const isWinner = index === 0;
    return (
        <div className={`relative flex flex-col md:flex-row bg-white rounded-3xl transition-all duration-500 overflow-hidden mb-6 group ${isWinner ? 'shadow-xl shadow-primary/5 ring-1 ring-primary/10' : 'shadow-lg shadow-slate-100 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1'}`}>
            {isWinner && (
                <div className="absolute top-0 right-0 bg-secondary text-white text-[11px] font-bold px-4 py-1.5 rounded-bl-2xl z-10 flex items-center gap-1 shadow-md shadow-secondary/20">
                    <Trophy className="w-3.5 h-3.5 mr-1 fill-white/20" /> TESTSIEGER 2026
                </div>
            )}
            <div className={`md:hidden absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center font-bold shadow-inner ${isWinner ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-500'}`}>
                #{index + 1}
            </div>
            <div className="p-8 md:w-[28%] flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-50 bg-gradient-to-b from-white to-slate-50/50">
                <div className="transform group-hover:scale-105 transition-transform duration-500 ease-out">
                    {project.logo_url ? (
                        <img src={project.logo_url} alt={project.name} className="h-16 w-auto object-contain mb-4 mix-blend-multiply" />
                    ) : (
                        <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center font-bold text-slate-400 text-2xl border border-slate-100 shadow-sm">
                            {project.name.charAt(0)}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                    <div className="font-extrabold text-4xl text-primary tracking-tighter">{project.rating || "9.5"}</div>
                    <div className="flex flex-col items-start leading-none">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Punkte</div>
                        <div className="text-xs text-secondary font-bold">EXZELLENT</div>
                    </div>
                </div>
                <div className="flex text-secondary gap-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
            </div>
            <div className="p-8 md:w-[47%] flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3">
                    <span className={`hidden md:flex w-8 h-8 rounded-full items-center justify-center font-bold text-sm shadow-sm border ${isWinner ? 'bg-secondary text-white border-secondary' : 'bg-white text-slate-400 border-slate-100'}`}>#{index + 1}</span>
                    <h3 className="text-2xl font-bold text-primary tracking-tight group-hover:text-secondary transition-colors">{project.name}</h3>
                </div>
                <p className="text-slate-500 text-[15px] mb-6 line-clamp-2 leading-relaxed font-medium">{project.short_description || "Hervorragender Anbieter mit starken Leistungen im aktuellen Test."}</p>
                <div className="flex flex-wrap gap-2.5">
                    {(project.features || ["Top Support", "Schnelle Auszahlung", "Sicher"]).slice(0, 3).map((feat: string, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 text-[13px] font-medium text-slate-600 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-green-500" /> {feat}
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-8 md:w-[25%] flex flex-col justify-center items-center gap-4 bg-slate-50/30">
                <Button asChild size="lg" className={`w-full h-14 font-bold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 rounded-xl ${isWinner ? 'bg-secondary hover:bg-secondary/90 text-white shadow-secondary/20' : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'}`}>
                    <a href={project.affiliate_link} target="_blank" rel="nofollow noreferrer" className="flex items-center justify-center gap-2">
                        Zum Anbieter <ArrowRight className="w-5 h-5" />
                    </a>
                </Button>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                    <Lock className="w-3 h-3" /> Sichere Weiterleitung
                </div>
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
    return categoryProjects.map(cp => {
        const proj = projectsData.find(p => p.id === cp.project_id);
        if (!proj) return null;
        return { ...proj, sort_order: cp.sort_order, features: proj.features || [] };
      }).filter((p): p is NonNullable<typeof p> => p !== null).sort((a, b) => a.sort_order - b.sort_order);
  }, [projectsData, categoryProjects]);
  
  const topPick = projects[0];
  const schemaRating = useMemo(() => {
      if (!slug) return { ratingValue: "4.8", reviewCount: 120 };
      return generateStableRating(slug);
  }, [slug]);
  
  const contentTopRef = useRef<HTMLDivElement | null>(null);
  const isInternalPage = (category as any)?.is_internal_generated === true;

  useForceSEO(category?.meta_description || "");

  if (isCatLoading || isProjLoading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;
  }
  if (!category) {
    return (
      <div className="flex flex-col h-screen items-center justify-center space-y-4 bg-slate-50">
        <h1 className="text-3xl font-bold text-primary tracking-tight">Seite nicht gefunden</h1>
        <p className="text-slate-500">Diese Kategorie scheint nicht zu existieren.</p>
        <Link to="/"><Button variant="outline" size="lg">Zurück zur Startseite</Button></Link>
      </div>
    );
  }
  const currentUrl = `https://rank-scout.com/kategorien/${category.slug}`;
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "Product", 
    "name": `${category.name} Vergleich & Test ${new Date().getFullYear()}`,
    "description": category.meta_description,
    "image": category.image_url || `https://rank-scout.com/og-image.jpg`,
    "brand": { "@type": "Brand", "name": "Rank-Scout" },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": schemaRating.ratingValue, "reviewCount": schemaRating.reviewCount, "bestRating": "5", "worstRating": "1" },
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR", "availability": "https://schema.org/InStock", "url": currentUrl }
  };
  const faqSchema = category.faq_data ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": category.faq_data.map((faq: any) => ({ "@type": "Question", "name": faq.question, "acceptedAnswer": { "@type": "Answer", "text": faq.answer } }))
  } : null;

  if (isInternalPage) {
    const updatedAt = new Date(category.updated_at || new Date()).toLocaleDateString('de-DE', { month: 'long', day: 'numeric', year: 'numeric' });
    const authorImage = (category as any).author_image; 
    
    const heroImage = getCategoryHeroImage(category);

    return (
      <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-[#FAFAFA]">
        <Helmet>
          <title>{category.meta_title || `${category.name} | Vergleich`}</title>
          <meta name="description" content={category.meta_description || ""} />
          <link rel="canonical" href={currentUrl} />
          <script type="application/ld+json">{JSON.stringify(jsonLdSchema)}</script>
          {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
        </Helmet>
        <Header />
        <main className="flex-1">
          {/* Breadcrumbs Bar - BRAND BLUE */}
          <div className="border-b border-white/10 bg-primary sticky top-[60px] z-30 shadow-md">
            <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 h-12 flex items-center text-sm font-medium text-blue-100 overflow-hidden">
                <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors"><Home className="w-4 h-4"/> Home</Link>
                <span className="mx-2 text-blue-400">/</span>
                <span className="text-white truncate font-semibold">{category.name}</span>
            </div>
          </div>

          {/* Hero Section - INTELLIGENT RESPONSIVE SIZING */}
          {/* h-[50vh] für Mobile, md:h-[60vh] für Desktop */}
          {/* max-h-[800px] verhindert das Abschneiden auf großen Screens */}
          <section className="relative w-full h-[50vh] md:h-[60vh] min-h-[500px] max-h-[800px] overflow-hidden rounded-b-[3.5rem] shadow-2xl shadow-slate-300/50 z-20 flex items-center justify-center">
            <div className="absolute inset-0 z-0">
                {/* Image */}
                <img 
                    src={heroImage} 
                    alt="Background" 
                    className="w-full h-full object-cover object-center opacity-100" 
                />
                {/* Clean Dark Overlay - Black/50 für perfekten Kontrast ohne Nebel */}
                <div className="absolute inset-0 bg-black/50"></div>
            </div>
            
            <div className="container relative z-20 mx-auto px-4 max-w-5xl text-center py-10">
              <div className="flex justify-center mb-8">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2 rounded-full shadow-lg text-xs font-bold uppercase tracking-widest transform transition-transform hover:scale-105">
                  <ShieldCheck className="w-4 h-4 text-secondary" />
                  {category.hero_pretitle || "Unabhängig geprüft"}
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tighter mb-8 leading-[1.1] drop-shadow-2xl">
                {category.h1_title || category.name}
              </h1>
              {category.hero_headline && (
                <p className="text-xl md:text-2xl text-white/90 font-medium mb-12 leading-relaxed max-w-3xl mx-auto antialiased drop-shadow-lg">
                  {category.hero_headline}
                </p>
              )}
              
              {/* Stats Box Floating */}
              <div className="inline-flex flex-wrap justify-center gap-4 bg-white/10 backdrop-blur-md p-3 rounded-3xl border border-white/20 shadow-2xl max-w-4xl mx-auto">
                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/95 border border-slate-100 shadow-sm">
                    <div className="p-2 bg-green-100 rounded-full text-green-600"><ShieldCheck className="w-5 h-5" /></div>
                    <div className="text-left text-slate-800">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Status</div>
                        <div className="text-sm font-bold">Geprüft</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/95 border border-slate-100 shadow-sm">
                    <div className="p-2 bg-blue-100 rounded-full text-primary"><Clock className="w-5 h-5" /></div>
                    <div className="text-left text-slate-800">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Update</div>
                        <div className="text-sm font-bold">{updatedAt}</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/95 border border-slate-100 shadow-sm">
                    <div className="p-2 bg-orange-100 rounded-full text-secondary"><Users className="w-5 h-5" /></div>
                    <div className="text-left text-slate-800">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Basis</div>
                        <div className="text-sm font-bold">Fakten</div>
                    </div>
                </div>
              </div>
            </div>
          </section>

          {/* Content Area - Slight negative margin to sit nicely under the curve */}
          <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 py-12 lg:flex lg:gap-12 relative z-10 -mt-10">
              <div className="lg:w-2/3" ref={contentTopRef}>
                <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-200/40 border border-slate-100 mb-10 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-2 h-full bg-secondary"></div>
                  <div className="flex items-start gap-6">
                    <div className="hidden md:flex p-4 bg-primary/5 rounded-2xl text-primary shrink-0 shadow-inner">
                        <Lightbulb className="w-8 h-8 text-secondary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-primary text-2xl mb-4 tracking-tight">Das Wichtigste in Kürze</h3>
                        <div className="text-slate-600 leading-loose text-lg">
                            Wir haben die Anbieter in dieser Kategorie auf Herz und Nieren geprüft. 
                            In diesem Vergleich findest du die besten Optionen für deine Bedürfnisse – sortiert nach Leistung, Sicherheit und Preis.
                        </div>
                    </div>
                  </div>
                </div>
                {category.long_content_top && (
                  <div className="bg-transparent mb-16 px-2">
                      <article id="content-top" className="scroll-mt-32 prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-primary prose-p:text-slate-600 prose-p:leading-loose prose-a:text-secondary prose-ul:marker:text-secondary">
                        <div dangerouslySetInnerHTML={{ __html: category.long_content_top }} />
                      </article>
                  </div>
                )}
                {projects.length > 0 && (
                    <div id="vergleich" className="scroll-mt-32 mb-20">
                        <div className="mb-8 px-2">
                            <Badge variant="secondary" className="mb-3 bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1">Testsieger {new Date().getFullYear()}</Badge>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight flex items-center gap-3">Alle Anbieter im Vergleich</h2>
                        </div>
                        <div className="space-y-6">{projects.map((proj, idx) => (<ProjectCard key={proj.id} project={proj} index={idx} />))}</div>
                    </div>
                )}
                {category.long_content_bottom && (
                  <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/30 border border-slate-100 mb-16">
                      <article id="content-bottom" className="scroll-mt-32 prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-primary prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-p:text-slate-600 prose-p:leading-loose prose-blockquote:border-secondary prose-blockquote:bg-secondary/5">
                        <div dangerouslySetInnerHTML={{ __html: category.long_content_bottom }} />
                      </article>
                  </div>
                )}
                <div className="bg-primary text-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-primary/20 flex flex-col md:flex-row items-center gap-8 mb-20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
                  <Avatar className="w-24 h-24 border-4 border-white/10 shadow-xl bg-white">
                    {authorImage ? (<AvatarImage src={authorImage} className="object-contain p-2" />) : (<AvatarImage src="/images/avatar-placeholder.jpg" />)}
                    <AvatarFallback className="bg-white text-primary font-bold text-2xl">RS</AvatarFallback>
                  </Avatar>
                  <div className="text-center md:text-left relative z-10">
                    <p className="text-secondary font-bold uppercase tracking-widest text-xs mb-2">Die Redaktion</p>
                    <p className="font-bold text-2xl mb-3 tracking-tight">Rank-Scout Experten-Team</p>
                    <p className="text-slate-300 leading-relaxed max-w-xl">Unser Team aus Finanz- und Tech-Experten analysiert täglich den Markt. Wir garantieren unabhängige Bewertungen basierend auf echten Daten.</p>
                  </div>
                </div>
                {category.faq_data && Array.isArray(category.faq_data) && category.faq_data.length > 0 && (
                    <section id="faq" className="scroll-mt-32 mb-24">
                        <div className="mb-10 px-2">
                            <Badge variant="outline" className="mb-4 border-secondary/30 text-secondary px-3 py-1">Wissen kompakt</Badge>
                            <h2 className="text-4xl font-extrabold text-primary tracking-tight">Häufige Fragen</h2>
                        </div>
                        <div className="space-y-4">
                            <Accordion type="single" collapsible className="w-full space-y-4">
                                {category.faq_data.map((faq: any, index: number) => (
                                    <AccordionItem key={index} value={`item-${index}`} className="bg-white border border-slate-100 shadow-sm rounded-2xl px-2 overflow-hidden hover:shadow-md data-[state=open]:border-primary/20">
                                        <AccordionTrigger className="text-left font-bold text-slate-800 hover:text-secondary px-6 py-5 text-lg">{faq.question}</AccordionTrigger>
                                        <AccordionContent className="text-slate-600 leading-loose px-6 pb-8 pt-2 text-base"><div dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\n/g, '<br/>') }} /></AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </section>
                )}
              </div>
              <aside className="lg:w-1/3 lg:sticky top-24 self-start hidden lg:block max-h-[calc(100vh-120px)] overflow-y-auto pr-2 pb-10 custom-scrollbar">
                {topPick && (
                  <div className="bg-white rounded-3xl p-6 border border-primary/10 shadow-2xl shadow-primary/5 mb-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-secondary text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-2xl">TESTSIEGER</div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-primary/5 rounded-xl text-primary"><Trophy className="w-6 h-6" /></div>
                      <p className="font-bold text-primary text-lg">Unsere Empfehlung</p>
                    </div>
                    <div className="flex items-center gap-5 mb-6">
                      {topPick.logo_url ? (<img src={topPick.logo_url} alt={topPick.name} className="w-20 h-20 object-contain rounded-2xl border border-slate-50 p-2 shadow-sm" />) : (<div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center font-bold text-slate-400 border border-slate-100">{topPick.name.charAt(0)}</div>)}
                      <div className="flex-1">
                        <p className="font-bold text-xl text-primary leading-tight mb-1.5">{topPick.name}</p>
                        <div className="flex text-secondary gap-0.5 mb-1">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}</div>
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">Exzellent</span>
                      </div>
                    </div>
                    <ul className="space-y-3 mb-8">{(topPick.features || []).slice(0, 3).map((feat: string, i: number) => (<li key={i} className="flex items-start gap-3 text-sm text-slate-600 leading-snug"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> {feat}</li>))}</ul>
                    <Button asChild className="w-full font-bold bg-secondary hover:bg-secondary/90 text-white h-14 shadow-lg shadow-secondary/20 transition-all rounded-xl text-base"><a href={topPick.affiliate_link} target="_blank" rel="nofollow noreferrer">Jetzt ansehen <ArrowRight className="w-5 h-5 ml-2" /></a></Button>
                  </div>
                )}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg shadow-slate-200/30 mb-8">
                  <p className="font-bold text-primary mb-6 flex items-center gap-2 text-sm uppercase tracking-widest text-slate-400"><Zap className="w-4 h-4 text-secondary"/> Inhalt</p>
                  <ul className="text-sm text-slate-500 space-y-4 font-medium">
                    {category.long_content_top && (<li><a href="#content-top" className="flex items-center gap-3 hover:text-secondary transition-colors group"><div className="w-1.5 h-1.5 bg-slate-300 rounded-full group-hover:bg-secondary transition-colors"></div> Einleitung</a></li>)}
                    <li><a href="#vergleich" className="flex items-center gap-3 text-primary font-bold"><div className="w-2 h-2 bg-secondary rounded-full shadow-sm shadow-secondary/50"></div> Vergleichstabelle</a></li>
                    {category.long_content_bottom && (<li><a href="#content-bottom" className="flex items-center gap-3 hover:text-secondary transition-colors group"><div className="w-1.5 h-1.5 bg-slate-300 rounded-full group-hover:bg-secondary transition-colors"></div> Details & Ratgeber</a></li>)}
                    {category.faq_data && (<li><a href="#faq" className="flex items-center gap-3 hover:text-secondary transition-colors group"><div className="w-1.5 h-1.5 bg-slate-300 rounded-full group-hover:bg-secondary transition-colors"></div> Häufige Fragen</a></li>)}
                  </ul>
                </div>
                <div className="bg-gradient-to-b from-white to-slate-50 rounded-3xl p-8 border border-slate-100 shadow-lg shadow-slate-200/30">
                  <p className="font-bold text-primary mb-6 text-[10px] uppercase tracking-widest text-center text-slate-400">Rank-Scout Garantie</p>
                  <div className="grid grid-cols-1 gap-5 text-sm text-slate-600 font-medium">
                    <div className="flex items-center gap-4"><div className="p-2 bg-green-100 rounded-full text-green-600 shadow-sm shadow-green-100"><ShieldCheck className="w-5 h-5" /></div><span>Redaktionell geprüft</span></div>
                    <div className="flex items-center gap-4"><div className="p-2 bg-primary/10 rounded-full text-primary shadow-sm"><Users className="w-5 h-5" /></div><span>100% Unabhängig</span></div>
                    <div className="flex items-center gap-4"><div className="p-2 bg-blue-100 rounded-full text-blue-600 shadow-sm shadow-blue-100"><Lock className="w-5 h-5" /></div><span>SSL Verschlüsselt</span></div>
                  </div>
                </div>
              </aside>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
        <Helmet>
          <title>{category.meta_title || category.name}</title>
          <meta name="description" content={category.meta_description || ""} />
          <link rel="canonical" href={currentUrl} />
          <script type="application/ld+json">{JSON.stringify(jsonLdSchema)}</script>
        </Helmet>
        {category.custom_html_override ? (<><Header /><CustomHtmlRenderer html={category.custom_html_override} /><Footer /></>) : (category.template === 'comparison' && category.theme === 'DATING' && category.slug.includes('stadt')) ? (<><Header /><CityLandingTemplate category={category} projects={projects} /><Footer /></>) : (<div className="min-h-screen bg-[#0a0a0a] text-white"><Header /><ReviewTemplate category={category} projects={projects} /></div>)}
    </>
  );
}