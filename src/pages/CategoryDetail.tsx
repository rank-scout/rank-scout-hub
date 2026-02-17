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

// --- NEU: IMPORT UNIVERSAL LOADER ---
import { UniversalWidgetLoader } from "@/components/templates/UniversalWidgetLoader";
// KYRA FIX: Import für Tracking
import { useTrackView } from "@/hooks/useTrackView";

const getCategoryHeroImage = (category: any) => {
    if (category.hero_image_url) return category.hero_image_url;
    const slug = category.slug.toLowerCase();
    if (slug.includes('krypto') || slug.includes('bitcoin')) return "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2072&auto=format&fit=crop";
    if (slug.includes('dating')) return "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=2072&auto=format&fit=crop";
    return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop";
};

const ProjectCard = ({ project, index }: { project: any, index: number }) => {
    const isWinner = index === 0;
    return (
        <div className={`relative flex flex-col md:flex-row bg-white rounded-3xl transition-all duration-500 overflow-hidden mb-6 group ${isWinner ? 'shadow-xl shadow-slate-900/5 ring-1 ring-slate-900/10' : 'shadow-lg shadow-slate-100 border border-slate-100 hover:shadow-xl hover:-translate-y-1'}`}>
            {isWinner && <div className="absolute top-0 right-0 bg-[#0a0a0a] text-white text-[11px] font-bold px-4 py-1.5 rounded-bl-2xl z-10 flex items-center gap-1 shadow-md"><Trophy className="w-3.5 h-3.5 mr-1 text-yellow-500" /> TESTSIEGER 2026</div>}
            <div className={`md:hidden absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center font-bold shadow-inner ${isWinner ? 'bg-[#0a0a0a] text-white' : 'bg-slate-100 text-slate-500'}`}>#{index + 1}</div>
            <div className="p-8 md:w-[28%] flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-50 bg-gradient-to-b from-white to-slate-50/50">
                <div className="transform group-hover:scale-105 transition-transform duration-500 ease-out">{project.logo_url ? (<img src={project.logo_url} alt={project.name} className="h-16 w-auto object-contain mb-4 mix-blend-multiply" />) : (<div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center font-bold text-slate-400 text-2xl border border-slate-100 shadow-sm">{project.name.charAt(0)}</div>)}</div>
                <div className="flex items-center gap-1.5 mb-2"><div className="font-extrabold text-4xl text-slate-900 tracking-tighter">{project.rating || "9.5"}</div><div className="flex flex-col items-start leading-none"><div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Punkte</div><div className="text-xs text-green-600 font-bold">EXZELLENT</div></div></div>
                <div className="flex text-yellow-400 gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}</div>
            </div>
            <div className="p-8 md:w-[47%] flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors mb-2">{project.name}</h3>
                <p className="text-slate-500 text-[15px] mb-6 line-clamp-2 leading-relaxed font-medium">{project.short_description}</p>
                <div className="flex flex-wrap gap-2.5">{(project.features || []).slice(0, 3).map((feat: string, i: number) => (<div key={i} className="flex items-center gap-1.5 text-[13px] font-medium text-slate-600 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg"><CheckCircle2 className="w-4 h-4 text-green-500" /> {feat}</div>))}</div>
            </div>
            <div className="p-8 md:w-[25%] flex flex-col justify-center items-center gap-4 bg-slate-50/30">
                <Button asChild size="lg" className={`w-full h-14 font-bold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 rounded-xl ${isWinner ? 'bg-[#0a0a0a] hover:bg-slate-800 text-white' : 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-200'}`}><a href={project.affiliate_link} target="_blank" rel="nofollow noreferrer" className="flex items-center justify-center gap-2">Zum Anbieter <ArrowRight className="w-5 h-5" /></a></Button>
            </div>
        </div>
    );
};

export default function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  
  // KYRA FIX: Tracking aktivieren!
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
  const isInternalPage = (category as any)?.is_internal_generated === true;

  useForceSEO(category?.meta_description || "");

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); });
      }, { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
    );
    const sections = ["content-top", "vergleich", "content-bottom", "faq"];
    sections.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [category, projects]);

  if (isCatLoading || isProjLoading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="w-12 h-12 animate-spin text-slate-900" /></div>;
  if (!category) return <div className="flex flex-col h-screen items-center justify-center space-y-4 bg-slate-50"><h1 className="text-3xl font-bold text-slate-900">404</h1><Link to="/"><Button variant="outline">Home</Button></Link></div>;

  const currentUrl = `https://rank-scout.com/${category.slug}`;
  const jsonLdSchema = { "@context": "https://schema.org", "@type": "Product", "name": category.name, "description": category.meta_description, "brand": { "@type": "Brand", "name": "Rank-Scout" } };

  if (category.template === 'hub_overview') {
      return (
        <div className="min-h-screen flex flex-col font-sans bg-slate-50">
            <Helmet><title>{category.meta_title || category.name}</title><link rel="canonical" href={currentUrl} /></Helmet>
            <Header /><HubTemplate category={category} /><Footer />
        </div>
      );
  }

  if (isInternalPage) {
    const updatedAt = new Date(category.updated_at || new Date()).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
    const heroImage = getCategoryHeroImage(category);
    const hasWidgetCode = !!(category as any).comparison_widget_code;

    return (
      <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-[#FAFAFA]">
        <Helmet><title>{category.meta_title || `${category.name}`}</title><meta name="description" content={category.meta_description || ""} /><link rel="canonical" href={currentUrl} /><script type="application/ld+json">{JSON.stringify(jsonLdSchema)}</script></Helmet>
        <Header />
        <main className="flex-1">
          {/* Breadcrumbs - Black */}
          <div className="border-b border-white/5 bg-[#0a0a0a] sticky top-[60px] z-30 shadow-md">
            <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 h-12 flex items-center text-sm font-medium text-slate-400 overflow-hidden">
                <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors"><Home className="w-4 h-4"/> Home</Link>
                <span className="mx-2 text-slate-600">/</span>
                <span className="text-white truncate font-semibold">{category.name}</span>
            </div>
          </div>

          {/* Hero - Black */}
          <section className="relative w-full h-[50vh] md:h-[60vh] min-h-[500px] max-h-[800px] overflow-hidden rounded-b-[3.5rem] shadow-2xl shadow-slate-300/50 z-20 flex items-center justify-center bg-[#0a0a0a]">
            <div className="absolute inset-0 z-0"><img src={heroImage} alt="Background" className="w-full h-full object-cover object-center opacity-60" /><div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/50 to-transparent"></div></div>
            <div className="container relative z-20 mx-auto px-4 max-w-5xl text-center py-10">
              <div className="flex justify-center mb-8"><div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 text-slate-200 px-5 py-2 rounded-full shadow-lg text-xs font-bold uppercase tracking-widest"><ShieldCheck className="w-4 h-4 text-white" />{category.hero_pretitle || "Redaktionell geprüft"}</div></div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tighter mb-8 leading-[1.1] drop-shadow-2xl">{category.h1_title || category.name}</h1>
              {category.hero_headline && (<p className="text-xl md:text-2xl text-slate-300 font-medium mb-12 leading-relaxed max-w-3xl mx-auto antialiased">{category.hero_headline}</p>)}
              <div className="inline-flex flex-wrap justify-center gap-4 bg-white/5 backdrop-blur-sm p-3 rounded-3xl border border-white/10 shadow-2xl max-w-4xl mx-auto">
                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm"><div className="p-2 bg-slate-100 rounded-full text-slate-900"><ShieldCheck className="w-5 h-5" /></div><div className="text-left text-slate-800"><div className="text-[10px] text-slate-400 font-bold uppercase">Status</div><div className="text-sm font-bold">Aktuell</div></div></div>
                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm"><div className="p-2 bg-slate-100 rounded-full text-slate-900"><Clock className="w-5 h-5" /></div><div className="text-left text-slate-800"><div className="text-[10px] text-slate-400 font-bold uppercase">Update</div><div className="text-sm font-bold">{updatedAt}</div></div></div>
              </div>
            </div>
          </section>

          <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 py-12 lg:flex lg:gap-12 relative z-10 -mt-10">
              <div className="lg:w-2/3" ref={contentTopRef}>
                <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-200/40 border border-slate-100 mb-10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0a0a0a]"></div>
                  <div className="flex items-start gap-6"><div className="hidden md:flex p-4 bg-slate-50 rounded-2xl text-slate-900 shrink-0"><Lightbulb className="w-8 h-8" /></div><div><h3 className="font-bold text-slate-900 text-2xl mb-4 tracking-tight">Das Wichtigste in Kürze</h3><div className="text-slate-600 leading-loose text-lg">Wir haben die besten Anbieter für dich geprüft.</div></div></div>
                </div>
                {category.long_content_top && (<div className="bg-transparent mb-16 px-2"><article id="content-top" className="scroll-mt-32 prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900"><div dangerouslySetInnerHTML={{ __html: category.long_content_top }} /></article></div>)}
                
                {/* --- INTELLIGENTE WEICHE: WIDGET ODER PROJEKT-LISTE --- */}
                {hasWidgetCode ? (
                    <div id="vergleich" className="scroll-mt-32 mb-20">
                        <div className="mb-8 px-2">
                            <Badge variant="outline" className="mb-3 border-slate-200 text-slate-500 px-3 py-1">Live Rechner</Badge>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">Aktueller Vergleich</h2>
                        </div>
                        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                            <UniversalWidgetLoader htmlCode={(category as any).comparison_widget_code} />
                        </div>
                        <p className="text-center text-xs text-slate-400 mt-4">Daten werden bereitgestellt durch unseren Partner.</p>
                    </div>
                ) : (
                    projects.length > 0 && (<div id="vergleich" className="scroll-mt-32 mb-20"><div className="mb-8 px-2"><Badge variant="outline" className="mb-3 border-slate-200 text-slate-500 px-3 py-1">Testsieger 2026</Badge><h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">Alle Anbieter im Vergleich</h2></div><div className="space-y-6">{projects.map((proj, idx) => (<ProjectCard key={proj.id} project={proj} index={idx} />))}</div></div>)
                )}

                {category.long_content_bottom && (<div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/30 border border-slate-100 mb-16"><article id="content-bottom" className="scroll-mt-32 prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900"><div dangerouslySetInnerHTML={{ __html: category.long_content_bottom }} /></article></div>)}
                {category.faq_data && Array.isArray(category.faq_data) && (<section id="faq" className="scroll-mt-32 mb-24"><div className="mb-10 px-2"><h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Häufige Fragen</h2></div><div className="space-y-4"><Accordion type="single" collapsible className="w-full space-y-4">{category.faq_data.map((faq: any, index: number) => (<AccordionItem key={index} value={`item-${index}`} className="bg-white border border-slate-100 shadow-sm rounded-2xl px-2"><AccordionTrigger className="text-left font-bold text-slate-800 px-6 py-5 text-lg hover:no-underline">{faq.question}</AccordionTrigger><AccordionContent className="text-slate-600 leading-loose px-6 pb-8 pt-2 text-base"><div dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\n/g, '<br/>') }} /></AccordionContent></AccordionItem>))}</Accordion></div></section>)}
              </div>
              
              <aside className="lg:w-1/3 lg:sticky top-24 self-start hidden lg:block max-h-[calc(100vh-120px)] overflow-y-auto pr-2 pb-10 custom-scrollbar">
                {/* Empfehlungs-Box nur zeigen wenn KEIN Widget da ist, da Widgets oft eigene Empfehlungen haben */}
                {!hasWidgetCode && topPick && (<div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 mb-8 relative overflow-hidden"><div className="absolute top-0 right-0 bg-[#0a0a0a] text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-2xl">EMPFEHLUNG</div><div className="flex items-center gap-3 mb-6"><div className="p-2.5 bg-slate-100 rounded-xl text-slate-900"><Trophy className="w-6 h-6" /></div><p className="font-bold text-slate-900 text-lg">Top Favorit</p></div><div className="flex items-center gap-5 mb-6">{topPick.logo_url ? (<img src={topPick.logo_url} className="w-20 h-20 object-contain rounded-2xl border border-slate-50 p-2" />) : (<div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center font-bold text-slate-400">{topPick.name.charAt(0)}</div>)}<div className="flex-1"><p className="font-bold text-xl text-slate-900 leading-tight mb-1.5">{topPick.name}</p><div className="flex text-yellow-400 gap-0.5 mb-1">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}</div><span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">Exzellent</span></div></div><Button asChild className="w-full font-bold bg-[#0a0a0a] hover:bg-slate-800 text-white h-14 rounded-xl"><a href={topPick.affiliate_link} target="_blank">Jetzt ansehen <ArrowRight className="w-5 h-5 ml-2" /></a></Button></div>)}
                
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg shadow-slate-200/30 mb-8">
                  <p className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-sm uppercase tracking-widest"><Zap className="w-4 h-4 text-yellow-500"/> Inhalt</p>
                  <ul className="text-sm space-y-4 font-medium">
                    {category.long_content_top && (<li><a href="#content-top" className={`flex items-center gap-3 transition-colors ${activeSection==='content-top'?'text-slate-900 font-bold':'text-slate-500 hover:text-slate-900'}`}><div className={`w-1.5 h-1.5 rounded-full ${activeSection==='content-top'?'bg-slate-900 scale-125':'bg-slate-300'}`}></div> Einleitung</a></li>)}
                    <li><a href="#vergleich" className={`flex items-center gap-3 transition-colors ${activeSection==='vergleich'?'text-slate-900 font-bold':'text-slate-500 hover:text-slate-900'}`}><div className={`w-1.5 h-1.5 rounded-full ${activeSection==='vergleich'?'bg-slate-900 scale-125':'bg-slate-300'}`}></div> Vergleichstabelle</a></li>
                    {category.long_content_bottom && (<li><a href="#content-bottom" className={`flex items-center gap-3 transition-colors ${activeSection==='content-bottom'?'text-slate-900 font-bold':'text-slate-500 hover:text-slate-900'}`}><div className={`w-1.5 h-1.5 rounded-full ${activeSection==='content-bottom'?'bg-slate-900 scale-125':'bg-slate-300'}`}></div> Details</a></li>)}
                    {category.faq_data && (<li><a href="#faq" className={`flex items-center gap-3 transition-colors ${activeSection==='faq'?'text-slate-900 font-bold':'text-slate-500 hover:text-slate-900'}`}><div className={`w-1.5 h-1.5 rounded-full ${activeSection==='faq'?'bg-slate-900 scale-125':'bg-slate-300'}`}></div> FAQ</a></li>)}
                  </ul>
                </div>

                {/* AD WIDGET (CENTERED & CLEAN) */}
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
                
                <div className="bg-gradient-to-b from-white to-slate-50 rounded-3xl p-8 border border-slate-100 shadow-lg shadow-slate-200/30"><p className="font-bold text-slate-900 mb-6 text-[10px] uppercase tracking-widest text-center">Rank-Scout Garantie</p><div className="space-y-4 text-sm text-slate-600 font-medium"><div className="flex items-center gap-4"><ShieldCheck className="w-5 h-5 text-green-600" /><span>Redaktionell geprüft</span></div><div className="flex items-center gap-4"><Users className="w-5 h-5 text-slate-900" /><span>100% Unabhängig</span></div><div className="flex items-center gap-4"><Lock className="w-5 h-5 text-blue-600" /><span>SSL Verschlüsselt</span></div></div></div>
              </aside>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <><Helmet><title>{category.meta_title || category.name}</title><link rel="canonical" href={currentUrl} /></Helmet>{category.custom_html_override ? (<><Header /><CustomHtmlRenderer html={category.custom_html_override} /><Footer /></>) : (category.template === 'comparison' && category.theme === 'DATING' && category.slug.includes('stadt')) ? (<><Header /><CityLandingTemplate category={category} projects={projects} /><Footer /></>) : (<div className="min-h-screen bg-[#0a0a0a] text-white"><Header /><ReviewTemplate category={category} projects={projects} /></div>)}</>
  );
}