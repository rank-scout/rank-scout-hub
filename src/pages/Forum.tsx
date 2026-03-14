import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useForumThreads, useForumCategories } from "@/hooks/useForum";
import { useForumBannerConfig, useForumAds } from "@/hooks/useSettings"; 
import { Helmet } from "react-helmet-async"; 
import { useForceSEO } from "@/hooks/useForceSEO"; 
import { LoadingScreen } from "@/components/ui/LoadingScreen"; 
import { 
  MessageCircle, Pin, Clock, Search, Filter, User, X, TrendingUp, HelpCircle, 
  Star, BarChart3, ArrowRight, ShieldCheck, Zap, LayoutGrid, Heart, Bitcoin, 
  Globe, MessageSquare, ExternalLink, ChevronRight, Image as ImageIcon
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollToTopHandler } from "@/components/ScrollToTopHandler";
import { useTrackView } from "@/hooks/useTrackView";
import { optimizeSupabaseImageUrl } from "@/lib/sanitizeHtml";

// --- HELPER ---
const getCategoryStyle = (slug: string) => {
  if (slug.includes('krypto') || slug.includes('bitcoin') || slug.includes('finance')) 
    return { icon: Bitcoin, color: "text-orange-500", bg: "bg-orange-500/10", gradient: "from-orange-500/20 to-orange-900/5" };
  if (slug.includes('dating') || slug.includes('liebe') || slug.includes('love')) 
    return { icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10", gradient: "from-rose-500/20 to-rose-900/5" };
  if (slug.includes('ki') || slug.includes('ai') || slug.includes('tech')) 
    return { icon: Zap, color: "text-blue-500", bg: "bg-blue-500/10", gradient: "from-blue-500/20 to-blue-900/5" };
  if (slug.includes('agentur') || slug.includes('business')) 
    return { icon: Globe, color: "text-indigo-500", bg: "bg-indigo-500/10", gradient: "from-indigo-500/20 to-indigo-900/5" };
  
  return { icon: LayoutGrid, color: "text-orange-500", bg: "bg-orange-500/10", gradient: "from-primary/10 to-background" };
};

const ScriptAd = ({ code }: { code: string }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !code) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    const htmlContent = `<!DOCTYPE html><html><head><base target="_blank"><style>body{margin:0;padding:0;display:flex;justify-content:center;align-items:center;font-family:sans-serif;background:transparent;}img{max-width:100%;height:auto;display:block;}a{text-decoration:none;}</style></head><body>${code}</body></html>`;
    try { doc.open(); doc.write(htmlContent); doc.close(); } catch (e) { console.error("Ad rendering failed", e); }
  }, [code]);
  return (<div className="w-full flex justify-center bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-4"><iframe ref={iframeRef} title="Advertisement" style={{ width: '100%', height: '100%', minHeight: '250px', border: 'none' }} scrolling="no" /></div>);
};
const generateExcerpt = (htmlString: string) => {
  if (!htmlString) return "";
  const doc = new DOMParser().parseFromString(htmlString, 'text/html');
  // Entfernt Code-Blöcke, Styles und Scripte komplett aus dem virtuellen DOM
  const elementsToRemove = doc.querySelectorAll('script, style, pre, code');
  elementsToRemove.forEach(el => el.remove());
  
  const text = doc.body.textContent || "";
  return text.replace(/\s+/g, ' ').trim();
};
export default function Forum() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); 
  const [searchParams] = useSearchParams();
  const urlCategoryId = searchParams.get("category");
  
  useTrackView(categorySlug || "forum-index", "forum");
  
  const { data: threads, isLoading } = useForumThreads();
  const { data: categories, isLoading: categoriesLoading } = useForumCategories();
  
  const bannerConfig = useForumBannerConfig(); 
  const globalAds = useForumAds(); 
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortTab, setSortTab] = useState("newest");
  const [randomGlobalAd, setRandomGlobalAd] = useState<any>(null);

  useEffect(() => {
    if (categories && !categoriesLoading) {
      if (categorySlug) {
        const activeCategory = categories.find(c => c.slug === categorySlug);
        if (activeCategory) setCategoryFilter(activeCategory.id);
      } else if (urlCategoryId) {
        const activeCategory = categories.find(c => c.id === urlCategoryId);
        if (activeCategory) {
            navigate(`/forum/kategorie/${activeCategory.slug}`, { replace: true });
        } else {
            setCategoryFilter(urlCategoryId);
        }
      } else {
        setCategoryFilter("all");
      }
    }
  }, [categorySlug, urlCategoryId, categories, categoriesLoading, navigate]);

  useEffect(() => {
      if (globalAds && globalAds.length > 0) {
          const activeAds = globalAds.filter(ad => ad.enabled);
          if (activeAds.length > 0) {
              setRandomGlobalAd(activeAds[Math.floor(Math.random() * activeAds.length)]);
          } else {
              setRandomGlobalAd(null);
          }
      }
  }, [globalAds]); 

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    if (value === "all") navigate("/forum");
    else {
      const cat = categories?.find(c => c.id === value);
      if (cat) navigate(`/forum/kategorie/${cat.slug}`);
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric", });
  const getInitial = (name: string) => name ? name.charAt(0).toUpperCase() : "U";

  // --- HARTE SEO LOGIK ---
  const derivedCategoryName = categorySlug 
    ? categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace(/-/g, ' ') 
    : null;

  const seoCategory = categorySlug && categories 
    ? categories.find(c => c.slug === categorySlug) 
    : null;

  let seoTitle = "Community Forum | Rank-Scout";
  if (seoCategory) {
    seoTitle = seoCategory.seo_title && seoCategory.seo_title.trim() !== "" ? seoCategory.seo_title : `${seoCategory.name} Forum - Erfahrungen & Diskussionen | Rank-Scout`;
  } else if (derivedCategoryName) {
    seoTitle = `${derivedCategoryName} Forum | Rank-Scout`;
  } else if (bannerConfig?.headline) {
    seoTitle = `${bannerConfig.headline} | Rank-Scout`;
  }

  let seoDescription = "Das große Vergleichsportal Forum. Diskutiere mit Experten über Software, Finanzen und mehr.";
  if (seoCategory) {
    if (seoCategory.seo_description && seoCategory.seo_description.trim() !== "") {
      seoDescription = seoCategory.seo_description;
    } else if ((seoCategory as any).meta_description && (seoCategory as any).meta_description.trim() !== "") {
       seoDescription = (seoCategory as any).meta_description;
    } else if (seoCategory.description && seoCategory.description.trim() !== "") {
      seoDescription = seoCategory.description.substring(0, 155);
    } else {
      seoDescription = `Diskutiere jetzt im Bereich ${seoCategory.name} auf Rank-Scout.`;
    }
  } else if (bannerConfig?.subheadline) {
    seoDescription = bannerConfig.subheadline;
  }

  useForceSEO(seoDescription);
  const canonicalUrl = categorySlug ? `${window.location.origin}/forum/kategorie/${categorySlug}` : `${window.location.origin}/forum`;

  const seoHead = (
    <Helmet key={location.pathname}>
      <title>{seoTitle}</title>
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
    </Helmet>
  );

  if (isLoading || categoriesLoading) {
    return (<>{seoHead}<LoadingScreen /></>);
  }

  const filteredThreads = (threads || []).filter((thread) => {
      const matchesSearch = thread.title.toLowerCase().includes(searchQuery.toLowerCase()) || thread.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || thread.category_id === categoryFilter;
      return matchesSearch && matchesCategory && thread.is_active;
  }).sort((a, b) => {
    if (sortTab === "popular") return (b.reply_count || 0) - (a.reply_count || 0);
    if (sortTab === "unanswered") return 0; 
    return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime();
  });
  
  const finalThreads = sortTab === "unanswered" ? filteredThreads.filter(t => !t.is_answered) : filteredThreads;
  const activeCategoryData = categories?.find(c => c.id === categoryFilter);
  const style = activeCategoryData ? getCategoryStyle(activeCategoryData.slug) : { icon: MessageSquare, color: "text-orange-500", bg: "bg-white/10", gradient: "" };
  const CategoryIcon = style.icon;
  const totalThreads = finalThreads.length;

  const currentAd = (() => {
    if (activeCategoryData?.ad_enabled) {
        if (activeCategoryData.assigned_ad_id) {
            const assignedAd = globalAds.find(a => a.id === activeCategoryData.assigned_ad_id);
            if (assignedAd && assignedAd.enabled) return assignedAd;
        }
        if (activeCategoryData.ad_html_code) return { type: 'code', enabled: true, html_code: activeCategoryData.ad_html_code };
        else if (activeCategoryData.ad_image_url) return { type: 'image', enabled: true, image_url: activeCategoryData.ad_image_url, link_url: activeCategoryData.ad_link_url, headline: activeCategoryData.ad_headline, subheadline: activeCategoryData.ad_subheadline, cta_text: activeCategoryData.ad_cta_text };
    }
    return randomGlobalAd;
  })();
  const currentAdAlt = currentAd?.ad_image_alt?.trim() || currentAd?.headline?.trim() || "Anzeige";

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-sans">
      
      {seoHead}
      <Header />
      <ScrollToTopHandler />

      <main className="flex-grow">
        
        {/* RANK-SCOUT HERO (Ultimativer 3D-Space mit Bild & animierten Sternen) */}
        <section className="relative pt-32 pb-24 md:pt-40 md:pb-28 bg-[#0a0f1c] overflow-hidden z-10 rounded-b-[3.5rem] shadow-2xl shadow-slate-300/50">
          
          {/* 1. HINTERGRUNDBILD (Erde/Weltraum) */}
          <div 
            className="absolute inset-0 z-0 opacity-150 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: 'url("https://rank-scout.com/big-threes/forum_magazin_herobild_rank-scout.webp")',
              maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)', 
              WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)' 
            }}
          />

          {/* 2. DUNKLES OVERLAY (Für Lesbarkeit) */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1c]/30 via-[#0a0f1c]/70 to-[#0a0f1c] z-0 pointer-events-none" />

          {/* 3. DIE 3D-STERNE (Animiertes Funkeln) */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-60" 
               style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }}>
            <div className="absolute inset-0 animate-[pulse_4s_ease-in-out_infinite]"
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='3' cy='3' r='0.5'/%3E%3Ccircle cx='33' cy='21' r='0.5'/%3E%3Ccircle cx='48' cy='48' r='0.5'/%3E%3Ccircle cx='18' cy='52' r='0.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
            <div className="absolute inset-0 animate-[pulse_2.5s_ease-in-out_infinite] [animation-delay:1s]"
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.8'%3E%3Ccircle cx='15' cy='15' r='1'/%3E%3Ccircle cx='75' cy='45' r='1'/%3E%3Ccircle cx='105' cy='105' r='1'/%3E%3Ccircle cx='45' cy='85' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
            <div className="absolute inset-0 animate-[pulse_3.5s_ease-in-out_infinite] [animation-delay:0.5s]"
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='240' height='240' viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='50' cy='50' r='1.5'/%3E%3Ccircle cx='180' cy='90' r='1.5'/%3E%3Ccircle cx='120' cy='200' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
          </div>

          {/* 4. GLOW ORBS (Farbige Lichter an den Rändern) */}
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-orange-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none z-0" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none z-0" />
          
          {/* 5. TEXT CONTENT */}
          <div className="container mx-auto px-4 relative z-20 pointer-events-none">
            <div className="max-w-4xl mx-auto text-center pointer-events-auto">
              <div className="inline-flex justify-center mb-8">
                <div className={`p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl`}>
                  <CategoryIcon className={`w-10 h-10 ${style.color || "text-orange-500"}`} />
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tighter text-white leading-tight drop-shadow-lg">
                {categoryFilter !== "all" && activeCategoryData ? activeCategoryData.name : (bannerConfig.headline || "Community Forum")}
              </h1>
              
              <p className="text-lg md:text-2xl text-blue-100/80 font-medium max-w-3xl mx-auto leading-relaxed px-4">
                {categoryFilter !== "all" && activeCategoryData?.description ? activeCategoryData.description : (bannerConfig.subheadline || "Diskutiere mit Experten, teile Erfahrungen und finde harte Fakten.")}
              </p>

              {categoryFilter !== "all" && (
                <div className="flex justify-center gap-4 mt-10">
                    <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-sm font-bold text-white shadow-inner">
                      <MessageSquare className="w-4 h-4 text-orange-500" /> {totalThreads} Beiträge
                    </div>
                    <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-sm font-bold text-white shadow-inner">
                      <ShieldCheck className="w-4 h-4 text-green-400" /> Moderiert
                    </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16 relative z-20 -mt-10">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* MAIN CONTENT (Left) */}
            <div className="lg:w-[70%] space-y-8">
              
              {/* Sticky Such- & Filterbar */}
              <div className="bg-white/80 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-[80px] z-30 transition-all">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input 
                    placeholder="Wissen suchen..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="pl-12 bg-slate-50 border-transparent focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 h-14 rounded-2xl text-base font-medium transition-all" 
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                  )}
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-full md:w-[220px] h-14 rounded-2xl bg-white border-slate-200 font-bold text-[#0A0F1C] focus:ring-orange-500/20">
                        <div className="flex items-center"><Filter className="w-4 h-4 mr-2 text-slate-400" /><SelectValue placeholder="Kategorie wählen" /></div>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                        <SelectItem value="all" className="font-bold">Alle Themen</SelectItem>
                        {categories?.map((cat) => (<SelectItem key={cat.id} value={cat.id} className="font-medium">{cat.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Beiträge Tabs & Liste */}
              <Tabs defaultValue="newest" value={sortTab} onValueChange={setSortTab} className="w-full">
                <div className="flex items-center justify-between mb-6 px-2">
                    <TabsList className="bg-transparent border-none p-0 h-auto gap-2">
                      <TabsTrigger value="newest" className="rounded-full px-6 py-2.5 data-[state=active]:bg-[#0A0F1C] data-[state=active]:text-white data-[state=active]:shadow-md bg-white border border-slate-100 text-slate-500 font-bold transition-all"><Clock className="w-4 h-4 mr-2" /> Neueste</TabsTrigger>
                      <TabsTrigger value="popular" className="rounded-full px-6 py-2.5 data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md bg-white border border-slate-100 text-slate-500 font-bold transition-all"><TrendingUp className="w-4 h-4 mr-2" /> Beliebt</TabsTrigger>
                      <TabsTrigger value="unanswered" className="hidden sm:flex rounded-full px-6 py-2.5 data-[state=active]:bg-rose-500 data-[state=active]:text-white data-[state=active]:shadow-md bg-white border border-slate-100 text-slate-500 font-bold transition-all"><HelpCircle className="w-4 h-4 mr-2" /> Offen</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value={sortTab} className="mt-0 space-y-5">
                  {finalThreads.length > 0 ? (
                    finalThreads.map((thread) => (
                      <Link key={thread.id} to={`/forum/${thread.slug}`} className="block group">
                        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col md:flex-row gap-6">
                          
                          {/* Seitenbalken für wichtige Themen */}
                          {thread.is_pinned && <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500" />}
                          
                          {/* BILD / THUMBNAIL (Wenn vorhanden) */}
{thread.featured_image_url && (
   <div className="w-full md:w-[280px] lg:w-[360px] aspect-[3/2] flex-shrink-0 rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 relative">
      <img 
        src={optimizeSupabaseImageUrl(thread.featured_image_url, 1536, 80)} 
        alt={thread.featured_image_alt?.trim() || thread.title} 
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        loading="lazy"
      />
   </div>
)}

                          {/* AVATAR (Nur wenn kein Bild da ist) */}
                          {!thread.featured_image_url && (
                              <div className="hidden sm:flex w-14 h-14 rounded-full bg-slate-50 items-center justify-center flex-shrink-0 group-hover:bg-orange-50 group-hover:text-orange-500 text-slate-400 font-bold text-xl border border-slate-100 transition-colors">
                                {thread.is_pinned ? <Pin className="w-6 h-6" /> : getInitial(thread.author_name)}
                              </div>
                          )}
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex flex-wrap gap-2 mb-3">
                              {thread.is_pinned && <Badge className="bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100 px-2 py-0.5 text-[10px] uppercase tracking-widest font-bold">Angepinnt</Badge>}
                              {thread.is_answered && <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 px-2 py-0.5 text-[10px] uppercase tracking-widest font-bold">Gelöst</Badge>}
                              {categoryFilter === "all" && thread.category_id && categories?.find(c => c.id === thread.category_id) && (
                                  <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 px-2 py-0.5 text-[10px] uppercase tracking-widest font-bold">
                                      {categories.find(c => c.id === thread.category_id)?.name}
                                  </Badge>
                              )}
                            </div>
                            
                            <h3 className="text-xl md:text-2xl font-extrabold text-[#0A0F1C] group-hover:text-orange-500 transition-colors mb-2 line-clamp-2 leading-tight">
                              {thread.title}
                            </h3>
                            <p className="text-slate-500 text-base line-clamp-2 mb-5 leading-relaxed">
  {generateExcerpt(thread.content).substring(0, 180)}...
</p>
                            
                            {/* Footer Meta */}
                            <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-t border-slate-100 pt-4 mt-auto">
                              <div className="flex items-center gap-4 md:gap-6 uppercase tracking-wider">
                                <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {thread.author_name}</span>
                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatDate(thread.created_at || "")}</span>
                              </div>
                              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full text-slate-600 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                                  <MessageCircle className="w-4 h-4" /> 
                                  <span>{thread.reply_count || 0}</span>
                              </div>
                            </div>
                          </div>

                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                      <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                          <Search className="w-10 h-10 text-slate-300" />
                      </div>
                      <h3 className="text-2xl font-extrabold text-[#0A0F1C] mb-2">Keine Beiträge gefunden</h3>
                      <p className="text-slate-500 max-w-sm mx-auto text-lg">Zu diesem Filter gibt es aktuell keine Diskussionen. Sei der Erste!</p>
                      <Button className="mt-8 rounded-full h-12 px-8 font-bold border-slate-200" variant="outline" onClick={() => navigate("/forum")}>Alle anzeigen</Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* SIDEBAR (Right) */}
            <div className="lg:w-[30%] space-y-8">
              
              {/* Kategorie Info Card */}
              {activeCategoryData && (
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-orange-500" />
                  <h2 className="flex items-center gap-3 text-xl font-extrabold text-[#0A0F1C] mb-4">
                    <Star className="w-6 h-6 text-orange-500" /> Über {activeCategoryData.name}
                  </h2>
                  <p className="text-slate-600 leading-relaxed font-medium mb-6">
                    {activeCategoryData.description || `Willkommen im Bereich für ${activeCategoryData.name}. Hier findest du alle relevanten Diskussionen.`}
                  </p>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <p className="font-extrabold text-[#0A0F1C] mb-1">Du suchst Anbieter?</p>
                    <p className="text-sm text-slate-500 mb-4">Vergleiche passende {activeCategoryData.name}-Lösungen im Überblick.</p>
                    <Button asChild className="w-full bg-[#0A0F1C] hover:bg-slate-900 text-white hover:text-orange-500 rounded-xl h-12 font-bold group">
                        <Link to={`/${activeCategoryData.slug}`}>
                            Zum Vergleich <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* Status Card */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg shadow-slate-200/30">
                <h2 className="text-lg font-extrabold flex items-center gap-2 text-[#0A0F1C] mb-6">
                    <BarChart3 className="w-5 h-5 text-orange-500" /> Community Status
                </h2>
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-bold text-sm uppercase tracking-widest">Diskussionen</span>
                      <span className="font-extrabold text-xl text-[#0A0F1C]">{totalThreads}</span>
                  </div>
                  <div className="h-px bg-slate-100" />
                  <div className="bg-emerald-50 text-emerald-600 px-4 py-2.5 rounded-xl text-xs font-bold text-center border border-emerald-100 uppercase tracking-widest flex items-center justify-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      Live Community
                  </div>
                </div>
              </div>

              {/* Werbung / Ads */}
              {currentAd && currentAd.enabled && (
                <div className="space-y-6">
                  {currentAd.type === 'code' && currentAd.html_code && <ScriptAd code={currentAd.html_code} />}
                  {currentAd.type === 'image' && currentAd.image_url && (
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/30 transition-all hover:shadow-xl group">
                      {(currentAd.headline || currentAd.subheadline) && (
                        <div className="mb-5">
                          {currentAd.headline && <h4 className="font-extrabold text-xl text-[#0A0F1C] mb-2">{currentAd.headline}</h4>}
                          {currentAd.subheadline && <p className="text-sm text-slate-500 font-medium">{currentAd.subheadline}</p>}
                        </div>
                      )}
                      <a href={currentAd.link_url || "#"} target={currentAd.link_url?.startsWith("http") ? "_blank" : "_self"} rel="noopener noreferrer" className="block relative overflow-hidden rounded-2xl mb-5 border border-slate-100">
                        <img src={optimizeSupabaseImageUrl(currentAd.image_url, 800, 80)} alt={currentAdAlt} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                        <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] px-2.5 py-1 rounded backdrop-blur-md z-20 font-bold uppercase tracking-widest">Anzeige</div>
                      </a>
                      {currentAd.cta_text && (
                        <Button asChild className="w-full h-12 rounded-xl bg-orange-500 hover:bg-[#0A0F1C] text-white font-bold transition-colors">
                          <a href={currentAd.link_url || "#"} target={currentAd.link_url?.startsWith("http") ? "_blank" : "_self"} rel="noopener noreferrer">
                              {currentAd.cta_text} <ChevronRight className="w-4 h-4 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
              
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}