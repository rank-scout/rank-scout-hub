import { useState, useEffect, useCallback } from "react";
import { 
  useSettings, useUpdateSetting, useHomeLayout, useHomeContent, 
  useHeaderConfig, useFooterConfig, useScoutyConfig, useHomeForumTeaser,
  useForumAds,
  useActiveTheme, 
  defaultHomeContent, ForumAd
} from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Loader2, Save, ArrowUp, ArrowDown, Eye, EyeOff, GripVertical, Menu, Plus, Trash2, 
  Image as ImageIcon, Upload, MessageSquare, DollarSign, Edit, CheckCircle2, Palette, Code
} from "lucide-react";
import type { Json } from "@/integrations/supabase/types";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Helper IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- VISUAL LIST EDITOR (AUSSERHALB DER KOMPONENTE UM LOOPS ZU VERMEIDEN) ---
const LinkListEditor = ({ label, links, onChange }: { label: string, links: any[], onChange: (v: any[]) => void }) => {
    const addLink = () => { onChange([...links, { label: "Neuer Link", url: "/" }]); };
    const removeLink = (index: number) => { const newLinks = [...links]; newLinks.splice(index, 1); onChange(newLinks); };
    const updateLink = (index: number, field: 'label'|'url', val: string) => { const newLinks = [...links]; newLinks[index][field] = val; onChange(newLinks); };

    return (
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border">
            <div className="flex justify-between items-center"><Label className="text-base font-bold">{label}</Label><Button size="sm" variant="outline" onClick={addLink}><Plus className="w-3 h-3 mr-1"/> Hinzufügen</Button></div>
            {links.length === 0 && <p className="text-sm text-muted-foreground italic">Keine Links vorhanden.</p>}
            <div className="space-y-2">
                {links.map((link, i) => (
                    <div key={i} className="flex gap-2 items-center bg-white p-2 rounded border">
                        <Input value={link.label} onChange={(e) => updateLink(i, 'label', e.target.value)} placeholder="Name" className="h-8 text-sm" />
                        <Input value={link.url} onChange={(e) => updateLink(i, 'url', e.target.value)} placeholder="/pfad" className="h-8 text-sm font-mono text-xs" />
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => removeLink(i)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function AdminSettings() {
  const { data: settings, isLoading } = useSettings();
  const updateSetting = useUpdateSetting();
  
  // Hooks
  const { sections } = useHomeLayout();
  const { content } = useHomeContent();
  const headerConfig = useHeaderConfig();
  const footerConfig = useFooterConfig();
  const scoutyConfig = useScoutyConfig();
  const homeForumTeaser = useHomeForumTeaser();
  const dbAds = useForumAds();

  // Local States
  const [siteLogoUrl, setSiteLogoUrl] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  // Forum Local States
  const [forumHeadline, setForumHeadline] = useState("");
  const [forumSubheadline, setForumSubheadline] = useState("");
  const [forumBadge, setForumBadge] = useState("");

  // AD MANAGER STATE
  const [ads, setAds] = useState<ForumAd[]>([]);
  const [isAdDialogOpen, setIsAdDialogOpen] = useState(false);
  const [currentAd, setCurrentAd] = useState<ForumAd | null>(null);

  // Theme State
  const [selectedTheme, setSelectedTheme] = useState("navy");

  // Sync Init (Stabilisiert)
  useEffect(() => {
    if (settings) {
       // Wir setzen die States nur, wenn sie sich von der DB unterscheiden (Loop-Schutz)
       if (settings.site_logo_url && settings.site_logo_url !== siteLogoUrl) setSiteLogoUrl(settings.site_logo_url as string);
       
       if (settings.forum_banner_headline && settings.forum_banner_headline !== forumHeadline) setForumHeadline(settings.forum_banner_headline as string);
       else if (!forumHeadline && !settings.forum_banner_headline) setForumHeadline("Diskussionen & Erfahrungen");

       if (settings.forum_banner_subheadline && settings.forum_banner_subheadline !== forumSubheadline) setForumSubheadline(settings.forum_banner_subheadline as string);
       
       if (settings.forum_banner_badge && settings.forum_banner_badge !== forumBadge) setForumBadge(settings.forum_banner_badge as string);
       
       // Theme sync (nur initial laden)
       if (settings.active_theme && settings.active_theme !== selectedTheme) {
           setSelectedTheme(settings.active_theme as string);
       }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  // Sync Ads
  useEffect(() => {
    if (dbAds && JSON.stringify(dbAds) !== JSON.stringify(ads)) {
        setAds(dbAds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbAds]);

  // Generic Save Helper
  const saveSetting = useCallback(async (key: string, value: Json) => {
    try {
      await updateSetting.mutateAsync({ key, value });
      toast.success("Gespeichert");
    } catch (error) {
      toast.error("Fehler beim Speichern");
      console.error(error);
    }
  }, [updateSetting]);

  // --- THEME HANDLER (VORSCHAU) ---
  const handleThemeChange = (themeId: string) => {
      setSelectedTheme(themeId);
      // Nur Vorschau im DOM setzen, NICHT in DB speichern!
      document.documentElement.setAttribute("data-theme", themeId);
      toast.info("Vorschau aktiviert. Klicke 'Speichern' zum Übernehmen.");
  };

  // --- THEME SPEICHERN (DB Update) ---
  const saveThemeConfig = () => {
      saveSetting("active_theme", selectedTheme);
  };

  const updateContent = (section: keyof typeof defaultHomeContent, field: string, value: any) => {
    // @ts-ignore
    const newContent = { ...content, [section]: { ...content[section], [field]: value } };
    saveSetting("home_content", newContent);
  };

  const updateHeader = (field: string, value: any) => {
    const newConfig = { ...headerConfig, [field]: value };
    saveSetting("header_config", newConfig);
  };

  const updateFooter = (field: string, value: any) => {
    const newConfig = { ...footerConfig, [field]: value };
    saveSetting("footer_config", newConfig);
  };

  const updateScouty = (field: string, value: any) => {
    const newConfig = { ...scoutyConfig, [field]: value };
    saveSetting("scouty_config", newConfig);
  };

  const updateHomeForum = (field: string, value: any) => {
    const newConfig = { ...homeForumTeaser, [field]: value };
    saveSetting("home_forum_teaser", newConfig);
  };

  const saveForumPageConfig = () => {
      saveSetting("forum_banner_headline", forumHeadline);
      saveSetting("forum_banner_subheadline", forumSubheadline);
      saveSetting("forum_banner_badge", forumBadge);
  };

  // --- AD MANAGER FUNCTIONS ---
  const openNewAdDialog = () => {
      setCurrentAd({
          id: generateId(),
          name: "Neuer Banner",
          type: "image",
          enabled: true,
          image_url: "",
          link_url: "",
          headline: "",
          subheadline: "",
          cta_text: "Zum Angebot",
          html_code: ""
      });
      setIsAdDialogOpen(true);
  };

  const openEditAdDialog = (ad: ForumAd) => {
      setCurrentAd({ ...ad });
      setIsAdDialogOpen(true);
  };

  const saveAd = () => {
      if (!currentAd) return;
      let newAds = [...ads];
      const index = newAds.findIndex(a => a.id === currentAd.id);
      if (index >= 0) newAds[index] = currentAd; 
      else newAds.push(currentAd);
      setAds(newAds);
      // @ts-ignore
      saveSetting("forum_ads_list", newAds);
      setIsAdDialogOpen(false);
  };

  const deleteAd = (id: string) => {
      if(!confirm("Wirklich löschen?")) return;
      const newAds = ads.filter(a => a.id !== id);
      setAds(newAds);
      // @ts-ignore
      saveSetting("forum_ads_list", newAds);
  };

  const toggleAd = (index: number) => {
      const newAds = [...ads];
      newAds[index].enabled = !newAds[index].enabled;
      setAds(newAds);
      // @ts-ignore
      saveSetting("forum_ads_list", newAds);
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    if (direction === 'up' && index > 0) {
      [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
    } else if (direction === 'down' && index < newSections.length - 1) {
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    }
    newSections.forEach((s, i) => s.order = i);
    // @ts-ignore
    saveSetting("home_sections", newSections);
  };

  const handleToggleSection = (index: number) => {
    const newSections = [...sections];
    newSections[index].enabled = !newSections[index].enabled;
    // @ts-ignore
    saveSetting("home_sections", newSections);
  };

  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from('branding').upload(fileName, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('branding').getPublicUrl(fileName);
      setSiteLogoUrl(data.publicUrl);
      saveSetting('site_logo_url', data.publicUrl);
    } catch (e: any) { toast.error(e.message); } 
    finally { setIsUploadingLogo(false); }
  }

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-4xl pb-20">
      <div>
        <h2 className="font-display text-2xl font-bold">CMS Cockpit</h2>
        <p className="text-muted-foreground">Verwalte Design, Inhalte und Werbung.</p>
      </div>

      <Tabs defaultValue="home" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="home">Startseite</TabsTrigger>
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="forum">Forum/Ads</TabsTrigger>
            <TabsTrigger value="design" className="bg-blue-50 data-[state=active]:bg-blue-100"><Palette className="w-4 h-4 mr-2"/> Design</TabsTrigger>
        </TabsList>

        {/* TAB HOME */}
        <TabsContent value="home" className="space-y-6 mt-6">
            <Card><CardHeader><CardTitle>Sektionen sortieren</CardTitle></CardHeader><CardContent className="space-y-2">{sections.map((section, index) => (<div key={section.id} className={`flex justify-between p-3 border rounded-lg ${section.enabled ? 'bg-white' : 'bg-slate-100 opacity-75'}`}><div className="flex items-center gap-4"><div className="flex flex-col gap-1"><Button variant="ghost" size="icon" className="h-6 w-6" disabled={index===0} onClick={()=>handleMoveSection(index,'up')}><ArrowUp className="w-4 h-4"/></Button><Button variant="ghost" size="icon" className="h-6 w-6" disabled={index===sections.length-1} onClick={()=>handleMoveSection(index,'down')}><ArrowDown className="w-4 h-4"/></Button></div><div className="flex items-center gap-3"><GripVertical className="w-4 h-4 text-slate-400" /><span className="font-medium">{section.label}</span></div></div><Button variant={section.enabled ? "default" : "outline"} size="icon" onClick={()=>handleToggleSection(index)}>{section.enabled ? <Eye className="w-4 h-4"/> : <EyeOff className="w-4 h-4"/>}</Button></div>))}</CardContent></Card>
            <Card><CardHeader><CardTitle>Texte bearbeiten</CardTitle></CardHeader><CardContent><Accordion type="single" collapsible className="w-full space-y-4">
                <AccordionItem value="hero" className="border rounded-xl px-4"><AccordionTrigger>Hero Section</AccordionTrigger><AccordionContent className="space-y-4 pt-4"><Input value={content.hero.title} onChange={(e)=>updateContent('hero','title',e.target.value)} placeholder="Titel"/><Textarea value={content.hero.subtitle} onChange={(e)=>updateContent('hero','subtitle',e.target.value)} placeholder="Untertitel"/><div className="grid grid-cols-2 gap-4"><Input value={content.hero.badge} onChange={(e)=>updateContent('hero','badge',e.target.value)} placeholder="Badge"/><Input value={content.hero.search_label} onChange={(e)=>updateContent('hero','search_label',e.target.value)} placeholder="Button Text"/></div><Input value={content.hero.search_placeholder} onChange={(e)=>updateContent('hero','search_placeholder',e.target.value)} placeholder="Such-Platzhalter"/></AccordionContent></AccordionItem>
                <AccordionItem value="big_three" className="border rounded-xl px-4"><AccordionTrigger>Big Three (Die 3 Boxen)</AccordionTrigger><AccordionContent className="space-y-4 pt-4"><Input value={content.big_three.headline} onChange={(e)=>updateContent('big_three','headline',e.target.value)} /><div className="grid md:grid-cols-3 gap-4"><div className="space-y-2 border p-2 rounded bg-slate-50"><Label className="text-blue-600 font-bold">Box 1 (Finanzen)</Label><Input value={content.big_three.finance_title} onChange={(e)=>updateContent('big_three','finance_title',e.target.value)} /><Textarea value={content.big_three.finance_desc} onChange={(e)=>updateContent('big_three','finance_desc',e.target.value)} /><Input value={content.big_three.finance_link} onChange={(e)=>updateContent('big_three','finance_link',e.target.value)} /></div><div className="space-y-2 border p-2 rounded bg-slate-50"><Label className="text-orange-600 font-bold">Box 2 (Software)</Label><Input value={content.big_three.software_title} onChange={(e)=>updateContent('big_three','software_title',e.target.value)} /><Textarea value={content.big_three.software_desc} onChange={(e)=>updateContent('big_three','software_desc',e.target.value)} /><Input value={content.big_three.software_link} onChange={(e)=>updateContent('big_three','software_link',e.target.value)} /></div><div className="space-y-2 border p-2 rounded bg-slate-50"><Label className="text-yellow-600 font-bold">Box 3 (Service)</Label><Input value={content.big_three.services_title} onChange={(e)=>updateContent('big_three','services_title',e.target.value)} /><Textarea value={content.big_three.services_desc} onChange={(e)=>updateContent('big_three','services_desc',e.target.value)} /><Input value={content.big_three.services_link} onChange={(e)=>updateContent('big_three','services_link',e.target.value)} /></div></div></AccordionContent></AccordionItem>
                <AccordionItem value="home_forum" className="border rounded-xl px-4"><AccordionTrigger>Forum Teaser</AccordionTrigger><AccordionContent className="space-y-4 pt-4"><div className="space-y-2"><Label>Headline</Label><Input value={homeForumTeaser.headline} onChange={(e)=>updateHomeForum('headline',e.target.value)} /></div><div className="space-y-2"><Label>Subheadline</Label><Input value={homeForumTeaser.subheadline} onChange={(e)=>updateHomeForum('subheadline',e.target.value)} /></div></AccordionContent></AccordionItem>
            </Accordion></CardContent></Card>
        </TabsContent>

        {/* TAB GLOBAL */}
        <TabsContent value="global" className="space-y-6 mt-6">
            <Card><CardHeader><CardTitle className="flex gap-2"><Menu className="w-5 h-5"/> Header & Navigation</CardTitle></CardHeader><CardContent className="space-y-6"><div className="grid md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Button Text</Label><Input value={headerConfig.button_text} onChange={(e)=>updateHeader('button_text',e.target.value)}/></div><div className="space-y-2"><Label>Button Link</Label><Input value={headerConfig.button_url} onChange={(e)=>updateHeader('button_url',e.target.value)}/></div></div><LinkListEditor label="Haupt-Navigation" links={headerConfig.nav_links || []} onChange={(v) => updateHeader('nav_links', v)} /></CardContent></Card>
            <Card><CardHeader><CardTitle>Footer & Rechtliches</CardTitle></CardHeader><CardContent className="space-y-6"><div className="grid md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Titel</Label><Input value={footerConfig.title} onChange={(e)=>updateFooter('title',e.target.value)}/></div><div className="space-y-2"><Label>Copyright</Label><Input value={footerConfig.copyright_text} onChange={(e)=>updateFooter('copyright_text',e.target.value)}/></div></div><div className="space-y-2"><Label>Beschreibung</Label><Textarea value={footerConfig.text_description} onChange={(e)=>updateFooter('text_description',e.target.value)}/></div><div className="space-y-2"><Label className="text-red-500 font-bold">Werbehinweis</Label><Textarea value={footerConfig.disclaimer} onChange={(e)=>updateFooter('disclaimer',e.target.value)} rows={3}/></div><LinkListEditor label="Rechtliche Links" links={footerConfig.legal_links || []} onChange={(v) => updateFooter('legal_links', v)} /><LinkListEditor label="Beliebte Links" links={footerConfig.popular_links || []} onChange={(v) => updateFooter('popular_links', v)} /></CardContent></Card>
            <Card><CardHeader><CardTitle>Logo</CardTitle></CardHeader><CardContent><div className="flex items-center gap-6"><div className="relative w-24 h-24 border-2 border-dashed flex items-center justify-center rounded-lg bg-muted/50">{siteLogoUrl ? <img src={siteLogoUrl} className="w-full h-full object-contain p-2" /> : <ImageIcon className="w-8 h-8 text-muted-foreground/50" />}{isUploadingLogo && <div className="absolute inset-0 bg-background/80 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}</div><div className="space-y-2"><Button variant="outline" className="relative" disabled={isUploadingLogo}><input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleLogoUpload} /><Upload className="w-4 h-4 mr-2" /> Logo hochladen</Button></div></div></CardContent></Card>
        </TabsContent>

        {/* TAB FORUM */}
        <TabsContent value="forum" className="space-y-6 mt-6">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" /> Forum Seite</CardTitle></CardHeader><CardContent className="space-y-6"><div className="space-y-3"><Label>Banner Überschrift</Label><Input value={forumHeadline} onChange={(e) => setForumHeadline(e.target.value)} /></div><div className="space-y-3"><Label>Banner Beschreibung</Label><Textarea value={forumSubheadline} onChange={(e) => setForumSubheadline(e.target.value)} /></div><Button onClick={saveForumPageConfig} className="w-full md:w-auto"><Save className="w-4 h-4 mr-2" /> Speichern</Button></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-600" /> Sidebar Werbung (Pool)</CardTitle><Button onClick={openNewAdDialog} size="sm" className="bg-green-600 hover:bg-green-700 text-white"><Plus className="w-4 h-4 mr-1"/> Banner erstellen</Button></CardHeader><CardContent className="space-y-6"><p className="text-sm text-muted-foreground">Pool für zufällige Banner.</p><div className="space-y-3">{ads.map((ad, idx) => (<div key={ad.id} className="flex items-center justify-between p-4 bg-slate-50 border rounded-xl"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center">{ad.type === 'code' ? <Code className="w-5 h-5 text-blue-500"/> : <ImageIcon className="w-5 h-5 text-green-500"/>}</div><div><div className="font-bold">{ad.name || "Unbenannt"}</div><div className="text-xs text-muted-foreground">{ad.enabled ? <span className="text-green-600">Aktiv</span> : <span className="text-slate-400">Inaktiv</span>}</div></div></div><div className="flex gap-2"><Switch checked={ad.enabled} onCheckedChange={() => toggleAd(idx)} /><Button variant="ghost" size="icon" onClick={() => openEditAdDialog(ad)}><Edit className="w-4 h-4"/></Button><Button variant="ghost" size="icon" onClick={() => deleteAd(ad.id)}><Trash2 className="w-4 h-4 text-destructive"/></Button></div></div>))}</div></CardContent></Card>
        </TabsContent>

        {/* DESIGN TAB */}
        <TabsContent value="design" className="space-y-6 mt-6">
            <Card className="border-2 border-blue-100 overflow-hidden">
                <CardHeader className="bg-slate-50 border-b">
                    <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5 text-primary" /> Design & Branding</CardTitle>
                    <CardDescription>Wähle das Farbschema für Rank-Scout. Änderungen sind vorerst nur eine Vorschau.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <RadioGroup value={selectedTheme} onValueChange={handleThemeChange} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { id: "navy", label: "Deep Navy", desc: "Seriöses Deep Navy (#0E1F53).", color: "#0E1F53" },
                            { id: "royal", label: "Royal Blue", desc: "Freundliches Königsblau.", color: "hsl(224, 76%, 28%)" },
                            { id: "electric", label: "Electric Indigo", desc: "Modern & Leuchtend (#030874).", color: "#030874" },
                            { id: "midnight", label: "Midnight Exclusive", desc: "Ultra dunkel.", color: "hsl(240, 100%, 18%)" },
                            { id: "obsidian", label: "Obsidian Orange", desc: "High Contrast Schwarz & Orange.", color: "#1a1a1a" },
                            { id: "crimson", label: "Crimson Black", desc: "Aggressives Rot auf Schwarz.", color: "#000000" },
                            { id: "emerald", label: "Cyber Emerald", desc: "Tech-Vibe mit Dunkelgrün.", color: "hsl(160, 100%, 15%)" },
                            { id: "slate", label: "Slate Minimal", desc: "Clean & Seriös Grau-Blau.", color: "hsl(215, 25%, 27%)" },
                            { id: "gold", label: "Luxury Gold", desc: "Premium Schwarz & Gold.", color: "#0d0d0d" }
                        ].map((t) => (
                            <div key={t.id}>
                                <RadioGroupItem value={t.id} id={`theme-${t.id}`} className="peer sr-only" />
                                <Label htmlFor={`theme-${t.id}`} className="flex flex-col gap-3 rounded-xl border-2 border-slate-200 p-4 hover:border-slate-300 hover:bg-slate-50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 cursor-pointer transition-all h-full">
                                    <div className="flex items-center justify-between"><span className="font-bold text-lg">{t.label}</span>{selectedTheme === t.id && <CheckCircle2 className="w-5 h-5 text-blue-600" />}</div>
                                    <div className="h-20 rounded-lg w-full flex overflow-hidden border">
                                        <div className="w-2/3 h-full" style={{background: t.color}}></div>
                                        <div className="w-1/3 h-full" style={{background: t.id === 'obsidian' ? '#F97316' : t.id === 'crimson' ? '#DC2626' : t.id === 'emerald' ? '#10B981' : t.id === 'gold' ? '#EAB308' : '#EA580C'}}></div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>

                    {/* SPEICHERN BUTTON */}
                    <div className="mt-8 flex justify-end border-t pt-4">
                        <Button onClick={saveThemeConfig} size="lg" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 shadow-lg">
                            <Save className="w-4 h-4 mr-2" />
                            Design & Branding global speichern
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </TabsContent>

        <Dialog open={isAdDialogOpen} onOpenChange={setIsAdDialogOpen}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{currentAd?.id ? "Banner bearbeiten" : "Neuer Banner"}</DialogTitle></DialogHeader>
                {currentAd && (
                    <div className="space-y-6 py-4">
                        <div className="space-y-2"><Label>Interner Name</Label><Input value={currentAd.name} onChange={e => setCurrentAd({...currentAd, name: e.target.value})} /></div>
                        <RadioGroup value={currentAd.type} onValueChange={(v: any) => setCurrentAd({...currentAd, type: v})} className="flex gap-4">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="image" id="r1" /><Label htmlFor="r1">Bild</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="code" id="r2" /><Label htmlFor="r2">Code</Label></div>
                        </RadioGroup>
                        {currentAd.type === 'image' ? (
                            <div className="space-y-4"><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Bild URL</Label><Input value={currentAd.image_url} onChange={e => setCurrentAd({...currentAd, image_url: e.target.value})} /></div><div className="space-y-2"><Label>Link URL</Label><Input value={currentAd.link_url} onChange={e => setCurrentAd({...currentAd, link_url: e.target.value})} /></div></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Headline</Label><Input value={currentAd.headline} onChange={e => setCurrentAd({...currentAd, headline: e.target.value})} /></div><div className="space-y-2"><Label>Subheadline</Label><Input value={currentAd.subheadline} onChange={e => setCurrentAd({...currentAd, subheadline: e.target.value})} /></div></div><div className="space-y-2"><Label>Button Text</Label><Input value={currentAd.cta_text} onChange={e => setCurrentAd({...currentAd, cta_text: e.target.value})} /></div></div>
                        ) : (
                            <div className="space-y-2"><Label>HTML Code</Label><Textarea value={currentAd.html_code} onChange={e => setCurrentAd({...currentAd, html_code: e.target.value})} rows={8} className="font-mono text-xs"/></div>
                        )}
                        <div className="flex items-center justify-between border p-3 rounded-lg"><Label>Aktiv</Label><Switch checked={currentAd.enabled} onCheckedChange={c => setCurrentAd({...currentAd, enabled: c})} /></div>
                    </div>
                )}
                <DialogFooter><Button variant="outline" onClick={() => setIsAdDialogOpen(false)}>Abbrechen</Button><Button onClick={saveAd}>Speichern</Button></DialogFooter>
            </DialogContent>
        </Dialog>
      </Tabs>
    </div>
  );
}