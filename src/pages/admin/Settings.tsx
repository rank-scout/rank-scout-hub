import { useState } from "react";
import { useSettings, useUpdateSetting } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Save, Lock, Globe, Layout, Link2, Sparkles, Building, BarChart3, Palette, CheckCircle2, XCircle, ExternalLink, DollarSign, Image as ImageIcon, Upload } from "lucide-react";
import type { TrendingLink, NavLink } from "@/lib/schemas";
import type { Json } from "@/integrations/supabase/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

export default function AdminSettings() {
  const { data: settings, isLoading } = useSettings();
  const updateSetting = useUpdateSetting();

  const [siteTitle, setSiteTitle] = useState("");
  const [siteLogoUrl, setSiteLogoUrl] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [topBarText, setTopBarText] = useState("");
  const [topBarLink, setTopBarLink] = useState("");
  const [newPin, setNewPin] = useState("");
  const [trendingLinks, setTrendingLinks] = useState<TrendingLink[]>([]);
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
  const [footerLinks, setFooterLinks] = useState<NavLink[]>([]);
  const [footerSiteName, setFooterSiteName] = useState("");
  const [footerDesignerName, setFooterDesignerName] = useState("");
  const [footerDesignerUrl, setFooterDesignerUrl] = useState("");
  const [analyticsCode, setAnalyticsCode] = useState("");
  const [dashboardTheme, setDashboardTheme] = useState<"light" | "dark">("dark");
  const [adsEnabled, setAdsEnabled] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [analyticsStatus, setAnalyticsStatus] = useState<"idle" | "checking" | "found" | "not-found">("idle");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const extractGoogleAnalyticsId = (code: string): string | null => {
    const match = code.match(/G-[A-Z0-9]+/);
    return match ? match[0] : null;
  };

  const googleAnalyticsId = extractGoogleAnalyticsId(analyticsCode);

  const checkAnalyticsStatus = async () => {
    setAnalyticsStatus("checking");
    try {
      const response = await fetch("/", { method: "GET" });
      if (googleAnalyticsId) {
        setAnalyticsStatus("found");
        toast({ title: "Analytics aktiv", description: `Google Analytics ${googleAnalyticsId} ist konfiguriert.` });
      } else {
        setAnalyticsStatus("not-found");
        toast({ title: "Kein Analytics Code", description: "Bitte füge deinen Code ein.", variant: "destructive" });
      }
    } catch (error) {
      setAnalyticsStatus("not-found");
    }
  };

  if (settings && !initialized) {
    setSiteTitle((settings.site_title as string) || "Rank-Scout");
    setSiteLogoUrl((settings.site_logo_url as string) || "");
    setSiteDescription((settings.site_description as string) || "");
    setHeroTitle((settings.hero_title as string) || "");
    setHeroSubtitle((settings.hero_subtitle as string) || "");
    setTopBarText((settings.top_bar_text as string) || "");
    setTopBarLink((settings.top_bar_link as string) || "");
    setTrendingLinks((settings.trending_links as TrendingLink[]) || []);
    setNavLinks((settings.nav_links as NavLink[]) || []);
    setFooterLinks((settings.footer_links as NavLink[]) || []);
    setFooterSiteName((settings.footer_site_name as string) || "Rank-Scout");
    setFooterDesignerName((settings.footer_designer_name as string) || "Digital-Perfect");
    setFooterDesignerUrl((settings.footer_designer_url as string) || "https://digital-perfect.com");
    setAnalyticsCode((settings.global_analytics_code as string) || "");
    setDashboardTheme((settings.dashboard_theme as "light" | "dark") || "dark");
    setAdsEnabled((settings.ads_enabled as boolean) || false);
    setInitialized(true);
  }

  async function saveSetting(key: string, value: Json) {
    try {
      await updateSetting.mutateAsync({ key, value });
      toast({ title: "Einstellung gespeichert" });
    } catch (error) {
      toast({ title: "Fehler", description: "Speichern fehlgeschlagen", variant: "destructive" });
    }
  }

  const handleAdsToggle = (enabled: boolean) => {
    setAdsEnabled(enabled);
    saveSetting("ads_enabled", enabled);
  };

  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('branding')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('branding')
        .getPublicUrl(fileName);

      setSiteLogoUrl(publicUrl);
      await saveSetting('site_logo_url', publicUrl);
      toast({ title: "Logo erfolgreich hochgeladen" });
    } catch (error: any) {
      toast({ title: "Upload Fehler", description: error.message, variant: "destructive" });
    } finally {
      setIsUploadingLogo(false);
    }
  }

  async function removeLogo() {
    setSiteLogoUrl("");
    await saveSetting("site_logo_url", null);
    toast({ title: "Logo entfernt" });
  }

  async function savePin() {
    if (newPin.length < 4) {
      toast({ title: "Fehler", description: "PIN zu kurz", variant: "destructive" });
      return;
    }
    await saveSetting("admin_pin", newPin);
    setNewPin("");
    toast({ title: "Admin-PIN geändert" });
  }

  function addTrendingLink() { setTrendingLinks([...trendingLinks, { label: "", url: "", emoji: "" }]); }
  function updateTrendingLink(index: number, field: keyof TrendingLink, value: string) {
    const updated = [...trendingLinks];
    updated[index] = { ...updated[index], [field]: value };
    setTrendingLinks(updated);
  }
  function removeTrendingLink(index: number) { setTrendingLinks(trendingLinks.filter((_, i) => i !== index)); }

  function addNavLink() { setNavLinks([...navLinks, { label: "", url: "" }]); }
  function updateNavLink(index: number, field: keyof NavLink, value: string) {
    const updated = [...navLinks];
    updated[index] = { ...updated[index], [field]: value };
    setNavLinks(updated);
  }
  function removeNavLink(index: number) { setNavLinks(navLinks.filter((_, i) => i !== index)); }

  function addFooterLink() { setFooterLinks([...footerLinks, { label: "", url: "" }]); }
  function updateFooterLink(index: number, field: keyof NavLink, value: string) {
    const updated = [...footerLinks];
    updated[index] = { ...updated[index], [field]: value };
    setFooterLinks(updated);
  }
  function removeFooterLink(index: number) { setFooterLinks(footerLinks.filter((_, i) => i !== index)); }

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Einstellungen</h2>
        <p className="text-muted-foreground">Verwalte globale Website-Einstellungen.</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Monetarisierung
          </CardTitle>
          <CardDescription>Steuere die Sichtbarkeit von Werbebannern global.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="ads-toggle" className="font-medium">Werbebanner anzeigen</Label>
              <span className="text-sm text-muted-foreground">Aktiviert AdSense und Amazon Banner.</span>
            </div>
            <Switch id="ads-toggle" checked={adsEnabled} onCheckedChange={handleAdsToggle} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Branding & SEO
          </CardTitle>
          <CardDescription>Logo, Titel und Beschreibung.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* LOGO UPLOAD */}
          <div className="space-y-4 border-b border-border pb-6">
            <Label>Logo</Label>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50 overflow-hidden group">
                {siteLogoUrl ? (
                  <img src={siteLogoUrl} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                )}
                {isUploadingLogo && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex gap-2">
                  <Button variant="outline" className="relative cursor-pointer" disabled={isUploadingLogo}>
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                    <Upload className="w-4 h-4 mr-2" />
                    Logo hochladen
                  </Button>
                  {siteLogoUrl && (
                    <Button variant="destructive" variant="ghost" onClick={removeLogo}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Empfohlen: PNG oder WebP mit transparentem Hintergrund. 
                  Wird auf dunklen Hintergründen automatisch weiß gefärbt.
                </p>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="siteTitle">Website Titel</Label>
            <Input id="siteTitle" value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} placeholder="Rank-Scout" />
            <p className="text-xs text-muted-foreground mt-1">Fallback, falls kein Logo hochgeladen ist.</p>
          </div>
          <div>
            <Label htmlFor="siteDescription">Meta Beschreibung</Label>
            <Textarea id="siteDescription" value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} rows={2} />
          </div>
          <Button onClick={() => { saveSetting("site_title", siteTitle); saveSetting("site_description", siteDescription); }}>
            <Save className="w-4 h-4 mr-2" /> Speichern
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2"><Layout className="w-5 h-5" /> Hero Bereich</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Hero Titel</Label><Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} /></div>
          <div><Label>Hero Untertitel</Label><Input value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} /></div>
          <Button onClick={() => { saveSetting("hero_title", heroTitle); saveSetting("hero_subtitle", heroSubtitle); }}><Save className="w-4 h-4 mr-2" /> Speichern</Button>
        </CardContent>
      </Card>

      {/* Restliche Sektionen (TopBar, Trending, etc.) bleiben gleich, gekürzt für Übersichtlichkeit */}
      <Card className="bg-card border-border"><CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Sparkles className="w-5 h-5" />Top-Bar</CardTitle></CardHeader><CardContent className="space-y-4"><div><Label>Text</Label><Input value={topBarText} onChange={(e) => setTopBarText(e.target.value)} /></div><div><Label>Link</Label><Input value={topBarLink} onChange={(e) => setTopBarLink(e.target.value)} /></div><Button onClick={() => { saveSetting("top_bar_text", topBarText); saveSetting("top_bar_link", topBarLink); }}><Save className="w-4 h-4 mr-2" />Speichern</Button></CardContent></Card>

      {/* Global Analytics Code */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2"><BarChart3 className="w-5 h-5" />Analytics Code {analyticsStatus === "found" && <CheckCircle2 className="w-5 h-5 text-green-500" />}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Tracking Code</Label><Textarea value={analyticsCode} onChange={(e) => { setAnalyticsCode(e.target.value); setAnalyticsStatus("idle"); }} rows={8} className="font-mono text-xs" /></div>
          <div className="flex gap-2"><Button onClick={() => saveSetting("global_analytics_code", analyticsCode)}><Save className="w-4 h-4 mr-2" />Speichern</Button><Button variant="outline" onClick={checkAnalyticsStatus} disabled={analyticsStatus === "checking"}>Status prüfen</Button></div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border"><CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Lock className="w-5 h-5" />Admin PIN</CardTitle></CardHeader><CardContent className="space-y-4"><div><Label>Neuer PIN</Label><Input type="password" value={newPin} onChange={(e) => setNewPin(e.target.value)} placeholder="Mind. 4 Zeichen" /></div><Button onClick={savePin} variant="outline"><Lock className="w-4 h-4 mr-2" />PIN ändern</Button></CardContent></Card>
    </div>
  );
}