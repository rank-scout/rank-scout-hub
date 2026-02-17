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
  Globe, MessageSquare, ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollToTopHandler } from "@/components/ScrollToTopHandler";
// KYRA FIX: Import für Tracking
import { useTrackView } from "@/hooks/useTrackView";

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
  
  return { icon: LayoutGrid, color: "text-primary", bg: "bg-primary/10", gradient: "from-primary/10 to-background" };
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
  return (<div className="w-full flex justify-center bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden p-4"><iframe ref={iframeRef} title="Advertisement" style={{ width: '100%', height: '100%', minHeight: '250px', border: 'none' }} scrolling="no" /></div>);
};

export default function Forum() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); 
  const [searchParams] = useSearchParams();
  const urlCategoryId = searchParams.get("category");
  
  // KYRA FIX: Wanze platziert. Trackt Kategorie oder Index.
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

  // --- HARTE SEO LOGIK (KYRA FIX: Vor Rendering Logik gezogen) ---
  
  // Wir versuchen den Titel zu setzen, auch wenn "categories" noch laden
  const derivedCategoryName = categorySlug 
    ? categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace(/-/g, ' ') 
    : null;

  const seoCategory = categorySlug && categories 
    ? categories.find(c => c.slug === categorySlug) 
    : null;

  // 1. TITEL
  let seoTitle = "Community Forum | Rank-Scout";
  if (seoCategory) {
    if (seoCategory.seo_title && seoCategory.seo_title.trim() !== "") {
      seoTitle = seoCategory.seo_title;
    } else {
      seoTitle = `${seoCategory.name} Forum - Erfahrungen & Diskussionen | Rank-Scout`;
    }
  } else if (derivedCategoryName) {
    // Fallback während Loading: Titel basierend auf URL generieren
    seoTitle = `${derivedCategoryName} Forum | Rank-Scout`;
  } else if (bannerConfig?.headline) {
    seoTitle = `${bannerConfig.headline} | Rank-Scout`;
  }

  // 2. BESCHREIBUNG
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

  const canonicalUrl = categorySlug
    ? `${window.location.origin}/forum/kategorie/${categorySlug}`
    : `${window.location.origin}/forum`;

  // KYRA FIX: Helmet Block isoliert
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

  // WICHTIG: Erst Helmet rendern, dann Loading prüfen
  if (isLoading || categoriesLoading) {
    return (
      <>
        {seoHead}
        <LoadingScreen />
      </>
    );
  }

  // --- Normales Rendering ab hier ---

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
  const style = activeCategoryData ? getCategoryStyle(activeCategoryData.slug) : { icon: MessageSquare, color: "text-primary", bg: "bg-primary/10", gradient: "from-slate-100 to-white" };
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      
      {seoHead}

      <Header />
      <ScrollToTopHandler />

      <main className="flex-grow pt-20">
        <section className={`relative py-12 md:py-20 overflow-hidden`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-50`} />
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className={`inline-flex items-center justify-center p-3 rounded-2xl mb-6 ${style.bg} shadow-sm ring-1 ring-white/50 backdrop-blur-sm`}>
                <CategoryIcon className={`w-8 h-8 ${style.color}`} />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900">
                {categoryFilter !== "all" && activeCategoryData ? activeCategoryData.name : (bannerConfig.headline || "Community Hub")}
              </h1>
              
              <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                {categoryFilter !== "all" && activeCategoryData?.description ? activeCategoryData.description : (bannerConfig.subheadline || "Diskutiere mit Experten, teile deine Erfahrungen und finde Antworten auf deine Fragen.")}
              </p>

              {categoryFilter !== "all" && (
                <div className="flex justify-center gap-8 mt-8 text-sm font-medium text-slate-500">
                  <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4" />{totalThreads} Beiträge</div>
                  <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" />Moderiert</div>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              {/* Filter & Suche */}
              <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between sticky top-24 z-20 transition-all">
                <div className="relative flex-1 w-full md:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Thema suchen..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-slate-50 border-slate-200" />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  {(categoryFilter !== "all" || searchQuery) && (
                    <Button variant="ghost" size="icon" onClick={() => { setSearchQuery(""); navigate("/forum"); }} title="Filter zurücksetzen"><X className="w-4 h-4" /></Button>
                  )}
                  <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-[180px]"><Filter className="w-4 h-4 mr-2 text-muted-foreground" /><SelectValue placeholder="Kategorie" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Alle Themen</SelectItem>{categories?.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </div>

              {/* Beiträge Tabs */}
              <Tabs defaultValue="newest" value={sortTab} onValueChange={setSortTab} className="w-full">
                <TabsList className="bg-white border p-1 mb-4 w-full md:w-auto justify-start h-auto">
                  <TabsTrigger value="newest" className="data-[state=active]:bg-slate-100 data-[state=active]:text-primary gap-2"><Clock className="w-3.5 h-3.5" /> Neueste</TabsTrigger>
                  <TabsTrigger value="popular" className="data-[state=active]:bg-slate-100 data-[state=active]:text-orange-600 gap-2"><TrendingUp className="w-3.5 h-3.5" /> Beliebt</TabsTrigger>
                  <TabsTrigger value="unanswered" className="data-[state=active]:bg-slate-100 data-[state=active]:text-rose-600 gap-2"><HelpCircle className="w-3.5 h-3.5" /> Unbeantwortet</TabsTrigger>
                </TabsList>
                <TabsContent value={sortTab} className="mt-0 space-y-4">
                  {finalThreads.length > 0 ? (
                    finalThreads.map((thread) => (
                      <Link key={thread.id} to={`/forum/${thread.slug}`} className="block group">
                        <Card className="hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-primary/30 relative overflow-hidden">
                          {thread.is_pinned && <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />}
                          <CardContent className="p-6">
                            <div className="flex gap-4">
                              <div className="hidden sm:flex w-12 h-12 rounded-xl bg-slate-100 items-center justify-center flex-shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                {thread.is_pinned ? <Pin className="w-5 h-5 text-secondary" /> : <User className="w-6 h-6 text-slate-400" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {thread.is_pinned && <Badge variant="secondary" className="text-xs">Wichtig</Badge>}
                                  {thread.is_answered && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none text-xs">Gelöst</Badge>}
                                  {categoryFilter === "all" && thread.category_id && categories?.find(c => c.id === thread.category_id) && (<Badge variant="outline" className="text-xs bg-slate-50">{categories.find(c => c.id === thread.category_id)?.name}</Badge>)}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors mb-2 line-clamp-1">{thread.title}</h3>
                                <p className="text-slate-500 text-sm line-clamp-2 mb-4">{thread.content.replace(/<[^>]*>/g, "").substring(0, 160)}...</p>
                                <div className="flex items-center justify-between text-xs text-slate-400 border-t pt-3">
                                  <div className="flex gap-4">
                                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {thread.author_name}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(thread.created_at || "")}</span>
                                    <span className="flex items-center gap-1 font-medium text-slate-600"><MessageCircle className="w-3.5 h-3.5" /> {thread.reply_count || 0} {thread.reply_count === 1 ? 'Antwort' : 'Antworten'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
                      <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="w-8 h-8 text-slate-300" /></div>
                      <h3 className="text-lg font-medium text-slate-900">Keine Beiträge gefunden</h3>
                      <p className="text-slate-500 max-w-sm mx-auto mt-2">Zu diesem Filter gibt es aktuell keine Diskussionen. Sei der Erste!</p>
                      <Button className="mt-4" variant="outline" onClick={() => navigate("/forum")}>Alle anzeigen</Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* SIDEBAR */}
            <div className="lg:col-span-4 space-y-6">
              {activeCategoryData && (
                <Card className="border-none shadow-lg bg-white overflow-hidden">
                  <div className={`h-2 w-full bg-gradient-to-r ${style.gradient}`} />
                  <CardHeader><h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><Star className={`w-5 h-5 ${style.color}`} />Über {activeCategoryData.name}</h2></CardHeader>
                  <CardContent className="text-sm text-slate-600 space-y-4">
                    <p>{activeCategoryData.description || `Willkommen im Bereich für ${activeCategoryData.name}. Hier findest du alle relevanten Diskussionen.`}</p>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <p className="font-semibold text-slate-900 mb-1">Du suchst Anbieter?</p>
                      <p className="text-xs mb-3">Vergleiche die besten {activeCategoryData.name}-Lösungen.</p>
                      <Button size="sm" className="w-full gap-2 group" asChild><Link to={`/kategorien/${activeCategoryData.slug}`}>Zum Vergleich <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></Link></Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardHeader className="pb-3"><h2 className="text-base font-bold flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" />Community Status</h2></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm"><span className="text-slate-500">Aktive Diskussionen</span><span className="font-bold">{totalThreads}</span></div>
                    <div className="h-px bg-slate-100" />
                    <div className="bg-green-50 text-green-700 px-3 py-2 rounded text-xs font-medium text-center">● Live Community</div>
                  </div>
                </CardContent>
              </Card>

              {currentAd && currentAd.enabled && (
                <div className="space-y-4">
                  {currentAd.type === 'code' && currentAd.html_code && <ScriptAd code={currentAd.html_code} />}
                  {currentAd.type === 'image' && currentAd.image_url && (
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                      {(currentAd.headline || currentAd.subheadline) && (
                        <div className="mb-4">
                          {currentAd.headline && <h4 className="font-bold text-lg leading-tight text-slate-900 mb-1">{currentAd.headline}</h4>}
                          {currentAd.subheadline && <p className="text-sm text-slate-500 leading-relaxed">{currentAd.subheadline}</p>}
                        </div>
                      )}
                      <a href={currentAd.link_url || "#"} target={currentAd.link_url?.startsWith("http") ? "_blank" : "_self"} rel="noopener noreferrer" className="block group relative overflow-hidden rounded-lg mb-4 border border-slate-100">
                        <img src={currentAd.image_url} alt={currentAd.headline || "Anzeige"} className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                        <div className="absolute top-2 right-2 bg-black/40 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm z-20 font-medium">Anzeige</div>
                      </a>
                      {currentAd.cta_text && (
                        <Button asChild className="w-full gap-2 group" variant="default">
                          <a href={currentAd.link_url || "#"} target={currentAd.link_url?.startsWith("http") ? "_blank" : "_self"} rel="noopener noreferrer">{currentAd.cta_text} <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" /></a>
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