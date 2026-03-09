import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "@/hooks/useCategories";
import { useProjects } from "@/hooks/useProjects";
import { useSettings, useUpdateSetting } from "@/hooks/useSettings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  FileBox, Mail, Link2, MousePointer, 
  Download, Activity, Globe, Eye, MessageSquare, Calendar as CalendarIcon, 
  MonitorPlay, Layers, ExternalLink, ArrowUpRight, TrendingUp, Percent, Zap, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend 
} from 'recharts';
import { format, startOfMonth, endOfMonth } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// --- FETCH FUNCTIONS ---
async function fetchSubscribers() {
  const { data, error } = await supabase.from("subscribers").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

async function fetchRedirects() {
  const { data, error } = await supabase.from("redirects").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

// --- COLORS ---
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ef4444'];

// --- URL HELPER ---
const getPublicUrl = (type: string, id: string) => {
    const baseUrl = window.location.origin;
    switch(type) {
        case 'page':
            if (id === 'home') return `${baseUrl}/`;
            if (id === 'top-apps') return `${baseUrl}/top-apps`;
            if (id === 'categories-overview') return `${baseUrl}/kategorien`;
            return `${baseUrl}/${id}`;
        case 'category':
            return `${baseUrl}/kategorien/${id}`;
        case 'comparison':
            return `${baseUrl}/${id}`; 
        case 'forum':
            if (id === 'forum-index') return `${baseUrl}/forum`;
            return `${baseUrl}/forum/${id}`; 
        default:
            return baseUrl;
    }
};

export default function AdminDashboard() {
  // DATE RANGE STATE
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  const { data: categories = [] } = useCategories(true);
  const { data: projects = [] } = useProjects(true);
  const { data: settings } = useSettings();
  const updateSetting = useUpdateSetting();

  // 1. NEUE PERIOD STATS (Unique Views aus page_views_analytics)
  const { data: rawAnalytics = [] } = useQuery({
    queryKey: ["analytics-period", dateRange],
    queryFn: async () => {
        if (!dateRange?.from) return [];
        const fromStr = format(dateRange.from, 'yyyy-MM-dd');
        const toStr = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : fromStr;
        const { data, error } = await supabase
            .from("page_views_analytics")
            .select("page_name, page_type, country, view_date")
            .gte("view_date", fromStr)
            .lte("view_date", toStr);
        if (error) throw error;
        return data || [];
    }
  });

  // 2. ALL TIME STATS (Bleibt bestehen, um die gesamte Historie nicht zu verlieren)
  const { data: allTimeStats = [] } = useQuery({
    queryKey: ["daily-stats-alltime"],
    queryFn: async () => {
        const { data, error } = await supabase.from("daily_stats").select("item_id, type, count");
        if (error) throw error;
        return data || [];
    }
  });

  const { data: subscribers = [] } = useQuery({ queryKey: ["subscribers"], queryFn: fetchSubscribers });
  const { data: redirects = [] } = useQuery({ queryKey: ["redirects"], queryFn: fetchRedirects });

  // --- TRAFFIC AGGREGATION ---
  const allTimeMap = useMemo(() => {
    return allTimeStats.reduce((acc: any, curr) => {
        const key = `${curr.item_id}_${curr.type}`;
        acc[key] = (acc[key] || 0) + curr.count;
        return acc;
    }, {});
  }, [allTimeStats]);

  const trafficList = useMemo(() => {
      const map = rawAnalytics.reduce((acc: any, curr) => {
        const key = `${curr.page_name}_${curr.page_type}`;
        if (!acc[key]) {
          acc[key] = { name: curr.page_name, type: curr.page_type, count: 0, last_date: curr.view_date };
        }
        acc[key].count += 1;
        if (new Date(curr.view_date) > new Date(acc[key].last_date)) acc[key].last_date = curr.view_date;
        return acc;
      }, {});
      
      return Object.values(map).map((item: any) => ({
          ...item,
          total_all_time: allTimeMap[`${item.name}_${item.type}`] || item.count
      })).sort((a: any, b: any) => b.count - a.count);
  }, [rawAnalytics, allTimeMap]);

  // --- LÄNDER VERTEILUNG ---
  const countryStats = useMemo(() => {
      const map = rawAnalytics.reduce((acc: any, curr) => {
          const c = curr.country || "Unbekannt";
          acc[c] = (acc[c] || 0) + 1;
          return acc;
      }, {});
      return Object.entries(map)
          .map(([name, value]) => ({ name, value }))
          .sort((a: any, b: any) => (b.value as number) - (a.value as number));
  }, [rawAnalytics]);

  // CONTENT IDs FÜR TITEL
  const blogIds = useMemo(() => [...new Set(rawAnalytics.filter((s:any) => s.page_type === 'blog').map((s:any) => s.page_name))], [rawAnalytics]);
  const threadIds = useMemo(() => [...new Set(rawAnalytics.filter((s:any) => s.page_type === 'thread').map((s:any) => s.page_name))], [rawAnalytics]);

  const { data: periodBlogs = [] } = useQuery({
     queryKey: ["period-blogs", blogIds],
     enabled: blogIds.length > 0,
     queryFn: async () => {
       const { data } = await supabase.from("blog_posts").select("id, title, slug").in("id", blogIds);
       return data || [];
     }
  });

  const { data: periodThreads = [] } = useQuery({
     queryKey: ["period-threads", threadIds],
     enabled: threadIds.length > 0,
     queryFn: async () => {
       const { data } = await supabase.from("forum_threads").select("id, title, slug").in("id", threadIds);
       return data || [];
     }
  });

  // KPIs (Jetzt basierend auf den bereinigten Unique Views)
  const periodProjectClicks = rawAnalytics.filter((s:any) => s.page_type === 'project').length;
  const periodPageViews = rawAnalytics.filter((s:any) => ['page', 'category', 'comparison', 'forum'].includes(s.page_type)).length;
  const totalAllTimeViews = Object.values(allTimeMap).reduce((sum: any, val: any) => sum + val, 0);
  const conversionRate = periodPageViews > 0 ? ((periodProjectClicks / periodPageViews) * 100).toFixed(1) : "0.0";
  const activeProjects = projects.filter((p) => p.is_active).length;

  const periodLeads = subscribers.filter(s => {
      if(!dateRange?.from) return false;
      const subDate = new Date(s.created_at);
      const end = dateRange.to || dateRange.from;
      const endOfDay = new Date(end);
      endOfDay.setHours(23, 59, 59, 999);
      return subDate >= dateRange.from && subDate <= endOfDay;
  }).length;

  const categoryPerformance = categories.map(cat => {
    const catProjectIds = projects.filter(p => p.category_id === cat.id).map(p => p.id);
    const clicks = rawAnalytics.filter((s:any) => s.page_type === 'project' && catProjectIds.includes(s.page_name)).length;
    return { name: cat.name, value: clicks };
  }).filter(item => item.value > 0);

  const topBlogs = periodBlogs.map(blog => ({
      ...blog, views: trafficList.find((t:any) => t.name === blog.id)?.count || 0
  })).sort((a,b) => b.views - a.views).slice(0, 5);

  const topThreads = periodThreads.map(thread => ({
      ...thread, views: trafficList.find((t:any) => t.name === thread.id)?.count || 0
  })).sort((a,b) => b.views - a.views).slice(0, 5);

  async function handleToggle(key: string, value: boolean) {
    try {
      await updateSetting.mutateAsync({ key, value: value as unknown as Json });
      toast({ title: "Einstellung gespeichert" });
    } catch (error) {
      toast({ title: "Fehler", description: "Speichern fehlgeschlagen", variant: "destructive" });
    }
  }

  const toggles = [
    { key: "newsletter_active", label: "Newsletter aktiv", description: "Anzeige auf allen Seiten" },
    { key: "top_bar_active", label: "Top-Bar aktiv", description: "Leiste ganz oben" },
    { key: "popup_active", label: "Popup aktiv", description: "Exit-Intent Layer" },
  ];

  const analyticsFound = settings?.global_analytics_code || (settings as any)?.google_analytics_id || (settings as any)?.google_search_console_verification;

  // --- TRAFFIC TABLE WITH HIGH CONTRAST BADGES ---
  const TrafficTable = ({ data, totalViewsContext }: { data: any[], totalViewsContext: number }) => {
    const sumPeriod = data.reduce((acc, item) => acc + item.count, 0);
    const sumAllTime = data.reduce((acc, item) => acc + item.total_all_time, 0);
    return (
    <div className="rounded-xl border border-slate-100 overflow-hidden shadow-sm">
        <Table>
            <TableHeader className="bg-slate-50">
                <TableRow>
                    <TableHead className="font-bold text-slate-900">Seite / Ziel</TableHead>
                    <TableHead className="font-bold text-slate-900">Typ</TableHead>
                    <TableHead className="text-right font-bold text-slate-900">Anteil</TableHead>
                    <TableHead className="text-right font-bold text-slate-900 text-primary">Views (Zeitraum)</TableHead>
                    <TableHead className="text-right font-bold text-slate-500">Views (Gesamt)</TableHead>
                    <TableHead className="text-right">Live</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground h-24 italic">Keine Daten verfügbar.</TableCell></TableRow>
                ) : (
                    data.map((item: any) => {
                        const share = totalViewsContext > 0 ? (item.count / totalViewsContext) * 100 : 0;
                        return (
                        <TableRow key={`${item.name}-${item.type}`} className="group hover:bg-slate-50/50 transition-colors">
                            <TableCell className="font-bold text-slate-700">{item.name}</TableCell>
                            <TableCell>
                                <Badge className={cn(
                                    "text-white border-none px-3 py-0.5 font-bold",
                                    item.type === 'project' ? 'bg-green-600' : 
                                    item.type === 'page' ? 'bg-blue-600' :
                                    item.type === 'category' ? 'bg-purple-600' : 
                                    item.type === 'comparison' ? 'bg-amber-600' : 'bg-slate-500'
                                )}>{item.type}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <span className="text-[10px] text-slate-400 w-8 font-mono">{share.toFixed(0)}%</span>
                                    <Progress value={share} className="h-1.5 w-12 bg-slate-100" />
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-black text-slate-900 text-base">{item.count}</TableCell>
                            <TableCell className="text-right text-slate-400 font-mono text-xs italic">{item.total_all_time}</TableCell>
                            <TableCell className="text-right">
                                {item.type !== 'project' && (
                                    <Button size="icon" variant="ghost" className="h-8 w-8 opacity-40 group-hover:opacity-100 transition-all" asChild>
                                        <a href={getPublicUrl(item.type, item.name)} target="_blank" rel="noopener noreferrer"><Eye className="w-4 h-4" /></a>
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    )})
                )}
            </TableBody>
            {data.length > 0 && (
                <TableFooter className="bg-slate-50 font-black text-slate-900">
                    <TableRow>
                        <TableCell colSpan={2}>ZUSAMMENFASSUNG</TableCell>
                        <TableCell className="text-right">-</TableCell>
                        <TableCell className="text-right text-primary">{sumPeriod}</TableCell>
                        <TableCell className="text-right text-slate-500 font-normal">{sumAllTime}</TableCell>
                        <TableCell />
                    </TableRow>
                </TableFooter>
            )}
        </Table>
    </div>
  )};

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Kommando-Zentrale</h2>
          <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
            <CalendarIcon className="w-4 h-4 text-primary" /> Zeitraum: <span className="font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">
              {dateRange?.from ? (dateRange.to ? `${format(dateRange.from, "dd.MM.yy")} - ${format(dateRange.to, "dd.MM.yy")}` : format(dateRange.from, "dd.MM.yy")) : "Heute"}
            </span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
            <Popover>
            <PopoverTrigger asChild>
                <Button id="date" variant={"outline"} className="w-[260px] justify-start text-left font-bold border-slate-200">
                    <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                    {dateRange?.from ? (dateRange.to ? <>{format(dateRange.from, "dd.MM.yyyy")} - {format(dateRange.to, "dd.MM.yyyy")}</> : format(dateRange.from, "dd.MM.yyyy")) : <span>Datum wählen</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
                <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={de} disabled={(date) => date > new Date()} />
            </PopoverContent>
            </Popover>
            <div className={`px-4 py-2 rounded-full text-xs font-black uppercase border flex items-center gap-2 ${analyticsFound ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                <div className={`w-2 h-2 rounded-full ${analyticsFound ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-orange-500 animate-pulse'}`}></div>
                Status: {analyticsFound ? 'Live' : 'Check'}
            </div>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-slate-100 shadow-sm group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">Views (Zeitraum)</CardTitle>
            <MonitorPlay className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900">{periodPageViews}</div>
            <p className="text-[10px] text-slate-400 mt-2 italic">Besucher auf der Seite</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-100 shadow-sm group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">Klicks (Zeitraum)</CardTitle>
            <MousePointer className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900">{periodProjectClicks}</div>
            <p className="text-[10px] text-slate-400 mt-2 italic">Outbound Conversions</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/5 to-white border-primary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black text-primary uppercase tracking-widest">Conversion Rate</CardTitle>
            <Percent className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-primary">{conversionRate}%</div>
            <p className="text-[10px] text-primary/60 mt-2 italic">Klicks pro View</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-100 shadow-sm group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">Aktive Projekte</CardTitle>
            <FileBox className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900">{activeProjects}</div>
            <p className="text-[10px] text-slate-400 mt-2 italic">Aktuell gelistet</p>
          </CardContent>
        </Card>
      </div>

      {/* MAIN TRAFFIC MONITOR */}
      <Card className="shadow-lg border-none bg-white rounded-3xl overflow-hidden ring-1 ring-slate-100">
        <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-900"><Layers className="w-6 h-6 text-primary"/> Traffic & Performance Monitor</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Analyse aller Besucherströme inklusive All-Time Statistiken.</CardDescription>
                </div>
                <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase block leading-none mb-1">Views Gesamt (Historie)</span>
                    <span className="text-lg font-black text-slate-900">{totalAllTimeViews}</span>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-8">
            <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-6 bg-slate-100 p-1.5 rounded-2xl w-full flex justify-start overflow-x-auto h-auto">
                    <TabsTrigger value="all" className="px-6 py-2.5 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Alles</TabsTrigger>
                    <TabsTrigger value="pages" className="px-6 py-2.5 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">System</TabsTrigger>
                    <TabsTrigger value="comparisons" className="px-6 py-2.5 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Vergleiche</TabsTrigger>
                    <TabsTrigger value="categories" className="px-6 py-2.5 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Kategorien</TabsTrigger>
                    <TabsTrigger value="forum" className="px-6 py-2.5 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Forum</TabsTrigger>
                    <TabsTrigger value="outbound" className="px-6 py-2.5 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-green-700">Affiliate Klicks</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-0 focus-visible:ring-0"><TrafficTable data={trafficList} totalViewsContext={periodPageViews + periodProjectClicks} /></TabsContent>
                <TabsContent value="pages" className="mt-0 focus-visible:ring-0"><TrafficTable data={trafficList.filter((i:any) => i.type === 'page')} totalViewsContext={periodPageViews} /></TabsContent>
                <TabsContent value="comparisons" className="mt-0 focus-visible:ring-0"><TrafficTable data={trafficList.filter((i:any) => i.type === 'comparison')} totalViewsContext={periodPageViews} /></TabsContent>
                <TabsContent value="categories" className="mt-0 focus-visible:ring-0"><TrafficTable data={trafficList.filter((i:any) => i.type === 'category')} totalViewsContext={periodPageViews} /></TabsContent>
                <TabsContent value="forum" className="mt-0 focus-visible:ring-0"><TrafficTable data={trafficList.filter((i:any) => i.type === 'forum')} totalViewsContext={periodPageViews} /></TabsContent>
                <TabsContent value="outbound" className="mt-0 focus-visible:ring-0">
                    <div className="bg-green-50 p-4 rounded-2xl border border-green-100 mb-6 flex items-center gap-4 text-green-800 text-sm font-bold shadow-sm">
                        <TrendingUp className="w-5 h-5 text-green-600"/> Welche Partner generieren aktuell den meisten Umsatz?
                    </div>
                    <TrafficTable data={trafficList.filter((i:any) => i.type === 'project')} totalViewsContext={periodProjectClicks} />
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: CHARTS */}
        <div className="lg:col-span-2 space-y-8">
            {/* PERFORMANCE CHART */}
            <Card className="shadow-sm border-none bg-white rounded-3xl ring-1 ring-slate-100 overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-50">
                    <CardTitle className="flex items-center gap-3 text-xl font-black"><Activity className="w-5 h-5 text-primary"/> Performance Distribution</CardTitle>
                    <CardDescription className="text-slate-400 font-medium uppercase text-[10px] font-bold">Anteil der Klicks nach Kategorie</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] p-6">
                    {categoryPerformance.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={categoryPerformance} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={140} innerRadius={80} paddingAngle={8} dataKey="value">
                                    {categoryPerformance.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />)}
                                </Pie>
                                <RechartsTooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4 bg-slate-50 rounded-3xl border border-dashed m-4">
                            <Globe className="w-12 h-12 opacity-10" /><p className="font-bold text-slate-300 uppercase tracking-widest">Keine Daten verfügbar</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* NEU: LÄNDER VERTEILUNG CHART */}
            <Card className="shadow-sm border-none bg-white rounded-3xl ring-1 ring-slate-100 overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-50">
                    <CardTitle className="flex items-center gap-3 text-xl font-black"><MapPin className="w-5 h-5 text-primary"/> Länder-Verteilung</CardTitle>
                    <CardDescription className="text-slate-400 font-bold uppercase text-[10px]">Herkunft deiner Besucher</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] p-6">
                    {countryStats.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={countryStats} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} innerRadius={60} paddingAngle={5} dataKey="value">
                                    {countryStats.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />)}
                                </Pie>
                                <RechartsTooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4 bg-slate-50 rounded-3xl border border-dashed m-4">
                            <Globe className="w-12 h-12 opacity-10" /><p className="font-bold text-slate-300 uppercase tracking-widest">Warten auf Daten...</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* RIGHT COLUMN: QUICK ACTIONS & EXPORT */}
        <div className="space-y-8 h-full">
            <Card className="shadow-sm border-none bg-white rounded-3xl ring-1 ring-slate-100">
              <CardHeader className="pb-4"><CardTitle className="text-lg font-black flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-500 shadow-yellow-200 shadow-sm rounded-full"/> Schnellzugriff</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {toggles.map((toggle) => (
                  <div key={toggle.key} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-black text-slate-700">{toggle.label}</Label>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{toggle.description}</p>
                    </div>
                    <Switch checked={settings?.[toggle.key] === true} onCheckedChange={(c) => handleToggle(toggle.key, c)} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-none bg-slate-900 text-white rounded-3xl overflow-hidden ring-1 ring-white/10">
              <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                      <Download className="w-6 h-6 text-white"/>
                      <CardTitle className="text-lg font-black text-white">Leads-Export</CardTitle>
                  </div>
              </CardHeader>
              <CardContent className="space-y-4">
                 <p className="text-xs text-slate-400 font-medium leading-relaxed">Exportiere alle Newsletter-Leads inklusive Quelle und Datum als strukturierte CSV.</p>
                 <Button 
                    variant="default" 
                    className="w-full h-14 rounded-2xl font-black bg-orange-500 text-white hover:bg-orange-600 shadow-xl shadow-orange-500/20 transition-all active:scale-95 border-none" 
                    onClick={() => {
                        const csv = "Email,Quelle,Datum\n" + subscribers.map(s => `"${s.email}","${s.source_page || 'Direkt'}","${new Date(s.created_at).toLocaleDateString()}"`).join("\n");
                        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = `rankscout_leads_${new Date().toISOString().split("T")[0]}.csv`;
                        link.click();
                        toast({ title: "CSV Exportiert", description: "Leads erfolgreich heruntergeladen." });
                    }}
                 >
                    Leads CSV Exportieren
                 </Button>
              </CardContent>
            </Card>

            {/* NEU: ANALYTICS EXPORT CARD */}
            <Card className="shadow-sm border-none bg-slate-800 text-white rounded-3xl overflow-hidden ring-1 ring-white/10">
              <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                      <Activity className="w-6 h-6 text-blue-400"/>
                      <CardTitle className="text-lg font-black text-white">Analytics-Export</CardTitle>
                  </div>
              </CardHeader>
              <CardContent className="space-y-4">
                 <p className="text-xs text-slate-400 font-medium leading-relaxed">Exportiere die bereinigten Unique Views inklusive Herkunftsland als CSV.</p>
                 <Button 
                    variant="default" 
                    className="w-full h-14 rounded-2xl font-black bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all active:scale-95 border-none" 
                    onClick={() => {
                        const csv = "Seite,Typ,Land,Datum\n" + rawAnalytics.map((a:any) => `"${a.page_name}","${a.page_type}","${a.country}","${a.view_date}"`).join("\n");
                        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = `rankscout_analytics_${new Date().toISOString().split("T")[0]}.csv`;
                        link.click();
                        toast({ title: "CSV Exportiert", description: "Analytics erfolgreich heruntergeladen." });
                    }}
                 >
                    Analytics Daten (Unique)
                 </Button>
              </CardContent>
            </Card>
        </div>
      </div>

      {/* CONTENT INTELLIGENCE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="shadow-sm border-none bg-white rounded-3xl ring-1 ring-slate-100 group overflow-hidden">
             <CardHeader className="bg-slate-50/50 p-6"><CardTitle className="flex items-center gap-2 text-lg font-black"><Globe className="w-5 h-5 text-blue-500 group-hover:animate-pulse"/> Meistgelesen (Zeitraum)</CardTitle></CardHeader>
             <CardContent className="p-6">
                <div className="space-y-4">
                    {topBlogs.length === 0 ? <p className="text-sm text-slate-400 italic py-10 text-center font-medium">Keine Daten für diesen Zeitraum.</p> : topBlogs.map(post => (
                        <div key={post.id} className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl border border-transparent hover:border-blue-100 transition-all">
                            <div className="flex flex-col max-w-[70%]"><span className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1">Titel</span><span className="text-sm font-bold text-slate-700 truncate">{post.title}</span></div>
                            <div className="flex flex-col items-end"><span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter mb-1">Views</span><span className="text-xs font-black bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full flex gap-2 items-center"><Eye className="w-3 h-3"/> {post.views}</span></div>
                        </div>
                    ))}
                </div>
             </CardContent>
          </Card>

          <Card className="shadow-sm border-none bg-white rounded-3xl ring-1 ring-slate-100 group overflow-hidden">
             <CardHeader className="bg-slate-50/50 p-6"><CardTitle className="flex items-center gap-2 text-lg font-black"><MessageSquare className="w-5 h-5 text-purple-500 group-hover:animate-bounce"/> Heiß diskutiert (Zeitraum)</CardTitle></CardHeader>
             <CardContent className="p-6">
                <div className="space-y-4">
                    {topThreads.length === 0 ? <p className="text-sm text-slate-400 italic py-10 text-center font-medium">Keine Forum-Aktivität im Zeitraum.</p> : topThreads.map(thread => (
                        <div key={thread.id} className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl border border-transparent hover:border-purple-100 transition-all">
                            <div className="flex flex-col max-w-[70%]"><span className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1">Betreff</span><span className="text-sm font-bold text-slate-700 truncate">{thread.title}</span></div>
                            <div className="flex flex-col items-end"><span className="text-[10px] font-black text-purple-400 uppercase tracking-tighter mb-1">Views</span><span className="text-xs font-black bg-purple-50 text-purple-600 px-3 py-1.5 rounded-full flex gap-2 items-center"><Eye className="w-3 h-3"/> {thread.views}</span></div>
                        </div>
                    ))}
                </div>
             </CardContent>
          </Card>
      </div>

      {/* EXTERNAL REPORT */}
      {(settings as any)?.custom_report_url && (
        <Card className="shadow-lg border-none bg-white rounded-3xl overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="bg-slate-50/50 p-6"><CardTitle className="text-lg font-black flex items-center gap-2"><Globe className="w-5 h-5 text-blue-500"/> Google Looker Studio Report</CardTitle></CardHeader>
            <CardContent className="p-0">
                <iframe src={(settings as any).custom_report_url} width="100%" height="800" className="border-0 bg-white" allowFullScreen></iframe>
            </CardContent>
        </Card>
      )}
    </div>
  );
}