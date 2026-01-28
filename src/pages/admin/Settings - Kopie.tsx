import { useState, useEffect } from "react";
import { 
  useSettings, useUpdateSetting, useHomeLayout, useHomeContent, 
  useHeaderConfig, useFooterConfig, useScoutyConfig, useHomeForumTeaser,
  useForumBannerConfig, // WICHTIG: Importiert
  defaultHomeContent
} from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { 
  Loader2, Save, Globe, Layout, Sparkles, DollarSign, 
  Image as ImageIcon, Upload, Users, MessageSquare,
  ArrowUp, ArrowDown, Eye, EyeOff, GripVertical, Menu, Bot, Plus, Trash2, Link as LinkIcon
} from "lucide-react";
import type { Json } from "@/integrations/supabase/types";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";

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
  const forumBannerConfig = useForumBannerConfig(); // Config für die Forum-Seite

  // Local States Global
  const [siteLogoUrl, setSiteLogoUrl] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Local States Forum
  const [forumHeadline, setForumHeadline] = useState("");
  const [forumSubheadline, setForumSubheadline] = useState("");
  const [forumBadge, setForumBadge] = useState("");

  // Sync Init
  useEffect(() => {
    if (settings) {
       setSiteLogoUrl((settings.site_logo_url as string) || "");
       // Forum Init
       setForumHeadline((settings.forum_banner_headline as string) || "Diskussionen & Erfahrungen");
       setForumSubheadline((settings.forum_banner_subheadline as string) || "Tausche dich mit anderen aus...");
       setForumBadge((settings.forum_banner_badge as string) || "Community Forum");
    }
  }, [settings]);

  // Generic Save Helpers
  async function saveSetting(key: string, value: Json) {
    try {
      await updateSetting.mutateAsync({ key, value });
      toast({ title: "Gespeichert" });
    } catch (error) {
      toast({ title: "Fehler", variant: "destructive" });
    }
  }

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

  // Helper für Forum Tab
  const saveForumPageConfig = () => {
      saveSetting("forum_banner_headline", forumHeadline);
      saveSetting("forum_banner_subheadline", forumSubheadline);
      saveSetting("forum_banner_badge", forumBadge);
  };

  // CMS Ordering
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

  // Logo
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
    } catch (e: any) { toast({ title: "Fehler", description: e.message, variant: "destructive" }); } 
    finally { setIsUploadingLogo(false); }
  }

  // --- VISUAL LIST EDITOR (NO CODE!) ---
  const LinkListEditor = ({ label, links, onChange }: { label: string, links: any[], onChange: (v: any[]) => void }) => {
    const addLink = () => {
        onChange([...links, { label: "Neuer Link", url: "/" }]);
    };
    const removeLink = (index: number) => {
        const newLinks = [...links];
        newLinks.splice(index, 1);
        onChange(newLinks);
    };
    const updateLink = (index: number, field: 'label'|'url', val: string) => {
        const newLinks = [...links];
        newLinks[index][field] = val;
        onChange(newLinks);
    };

    return (
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border">
            <div className="flex justify-between items-center">
                <Label className="text-base font-bold">{label}</Label>
                <Button size="sm" variant="outline" onClick={addLink}><Plus className="w-3 h-3 mr-1"/> Hinzufügen</Button>
            </div>
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

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-4xl pb-20">
      <div>
        <h2 className="font-display text-2xl font-bold">CMS Cockpit</h2>
        <p className="text-muted-foreground">Bearbeite alle Inhalte visuell und ohne Code.</p>
      </div>

      <Tabs defaultValue="home" className="w-full">
        {/* HIER: Grid auf 3 erweitert und Tab hinzugefügt */}
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="home">Startseite & Inhalte</TabsTrigger>
            <TabsTrigger value="global">Menü & Footer</TabsTrigger>
            <TabsTrigger value="forum">Forum Seite</TabsTrigger>
        </TabsList>

        {/* TAB 1: HOME CONTENT */}
        <TabsContent value="home" className="space-y-6 mt-6">
            
            {/* 1. LAYOUT ORDER */}
            <Card>
                <CardHeader><CardTitle>Sektionen sortieren</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    {sections.map((section, index) => (
                         <div key={section.id} className={`flex justify-between p-3 border rounded-lg ${section.enabled ? 'bg-white' : 'bg-slate-100 opacity-75'}`}>
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col gap-1">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index===0} onClick={()=>handleMoveSection(index,'up')}><ArrowUp className="w-4 h-4"/></Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index===sections.length-1} onClick={()=>handleMoveSection(index,'down')}><ArrowDown className="w-4 h-4"/></Button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <GripVertical className="w-4 h-4 text-slate-400" />
                                    <span className="font-medium">{section.label}</span>
                                </div>
                            </div>
                            <Button variant={section.enabled ? "default" : "outline"} size="icon" onClick={()=>handleToggleSection(index)}>
                                {section.enabled ? <Eye className="w-4 h-4"/> : <EyeOff className="w-4 h-4"/>}
                            </Button>
                         </div>
                    ))}
                </CardContent>
            </Card>

            {/* 2. INHALTE EDITIEREN */}
            <Card>
                <CardHeader><CardTitle>Texte bearbeiten</CardTitle></CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        
                        <AccordionItem value="hero" className="border rounded-xl px-4">
                            <AccordionTrigger>Hero Section</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                <Input value={content.hero.title} onChange={(e)=>updateContent('hero','title',e.target.value)} placeholder="Titel"/>
                                <Textarea value={content.hero.subtitle} onChange={(e)=>updateContent('hero','subtitle',e.target.value)} placeholder="Untertitel"/>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input value={content.hero.badge} onChange={(e)=>updateContent('hero','badge',e.target.value)} placeholder="Badge"/>
                                    <Input value={content.hero.search_label} onChange={(e)=>updateContent('hero','search_label',e.target.value)} placeholder="Button Text"/>
                                </div>
                                <Input value={content.hero.search_placeholder} onChange={(e)=>updateContent('hero','search_placeholder',e.target.value)} placeholder="Such-Platzhalter"/>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="big_three" className="border rounded-xl px-4">
                            <AccordionTrigger>Big Three (Die 3 Boxen)</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                <Input value={content.big_three.headline} onChange={(e)=>updateContent('big_three','headline',e.target.value)} />
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="space-y-2 border p-2 rounded bg-slate-50">
                                        <Label className="text-blue-600 font-bold">Box 1 (Finanzen)</Label>
                                        <Input value={content.big_three.finance_title} onChange={(e)=>updateContent('big_three','finance_title',e.target.value)} />
                                        <Textarea value={content.big_three.finance_desc} onChange={(e)=>updateContent('big_three','finance_desc',e.target.value)} />
                                        <Input value={content.big_three.finance_link} onChange={(e)=>updateContent('big_three','finance_link',e.target.value)} />
                                    </div>
                                    <div className="space-y-2 border p-2 rounded bg-slate-50">
                                        <Label className="text-orange-600 font-bold">Box 2 (Software)</Label>
                                        <Input value={content.big_three.software_title} onChange={(e)=>updateContent('big_three','software_title',e.target.value)} />
                                        <Textarea value={content.big_three.software_desc} onChange={(e)=>updateContent('big_three','software_desc',e.target.value)} />
                                        <Input value={content.big_three.software_link} onChange={(e)=>updateContent('big_three','software_link',e.target.value)} />
                                    </div>
                                    <div className="space-y-2 border p-2 rounded bg-slate-50">
                                        <Label className="text-yellow-600 font-bold">Box 3 (Service)</Label>
                                        <Input value={content.big_three.services_title} onChange={(e)=>updateContent('big_three','services_title',e.target.value)} />
                                        <Textarea value={content.big_three.services_desc} onChange={(e)=>updateContent('big_three','services_desc',e.target.value)} />
                                        <Input value={content.big_three.services_link} onChange={(e)=>updateContent('big_three','services_link',e.target.value)} />
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="home_forum" className="border rounded-xl px-4">
                            <AccordionTrigger>Forum Teaser (Startseite)</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                <div className="space-y-2"><Label>Headline</Label><Input value={homeForumTeaser.headline} onChange={(e)=>updateHomeForum('headline',e.target.value)} /></div>
                                <div className="space-y-2"><Label>Subheadline</Label><Input value={homeForumTeaser.subheadline} onChange={(e)=>updateHomeForum('subheadline',e.target.value)} /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Link Text</Label><Input value={homeForumTeaser.link_text} onChange={(e)=>updateHomeForum('link_text',e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Mobile Button</Label><Input value={homeForumTeaser.mobile_button} onChange={(e)=>updateHomeForum('mobile_button',e.target.value)} /></div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="scouty" className="border rounded-xl px-4">
                            <AccordionTrigger className="flex gap-2"><Bot className="w-4 h-4"/> Scouty Widget</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                <div className="space-y-2"><Label>Intro Blase ("Hi, ich bin...")</Label><Input value={scoutyConfig.bubble_intro} onChange={(e)=>updateScouty('bubble_intro',e.target.value)} /></div>
                                <div className="space-y-2"><Label>Exit Intent ("Warte!...")</Label><Input value={scoutyConfig.bubble_exit} onChange={(e)=>updateScouty('bubble_exit',e.target.value)} /></div>
                                <div className="space-y-2"><Label>Newsletter Blase ("Top 3...")</Label><Input value={scoutyConfig.bubble_newsletter} onChange={(e)=>updateScouty('bubble_newsletter',e.target.value)} /></div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="trust" className="border rounded-xl px-4"><AccordionTrigger>Trust & Siegel</AccordionTrigger><AccordionContent className="pt-4"><Input value={content.trust.headline} onChange={(e)=>updateContent('trust','headline',e.target.value)}/></AccordionContent></AccordionItem>
                        <AccordionItem value="categories" className="border rounded-xl px-4"><AccordionTrigger>Kategorien</AccordionTrigger><AccordionContent className="pt-4"><Input value={content.categories.headline} onChange={(e)=>updateContent('categories','headline',e.target.value)}/></AccordionContent></AccordionItem>
                        <AccordionItem value="news" className="border rounded-xl px-4"><AccordionTrigger>News / Ratgeber</AccordionTrigger><AccordionContent className="pt-4"><Input value={content.news.headline} onChange={(e)=>updateContent('news','headline',e.target.value)}/></AccordionContent></AccordionItem>
                        
                        <AccordionItem value="seo" className="border rounded-xl px-4"><AccordionTrigger>SEO Text (Unten)</AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-4">
                                <Input value={content.seo.headline} onChange={(e)=>updateContent('seo','headline',e.target.value)} placeholder="Headline"/>
                                <Textarea value={content.seo.intro} onChange={(e)=>updateContent('seo','intro',e.target.value)} placeholder="Intro Text" rows={4}/>
                            </AccordionContent>
                        </AccordionItem>

                    </Accordion>
                </CardContent>
            </Card>
        </TabsContent>

        {/* TAB 2: GLOBAL */}
        <TabsContent value="global" className="space-y-6 mt-6">
            
            {/* HEADER */}
            <Card>
                <CardHeader><CardTitle className="flex gap-2"><Menu className="w-5 h-5"/> Header & Navigation</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Button Text</Label><Input value={headerConfig.button_text} onChange={(e)=>updateHeader('button_text',e.target.value)}/></div>
                        <div className="space-y-2"><Label>Button Link</Label><Input value={headerConfig.button_url} onChange={(e)=>updateHeader('button_url',e.target.value)}/></div>
                    </div>
                    
                    {/* VISUAL EDITOR */}
                    <LinkListEditor 
                        label="Haupt-Navigation (Menüpunkte)" 
                        links={headerConfig.nav_links || []} 
                        onChange={(v) => updateHeader('nav_links', v)} 
                    />
                </CardContent>
            </Card>

            {/* FOOTER */}
            <Card>
                <CardHeader><CardTitle>Footer & Rechtliches</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Titel</Label><Input value={footerConfig.title} onChange={(e)=>updateFooter('title',e.target.value)}/></div>
                        <div className="space-y-2"><Label>Copyright</Label><Input value={footerConfig.copyright_text} onChange={(e)=>updateFooter('copyright_text',e.target.value)}/></div>
                        <div className="space-y-2"><Label>Geprüft-Text</Label><Input value={footerConfig.text_checked} onChange={(e)=>updateFooter('text_checked',e.target.value)}/></div>
                        <div className="space-y-2"><Label>Update-Text</Label><Input value={footerConfig.text_update} onChange={(e)=>updateFooter('text_update',e.target.value)}/></div>
                    </div>
                    <div className="space-y-2"><Label>Beschreibung</Label><Textarea value={footerConfig.text_description} onChange={(e)=>updateFooter('text_description',e.target.value)}/></div>
                    <div className="space-y-2"><Label className="text-red-500 font-bold">Werbehinweis (Disclaimer)</Label><Textarea value={footerConfig.disclaimer} onChange={(e)=>updateFooter('disclaimer',e.target.value)} rows={3}/></div>
                    
                    <LinkListEditor 
                        label="Rechtliche Links (Impressum etc.)" 
                        links={footerConfig.legal_links || []} 
                        onChange={(v) => updateFooter('legal_links', v)} 
                    />
                    
                    <LinkListEditor 
                        label="Beliebte Links (Spalte 2)" 
                        links={footerConfig.popular_links || []} 
                        onChange={(v) => updateFooter('popular_links', v)} 
                    />
                </CardContent>
            </Card>

            {/* BRANDING */}
            <Card>
                 <CardHeader><CardTitle>Logo</CardTitle></CardHeader>
                 <CardContent>
                     <div className="flex items-center gap-6">
                         <div className="relative w-24 h-24 border-2 border-dashed flex items-center justify-center rounded-lg bg-muted/50">
                            {siteLogoUrl ? <img src={siteLogoUrl} className="w-full h-full object-contain p-2" /> : <ImageIcon className="w-8 h-8 text-muted-foreground/50" />}
                            {isUploadingLogo && <div className="absolute inset-0 bg-background/80 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}
                         </div>
                         <div className="space-y-2">
                            <Button variant="outline" className="relative" disabled={isUploadingLogo}>
                              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleLogoUpload} />
                              <Upload className="w-4 h-4 mr-2" /> Logo hochladen
                            </Button>
                         </div>
                      </div>
                 </CardContent>
            </Card>

        </TabsContent>

        {/* TAB 3: FORUM (NEUER REITER) */}
        <TabsContent value="forum" className="space-y-6 mt-6">
            <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" /> Forum Seite Einstellungen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-3">
                        <Label>Banner Überschrift (Auf der /forum Seite)</Label>
                        <Input value={forumHeadline} onChange={(e) => setForumHeadline(e.target.value)} placeholder="z.B. Community Hub" />
                    </div>
                    <div className="space-y-3">
                        <Label>Banner Beschreibung</Label>
                        <Textarea value={forumSubheadline} onChange={(e) => setForumSubheadline(e.target.value)} placeholder="z.B. Diskutiere mit Experten..." />
                    </div>
                    <div className="space-y-3">
                        <Label>Badge Text</Label>
                        <Input value={forumBadge} onChange={(e) => setForumBadge(e.target.value)} placeholder="z.B. Community Forum" />
                    </div>
                    <Button onClick={saveForumPageConfig} className="w-full md:w-auto">
                        <Save className="w-4 h-4 mr-2" /> Forum-Texte speichern
                    </Button>
                </CardContent>
            </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}