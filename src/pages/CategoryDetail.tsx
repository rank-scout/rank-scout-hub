import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCategoryBySlug } from "@/hooks/useCategories";
import { useProjects } from "@/hooks/useProjects";
import { useCategoryProjects } from "@/hooks/useCategoryProjects";
import { Button } from "@/components/ui/button";
import { 
    Loader2, ShieldCheck, Clock, Users, Lock, Trophy, Star, CheckCircle2, ArrowRight, Home, Lightbulb, Zap
} from "lucide-react"; 

import CustomHtmlRenderer from "@/components/templates/CustomHtmlRenderer";
import CityLandingTemplate from "@/components/templates/CityLandingTemplate";
import { ReviewTemplate } from "@/components/templates/ReviewTemplate";
import { HubTemplate } from "@/components/templates/HubTemplate"; 
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useForceSEO } from "@/hooks/useForceSEO";

import { UniversalWidgetLoader } from "@/components/templates/UniversalWidgetLoader";
import { useTrackView } from "@/hooks/useTrackView";

// --- NEUE SICHERHEITS-IMPORTS ---
import { supabase } from "@/integrations/supabase/client";
import { AffiliateDisclaimer } from "@/components/AffiliateDisclaimer";
import { StarRatingWidget } from "@/components/StarRatingWidget";

const getCategoryHeroImage = (category: any) => {
    if (category.hero_image_url) return category.hero_image_url;
    const slug = category.slug.toLowerCase();
    if (slug.includes('krypto') || slug.includes('bitcoin')) return "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2072&auto=format&fit=crop";
    if (slug.includes('dating')) return "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=2072&auto=format&fit=crop";
    return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop";
};

// KYRA UPDATE: Pixel-genaue Amazon-Sterne mit Premium-Gold & Trust-Label
const RatingStars = ({ rating }: { rating: number }) => {
    const score = (rating || 9.5) / 2; 

    return (
        <div className="flex flex-col items-start mt-1">
            <div className="flex gap-0.5">
                {[0, 1, 2, 3, 4].map((index) => {
                    const fill = Math.max(0, Math.min(1, score - index));
                    const fillPercentage = fill * 100;
                    
                    return (
                        <div key={index} className="relative">
                            <Star className="w-4 h-4 text-slate-200 fill-current" />
                            <div className="absolute top-0 left-0 overflow-hidden" style={{ width: `${fillPercentage}%` }}>
                                <Star className="w-4 h-4 text-[#FFB900] fill-current" />
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-slate-500 font-medium bg-slate-50 px-2 py-1 rounded border border-slate-100/50">
                <ShieldCheck className="w-3 h-3 text-green-500" />
                <span>Verifizierte Testnote</span>
            </div>
        </div>
    );
};

const ProjectCard = ({ project, index, category }: { project: any, index: number, category: any }) => {
    const isWinner = index === 0;
    
    const ctaText = category?.project_cta_text || "Zum Anbieter";
    const badgeText = project?.badge_text || category?.hero_badge_text || "EMPFEHLUNG 2026";
    
    const ratingValue = project.rating || 9.5;
    const ratingText = ratingValue >= 9 ? 'EXZELLENT' : (ratingValue >= 8 ? 'SEHR GUT' : 'GUT');

    return (
        <div className={`relative flex flex-col md:flex-row bg-white rounded-3xl transition-all duration-500 overflow-hidden mb-6 group ${isWinner ? 'shadow-2xl shadow-orange-500/10 ring-1 ring-orange-500/30 border-orange-500/20' : 'shadow-lg shadow-slate-100 border border-slate-100 hover:shadow-xl hover:-translate-y-1 hover:border-orange-500/30'}`}>
            
            {/* BADGE */}
            {isWinner && <div className="absolute top-0 right-0 bg-[#0A0F1C] text-orange-400 text-[11px] font-bold px-4 py-1.5 rounded-bl-2xl z-20 flex items-center gap-1 shadow-md"><Trophy className="w-3.5 h-3.5 mr-1 text-orange-500" /> {badgeText}</div>}
            <div className={`md:hidden absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center font-bold shadow-inner z-20 ${isWinner ? 'bg-[#0A0F1C] text-orange-400' : 'bg-slate-100 text-slate-500'}`}>#{index + 1}</div>
            
            {/* LOGO SEKTION */}
            <div className="p-8 md:w-[28%] flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-50 bg-gradient-to-b from-white to-slate-50/50 relative">
                <a href={project.affiliate_link} target="_blank" rel="nofollow noreferrer" className="transform group-hover:scale-105 transition-transform duration-500 ease-out block z-10">
                    {project.logo_url ? (
                        <img src={project.logo_url} alt={project.name} className="h-16 w-auto object-contain mb-4 mix-blend-multiply" />
                    ) : (
                        <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center font-bold text-slate-400 text-2xl border border-slate-100 shadow-sm">{project.name.charAt(0)}</div>
                    )}
                </a>
                <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="font-extrabold text-4xl text-[#0A0F1C] tracking-tighter">{ratingValue}</div>
                    <div className="flex flex-col items-start leading-none">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Punkte</div>
                        <div className="text-xs text-[#0A0F1C] font-bold">{ratingText}</div>
                    </div>
                </div>
                <RatingStars rating={ratingValue} />
            </div>

            {/* CONTENT SEKTION */}
            <div className="p-8 md:w-[47%] flex flex-col justify-center">
                <a href={project.affiliate_link} target="_blank" rel="nofollow noreferrer" className="block w-fit z-10">
                    <h3 className="text-2xl font-bold text-[#0A0F1C] tracking-tight hover:text-orange-500 transition-colors mb-2">{project.name}</h3>
                </a>
                <p className="text-slate-500 text-[15px] mb-6 line-clamp-2 leading-relaxed font-medium">{project.short_description}</p>
                <div className="flex flex-wrap gap-2.5">
                    {(project.features || []).slice(0, 3).map((feat: string, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 text-[13px] font-medium text-slate-600 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-orange-500" /> {feat}
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA SEKTION */}
            <div className="p-8 md:w-[25%] flex flex-col justify-center items-center gap-4 bg-slate-50/30">
                <Button asChild size="lg" className={`w-full h-14 font-bold text-base shadow-lg transition-all duration-300 rounded-xl group/btn ${isWinner ? 'bg-orange-500 hover:bg-[#0A0F1C] text-white hover:text-orange-500 border-none shadow-orange-500/25 hover:shadow-slate-900/20' : 'bg-[#0A0F1C] hover:bg-slate-900 text-white hover:text-orange-500 border-none shadow-slate-900/20'}`}>
                    <a href={project.affiliate_link} target="_blank" rel="nofollow noreferrer" className="flex items-center justify-center gap-2">
                        {ctaText}* <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                    </a>
                </Button>
            </div>
        </div>
    );
};

export default function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  useTrackView(slug, "category");

  const { data: category, isLoading: isCatLoading } = useCategoryBySlug(slug || "");
  const { data: projectsData, isLoading: isProjLoading } = useProjects();
  const { data: categoryProjects } = useCategoryProjects(category?.id);
  const [activeSection, setActiveSection] = useState<string>("");

  const projects = useMemo(() => {
    if (!projectsData || !categoryProjects) return [];
    return categoryProjects.map(cp => {
        const proj = projectsData.find(p => p.id === cp.project_id);
        if (!proj) return null;
        return { ...proj, sort_order: cp.sort_order, features: proj.features || [] };
      }).filter((p): p is NonNullable<typeof p> => p !== null).sort((a, b) => a.sort_order - b.sort_order);
  }, [projectsData, categoryProjects]);
  
  const topPick = projects[0];
  const contentTopRef = useRef<HTMLDivElement | null>(null);

  useForceSEO(category?.meta_description || "");

  // --- NEU: Dynamische Rating-Logik ---
  const [dynamicRating, setDynamicRating] = useState<{stars: number, count: number} | null>(null);

  useEffect(() => {
    const fetchRating = async () => {
      if (!category?.slug) return;
      const { data } = await supabase
        .from('page_ratings')
        .select('total_stars, vote_count')
        .eq('slug', category.slug)
        .maybeSingle();

      if (data && data.vote_count > 0) {
        setDynamicRating({
          stars: Number((data.total_stars / data.vote_count).toFixed(1)),
          count: data.vote_count
        });
      }
    };
    fetchRating();
  }, [category?.slug]);

  // Dynamisches JSON-LD generieren
  const jsonLd = useMemo(() => {
    if (!category) return null;
    const schema: any = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": category.meta_title || category.name,
      "description": category.meta_description,
      "url": `https://rank-scout.com/${category.slug}`
    };

    if (dynamicRating) {
      schema.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": dynamicRating.stars,
        "reviewCount": dynamicRating.count,
        "bestRating": "5",
        "worstRating": "1"
      };
    }
    return JSON.stringify(schema);
  }, [category, dynamicRating]);
  // --- ENDE NEU ---

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); });
      }, { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
    );
    const sections = ["content-top", "vergleich", "content-bottom", "faq"];
    sections.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [category, projects]);

  if (isCatLoading || isProjLoading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="w-12 h-12 animate-spin text-[#0A0F1C]" /></div>;
  
  if (!category || category.is_active === false) {
      return (
          <div className="flex flex-col h-screen items-center justify-center space-y-4 bg-slate-50">
              <Helmet>
                  <title>404 - Seite nicht gefunden | Rank-Scout</title>
                  <meta name="robots" content="noindex, nofollow" />
              </Helmet>
              <h1 className="text-4xl font-black text-[#0A0F1C]">404</h1>
              <p className="text-slate-500 font-medium">Diese Seite existiert nicht oder ist derzeit offline.</p>
              <Link to="/"><Button variant="outline" className="mt-4">Zurück zur Startseite</Button></Link>
          </div>
      );
  }

  const isInternalPage = (category as any)?.is_internal_generated === true;
  const currentUrl = `https://rank-scout.com/${category.slug}`;

  if (category.template === 'hub_overview') {
      return (
        <div className="min-h-screen flex flex-col font-sans bg-slate-50">
            <Helmet>
                <title>{category.meta_title || category.name}</title>
                <link rel="canonical" href={currentUrl} />
                {jsonLd && <script type="application/ld+json">{jsonLd}</script>}
            </Helmet>
            <Header /><HubTemplate category={category} /><Footer />
        </div>
      );
  }

  if (isInternalPage) {
    const updatedAt = new Date(category.updated_at || new Date()).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
    const heroImage = getCategoryHeroImage(category);
    const hasWidgetCode = !!(category as any).comparison_widget_code;

    const introTitle = category.intro_title || "Das Wichtigste in Kürze";
    const comparisonTitle = category.comparison_title || "Alle Anbieter im Vergleich";
    const featuresTitle = category.features_title || "Inhalt";

return (
      <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-[#FAFAFA]">
        <Helmet>
          <title>{category.meta_title || `${category.name}`}</title>
          <meta name="description" content={category.meta_description || ""} />
          <link rel="canonical" href={currentUrl} />
          {/* Dynamisches Schema injizieren */}
          {jsonLd && <script type="application/ld+json">{jsonLd}</script>}
        </Helmet>
        <Header />
        <main className="flex-1">
          {/* Breadcrumbs */}
          <div className="border-b border-white/5 bg-[#0a0a0a] sticky top-[65px] z-30 shadow-md">
            <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 h-12 flex items-center text-sm font-medium text-slate-400 overflow-hidden">
                <Link to="/" className="hover:text-orange-500 flex items-center gap-1 transition-colors"><Home className="w-4 h-4"/> Startseite</Link>
                <span className="mx-2 text-slate-600">/</span>
                <span className="text-white truncate font-semibold">{category.name}</span>
            </div>
          </div>

          {/* Hero */}
          <section className="relative w-full min-h-[500px] md:min-h-[60vh] overflow-hidden rounded-b-[3.5rem] shadow-2xl shadow-slate-300/50 z-20 flex items-center justify-center bg-[#0a0a0a]">
            <div className="absolute inset-0 z-0"><img src={heroImage} alt="Background" className="w-full h-full object-cover object-center opacity-60" /><div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/50 to-transparent"></div></div>
            <div className="container relative z-20 mx-auto px-4 max-w-5xl text-center pt-32 pb-16 md:pt-40 md:pb-20 flex flex-col items-center justify-center">
              <div className="flex justify-center mb-6 md:mb-8"><div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 text-orange-400 px-5 py-2 rounded-full shadow-lg text-[10px] md:text-xs font-bold uppercase tracking-widest"><ShieldCheck className="w-4 h-4 text-orange-500" />{category.hero_pretitle || "Redaktionell geprüft"}</div></div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tighter mb-6 md:mb-8 leading-tight md:leading-[1.1] drop-shadow-2xl px-2">{category.h1_title || category.name}</h1>
              {category.hero_headline && (<p className="text-lg sm:text-xl md:text-2xl text-slate-300 font-medium mb-10 md:mb-12 leading-relaxed max-w-3xl mx-auto antialiased px-4">{category.hero_headline}</p>)}
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-4 bg-white/5 backdrop-blur-sm p-3 rounded-3xl border border-white/10 shadow-2xl max-w-4xl mx-auto w-full sm:w-auto">
                <div className="flex items-center gap-3 px-5 md:px-6 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm w-full sm:w-auto"><div className="p-2 bg-orange-50 rounded-full text-orange-600"><ShieldCheck className="w-5 h-5" /></div><div className="text-left text-slate-800"><div className="text-[10px] text-slate-400 font-bold uppercase">Status</div><div className="text-sm font-bold">Aktuell</div></div></div>
                <div className="flex items-center gap-3 px-5 md:px-6 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm w-full sm:w-auto"><div className="p-2 bg-orange-50 rounded-full text-orange-600"><Clock className="w-5 h-5" /></div><div className="text-left text-slate-800"><div className="text-[10px] text-slate-400 font-bold uppercase">Update</div><div className="text-sm font-bold">{updatedAt}</div></div></div>
              </div>
            </div>
          </section>

          <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 py-12 lg:flex lg:gap-12 relative z-10 -mt-10">
              <div className="lg:w-2/3" ref={contentTopRef}>
                
                {/* Intro Box */}
                <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-200/40 border border-slate-100 mb-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
                  <div className="flex items-start gap-6"><div className="hidden md:flex p-4 bg-orange-50 rounded-2xl text-orange-500 shrink-0"><Lightbulb className="w-8 h-8" /></div><div><h3 className="font-bold text-[#0A0F1C] text-2xl tracking-tight">{introTitle}</h3></div></div>
                </div>

                {category.long_content_top && (<div className="bg-transparent mb-16 px-2 mt-8"><article id="content-top" className="scroll-mt-32 prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[#0A0F1C]"><div dangerouslySetInnerHTML={{ __html: category.long_content_top }} /></article></div>)}
                
                {/* --- INTELLIGENTE WEICHE (Rechner vs. Liste) --- */}
                {hasWidgetCode ? (
                    <div id="vergleich" className="scroll-mt-32 mb-10">
                        <div className="mb-8 px-2">
                            <Badge variant="outline" className="mb-3 border-orange-200 text-orange-600 bg-orange-50 px-3 py-1">Live Rechner</Badge>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A0F1C] tracking-tight flex items-center gap-3">{comparisonTitle}</h2>
                        </div>
                        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                            <UniversalWidgetLoader htmlCode={(category as any).comparison_widget_code} />
                        </div>
                        <p className="text-center text-xs text-slate-400 mt-4">Daten werden bereitgestellt durch unseren Partner.</p>
                    </div>
                ) : (
                    projects.length > 0 && (<div id="vergleich" className="scroll-mt-32 mb-10"><div className="mb-8 px-2"><Badge variant="outline" className="mb-3 border-orange-200 text-orange-600 bg-orange-50 px-3 py-1">{category.hero_badge_text || "Empfehlungen 2026"}</Badge><h2 className="text-3xl md:text-4xl font-extrabold text-[#0A0F1C] tracking-tight flex items-center gap-3">{comparisonTitle}</h2></div><div className="space-y-6">{projects.map((proj, idx) => (<ProjectCard key={proj.id} project={proj} index={idx} category={category} />))}</div></div>)
                )}

                {/* --- NEU: Affiliate Disclaimer UNTER dem Vergleich --- */}
                <div className="mb-16">
                    <AffiliateDisclaimer />
                </div>

                {category.long_content_bottom && (<div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/30 border border-slate-100 mb-16"><article id="content-bottom" className="scroll-mt-32 prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-[#0A0F1C]"><div dangerouslySetInnerHTML={{ __html: category.long_content_bottom }} /></article></div>)}
                
                {category.faq_data && Array.isArray(category.faq_data) && (
                  <section id="faq" className="scroll-mt-32 mb-16">
                    <div className="mb-10 px-2"><h2 className="text-4xl font-extrabold text-[#0A0F1C] tracking-tight">Häufige Fragen</h2></div>
                    <div className="space-y-4">
                      <Accordion type="single" collapsible className="w-full space-y-4">
                        {category.faq_data.map((faq: any, index: number) => (
                          <AccordionItem key={index} value={`item-${index}`} className="bg-white border border-slate-100 shadow-sm rounded-2xl px-2">
                            <AccordionTrigger className="text-left font-bold text-[#0A0F1C] px-6 py-5 text-lg hover:no-underline hover:text-orange-500 transition-colors">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-slate-600 leading-loose px-6 pb-8 pt-2 text-base">
                              <div dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\n/g, '<br/>') }} />
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </section>
                )}

                {/* --- NEU: Sterne-Widget am absoluten Ende des redaktionellen Contents --- */}
                <div className="mb-24 mt-8 border-t border-slate-100 pt-10">
                    <StarRatingWidget slug={category.slug} />
                </div>

              </div>
              
              {/* SIDEBAR */}
              <aside className="lg:w-1/3 lg:sticky top-24 self-start hidden lg:block max-h-[calc(100vh-120px)] overflow-y-auto pr-2 pb-10 custom-scrollbar">
                {!hasWidgetCode && topPick && (<div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 mb-8 relative overflow-hidden"><div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-2xl">EMPFEHLUNG</div><div className="flex items-center gap-3 mb-6"><div className="p-2.5 bg-orange-50 rounded-xl text-orange-500"><Trophy className="w-6 h-6" /></div><p className="font-bold text-[#0A0F1C] text-lg">Top Favorit</p></div><div className="flex items-center gap-5 mb-6">{topPick.logo_url ? (<img src={topPick.logo_url} className="w-20 h-20 object-contain rounded-2xl border border-slate-50 p-2" />) : (<div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center font-bold text-slate-400">{topPick.name.charAt(0)}</div>)}<div className="flex-1"><p className="font-bold text-xl text-[#0A0F1C] leading-tight mb-1.5">{topPick.name}</p><div className="mb-1"><RatingStars rating={topPick.rating} /></div></div></div><Button asChild className="w-full font-bold bg-[#0A0F1C] hover:bg-slate-900 text-white hover:text-orange-500 transition-colors h-14 rounded-xl group/sidebar-btn"><a href={topPick.affiliate_link} target="_blank">Jetzt ansehen* <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover/sidebar-btn:translate-x-1" /></a></Button></div>)}
                
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg shadow-slate-200/30 mb-8">
                  <p className="font-bold text-[#0A0F1C] mb-6 flex items-center gap-2 text-sm uppercase tracking-widest"><Zap className="w-4 h-4 text-orange-500"/> {featuresTitle}</p>
                  <ul className="text-sm space-y-4 font-medium">
                    {category.long_content_top && (<li><a href="#content-top" className={`flex items-center gap-3 transition-colors ${activeSection==='content-top'?'text-orange-500 font-bold':'text-slate-500 hover:text-orange-500'}`}><div className={`w-1.5 h-1.5 rounded-full ${activeSection==='content-top'?'bg-orange-500 scale-125':'bg-slate-300'}`}></div> Einleitung</a></li>)}
                    <li><a href="#vergleich" className={`flex items-center gap-3 transition-colors ${activeSection==='vergleich'?'text-orange-500 font-bold':'text-slate-500 hover:text-orange-500'}`}><div className={`w-1.5 h-1.5 rounded-full ${activeSection==='vergleich'?'bg-orange-500 scale-125':'bg-slate-300'}`}></div> Vergleichstabelle</a></li>
                    {category.long_content_bottom && (<li><a href="#content-bottom" className={`flex items-center gap-3 transition-colors ${activeSection==='content-bottom'?'text-orange-500 font-bold':'text-slate-500 hover:text-orange-500'}`}><div className={`w-1.5 h-1.5 rounded-full ${activeSection==='content-bottom'?'bg-orange-500 scale-125':'bg-slate-300'}`}></div> Details</a></li>)}
                    {category.faq_data && (<li><a href="#faq" className={`flex items-center gap-3 transition-colors ${activeSection==='faq'?'text-orange-500 font-bold':'text-slate-500 hover:text-orange-500'}`}><div className={`w-1.5 h-1.5 rounded-full ${activeSection==='faq'?'bg-orange-500 scale-125':'bg-slate-300'}`}></div> FAQ</a></li>)}
                  </ul>
                </div>

                {((category as any).sidebar_ad_html || (category as any).sidebar_ad_image) && (
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg shadow-slate-200/30 mb-8 flex flex-col items-center justify-center overflow-hidden">
                        <span className="text-[9px] uppercase tracking-widest text-slate-300 font-bold mb-4 w-full text-center">Anzeige</span>
                        {(category as any).sidebar_ad_html ? (
                            <div className="w-full flex justify-center items-center"><div dangerouslySetInnerHTML={{ __html: (category as any).sidebar_ad_html }} /></div>
                        ) : (
                            <img src={(category as any).sidebar_ad_image} alt="Werbung" className="max-w-full h-auto rounded-xl mx-auto" />
                        )}
                    </div>
                )}
                
                <div className="bg-gradient-to-b from-white to-slate-50 rounded-3xl p-8 border border-slate-100 shadow-lg shadow-slate-200/30"><p className="font-bold text-[#0A0F1C] mb-6 text-[10px] uppercase tracking-widest text-center">Rank-Scout Garantie</p><div className="space-y-4 text-sm text-slate-600 font-medium"><div className="flex items-center gap-4"><ShieldCheck className="w-5 h-5 text-green-600" /><span>Redaktionell geprüft</span></div><div className="flex items-center gap-4"><Users className="w-5 h-5 text-[#0A0F1C]" /><span>100% Unabhängig</span></div><div className="flex items-center gap-4"><Lock className="w-5 h-5 text-blue-600" /><span>SSL Verschlüsselt</span></div></div></div>
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
        <link rel="canonical" href={currentUrl} />
        {jsonLd && <script type="application/ld+json">{jsonLd}</script>}
      </Helmet>
      {category.custom_html_override ? (
        <><Header /><CustomHtmlRenderer category={category} projects={projects} htmlContent={category.custom_html_override} /><Footer /></>
      ) : (category.template === 'comparison' && category.theme === 'DATING' && category.slug.includes('stadt')) ? (
        <><Header /><CityLandingTemplate category={category} projects={projects} /><Footer /></>
      ) : (
        <div className="min-h-screen bg-[#0a0a0a] text-white"><Header /><ReviewTemplate category={category} projects={projects} /></div>
      )}
    </>
  );
}