import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "@/hooks/useCategories";
import { useProjects } from "@/hooks/useProjects";
import { useSettings, useUpdateSetting } from "@/hooks/useSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FolderTree, FileBox, TrendingUp, Users, Mail, Link2, MousePointer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

// Fetch subscribers
async function fetchSubscribers() {
  const { data, error } = await supabase
    .from("subscribers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

// Fetch redirects
async function fetchRedirects() {
  const { data, error } = await supabase
    .from("redirects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export default function AdminDashboard() {
  const { data: categories = [] } = useCategories(true);
  const { data: projects = [] } = useProjects(true);
  const { data: settings } = useSettings();
  const updateSetting = useUpdateSetting();

  const { data: subscribers = [] } = useQuery({
    queryKey: ["subscribers"],
    queryFn: fetchSubscribers,
  });

  const { data: redirects = [] } = useQuery({
    queryKey: ["redirects"],
    queryFn: fetchRedirects,
  });

  const activeCategories = categories.filter((c) => c.is_active).length;
  const activeProjects = projects.filter((p) => p.is_active).length;
  const totalClicks = redirects.reduce((sum, r) => sum + (r.click_count || 0), 0);

  const stats = [
    {
      title: "Leads",
      value: subscribers.length,
      subtitle: "Newsletter Abonnenten",
      icon: Mail,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Landingpages",
      value: categories.length,
      subtitle: `${activeCategories} aktiv`,
      icon: FolderTree,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      title: "Projekte",
      value: projects.length,
      subtitle: `${activeProjects} aktiv`,
      icon: FileBox,
      color: "text-dating",
      bg: "bg-dating/10",
    },
    {
      title: "Redirect Klicks",
      value: totalClicks,
      subtitle: `${redirects.length} Links`,
      icon: MousePointer,
      color: "text-casino",
      bg: "bg-casino/10",
    },
  ];

  // Toggle handlers
  async function handleToggle(key: string, value: boolean) {
    try {
      await updateSetting.mutateAsync({ key, value: value as unknown as Json });
      toast({ title: "Einstellung gespeichert" });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Einstellung konnte nicht gespeichert werden",
        variant: "destructive",
      });
    }
  }

  const toggles = [
    {
      key: "newsletter_active",
      label: "Newsletter aktiv",
      description: "Zeige Newsletter-Box auf allen Seiten",
    },
    {
      key: "top_bar_active",
      label: "Top-Bar aktiv",
      description: "Ankündigung oben auf der Seite",
    },
    {
      key: "popup_active",
      label: "Popup aktiv",
      description: "Exit-Intent Popup anzeigen",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          Willkommen zurück!
        </h2>
        <p className="text-muted-foreground">
          Hier ist eine Übersicht deines Rank-Scout Portals.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Toggles */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-display">⚡ Quick Toggles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {toggles.map((toggle) => (
            <div key={toggle.key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="space-y-0.5">
                <Label htmlFor={toggle.key} className="text-base font-medium">
                  {toggle.label}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {toggle.description}
                </p>
              </div>
              <Switch
                id={toggle.key}
                checked={settings?.[toggle.key] === true}
                onCheckedChange={(checked) => handleToggle(toggle.key, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-display">📧 Newsletter Anmeldungen</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => {
                const csv = "Email,Quelle,Datum\n" + 
                  subscribers.map(s => 
                    `"${s.email}","${s.source_page || 'Direkt'}","${new Date(s.created_at).toLocaleDateString('de-DE')}"`
                  ).join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = `newsletter_${new Date().toISOString().split("T")[0]}.csv`;
                link.click();
                toast({ title: "CSV heruntergeladen" });
              }}
            >
              <Download className="w-4 h-4" />
              CSV Export
            </Button>
          </CardHeader>
          <CardContent>
            {subscribers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine Anmeldungen vorhanden.</p>
            ) : (
              <div className="space-y-3">
                {subscribers.slice(0, 5).map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{sub.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {sub.source_page || "Direkt"} • {new Date(sub.created_at).toLocaleDateString("de-DE")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Redirects */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-display">🔗 Top Redirects</CardTitle>
          </CardHeader>
          <CardContent>
            {redirects.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine Redirects vorhanden.</p>
            ) : (
              <div className="space-y-3">
                {[...redirects].sort((a, b) => (b.click_count || 0) - (a.click_count || 0)).slice(0, 5).map((redirect) => (
                  <div key={redirect.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground font-mono">/{redirect.slug}</p>
                      <p className="text-xs text-muted-foreground truncate">{redirect.target_url}</p>
                    </div>
                    <span className="text-sm font-bold text-primary ml-2">
                      {redirect.click_count || 0} Klicks
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Landingpages */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-display">📄 Letzte Landingpages</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine Landingpages vorhanden.</p>
            ) : (
              <div className="space-y-3">
                {categories.slice(0, 5).map((category) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{category.icon || "📊"}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{category.name}</p>
                        <p className="text-xs text-muted-foreground">{category.theme}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      category.is_active 
                        ? "bg-green-500/10 text-green-500" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {category.is_active ? "Aktiv" : "Inaktiv"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-display">📱 Letzte Projekte</CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine Projekte vorhanden.</p>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{project.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{project.url}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ml-2 ${
                      project.is_active 
                        ? "bg-green-500/10 text-green-500" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {project.is_active ? "Aktiv" : "Inaktiv"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
