import { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom"; // WICHTIG: useSearchParams ergänzt
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useForumThreads, useForumCategories } from "@/hooks/useForum";
import { useForumBannerConfig } from "@/hooks/useSettings"; 
import { 
  MessageCircle, 
  Pin, 
  Clock, 
  Search, 
  Filter, 
  User, 
  X, 
  TrendingUp, 
  Star, 
  HelpCircle,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  Zap,
  LayoutGrid,
  Heart,
  Bitcoin,
  Globe,
  MessageSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollToTopHandler } from "@/components/ScrollToTopHandler";

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

export default function Forum() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  
  // URL Parameter auslesen (NEU: Damit der Link von der Startseite funktioniert)
  const [searchParams] = useSearchParams();
  const urlCategoryId = searchParams.get("category");
  
  const { data: threads, isLoading } = useForumThreads();
  const { data: categories } = useForumCategories();
  const bannerConfig = useForumBannerConfig(); 
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortTab, setSortTab] = useState("newest");

  // Effekt: Kategorie setzen (Entweder per Slug oder per ?category=ID Parameter)
  useEffect(() => {
    if (categories) {
      if (categorySlug) {
        // Fall 1: URL ist /forum/kategorie/slug
        const activeCategory = categories.find(c => c.slug === categorySlug);
        if (activeCategory) setCategoryFilter(activeCategory.id);
      } else if (urlCategoryId) {
        // Fall 2: URL ist /forum?category=ID (von der Startseite)
        setCategoryFilter(urlCategoryId);
      } else {
        setCategoryFilter("all");
      }
    }
  }, [categorySlug, urlCategoryId, categories]);

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    if (value === "all") navigate("/forum");
    else {
      const cat = categories?.find(c => c.id === value);
      if (cat) navigate(`/forum/kategorie/${cat.slug}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredThreads = useMemo(() => {
    if (!threads) return [];
    
    let filtered = threads.filter((thread) => {
      const matchesSearch =
        thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || thread.category_id === categoryFilter;
      return matchesSearch && matchesCategory && thread.is_active;
    });

    if (sortTab === "popular") {
      filtered.sort((a, b) => (b.reply_count || 0) - (a.reply_count || 0));
    } else if (sortTab === "unanswered") {
      filtered = filtered.filter(t => !t.is_answered);
    } else {
      filtered.sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime());
    }

    return filtered;
  }, [threads, searchQuery, categoryFilter, sortTab]);

  const activeCategoryData = categories?.find(c => c.id === categoryFilter);
  const style = activeCategoryData ? getCategoryStyle(activeCategoryData.slug) : { icon: MessageSquare, color: "text-primary", bg: "bg-primary/10", gradient: "from-slate-100 to-white" };
  const CategoryIcon = style.icon;

  const totalThreads = filteredThreads.length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />
      <ScrollToTopHandler />

      <main className="flex-grow pt-20"> {/* PT-20 hinzugefügt wegen fixed Header */}
        <section className={`relative py-12 md:py-20 overflow-hidden`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-50`} />
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className={`inline-flex items-center justify-center p-3 rounded-2xl mb-6 ${style.bg} shadow-sm ring-1 ring-white/50 backdrop-blur-sm`}>
                <CategoryIcon className={`w-8 h-8 ${style.color}`} />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900">
                {categoryFilter !== "all" && activeCategoryData 
                  ? activeCategoryData.name 
                  : (bannerConfig.headline || "Community Hub")}
              </h1>
              
              <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                {categoryFilter !== "all" && activeCategoryData?.description
                  ? activeCategoryData.description
                  : (bannerConfig.subheadline || "Diskutiere mit Experten, teile deine Erfahrungen und finde Antworten auf deine Fragen.")}
              </p>

              {categoryFilter !== "all" && (
                <div className="flex justify-center gap-8 mt-8 text-sm font-medium text-slate-500">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    {totalThreads} Beiträge
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Moderiert
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div className="lg:col-span-8 space-y-6">
              
              <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between sticky top-24 z-20 transition-all">
                <div className="relative flex-1 w-full md:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Thema suchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-50 border-slate-200"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  {(categoryFilter !== "all" || searchQuery) && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setSearchQuery("");
                        navigate("/forum");
                      }}
                      title="Filter zurücksetzen"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Kategorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Themen</SelectItem>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs defaultValue="newest" value={sortTab} onValueChange={setSortTab} className="w-full">
                <TabsList className="bg-white border p-1 mb-4 w-full md:w-auto justify-start h-auto">
                  <TabsTrigger value="newest" className="data-[state=active]:bg-slate-100 data-[state=active]:text-primary gap-2">
                    <Clock className="w-3.5 h-3.5" /> Neueste
                  </TabsTrigger>
                  <TabsTrigger value="popular" className="data-[state=active]:bg-slate-100 data-[state=active]:text-orange-600 gap-2">
                    <TrendingUp className="w-3.5 h-3.5" /> Beliebt
                  </TabsTrigger>
                  <TabsTrigger value="unanswered" className="data-[state=active]:bg-slate-100 data-[state=active]:text-rose-600 gap-2">
                    <HelpCircle className="w-3.5 h-3.5" /> Unbeantwortet
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={sortTab} className="mt-0 space-y-4">
                  {isLoading ? (
                    [1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
                  ) : filteredThreads.length > 0 ? (
                    filteredThreads.map((thread) => (
                      <Link key={thread.id} to={`/forum/${thread.slug}`} className="block group">
                        <Card className="hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-primary/30 relative overflow-hidden">
                          {thread.is_pinned && (
                            <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
                          )}
                          <CardContent className="p-6">
                            <div className="flex gap-4">
                              <div className="hidden sm:flex w-12 h-12 rounded-xl bg-slate-100 items-center justify-center flex-shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                {thread.is_pinned ? <Pin className="w-5 h-5 text-secondary" /> : <User className="w-6 h-6 text-slate-400" />}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {thread.is_pinned && <Badge variant="secondary" className="text-xs">Wichtig</Badge>}
                                  {thread.is_answered && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none text-xs">Gelöst</Badge>}
                                  {categoryFilter === "all" && thread.category_id && categories?.find(c => c.id === thread.category_id) && (
                                    <Badge variant="outline" className="text-xs bg-slate-50">
                                      {categories.find(c => c.id === thread.category_id)?.name}
                                    </Badge>
                                  )}
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors mb-2 line-clamp-1">
                                  {thread.title}
                                </h3>
                                <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                                  {thread.content.replace(/<[^>]*>/g, "").substring(0, 160)}...
                                </p>

                                <div className="flex items-center justify-between text-xs text-slate-400 border-t pt-3">
                                  <div className="flex gap-4">
                                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {thread.author_name}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(thread.created_at || "")}</span>
                                    <span className="flex items-center gap-1 font-medium text-slate-600">
                                      <MessageCircle className="w-3.5 h-3.5" /> 
                                      {thread.reply_count || 0} {thread.reply_count === 1 ? 'Antwort' : 'Antworten'}
                                    </span>
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
                      <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900">Keine Beiträge gefunden</h3>
                      <p className="text-slate-500 max-w-sm mx-auto mt-2">
                        Zu diesem Filter gibt es aktuell keine Diskussionen. Sei der Erste!
                      </p>
                      <Button className="mt-4" variant="outline" onClick={() => navigate("/forum")}>
                        Alle anzeigen
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <div className="lg:col-span-4 space-y-6">
              {activeCategoryData && (
                <Card className="border-none shadow-lg bg-white overflow-hidden">
                  <div className={`h-2 w-full bg-gradient-to-r ${style.gradient}`} />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Star className={`w-5 h-5 ${style.color}`} />
                      Über {activeCategoryData.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-600 space-y-4">
                    <p>{activeCategoryData.description || `Willkommen im Bereich für ${activeCategoryData.name}. Hier findest du alle relevanten Diskussionen.`}</p>
                    
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <p className="font-semibold text-slate-900 mb-1">Du suchst Anbieter?</p>
                      <p className="text-xs mb-3">Vergleiche die besten {activeCategoryData.name}-Lösungen.</p>
                      <Button size="sm" className="w-full gap-2 group" asChild>
                        <Link to={`/kategorien/${activeCategoryData.slug}`}>
                          Zum Vergleich <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Community Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Aktive Diskussionen</span>
                      <span className="font-bold">{totalThreads}</span>
                    </div>
                    <div className="h-px bg-slate-100" />
                    <div className="bg-green-50 text-green-700 px-3 py-2 rounded text-xs font-medium text-center">
                      ● Live Community
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* WERBEBANNER MIT OVERLAY */}
              {bannerConfig.enabled && ( // FIX: enabled property prüfen (oder wie im Hook definiert)
                <div className="block group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-primary to-slate-900 text-white p-6">
                   <div className="flex flex-col h-full justify-between min-h-[200px]">
                      <div>
                        <div className="text-xs font-bold bg-white/20 px-2 py-1 rounded w-fit mb-4">
                           {bannerConfig.badge}
                        </div>
                        <h4 className="font-bold text-xl leading-tight mb-2">{bannerConfig.headline}</h4>
                        <p className="text-sm opacity-90">{bannerConfig.subheadline}</p>
                      </div>
                      <Button size="sm" variant="secondary" className="mt-4 w-full">
                         Mehr erfahren <ArrowRight className="ml-2 w-3 h-3"/>
                      </Button>
                   </div>
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