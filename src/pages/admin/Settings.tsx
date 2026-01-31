import { useState, useEffect } from "react";
import { 
  useSettings, 
  useUpdateSetting, 
  useHomeLayout, 
  useHomeContent, 
  useForumAds,
  defaultHomeLayout, 
  defaultHomeContent,
  ForumAd 
} from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { 
  Loader2, Trash2, Save, Lock, Globe, Layout, Sparkles, BarChart3, 
  CheckCircle2, DollarSign, Image as ImageIcon, Upload, Link as LinkIcon,
  Target, Users, Plus, Edit, Menu as MenuIcon, MessageSquare, ShieldCheck, List
} from "lucide-react";
import type { Json } from "@/integrations/supabase/types";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminSettings() {
  const { data: settings, isLoading } = useSettings();
  const updateSetting = useUpdateSetting();
  
  // Hooks für Home-Steuerung & Ads
  const { layout } = useHomeLayout();
  const { content: serverContent } = useHomeContent();
  const { data: forumAds } = useForumAds();
  
  // Lokaler State
  const [localContent, setLocalContent] = useState<typeof defaultHomeContent | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Bestehende States
  const [siteTitle, setSiteTitle] = useState("");
  const [siteLogoUrl, setSiteLogoUrl] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [topBarText, setTopBarText] = useState("");
  const [topBarLink, setTopBarLink] = useState("");
  const [newPin, setNewPin] = useState("");
  const [analyticsCode, setAnalyticsCode] = useState("");
  const [adsEnabled, setAdsEnabled] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [analyticsStatus, setAnalyticsStatus] = useState<"idle" | "checking" | "found" | "not-found">("idle");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const [adSenseClient, setAdSenseClient] = useState("");
  const [adSenseSlot, setAdSenseSlot] = useState("");
  const [amznHeadline, setAmznHeadline] = useState("");
  const [amznText, setAmznText] = useState("");
  const [amznButton, setAmznButton] = useState("");
  const [amznLink, setAmznLink] = useState("");

  // SCOUTY STATES
  const [scoutyHighTicketUrl, setScoutyHighTicketUrl] = useState("");
  const [scoutyEnabled, setScoutyEnabled] = useState(true);
  const [scoutyLeadsCount, setScoutyLeadsCount] = useState(0);

  const [isAdDialogOpen, setIsAdDialogOpen] = useState(false);
  const [currentAd, setCurrentAd] = useState<ForumAd>({
    id: "", name: "", type: "image", enabled: true, 
    image_url: "", link_url: "", headline: "", subheadline: "", cta_text: "", html_code: ""
  });

  // --- STANDARD CONFIG WERTE (DEFAULTS) ---
  const defaultHeaderConfig = { 
    nav_links: [
        { label: "Software Vergleich", url: "/categories/software" },
        { label: "Finanz-Tools", url: "/categories/finance" },
        { label: "Agentur Finder", url: "/categories/agency" }
    ], 
    button_text: "Jetzt vergleichen", 
    button_url: "/categories" 
  };

  const defaultFooterConfig = {
    text_checked: "Redaktionell geprüft",
    text_update: "Aktualisiert: 2026",
    // HIER IST DER TEXT, DER AUTOMATISCH ÜBERNOMMEN WIRD
    text_description: "Unsere Vergleiche basieren auf echten Daten, Nutzer-Feedback und Experten-Analysen.", 
    copyright_text: "© 2026 Rank-Scout. Alle Rechte vorbehalten.",
    made_with_text: "Made with",
    made_in_text: "in Germany", 
    disclaimer: "*Werbehinweis: Wir finanzieren uns über sogenannte Affiliate-Links. Wenn Sie über einen Link auf dieser Seite einkaufen, erhalten wir möglicherweise eine Provision. Der Preis für Sie ändert sich dabei nicht. Unsere redaktionelle Unabhängigkeit bleibt davon unberührt.",
    legal_links: [
        { label: "Impressum", url: "/impressum" },
        { label: "Datenschutz", url: "/datenschutz" },
        { label: "AGB", url: "/agb" },
        { label: "Sicherheit", url: "/sicherheit" }
    ],
    popular_links: [
        { label: "Software Vergleich", url: "/categories/software" },
        { label: "Finanz-Tools", url: "/categories/finance" },
        { label: "Agentur Finder", url: "/categories/agency" }
    ]
  };

  const [headerConfig, setHeaderConfig] = useState<any>(defaultHeaderConfig);
  const [footerConfig, setFooterConfig] = useState<any>(defaultFooterConfig);

  // Initialisierung
  if (settings && !initialized) {
    setSiteTitle((settings.site_title as string) || "Rank-Scout");
    setSiteLogoUrl((settings.site_logo_url as string) || "");
    setSiteDescription((settings.site_description as string) || "");
    setTopBarText((settings.top_bar_text as string) || "");
    setTopBarLink((settings.top_bar_link as string) || "");
    setAnalyticsCode((settings.global_analytics_code as string) || "");
    setAdsEnabled((settings.ads_enabled as boolean) || false);
    
    setAdSenseClient((settings.ads_sense_client_id as string) || "");
    setAdSenseSlot((settings.ads_sense_slot_id as string) || "");
    
    setAmznHeadline((settings.ads_amazon_headline as string) || "");
    setAmznText((settings.ads_amazon_text as string) || "");
    setAmznButton((settings.ads_amazon_button_text as string) || "");
    setAmznLink((settings.ads_amazon_link as string) || "");

    // Scouty Init
    // @ts-ignore
    const scoutyConfig = settings.scouty_config as { high_ticket_url?: string; enabled?: boolean } | null;
    setScoutyHighTicketUrl(scoutyConfig?.high_ticket_url || "");
    if (scoutyConfig?.enabled !== undefined) {
      setScoutyEnabled(scoutyConfig.enabled);
    }

    // SICHERES MERGEN FÜR HEADER & FOOTER
    // Wenn in der DB was steht, nehmen wir das und ergänzen fehlende Keys aus den Defaults
    // @ts-ignore
    if (settings.header_config) {
        setHeaderConfig((prev: any) => ({ ...prev, ...(settings.header_config as any) }));
    }
    // @ts-ignore
    if (settings.footer_config) {
        setFooterConfig((prev: any) => ({ ...prev, ...(settings.footer_config as any) }));
    }

    setInitialized(true);
  }

  useEffect(() => {
    if (serverContent && !localContent) {
      setLocalContent(JSON.parse(JSON.stringify(serverContent)));
    }
  }, [serverContent]);

  useEffect(() => {
    const fetchLeads = async () => {
      const { count } = await supabase
        .from("subscribers")
        .select("*", { count: 'exact', head: true })
        .eq("source_page", "scouty_widget");
      if (count !== null) setScoutyLeadsCount(count);
    };
    fetchLeads();
  }, []);

  async function saveSetting(key: string, value: Json) {
    try {
      await updateSetting.mutateAsync({ key, value });
      toast({ title: "Einstellung gespeichert" });
    } catch (error) {
      toast({ title: "Fehler", description: "Speichern fehlgeschlagen", variant: "destructive" });
    }
  }

  const saveScoutyConfig = () => {
    saveSetting("scouty_config", { 
        high_ticket_url: scoutyHighTicketUrl,
        enabled: scoutyEnabled
    });
  };

  const toggleSection = (key: keyof typeof defaultHomeLayout) => {
    // @ts-ignore
    const newLayout = { ...layout, [key]: !layout[key] };
    saveSetting("home_layout_v2", newLayout); 
  };

  const updateContent = (section: string, field: string, value: any) => {
    if (!localContent) return;
    const newContent = { 
      ...localContent, 
      [section]: { 
        //@ts-ignore
        ...(localContent[section] || {}), 
        [field]: value 
      } 
    };
    setLocalContent(newContent);
    setHasUnsavedChanges(true);
  };

  const saveContentManually = () => {
    if (!localContent) return;
    saveSetting("home_content", localContent);
    setHasUnsavedChanges(false);
  };

  // --- BIG THREE DYNAMISCH ---
  const addBigThreeItem = () => {
    if (!localContent) return;
    // @ts-ignore
    const currentItems = localContent.big_three?.items || [];
    const newItem = {
      id: crypto.randomUUID(),
      title: "Neuer Bereich",
      desc: "Beschreibung...",
      link: "/",
      button_text: "Ansehen",
      image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
      theme: "blue",
      icon: "trending"
    };
    updateContent("big_three", "items", [...currentItems, newItem]);
  };

  const removeBigThreeItem = (index: number) => {
    if (!localContent) return;
    // @ts-ignore
    const newItems = [...(localContent.big_three?.items || [])];
    newItems.splice(index, 1);
    updateContent("big_three", "items", newItems);
  };

  const updateBigThreeItem = (index: number, field: string, value: any) => {
    if (!localContent) return;
    // @ts-ignore
    const newItems = [...(localContent.big_three?.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    updateContent("big_three", "items", newItems);
  };

  const updateFeature = (index: number, field: string, value: any) => {
    if (!localContent) return;
    // @ts-ignore
    const currentFeatures = localContent.why_us?.features || [];
    while(currentFeatures.length < 4) {
        currentFeatures.push({ title: "Feature", text: "Beschreibung", icon: "zap" });
    }
    const newFeatures = [...currentFeatures];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    updateContent("why_us", "features", newFeatures);
  };

  // --- HEADER LINKS ---
  const addNavLink = () => {
    const newLinks = [...(headerConfig.nav_links || []), { label: "Neuer Link", url: "/" }];
    setHeaderConfig({ ...headerConfig, nav_links: newLinks });
  };
  const removeNavLink = (index: number) => {
    const newLinks = [...(headerConfig.nav_links || [])];
    newLinks.splice(index, 1);
    setHeaderConfig({ ...headerConfig, nav_links: newLinks });
  };
  const updateNavLink = (index: number, field: string, value: string) => {
    const newLinks = [...(headerConfig.nav_links || [])];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setHeaderConfig({ ...headerConfig, nav_links: newLinks });
  };

  // --- FOOTER LINKS ---
  const addLegalLink = () => {
    const newLinks = [...(footerConfig.legal_links || []), { label: "Neuer Link", url: "/" }];
    setFooterConfig({ ...footerConfig, legal_links: newLinks });
  };
  const removeLegalLink = (index: number) => {
    const newLinks = [...(footerConfig.legal_links || [])];
    newLinks.splice(index, 1);
    setFooterConfig({ ...footerConfig, legal_links: newLinks });
  };
  const updateLegalLink = (index: number, field: string, value: string) => {
    const newLinks = [...(footerConfig.legal_links || [])];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setFooterConfig({ ...footerConfig, legal_links: newLinks });
  };
  
  const addPopularLink = () => {
    const newLinks = [...(footerConfig.popular_links || []), { label: "Neuer Link", url: "/" }];
    setFooterConfig({ ...footerConfig, popular_links: newLinks });
  };
  const removePopularLink = (index: number) => {
    const newLinks = [...(footerConfig.popular_links || [])];
    newLinks.splice(index, 1);
    setFooterConfig({ ...footerConfig, popular_links: newLinks });
  };
  const updatePopularLink = (index: number, field: string, value: string) => {
    const newLinks = [...(footerConfig.popular_links || [])];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setFooterConfig({ ...footerConfig, popular_links: newLinks });
  };

  const saveHeader = () => saveSetting("header_config", headerConfig);
  const saveFooter = () => saveSetting("footer_config", footerConfig);

  const saveAd = async () => {
    const newAds = currentAd.id 
      ? forumAds?.map(ad => ad.id === currentAd.id ? currentAd : ad)
      : [...(forumAds || []), { ...currentAd, id: crypto.randomUUID() }];
    
    try {
      await updateSetting.mutateAsync({ key: "forum_ads", value: newAds });
      toast({ title: "Werbung gespeichert" });
      setIsAdDialogOpen(false);
    } catch (e) { toast({ title: "Fehler", variant: "destructive" }); }
  };

  const deleteAd = async (id: string) => {
    try {
      const newAds = forumAds?.filter(ad => ad.id !== id);
      await updateSetting.mutateAsync({ key: "forum_ads", value: newAds });
      toast({ title: "Gelöscht" });
    } catch (e) { toast({ title: "Fehler", variant: "destructive" }); }
  };

  const createAd = () => {
    setCurrentAd({ id: "", name: "Neu", type: "image", enabled: true, image_url: "", link_url: "", headline: "", subheadline: "", cta_text: "", html_code: "" });
    setIsAdDialogOpen(true);
  };
  const editAd = (ad: ForumAd) => { setCurrentAd(ad); setIsAdDialogOpen(true); };

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

  const checkAnalyticsStatus = async () => {
    setAnalyticsStatus("checking");
    const id = analyticsCode.match(/G-[A-Z0-9]+/)?.[0];
    try {
      if (id) {
        setAnalyticsStatus("found");
        toast({ title: "Analytics aktiv", description: `Google Analytics ${id} ist konfiguriert.` });
      } else {
        setAnalyticsStatus("not-found");
        toast({ title: "Kein Analytics Code", description: "Bitte füge deinen Code ein.", variant: "destructive" });
      }
    } catch (error) {
      setAnalyticsStatus("not-found");
    }
  };

  if (isLoading || !localContent) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  // @ts-ignore
  const safeBigThreeItems = localContent?.big_three?.items || [];
  // @ts-ignore
  const safeFeatures = localContent?.why_us?.features || [];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Einstellungen</h2>
        <p className="text-muted-foreground">Verwalte globale Website-Einstellungen, Navigation und Inhalte.</p>
      </div>

      <Tabs defaultValue="global" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-200/50 dark:bg-slate-800 p-1 rounded-xl h-auto">
          <TabsTrigger 
            value="global" 
            className="py-3 rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-medium"
          >
            Global & Branding
          </TabsTrigger>
          <TabsTrigger 
            value="navigation" 
            className="py-3 rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-medium"
          >
            Navi & Footer
          </TabsTrigger>
          <TabsTrigger 
            value="home" 
            className="py-3 rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-medium"
          >
            Startseite {hasUnsavedChanges && <span className="ml-2 w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-slate-900 border-slate-800 text-slate-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-white">
                  <Target className="h-4 w-4 text-secondary" />
                  Scouty AI Config
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  Konfiguriere deinen AI-Assistenten.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center justify-between">
                    <Label className="text-white text-xs">Scouty aktivieren</Label>
                    <Switch checked={scoutyEnabled} onCheckedChange={setScoutyEnabled} />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-white text-xs">High-Ticket / Easter-Egg URL</Label>
                    <div className="flex gap-2">
                        <Input 
                        placeholder="https://..." 
                        value={scoutyHighTicketUrl}
                        onChange={(e) => setScoutyHighTicketUrl(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-xs h-9" 
                        />
                    </div>
                 </div>
                 <Button onClick={saveScoutyConfig} size="sm" className="w-full bg-secondary hover:bg-secondary/80 h-8">
                    <Save className="h-3 w-3 mr-2" /> Speichern
                 </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800 text-slate-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-white">
                  <Users className="h-4 w-4 text-green-500" />
                  Scouty Leads
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  Generierte Kontakte im Chat.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <div className="text-3xl font-extrabold text-white">{scoutyLeadsCount}</div>
                <div className="text-xs text-slate-400 leading-tight">
                  User haben ihre Mail<br/>hinterlassen.
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" /> Monetarisierung
              </CardTitle>
              <CardDescription>Steuere Werbebanner und Affiliate Links.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="ads-toggle" className="font-medium text-base">Werbebanner anzeigen</Label>
                  <span className="text-sm text-muted-foreground">Globaler Schalter für alle Anzeigen.</span>
                </div>
                <Switch id="ads-toggle" checked={adsEnabled} onCheckedChange={handleAdsToggle} />
              </div>

              <div className="space-y-4 pt-2">
                <h4 className="font-medium flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"/> Google AdSense
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Publisher ID</Label>
                    <Input value={adSenseClient} onChange={(e) => setAdSenseClient(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Slot ID</Label>
                    <Input value={adSenseSlot} onChange={(e) => setAdSenseSlot(e.target.value)} />
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => { saveSetting("ads_sense_client_id", adSenseClient); saveSetting("ads_sense_slot_id", adSenseSlot); }}>
                  <Save className="w-4 h-4 mr-2" /> AdSense speichern
                </Button>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                 <h4 className="font-medium flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"/> Native Amazon Banner
                </h4>
                <div className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Headline</Label><Input value={amznHeadline} onChange={(e) => setAmznHeadline(e.target.value)} /></div>
                      <div className="space-y-2"><Label>Affiliate Link</Label><Input value={amznLink} onChange={(e) => setAmznLink(e.target.value)} /></div>
                  </div>
                  <div className="space-y-2"><Label>Text</Label><Input value={amznText} onChange={(e) => setAmznText(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Button</Label><Input value={amznButton} onChange={(e) => setAmznButton(e.target.value)} /></div>
                </div>
                <Button size="sm" variant="outline" onClick={() => {
                      saveSetting("ads_amazon_headline", amznHeadline);
                      saveSetting("ads_amazon_text", amznText);
                      saveSetting("ads_amazon_button_text", amznButton);
                      saveSetting("ads_amazon_link", amznLink);
                  }}>
                  <Save className="w-4 h-4 mr-2" /> Banner speichern
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Globe className="w-5 h-5 text-secondary" /> Branding</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 border-b border-border pb-6">
                <Label>Logo</Label>
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden">
                    {siteLogoUrl ? <img src={siteLogoUrl} className="w-full h-full object-contain p-2" /> : <ImageIcon className="w-8 h-8 text-muted-foreground/50" />}
                    {isUploadingLogo && <div className="absolute inset-0 bg-background/80 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex gap-2">
                      <Button variant="outline" className="relative cursor-pointer" disabled={isUploadingLogo}>
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleLogoUpload} />
                        <Upload className="w-4 h-4 mr-2" /> Upload
                      </Button>
                      {siteLogoUrl && <Button variant="destructive" onClick={removeLogo}><Trash2 className="w-4 h-4" /></Button>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="space-y-2"><Label>Website Titel</Label><Input value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} /></div>
                <div className="space-y-2"><Label>Meta Beschreibung</Label><Textarea value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} rows={2} /></div>
              </div>
              <Button onClick={() => { saveSetting("site_title", siteTitle); saveSetting("site_description", siteDescription); }} className="bg-primary hover:bg-primary/90"><Save className="w-4 h-4 mr-2" /> Speichern</Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
             <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><BarChart3 className="w-5 h-5 text-orange-500" />Analytics</CardTitle></CardHeader>
             <CardContent className="space-y-4">
                <Textarea value={analyticsCode} onChange={(e) => { setAnalyticsCode(e.target.value); setAnalyticsStatus("idle"); }} rows={4} className="font-mono text-xs" />
                <div className="flex gap-2"><Button onClick={() => saveSetting("global_analytics_code", analyticsCode)}><Save className="w-4 h-4 mr-2" />Speichern</Button><Button variant="outline" onClick={checkAnalyticsStatus} disabled={analyticsStatus === "checking"}>Status prüfen</Button></div>
             </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
             <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Lock className="w-5 h-5 text-red-500" />Admin PIN</CardTitle></CardHeader>
             <CardContent className="space-y-4">
                <div className="flex gap-2"><Input type="password" value={newPin} onChange={(e) => setNewPin(e.target.value)} placeholder="Neuer PIN" /><Button onClick={savePin} variant="outline">Ändern</Button></div>
             </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="navigation" className="space-y-6 mt-6">
          
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MenuIcon className="w-5 h-5 text-primary" /> Header Navigation</CardTitle>
              <CardDescription>Die Links im Hauptmenü (oben).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                 {headerConfig.nav_links?.map((link: any, idx: number) => (
                    <div key={idx} className="flex gap-3 items-end">
                       <div className="flex-1 space-y-1">
                          <Label className="text-xs">Beschriftung</Label>
                          <Input value={link.label} onChange={e => updateNavLink(idx, 'label', e.target.value)} />
                       </div>
                       <div className="flex-1 space-y-1">
                          <Label className="text-xs">Ziel-URL</Label>
                          <Input value={link.url} onChange={e => updateNavLink(idx, 'url', e.target.value)} />
                       </div>
                       <Button variant="ghost" size="icon" onClick={() => removeNavLink(idx)} className="mb-0.5"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                 ))}
                 <Button variant="outline" size="sm" onClick={addNavLink}><Plus className="w-3 h-3 mr-2" /> Link hinzufügen</Button>
              </div>

              <div className="pt-6 border-t border-border space-y-4">
                 <h4 className="font-medium text-sm text-muted-foreground">Header Button (CTA)</h4>
                 <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Button Text</Label><Input value={headerConfig.button_text} onChange={e => setHeaderConfig({...headerConfig, button_text: e.target.value})} /></div>
                    <div className="space-y-2"><Label>Button Ziel</Label><Input value={headerConfig.button_url} onChange={e => setHeaderConfig({...headerConfig, button_url: e.target.value})} /></div>
                 </div>
              </div>
              <Button onClick={saveHeader} className="w-full mt-4 bg-primary"><Save className="w-4 h-4 mr-2" /> Navigation Speichern</Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><LinkIcon className="w-5 h-5 text-secondary" /> Top-Bar (Oben drüber)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Text</Label><Input value={topBarText} onChange={(e) => setTopBarText(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Link</Label><Input value={topBarLink} onChange={(e) => setTopBarLink(e.target.value)} /></div>
               </div>
               <Button onClick={() => { saveSetting("top_bar_text", topBarText); saveSetting("top_bar_link", topBarLink); }} className="bg-primary hover:bg-primary/90"><Save className="w-4 h-4 mr-2" /> Speichern</Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><List className="w-5 h-5 text-green-500" /> Footer Links Steuerung</CardTitle>
              <CardDescription>Verwalte die Link-Listen im unteren Bereich.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* SECTION: LEGAL LINKS */}
              <div className="space-y-4">
                 <h4 className="font-medium flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <ShieldCheck className="w-4 h-4" /> Rechtliches (Spalte 1)
                 </h4>
                 {footerConfig.legal_links?.map((link: any, idx: number) => (
                    <div key={idx} className="flex gap-3 items-end">
                       <div className="flex-1 space-y-1">
                          <Label className="text-xs">Beschriftung</Label>
                          <Input value={link.label} onChange={e => updateLegalLink(idx, 'label', e.target.value)} />
                       </div>
                       <div className="flex-1 space-y-1">
                          <Label className="text-xs">Ziel-URL</Label>
                          <Input value={link.url} onChange={e => updateLegalLink(idx, 'url', e.target.value)} />
                       </div>
                       <Button variant="ghost" size="icon" onClick={() => removeLegalLink(idx)} className="mb-0.5"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                 ))}
                 <Button variant="outline" size="sm" onClick={addLegalLink}><Plus className="w-3 h-3 mr-2" /> Rechtlichen Link hinzufügen</Button>
              </div>

              <div className="border-t border-border" />

              {/* SECTION: POPULAR LINKS */}
              <div className="space-y-4">
                 <h4 className="font-medium flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <LinkIcon className="w-4 h-4" /> Vergleiche & Tools (Spalte 2)
                 </h4>
                 {footerConfig.popular_links?.map((link: any, idx: number) => (
                    <div key={idx} className="flex gap-3 items-end">
                       <div className="flex-1 space-y-1">
                          <Label className="text-xs">Beschriftung</Label>
                          <Input value={link.label} onChange={e => updatePopularLink(idx, 'label', e.target.value)} />
                       </div>
                       <div className="flex-1 space-y-1">
                          <Label className="text-xs">Ziel-URL</Label>
                          <Input value={link.url} onChange={e => updatePopularLink(idx, 'url', e.target.value)} />
                       </div>
                       <Button variant="ghost" size="icon" onClick={() => removePopularLink(idx)} className="mb-0.5"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                 ))}
                 <Button variant="outline" size="sm" onClick={addPopularLink}><Plus className="w-3 h-3 mr-2" /> Vergleichs-Link hinzufügen</Button>
              </div>

              <Button onClick={saveFooter} className="w-full mt-2 bg-primary"><Save className="w-4 h-4 mr-2" /> Footer Links Speichern</Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-orange-500" /> Footer Inhalte</CardTitle>
              <CardDescription>Texte im unteren Bereich der Seite.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                 <div className="space-y-2"><Label>Geprüft Text</Label><Input value={footerConfig.text_checked} onChange={e => setFooterConfig({...footerConfig, text_checked: e.target.value})} /></div>
                 <div className="space-y-2"><Label>Update Text</Label><Input value={footerConfig.text_update} onChange={e => setFooterConfig({...footerConfig, text_update: e.target.value})} /></div>
              </div>
              <div className="space-y-2"><Label>Copyright Zeile</Label><Input value={footerConfig.copyright_text} onChange={e => setFooterConfig({...footerConfig, copyright_text: e.target.value})} /></div>
              <div className="space-y-2"><Label>Beschreibung (Über uns)</Label><Textarea value={footerConfig.text_description} onChange={e => setFooterConfig({...footerConfig, text_description: e.target.value})} rows={2} /></div>
              <div className="space-y-2"><Label>Disclaimer (Ganz unten)</Label><Textarea value={footerConfig.disclaimer} onChange={e => setFooterConfig({...footerConfig, disclaimer: e.target.value})} rows={3} /></div>
              
              <div className="grid md:grid-cols-2 gap-4 pt-2">
                 <div className="space-y-2"><Label>"Made with" Text</Label><Input value={footerConfig.made_with_text} onChange={e => setFooterConfig({...footerConfig, made_with_text: e.target.value})} /></div>
                 <div className="space-y-2"><Label>"Made in" Text</Label><Input value={footerConfig.made_in_text} onChange={e => setFooterConfig({...footerConfig, made_in_text: e.target.value})} /></div>
              </div>
              
              <Button onClick={saveFooter} className="w-full mt-2 bg-primary"><Save className="w-4 h-4 mr-2" /> Footer Texte Speichern</Button>
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="home" className="space-y-6 mt-6">
          <div className="sticky top-2 z-50 bg-background/95 backdrop-blur py-2 border-b border-border/50 flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg">Startseiten Editor</h3>
              <p className="text-xs text-muted-foreground">Änderungen werden erst beim Klick auf "Speichern" wirksam.</p>
            </div>
            <Button 
              onClick={saveContentManually} 
              size="lg"
              className={`transition-all ${hasUnsavedChanges ? 'bg-orange-600 hover:bg-orange-700 animate-pulse' : 'bg-primary'}`}
            >
              <Save className="w-4 h-4 mr-2" />
              {hasUnsavedChanges ? "Änderungen speichern *" : "Speichern"}
            </Button>
          </div>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Layout className="w-5 h-5 text-primary" /> Layout Steuerung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               {Object.keys(defaultHomeLayout).map((key) => (
                 <div key={key} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900 p-2 rounded-lg transition-colors">
                   <Label className="capitalize font-medium cursor-pointer" onClick={() => toggleSection(key as keyof typeof defaultHomeLayout)}>
                      {key.replace('_', ' ')}
                   </Label>
                   <Switch 
                     // @ts-ignore
                     checked={layout[key]} 
                     onCheckedChange={() => toggleSection(key as keyof typeof defaultHomeLayout)}
                   />
                 </div>
               ))}
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-secondary" /> Texte & Inhalte</CardTitle></CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="hero">
                  <AccordionTrigger>Hero Section</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4 px-4">
                    <div className="space-y-2"><Label>H1 Titel</Label><Input value={localContent.hero.title} onChange={(e) => updateContent('hero', 'title', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Untertitel</Label><Textarea value={localContent.hero.subtitle} onChange={(e) => updateContent('hero', 'subtitle', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Badge</Label><Input value={localContent.hero.badge} onChange={(e) => updateContent('hero', 'badge', e.target.value)} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Search Label</Label><Input value={localContent.hero.search_label} onChange={(e) => updateContent('hero', 'search_label', e.target.value)} /></div>
                      <div className="space-y-2"><Label>Search Placeholder</Label><Input value={localContent.hero.search_placeholder} onChange={(e) => updateContent('hero', 'search_placeholder', e.target.value)} /></div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="trust">
                  <AccordionTrigger>Trust / Vorteile</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4 px-4">
                    <div className="space-y-2"><Label>Überschrift</Label><Input value={localContent.trust.headline} onChange={(e) => updateContent('trust', 'headline', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Untertext</Label><Textarea value={localContent.trust.subheadline} onChange={(e) => updateContent('trust', 'subheadline', e.target.value)} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Box Titel</Label><Input value={localContent.trust.box_title} onChange={(e) => updateContent('trust', 'box_title', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Box Text</Label><Textarea rows={4} value={localContent.trust.box_text} onChange={(e) => updateContent('trust', 'box_text', e.target.value)} /></div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="big_three">
                  <AccordionTrigger>Big Three (Kategorien)</AccordionTrigger>
                  <AccordionContent className="space-y-6 pt-4 px-4">
                      <div className="space-y-2"><Label>Sektions-Überschrift</Label><Input value={localContent.big_three.headline} onChange={(e) => updateContent('big_three', 'headline', e.target.value)} /></div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center"><Label>Karten</Label><Button size="sm" variant="outline" onClick={addBigThreeItem}><Plus className="w-3 h-3 mr-2"/> Karte</Button></div>
                        {safeBigThreeItems.map((item: any, idx: number) => (
                            <div key={item.id || idx} className="border p-4 rounded-lg bg-slate-50 space-y-3 relative">
                                <Button variant="destructive" size="icon" className="absolute right-2 top-2 h-6 w-6" onClick={() => removeBigThreeItem(idx)}><Trash2 className="w-3 h-3"/></Button>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input value={item.title} onChange={e => updateBigThreeItem(idx, 'title', e.target.value)} className="h-8 text-sm" placeholder="Titel"/>
                                    <Input value={item.button_text} onChange={e => updateBigThreeItem(idx, 'button_text', e.target.value)} className="h-8 text-sm" placeholder="Button"/>
                                </div>
                                <Textarea value={item.desc} onChange={e => updateBigThreeItem(idx, 'desc', e.target.value)} className="h-16 text-sm" placeholder="Beschreibung"/>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input value={item.link} onChange={e => updateBigThreeItem(idx, 'link', e.target.value)} className="h-8 text-sm" placeholder="Link"/>
                                    <Select value={item.theme} onValueChange={v => updateBigThreeItem(idx, 'theme', v)}>
                                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                        <SelectContent><SelectItem value="blue">Blau</SelectItem><SelectItem value="gold">Gold</SelectItem><SelectItem value="dark">Dark</SelectItem></SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ))}
                      </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="news">
                  <AccordionTrigger>Newsletter Bereich</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4 px-4">
                      <div className="space-y-2"><Label>Überschrift</Label><Input value={localContent.news.headline} onChange={(e) => updateContent('news', 'headline', e.target.value)} /></div>
                      <div className="space-y-2"><Label>Text</Label><Textarea value={localContent.news.subheadline} onChange={(e) => updateContent('news', 'subheadline', e.target.value)} /></div>
                      <div className="space-y-2"><Label>Button Text</Label><Input value={localContent.news.button_text} onChange={(e) => updateContent('news', 'button_text', e.target.value)} /></div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="seo">
                  <AccordionTrigger>Why Rank-Scout (SEO)</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4 px-4">
                      <div className="space-y-2"><Label>Überschrift</Label><Input value={localContent.why_us?.headline} onChange={(e) => updateContent('why_us', 'headline', e.target.value)} /></div>
                      <div className="space-y-2"><Label>Intro</Label><Textarea value={localContent.why_us?.subheadline} onChange={(e) => updateContent('why_us', 'subheadline', e.target.value)} /></div>
                      <div className="border-t pt-4">
                          <Label className="mb-2 block font-bold text-xs uppercase text-muted-foreground">Die 4 Feature Karten</Label>
                          <div className="grid grid-cols-1 gap-4">
                              {safeFeatures.map((feat: any, idx: number) => (
                                  <div key={idx} className="border p-3 rounded bg-slate-50">
                                      <div className="text-xs font-mono text-slate-400 mb-1">Karte {idx + 1}</div>
                                      <div className="grid grid-cols-1 gap-2">
                                          <Input placeholder="Titel" value={feat.title} onChange={e => updateFeature(idx, 'title', e.target.value)} className="h-8"/>
                                          <Textarea placeholder="Text" value={feat.text} onChange={e => updateFeature(idx, 'text', e.target.value)} className="h-16 text-sm"/>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="forum_ads">
                    <AccordionTrigger>Forum Banner & Werbung</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4 px-4">
                        <div className="flex justify-between items-center mb-4"><Label>Aktive Kampagnen</Label><Button size="sm" onClick={createAd}><Plus className="w-3 h-3 mr-2"/> Werbung</Button></div>
                        <div className="grid md:grid-cols-2 gap-4">
                            {forumAds?.map((ad: ForumAd) => (
                                <Card key={ad.id} className="border-slate-200 shadow-none relative">
                                    <CardHeader className="p-3 pb-0"><div className="flex justify-between items-center"><span className="font-bold text-sm">{ad.name}</span>{ad.enabled ? <span className="text-[10px] bg-green-100 text-green-700 px-1.5 rounded">Aktiv</span> : <span className="text-[10px] bg-slate-100 px-1.5 rounded">Inaktiv</span>}</div></CardHeader>
                                    <CardContent className="p-3 pt-2">
                                        <div className="text-xs text-muted-foreground mb-2 truncate">{ad.type}</div>
                                        <div className="flex gap-2"><Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => editAd(ad)}>Edit</Button><Button size="sm" variant="destructive" className="h-7 text-xs flex-1" onClick={() => deleteAd(ad.id)}>Del</Button></div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isAdDialogOpen} onOpenChange={setIsAdDialogOpen}>
            <DialogContent className="max-w-xl">
                <DialogHeader><DialogTitle>{currentAd.id ? "Werbung bearbeiten" : "Neue Werbung"}</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Name</Label><Input value={currentAd.name} onChange={e => setCurrentAd({...currentAd, name: e.target.value})} /></div>
                        <div className="space-y-2"><Label>Typ</Label><Select value={currentAd.type} onValueChange={v => setCurrentAd({...currentAd, type: v as any})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="image">Bild Banner</SelectItem><SelectItem value="code">HTML Code</SelectItem></SelectContent></Select></div>
                    </div>
                    {currentAd.type === 'image' ? (
                        <>
                            <div className="space-y-2"><Label>Bild URL</Label><Input value={currentAd.image_url} onChange={e => setCurrentAd({...currentAd, image_url: e.target.value})} /></div>
                            <div className="space-y-2"><Label>Ziel Link</Label><Input value={currentAd.link_url} onChange={e => setCurrentAd({...currentAd, link_url: e.target.value})} /></div>
                            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Headline</Label><Input value={currentAd.headline} onChange={e => setCurrentAd({...currentAd, headline: e.target.value})} /></div><div className="space-y-2"><Label>Subheadline</Label><Input value={currentAd.subheadline} onChange={e => setCurrentAd({...currentAd, subheadline: e.target.value})} /></div></div>
                        </>
                    ) : (
                        <div className="space-y-2"><Label>HTML / Script Code</Label><Textarea value={currentAd.html_code} onChange={e => setCurrentAd({...currentAd, html_code: e.target.value})} rows={6} className="font-mono text-xs"/></div>
                    )}
                    <div className="flex items-center justify-between border p-3 rounded-lg"><Label>Aktiv geschaltet</Label><Switch checked={currentAd.enabled} onCheckedChange={c => setCurrentAd({...currentAd, enabled: c})} /></div>
                </div>
                <DialogFooter><Button variant="outline" onClick={() => setIsAdDialogOpen(false)}>Abbrechen</Button><Button onClick={saveAd}>Speichern</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}