import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "@/hooks/useCategories";
import { useProjects } from "@/hooks/useProjects";
import { useSettings, useUpdateSetting } from "@/hooks/useSettings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  FolderTree, FileBox, Mail, Link2, MousePointer, 
  Download, Activity, Globe, Eye, MessageSquare, Calendar as CalendarIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend 
} from 'recharts';
import { format, startOfMonth, endOfMonth, subDays, isWithinInterval } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

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
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AdminDashboard() {
  // DATE RANGE STATE (Default: Aktueller Monat)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const { data: categories = [] } = useCategories(true);
  const { data: projects = [] } = useProjects(true);
  const { data: settings } = useSettings();
  const updateSetting = useUpdateSetting();

  // 1. STATS QUERY (Zeitraum-basiert)
  const { data: stats = [] } = useQuery({
    queryKey: ["daily-stats", dateRange],
    queryFn: async () => {
        if (!dateRange?.from) return [];
        
        // End-Datum fixen (auf Ende des Tages setzen), falls nur ein Tag gewählt ist
        const fromStr = format(dateRange.from, 'yyyy-MM-dd');
        const toStr = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : fromStr;

        // Wir holen Stats für den Zeitraum
        const { data, error } = await supabase
            .from("daily_stats")
            .select("*")
            .gte("date", fromStr)
            .lte("date", toStr);
            
        if (error) {
            console.error("Stats Error", error);
            return [];
        }
        return data || [];
    }
  });

  // 2. DETAIL DATEN FÜR LISTEN NACHLADEN
  // Wir aggregieren erst alle IDs aus den Stats, um nicht zu viele Requests zu machen
  const blogIds = [...new Set(stats.filter(s => s.type === 'blog').map(s => s.item_id))];
  const threadIds = [...new Set(stats.filter(s => s.type === 'thread').map(s => s.item_id))];

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

  // --- MERGE LOGIC (Stats summieren für Zeitraum) ---
  
  // Helper: Summiert Counts für eine ID im Zeitraum
  const getSumForId = (id: string, type: string) => {
      return stats
        .filter(s => s.item_id === id && s.type === type)
        .reduce((acc, curr) => acc + (curr.count || 0), 0);
  };

  const topBlogs = periodBlogs.map(blog => ({
      ...blog, 
      views: getSumForId(blog.id, 'blog')
  })).sort((a,b) => b.views - a.views).slice(0, 5);

  const topThreads = periodThreads.map(thread => ({
      ...thread, 
      views: getSumForId(thread.id, 'thread')
  })).sort((a,b) => b.views - a.views).slice(0, 5);


  // Basic Stats Queries (Cached)
  const { data: subscribers = [] } = useQuery({ queryKey: ["subscribers"], queryFn: fetchSubscribers });
  const { data: redirects = [] } = useQuery({ queryKey: ["redirects"], queryFn: fetchRedirects });
  
  // --- KPI CALCULATIONS (ZEITRAUM) ---
  const activeCategories = categories.filter((c) => c.is_active).length;
  const activeProjects = projects.filter((p) => p.is_active).length;
  
  // Projekt Klicks im Zeitraum
  const periodProjectClicks = stats
    .filter(s => s.type === 'project')
    .reduce((sum, s) => sum + (s.count || 0), 0);

  // Leads im Zeitraum
  const periodLeads = subscribers.filter(s => {
      if(!dateRange?.from) return false;
      const subDate = new Date(s.created_at);
      const end = dateRange.to || dateRange.from;
      // Setze end auf 23:59:59 um den ganzen Tag mitzunehmen
      const endOfDay = new Date(end);
      endOfDay.setHours(23, 59, 59, 999);
      
      return subDate >= dateRange.from && subDate <= endOfDay;
  }).length;
  
  // --- PIE CHART DATA PREP ---
  const categoryPerformance = categories.map(cat => {
    const catProjectIds = projects.filter(p => p.category_id === cat.id).map(p => p.id);
    
    // Summe Klicks für diese Kategorie im Zeitraum
    const clicks = stats
        .filter(s => s.type === 'project' && catProjectIds.includes(s.item_id))
        .reduce((sum, s) => sum + (s.count || 0), 0);

    return { name: cat.name, value: clicks };
  }).filter(item => item.value > 0); 


  // Toggle Handlers
  async function handleToggle(key: string, value: boolean) {
    try {
      await updateSetting.mutateAsync({ key, value: value as unknown as Json });
      toast({ title: "Einstellung gespeichert" });
    } catch (error) {
      toast({ title: "Fehler", description: "Fehler beim Speichern", variant: "destructive" });
    }
  }

  const toggles = [
    { key: "newsletter_active", label: "Newsletter aktiv", description: "Zeige Newsletter-Box auf allen Seiten" },
    { key: "top_bar_active", label: "Top-Bar aktiv", description: "Ankündigung oben auf der Seite" },
    { key: "popup_active", label: "Popup aktiv", description: "Exit-Intent Popup anzeigen" },
  ];

  // FIX: Prüfe jetzt auch google_search_console_verification
  const analyticsFound = 
    settings?.global_analytics_code || 
    (settings as any)?.google_analytics_id || 
    (settings as any)?.google_search_console_verification;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Admin Cockpit</h2>
          <p className="text-muted-foreground flex items-center gap-2">
            Zeitraum: <span className="font-bold text-primary">
              {dateRange?.from ? (
                dateRange.to ? (
                  `${format(dateRange.from, "dd.MM.yy")} - ${format(dateRange.to, "dd.MM.yy")}`
                ) : (
                  format(dateRange.from, "dd.MM.yyyy")
                )
              ) : "Bitte wählen"}
            </span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
             {/* DATE RANGE PICKER */}
            <Popover>
            <PopoverTrigger asChild>
                <Button
                id="date"
                variant={"outline"}
                className={cn(
                    "w-[260px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                )}
                >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                    dateRange.to ? (
                    <>
                        {format(dateRange.from, "LLL dd, y", { locale: de })} -{" "}
                        {format(dateRange.to, "LLL dd, y", { locale: de })}
                    </>
                    ) : (
                    format(dateRange.from, "LLL dd, y", { locale: de })
                    )
                ) : (
                    <span>Zeitraum wählen</span>
                )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={de}
                />
            </PopoverContent>
            </Popover>

            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${analyticsFound ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                GSC / GA4: {analyticsFound ? 'Aktiv' : 'Fehlt'}
            </div>
        </div>
      </div>

      {/* --- TOP KPIs (Dynamisch nach Zeitraum) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Leads (Zeitraum)</CardTitle>
            <Mail className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{periodLeads}</div>
            <p className="text-xs text-muted-foreground">Anmeldungen im gewählten Bereich</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Klicks (Zeitraum)</CardTitle>
            <MousePointer className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{periodProjectClicks}</div>
            <p className="text-xs text-muted-foreground">Klicks auf "Zum Angebot"</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aktive Projekte</CardTitle>
            <FileBox className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">in {activeCategories} Kategorien</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">SEO Links</CardTitle>
            <Link2 className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{redirects.length}</div>
            <p className="text-xs text-muted-foreground">Redirects verwaltet</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- PERFORMANCE CHART (PIE) --- */}
        <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-primary"/> Performance nach Kategorie</CardTitle>
                <CardDescription>Verteilung der Klicks im gewählten Zeitraum.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                {categoryPerformance.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryPerformance}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {categoryPerformance.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <Activity className="w-8 h-8 opacity-20" />
                        <p>Keine Daten für diesen Zeitraum.</p>
                    </div>
                )}
            </CardContent>
        </Card>

        {/* --- QUICK TOGGLES --- */}
        <Card className="shadow-sm">
          <CardHeader><CardTitle>⚡ Schnellzugriff</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {toggles.map((toggle) => (
              <div key={toggle.key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">{toggle.label}</Label>
                  <p className="text-xs text-muted-foreground">{toggle.description}</p>
                </div>
                <Switch checked={settings?.[toggle.key] === true} onCheckedChange={(c) => handleToggle(toggle.key, c)} />
              </div>
            ))}
            {/* CSV Export Button */}
            <div className="pt-4">
                 <Button variant="outline" className="w-full gap-2" onClick={() => {
                    const csv = "Email,Quelle,Datum\n" + subscribers.map(s => `"${s.email}","${s.source_page || 'Direkt'}","${new Date(s.created_at).toLocaleDateString()}"`).join("\n");
                    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = `leads_${new Date().toISOString().split("T")[0]}.csv`;
                    link.click();
                    toast({ title: "CSV Exportiert" });
                 }}>
                    <Download className="w-4 h-4"/> Leads CSV Export
                 </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- CONTENT INTELLIGENCE (ZEITRAUM) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Blog Posts */}
          <Card className="shadow-sm border-l-4 border-l-blue-500">
             <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Globe className="w-5 h-5 text-blue-500"/> Meistgelesen (Zeitraum)</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="space-y-3">
                    {topBlogs.length === 0 ? <p className="text-sm text-muted-foreground">Keine Views in diesem Zeitraum.</p> : topBlogs.map(post => (
                        <div key={post.id} className="flex justify-between items-center border-b border-slate-50 pb-2 last:border-0">
                            <span className="text-sm font-medium truncate max-w-[70%]">{post.title}</span>
                            <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-full flex gap-1 items-center">
                                <Eye className="w-3 h-3"/> {post.views}
                            </span>
                        </div>
                    ))}
                </div>
             </CardContent>
          </Card>

          {/* Top Forum Threads */}
          <Card className="shadow-sm border-l-4 border-l-purple-500">
             <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><MessageSquare className="w-5 h-5 text-purple-500"/> Heiß diskutiert (Zeitraum)</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="space-y-3">
                    {topThreads.length === 0 ? <p className="text-sm text-muted-foreground">Keine Views in diesem Zeitraum.</p> : topThreads.map(thread => (
                        <div key={thread.id} className="flex justify-between items-center border-b border-slate-50 pb-2 last:border-0">
                            <span className="text-sm font-medium truncate max-w-[70%]">{thread.title}</span>
                            <span className="text-xs font-bold bg-purple-50 text-purple-600 px-2 py-1 rounded-full flex gap-1 items-center">
                                <Eye className="w-3 h-3"/> {thread.views}
                            </span>
                        </div>
                    ))}
                </div>
             </CardContent>
          </Card>
      </div>

      {/* --- GOOGLE LOOKER STUDIO EMBED (Falls URL da ist) --- */}
      {(settings as any)?.custom_report_url && (
        <Card className="shadow-sm">
            <CardHeader><CardTitle>Live Traffic Report (Google)</CardTitle></CardHeader>
            <CardContent>
                <iframe 
                    src={(settings as any).custom_report_url} 
                    width="100%" 
                    height="600" 
                    className="border-0 rounded-lg bg-slate-50" 
                    allowFullScreen
                ></iframe>
            </CardContent>
        </Card>
      )}
    </div>
  );
}