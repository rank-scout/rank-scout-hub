import { useState, useEffect } from "react";
import { 
  useSettings, 
  useUpdateSetting, 
  useHomeLayout, 
  useHomeContent, 
  useAdSenseConfig, 
  useAmazonConfig,
  defaultHomeLayout, 
  defaultHomeContent 
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
  Target, Users
} from "lucide-react";
import type { Json } from "@/integrations/supabase/types";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function AdminSettings() {
  const { data: settings, isLoading } = useSettings();
  const updateSetting = useUpdateSetting();
  
  // Hooks für Home-Steuerung & Ads
  const { layout } = useHomeLayout();
  const { content } = useHomeContent();
  
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

  // States für Monetarisierung
  const [adSenseClient, setAdSenseClient] = useState("");
  const [adSenseSlot, setAdSenseSlot] = useState("");
  
  // Neue States für Native Amazon Banner
  const [amznHeadline, setAmznHeadline] = useState("");
  const [amznText, setAmznText] = useState("");
  const [amznButton, setAmznButton] = useState("");
  const [amznLink, setAmznLink] = useState("");

  // SCOUTY STATES (Integration)
  const [scoutyHighTicketUrl, setScoutyHighTicketUrl] = useState("");
  const [scoutyLeadsCount, setScoutyLeadsCount] = useState(0);

  // Initialisierung aller Settings
  if (settings && !initialized) {
    setSiteTitle((settings.site_title as string) || "Rank-Scout");
    setSiteLogoUrl((settings.site_logo_url as string) || "");
    setSiteDescription((settings.site_description as string) || "");
    setTopBarText((settings.top_bar_text as string) || "");
    setTopBarLink((settings.top_bar_link as string) || "");
    setAnalyticsCode((settings.global_analytics_code as string) || "");
    setAdsEnabled((settings.ads_enabled as boolean) || false);
    
    // Init Ads Config
    setAdSenseClient((settings.ads_sense_client_id as string) || "");
    setAdSenseSlot((settings.ads_sense_slot_id as string) || "");
    
    // Init Native Amazon Config
    setAmznHeadline((settings.ads_amazon_headline as string) || "");
    setAmznText((settings.ads_amazon_text as string) || "");
    setAmznButton((settings.ads_amazon_button_text as string) || "");
    setAmznLink((settings.ads_amazon_link as string) || "");

    // Init Scouty Config
    // @ts-ignore
    const scoutyConfig = settings.scouty_config as { high_ticket_url?: string } | null;
    setScoutyHighTicketUrl(scoutyConfig?.high_ticket_url || "");

    setInitialized(true);
  }

  // Fetch Scouty Leads Count (Live from Subscribers)
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

  // Speichern Funktion (Global)
  async function saveSetting(key: string, value: Json) {
    try {
      await updateSetting.mutateAsync({ key, value });
      toast({ title: "Einstellung gespeichert" });
    } catch (error) {
      toast({ title: "Fehler", description: "Speichern fehlgeschlagen", variant: "destructive" });
    }
  }

  // Scouty Speichern Helper
  const saveScoutyConfig = () => {
    saveSetting("scouty_config", { high_ticket_url: scoutyHighTicketUrl });
  };

  // Funktionen für Home-Layout & Content
  const toggleSection = (key: keyof typeof defaultHomeLayout) => {
    const newLayout = { ...layout, [key]: !layout[key] };
    saveSetting("home_layout", newLayout);
  };

  const updateContent = (section: keyof typeof defaultHomeContent, field: string, value: string) => {
    const newContent = { 
      ...content, 
      [section]: { 
        //@ts-ignore
        ...content[section], 
        [field]: value 
      } 
    };
    saveSetting("home_content", newContent);
  };

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

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Einstellungen</h2>
        <p className="text-muted-foreground">Verwalte globale Website-Einstellungen und Startseiten-Inhalte.</p>
      </div>

      <Tabs defaultValue="global" className="w-full">
        {/* TAB NAVIGATION: KYRA UPDATE - Orange/Primary statt Blue */}
        <TabsList className="grid w-full grid-cols-2 bg-slate-200/50 dark:bg-slate-800 p-1 rounded-xl h-auto">
          <TabsTrigger 
            value="global" 
            className="py-3 rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-medium text-slate-600 dark:text-slate-400"
          >
            Global & Branding
          </TabsTrigger>
          <TabsTrigger 
            value="home" 
            className="py-3 rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-medium text-slate-600 dark:text-slate-400"
          >
            Startseite & Content
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: GLOBALE EINSTELLUNGEN */}
        <TabsContent value="global" className="space-y-6 mt-6">
          
          {/* SCOUTY AI CARD */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-slate-900 border-slate-800 text-slate-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-white">
                  <Target className="h-4 w-4 text-secondary" />
                  Scouty High-Ticket Link
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  Wohin führt das Easter-Egg (5 Klicks)?
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="flex gap-2">
                    <Input 
                      placeholder="https://..." 
                      value={scoutyHighTicketUrl}
                      onChange={(e) => setScoutyHighTicketUrl(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs h-9" 
                    />
                    <Button onClick={saveScoutyConfig} size="sm" className="bg-secondary hover:bg-secondary/80 h-9 px-3">
                      <Save className="h-4 w-4" />
                    </Button>
                 </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800 text-slate-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-white">
                  <Users className="h-4 w-4 text-green-500" />
                  Scouty Leads
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  Generierte E-Mail Kontakte im Chat.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <div className="text-3xl font-extrabold text-white">{scoutyLeadsCount}</div>
                <div className="text-xs text-slate-400 leading-tight">
                  User haben ihre Mail<br/>für Deals hinterlassen.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* MONETARISIERUNG CARD */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" /> Monetarisierung
              </CardTitle>
              <CardDescription>Steuere Werbebanner und Affiliate Links zentral.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Hauptschalter */}
              <div className="flex items-center justify-between space-x-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="ads-toggle" className="font-medium text-base">Werbebanner anzeigen</Label>
                  <span className="text-sm text-muted-foreground">Globaler Schalter für alle Anzeigen.</span>
                </div>
                <Switch 
                  id="ads-toggle" 
                  checked={adsEnabled} 
                  onCheckedChange={handleAdsToggle} 
                  className="data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-600"
                />
              </div>

              {/* Google AdSense */}
              <div className="space-y-4 pt-2">
                <h4 className="font-medium flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"/> Google AdSense
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Publisher ID (Client)</Label>
                    <Input 
                      placeholder="ca-pub-XXXXXXXXXXXXXXXX" 
                      value={adSenseClient} 
                      onChange={(e) => setAdSenseClient(e.target.value)} 
                    />
                    <p className="text-[10px] text-muted-foreground">Format: ca-pub-...</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Default Slot ID</Label>
                    <Input 
                      placeholder="1234567890" 
                      value={adSenseSlot} 
                      onChange={(e) => setAdSenseSlot(e.target.value)} 
                    />
                  </div>
                </div>
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    saveSetting("ads_sense_client_id", adSenseClient);
                    saveSetting("ads_sense_slot_id", adSenseSlot);
                  }}
                >
                  <Save className="w-4 h-4 mr-2" /> AdSense Daten speichern
                </Button>
              </div>

              {/* Amazon PartnerNet - Native Banner Builder */}
              <div className="space-y-4 pt-4 border-t border-border">
                 <h4 className="font-medium flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"/> Native Amazon Banner (Top)
                </h4>
                <div className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Headline (Fett)</Label>
                        <Input 
                          placeholder="z.B. Die besten Laptops für Gründer" 
                          value={amznHeadline} 
                          onChange={(e) => setAmznHeadline(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Affiliate Link (SiteStripe)</Label>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            className="pl-9"
                            placeholder="https://amzn.to/..." 
                            value={amznLink} 
                            onChange={(e) => setAmznLink(e.target.value)} 
                          />
                        </div>
                      </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Beschreibungstext</Label>
                    <Input 
                      placeholder="z.B. Top-Leistung für unter 800€. Von unseren Experten geprüft." 
                      value={amznText} 
                      onChange={(e) => setAmznText(e.target.value)} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Button Text</Label>
                    <Input 
                      placeholder="z.B. Jetzt Angebote prüfen" 
                      value={amznButton} 
                      onChange={(e) => setAmznButton(e.target.value)} 
                    />
                  </div>

                  <p className="text-[10px] text-muted-foreground">Erstellt automatisch einen Premium-Banner im Rank-Scout Design. Keine externen Skripte notwendig.</p>
                </div>

                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => {
                      saveSetting("ads_amazon_headline", amznHeadline);
                      saveSetting("ads_amazon_text", amznText);
                      saveSetting("ads_amazon_button_text", amznButton);
                      saveSetting("ads_amazon_link", amznLink);
                  }}
                >
                  <Save className="w-4 h-4 mr-2" /> Banner speichern
                </Button>
              </div>

            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Globe className="w-5 h-5 text-secondary" /> Branding & SEO
              </CardTitle>
              <CardDescription>Logo, Titel und Beschreibung.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleLogoUpload} />
                        <Upload className="w-4 h-4 mr-2" /> Logo hochladen
                      </Button>
                      {siteLogoUrl && (
                        <Button variant="destructive" onClick={removeLogo}>
                          <Trash2 className="w-4 h-4 text-white" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Empfohlen: PNG oder WebP mit transparentem Hintergrund.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteTitle">Website Titel</Label>
                  <Input id="siteTitle" value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} placeholder="Rank-Scout" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Meta Beschreibung</Label>
                  <Textarea id="siteDescription" value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} rows={2} />
                </div>
              </div>
              <Button 
                onClick={() => { saveSetting("site_title", siteTitle); saveSetting("site_description", siteDescription); }}
                className="text-white bg-primary hover:bg-primary/90"
              >
                <Save className="w-4 h-4 mr-2" /> Speichern
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2"><Sparkles className="w-5 h-5 text-secondary" />Top-Bar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Text</Label><Input value={topBarText} onChange={(e) => setTopBarText(e.target.value)} /></div>
              <div className="space-y-2"><Label>Link</Label><Input value={topBarLink} onChange={(e) => setTopBarLink(e.target.value)} /></div>
              <Button onClick={() => { saveSetting("top_bar_text", topBarText); saveSetting("top_bar_link", topBarLink); }} className="text-white bg-primary hover:bg-primary/90">
                <Save className="w-4 h-4 mr-2" />Speichern
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-500" />Analytics Code {analyticsStatus === "found" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Tracking Code</Label><Textarea value={analyticsCode} onChange={(e) => { setAnalyticsCode(e.target.value); setAnalyticsStatus("idle"); }} rows={8} className="font-mono text-xs bg-slate-50" /></div>
              <div className="flex gap-2">
                <Button onClick={() => saveSetting("global_analytics_code", analyticsCode)} className="text-white bg-primary hover:bg-primary/90"><Save className="w-4 h-4 mr-2" />Speichern</Button>
                <Button variant="outline" onClick={checkAnalyticsStatus} disabled={analyticsStatus === "checking"}>Status prüfen</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2"><Lock className="w-5 h-5 text-red-500" />Admin PIN</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Neuer PIN</Label><Input type="password" value={newPin} onChange={(e) => setNewPin(e.target.value)} placeholder="Mind. 4 Zeichen" /></div>
              <Button onClick={savePin} variant="outline"><Lock className="w-4 h-4 mr-2" />PIN ändern</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: STARTSEITE & CONTENT */}
        <TabsContent value="home" className="space-y-6 mt-6">
          
          {/* LAYOUT STEUERUNG */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Layout className="w-5 h-5 text-primary" /> Layout Steuerung</CardTitle>
              <CardDescription>Aktiviere oder deaktiviere Sektionen auf der Startseite.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {Object.keys(defaultHomeLayout).map((key) => (
                 <div key={key} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900 p-2 rounded-lg transition-colors">
                   <Label className="capitalize font-medium cursor-pointer" onClick={() => toggleSection(key as keyof typeof defaultHomeLayout)}>
                      {key.replace('_', ' ')}
                   </Label>
                   <Switch 
                     checked={layout[key as keyof typeof layout]} 
                     onCheckedChange={() => toggleSection(key as keyof typeof defaultHomeLayout)}
                     className="data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-600"
                   />
                 </div>
               ))}
            </CardContent>
          </Card>

          {/* CONTENT STEUERUNG */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-secondary" /> Texte & Inhalte</CardTitle>
              <CardDescription>Bearbeite die Texte der Startseiten-Sektionen.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                
                <AccordionItem value="hero">
                  <AccordionTrigger className="hover:no-underline hover:bg-slate-50 px-4 rounded-lg">Hero Section</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4 px-4">
                    <div className="space-y-2"><Label>Titel</Label><Input value={content.hero.title} onChange={(e) => updateContent('hero', 'title', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Untertitel</Label><Textarea value={content.hero.subtitle} onChange={(e) => updateContent('hero', 'subtitle', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Badge Text</Label><Input value={content.hero.badge} onChange={(e) => updateContent('hero', 'badge', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Such-Platzhalter</Label><Input value={content.hero.search_placeholder} onChange={(e) => updateContent('hero', 'search_placeholder', e.target.value)} /></div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="trust">
                  <AccordionTrigger className="hover:no-underline hover:bg-slate-50 px-4 rounded-lg">Trust / Vorteile</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4 px-4">
                    <div className="space-y-2"><Label>Überschrift</Label><Input value={content.trust.headline} onChange={(e) => updateContent('trust', 'headline', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Untertext</Label><Textarea value={content.trust.subheadline} onChange={(e) => updateContent('trust', 'subheadline', e.target.value)} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Box Titel</Label><Input value={content.trust.box_title} onChange={(e) => updateContent('trust', 'box_title', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Box Text</Label><Textarea rows={4} value={content.trust.box_text} onChange={(e) => updateContent('trust', 'box_text', e.target.value)} /></div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="big_three">
                  <AccordionTrigger className="hover:no-underline hover:bg-slate-50 px-4 rounded-lg">Big Three (Kategorien)</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4 px-4">
                      <div className="space-y-2"><Label>Headline</Label><Input value={content.big_three.headline} onChange={(e) => updateContent('big_three', 'headline', e.target.value)} /></div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2"><Label>Titel 1</Label><Input value={content.big_three.finance_title} onChange={(e) => updateContent('big_three', 'finance_title', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Titel 2</Label><Input value={content.big_three.software_title} onChange={(e) => updateContent('big_three', 'software_title', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Titel 3</Label><Input value={content.big_three.services_title} onChange={(e) => updateContent('big_three', 'services_title', e.target.value)} /></div>
                      </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="news">
                  <AccordionTrigger className="hover:no-underline hover:bg-slate-50 px-4 rounded-lg">Newsletter Bereich</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4 px-4">
                      <div className="space-y-2"><Label>Überschrift</Label><Input value={content.news.headline} onChange={(e) => updateContent('news', 'headline', e.target.value)} /></div>
                      <div className="space-y-2"><Label>Text</Label><Textarea value={content.news.subheadline} onChange={(e) => updateContent('news', 'subheadline', e.target.value)} /></div>
                      <div className="space-y-2"><Label>Button Text</Label><Input value={content.news.button_text} onChange={(e) => updateContent('news', 'button_text', e.target.value)} /></div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="seo">
                  <AccordionTrigger className="hover:no-underline hover:bg-slate-50 px-4 rounded-lg">SEO Content (Unten)</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4 px-4">
                      <div className="space-y-2"><Label>Überschrift</Label><Input value={content.seo.headline} onChange={(e) => updateContent('seo', 'headline', e.target.value)} /></div>
                      <div className="space-y-2"><Label>Intro</Label><Textarea value={content.seo.intro} onChange={(e) => updateContent('seo', 'intro', e.target.value)} /></div>
                  </AccordionContent>
                </AccordionItem>

              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}