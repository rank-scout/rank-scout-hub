import { useState } from "react";
import { useSettings, useUpdateSetting } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Save, Lock, Globe, Layout, Link2, Sparkles, Building } from "lucide-react";
import type { TrendingLink, NavLink } from "@/lib/schemas";
import type { Json } from "@/integrations/supabase/types";

export default function AdminSettings() {
  const { data: settings, isLoading } = useSettings();
  const updateSetting = useUpdateSetting();

  const [siteTitle, setSiteTitle] = useState("");
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
  const [initialized, setInitialized] = useState(false);

  // Initialize form values from settings
  if (settings && !initialized) {
    setSiteTitle((settings.site_title as string) || "Rank-Scout");
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
    setInitialized(true);
  }

  async function saveSetting(key: string, value: Json) {
    try {
      await updateSetting.mutateAsync({ key, value });
      toast({ title: "Einstellung gespeichert" });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Einstellung konnte nicht gespeichert werden",
        variant: "destructive",
      });
    }
  }

  async function savePin() {
    if (newPin.length < 4) {
      toast({
        title: "Fehler",
        description: "PIN muss mindestens 4 Zeichen haben",
        variant: "destructive",
      });
      return;
    }
    await saveSetting("admin_pin", newPin);
    setNewPin("");
    toast({ title: "Admin-PIN geändert" });
  }

  function addTrendingLink() {
    setTrendingLinks([...trendingLinks, { label: "", url: "", emoji: "" }]);
  }

  function updateTrendingLink(index: number, field: keyof TrendingLink, value: string) {
    const updated = [...trendingLinks];
    updated[index] = { ...updated[index], [field]: value };
    setTrendingLinks(updated);
  }

  function removeTrendingLink(index: number) {
    setTrendingLinks(trendingLinks.filter((_, i) => i !== index));
  }

  function addNavLink() {
    setNavLinks([...navLinks, { label: "", url: "" }]);
  }

  function updateNavLink(index: number, field: keyof NavLink, value: string) {
    const updated = [...navLinks];
    updated[index] = { ...updated[index], [field]: value };
    setNavLinks(updated);
  }

  function removeNavLink(index: number) {
    setNavLinks(navLinks.filter((_, i) => i !== index));
  }

  function addFooterLink() {
    setFooterLinks([...footerLinks, { label: "", url: "" }]);
  }

  function updateFooterLink(index: number, field: keyof NavLink, value: string) {
    const updated = [...footerLinks];
    updated[index] = { ...updated[index], [field]: value };
    setFooterLinks(updated);
  }

  function removeFooterLink(index: number) {
    setFooterLinks(footerLinks.filter((_, i) => i !== index));
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Einstellungen</h2>
        <p className="text-muted-foreground">Verwalte globale Website-Einstellungen.</p>
      </div>

      {/* Site Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Website
          </CardTitle>
          <CardDescription>Grundlegende Einstellungen für deine Website (SEO).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="siteTitle">Website Titel</Label>
            <Input
              id="siteTitle"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              placeholder="Rank-Scout - Dein Vergleichsportal"
            />
            <p className="text-xs text-muted-foreground mt-1">Wird im Browser-Tab angezeigt</p>
          </div>
          <div>
            <Label htmlFor="siteDescription">Meta Beschreibung</Label>
            <Textarea
              id="siteDescription"
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              placeholder="Rank-Scout vergleicht die besten Anbieter..."
              rows={2}
            />
            <p className="text-xs text-muted-foreground mt-1">Wird in Google-Suchergebnissen angezeigt</p>
          </div>
          <Button 
            onClick={() => {
              saveSetting("site_title", siteTitle);
              saveSetting("site_description", siteDescription);
            }}
            disabled={updateSetting.isPending}
            className="gap-2"
          >
            {updateSetting.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Speichern
          </Button>
        </CardContent>
      </Card>

      {/* Hero Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Layout className="w-5 h-5" />
            Hero Bereich
          </CardTitle>
          <CardDescription>Titel und Untertitel auf der Startseite.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="heroTitle">Hero Titel</Label>
            <Input
              id="heroTitle"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              placeholder="Entdecke die besten Vergleiche"
            />
          </div>
          <div>
            <Label htmlFor="heroSubtitle">Hero Untertitel</Label>
            <Input
              id="heroSubtitle"
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              placeholder="Wir vergleichen, damit du die richtige Wahl triffst"
            />
          </div>
          <Button 
            onClick={() => {
              saveSetting("hero_title", heroTitle);
              saveSetting("hero_subtitle", heroSubtitle);
            }}
            disabled={updateSetting.isPending}
            className="gap-2"
          >
            {updateSetting.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Speichern
          </Button>
        </CardContent>
      </Card>

      {/* Top Bar Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Top-Bar
          </CardTitle>
          <CardDescription>Ankündigungsleiste oben auf der Seite.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="topBarText">Text</Label>
            <Input
              id="topBarText"
              value={topBarText}
              onChange={(e) => setTopBarText(e.target.value)}
              placeholder="🔥 Neues Angebot verfügbar!"
            />
          </div>
          <div>
            <Label htmlFor="topBarLink">Link (optional)</Label>
            <Input
              id="topBarLink"
              value={topBarLink}
              onChange={(e) => setTopBarLink(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <Button 
            onClick={() => {
              saveSetting("top_bar_text", topBarText);
              saveSetting("top_bar_link", topBarLink);
            }}
            disabled={updateSetting.isPending}
            className="gap-2"
          >
            {updateSetting.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Speichern
          </Button>
        </CardContent>
      </Card>

      {/* Trending Links */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Trending Links
          </CardTitle>
          <CardDescription>Beliebte Suchbegriffe unter der Suchleiste.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {trendingLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={link.emoji || ""}
                onChange={(e) => updateTrendingLink(index, "emoji", e.target.value)}
                placeholder="🔥"
                className="w-16 text-center"
              />
              <Input
                value={link.label}
                onChange={(e) => updateTrendingLink(index, "label", e.target.value)}
                placeholder="Label"
                className="flex-1"
              />
              <Input
                value={link.url}
                onChange={(e) => updateTrendingLink(index, "url", e.target.value)}
                placeholder="/url"
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTrendingLink(index)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Button variant="outline" onClick={addTrendingLink} className="gap-2">
              <Plus className="w-4 h-4" />
              Link hinzufügen
            </Button>
            <Button 
              onClick={() => saveSetting("trending_links", trendingLinks as unknown as Json)}
              disabled={updateSetting.isPending}
              className="gap-2"
            >
              {updateSetting.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Speichern
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Nav Links */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg">Navigation</CardTitle>
          <CardDescription>Links im Header der Website.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {navLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={link.label}
                onChange={(e) => updateNavLink(index, "label", e.target.value)}
                placeholder="Label"
                className="flex-1"
              />
              <Input
                value={link.url}
                onChange={(e) => updateNavLink(index, "url", e.target.value)}
                placeholder="https://..."
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeNavLink(index)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Button variant="outline" onClick={addNavLink} className="gap-2">
              <Plus className="w-4 h-4" />
              Link hinzufügen
            </Button>
            <Button 
              onClick={() => saveSetting("nav_links", navLinks as unknown as Json)}
              disabled={updateSetting.isPending}
              className="gap-2"
            >
              {updateSetting.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Speichern
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer Links */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg">Footer Links</CardTitle>
          <CardDescription>Rechtliche Links im Footer (Impressum, Datenschutz, etc.).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {footerLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={link.label}
                onChange={(e) => updateFooterLink(index, "label", e.target.value)}
                placeholder="Label"
                className="flex-1"
              />
              <Input
                value={link.url}
                onChange={(e) => updateFooterLink(index, "url", e.target.value)}
                placeholder="/impressum"
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFooterLink(index)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Button variant="outline" onClick={addFooterLink} className="gap-2">
              <Plus className="w-4 h-4" />
              Link hinzufügen
            </Button>
            <Button 
              onClick={() => saveSetting("footer_links", footerLinks as unknown as Json)}
              disabled={updateSetting.isPending}
              className="gap-2"
            >
              {updateSetting.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Speichern
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Global Footer Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Building className="w-5 h-5" />
            Footer Branding
          </CardTitle>
          <CardDescription>Globale Footer-Einstellungen für alle Seiten (wird verwendet, wenn keine Kategorie-spezifischen Werte gesetzt sind).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="footerSiteName">Site-Name (Logo)</Label>
            <Input
              id="footerSiteName"
              value={footerSiteName}
              onChange={(e) => setFooterSiteName(e.target.value)}
              placeholder="Rank-Scout"
            />
            <p className="text-xs text-muted-foreground mt-1">Wird im Footer als Logo angezeigt</p>
          </div>
          <div>
            <Label htmlFor="footerDesignerName">Designer Name</Label>
            <Input
              id="footerDesignerName"
              value={footerDesignerName}
              onChange={(e) => setFooterDesignerName(e.target.value)}
              placeholder="Digital-Perfect"
            />
          </div>
          <div>
            <Label htmlFor="footerDesignerUrl">Designer URL</Label>
            <Input
              id="footerDesignerUrl"
              value={footerDesignerUrl}
              onChange={(e) => setFooterDesignerUrl(e.target.value)}
              placeholder="https://digital-perfect.com"
            />
          </div>
          <Button 
            onClick={() => {
              saveSetting("footer_site_name", footerSiteName);
              saveSetting("footer_designer_name", footerDesignerName);
              saveSetting("footer_designer_url", footerDesignerUrl);
            }}
            disabled={updateSetting.isPending}
            className="gap-2"
          >
            {updateSetting.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Speichern
          </Button>
        </CardContent>
      </Card>

      {/* Admin PIN */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Admin PIN ändern
          </CardTitle>
          <CardDescription>PIN für das Chef-Cockpit (Mobile Admin).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="newPin">Neuer PIN</Label>
            <Input
              id="newPin"
              type="password"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Mindestens 4 Zeichen"
            />
          </div>
          <Button 
            onClick={savePin}
            variant="outline"
            disabled={updateSetting.isPending}
            className="gap-2"
          >
            {updateSetting.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            PIN ändern
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
