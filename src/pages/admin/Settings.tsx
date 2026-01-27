import { useState, useEffect } from "react";
import { 
  useSettings, 
  useUpdateSetting, 
  defaultHomeLayout, 
  defaultHomeContent,
  type ForumBannerConfig 
} from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Loader2, Save, Layout, Image as ImageIcon, MessageSquare, UploadCloud, X, Type
} from "lucide-react";
import type { Json } from "@/integrations/supabase/types";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";

export default function AdminSettings() {
  const { data: settings, isLoading, refetch } = useSettings();
  const updateSetting = useUpdateSetting();

  // Local States
  const [layout, setLayout] = useState(defaultHomeLayout);
  const [content, setContent] = useState(defaultHomeContent);
  const [forumBanner, setForumBanner] = useState<ForumBannerConfig>({ 
    imageUrl: "", 
    linkUrl: "", 
    isActive: true,
    title: "",
    description: "",
    ctaText: ""
  });
  
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (settings) {
      const rawLayout = settings['home_layout'];
      if (Array.isArray(rawLayout) && rawLayout.length > 0) {
        setLayout(rawLayout as any);
      } else {
        setLayout(defaultHomeLayout);
      }

      const rawContent = settings['home_content'];
      if (rawContent && typeof rawContent === 'object') {
         setContent({ ...defaultHomeContent, ...(rawContent as any) });
      } else {
         setContent(defaultHomeContent);
      }

      const rawBanner = settings['forum_banner_config'];
      if (rawBanner && typeof rawBanner === 'object') {
        setForumBanner(rawBanner as any);
      } else {
        setForumBanner({
          imageUrl: "https://placehold.co/500x300/e2e8f0/1e293b?text=Dein+Banner+Hier",
          linkUrl: "#",
          isActive: true,
          title: "Spezialangebot",
          description: "Klicke hier für mehr Infos.",
          ctaText: "Zum Angebot"
        });
      }
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      const safeLayout = Array.isArray(layout) ? layout : defaultHomeLayout;

      await Promise.all([
        updateSetting.mutateAsync({ key: 'home_layout', value: safeLayout as unknown as Json }),
        updateSetting.mutateAsync({ key: 'home_content', value: content as unknown as Json }),
        updateSetting.mutateAsync({ key: 'forum_banner_config', value: forumBanner as unknown as Json })
      ]);
      
      toast.success("Einstellungen erfolgreich gespeichert");
      refetch(); 
    } catch (error) {
      console.error("Save Error:", error);
      toast.error("Fehler beim Speichern.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileName = `banner-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      const { error: uploadError } = await supabase.storage.from("forum-images").upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("forum-images").getPublicUrl(fileName);
      setForumBanner(prev => ({ ...prev, imageUrl: urlData.publicUrl }));
      toast.success("Banner hochgeladen!");
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error("Upload fehlgeschlagen.");
    } finally {
      setIsUploading(false);
    }
  };

  const updateContent = (section: string, key: string, value: string) => {
    setContent(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], [key]: value }
    }));
  };

  const sortedLayout = Array.isArray(layout) ? [...layout].sort((a, b) => a.sort_order - b.sort_order) : [...defaultHomeLayout];

  if (isLoading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Einstellungen</h2>
          <p className="text-muted-foreground">Verwalte Layout, Content und globale Konfigurationen.</p>
        </div>
        <Button onClick={handleSave} className="gap-2 bg-green-600 hover:bg-green-700 font-bold">
          {updateSetting.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
          Speichern
        </Button>
      </div>

      <Tabs defaultValue="layout" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
          <TabsTrigger value="layout" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-2 px-0">Home Layout</TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-2 px-0">Home Content</TabsTrigger>
          <TabsTrigger value="forum" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-2 px-0 gap-2"><MessageSquare className="w-4 h-4"/> Forum Werbung</TabsTrigger>
        </TabsList>

        <TabsContent value="layout" className="space-y-6 pt-6">
          <Card>
            <CardHeader><CardTitle>Startseiten Aufbau</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {sortedLayout.map((section, index) => (
                <div key={section.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded shadow-sm font-mono text-xs font-bold text-slate-500 w-8 h-8 flex items-center justify-center">{index + 1}</div>
                    <span className="capitalize font-medium text-slate-900">{section.id} Section</span>
                  </div>
                  <Switch checked={section.is_active} onCheckedChange={(checked) => setLayout(layout.map(l => l.id === section.id ? { ...l, is_active: checked } : l))} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6 pt-6">
          <Card>
            <CardHeader><CardTitle>Texte & Inhalte</CardTitle></CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="hero">
                  <AccordionTrigger className="hover:no-underline hover:bg-slate-50 px-4 rounded-lg">Hero Section</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4 px-4">
                      <div className="space-y-2"><Label>Headline</Label><Input value={content.hero.headline} onChange={(e) => updateContent('hero', 'headline', e.target.value)} /></div>
                      <div className="space-y-2"><Label>Sub-Headline</Label><Textarea value={content.hero.subheadline} onChange={(e) => updateContent('hero', 'subheadline', e.target.value)} /></div>
                      <div className="space-y-2"><Label>Button Text</Label><Input value={content.hero.button_text} onChange={(e) => updateContent('hero', 'button_text', e.target.value)} /></div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="categories">
                  <AccordionTrigger className="hover:no-underline hover:bg-slate-50 px-4 rounded-lg">Kategorien</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4 px-4">
                      <div className="space-y-2"><Label>Überschrift</Label><Input value={content.categories_headline} onChange={(e) => setContent({...content, categories_headline: e.target.value})} /></div>
                      <div className="space-y-2"><Label>Beschreibung</Label><Textarea value={content.categories_subheadline} onChange={(e) => setContent({...content, categories_subheadline: e.target.value})} /></div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="news">
                  <AccordionTrigger className="hover:no-underline hover:bg-slate-50 px-4 rounded-lg">News</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4 px-4">
                      <div className="space-y-2"><Label>Überschrift</Label><Input value={content.news.headline} onChange={(e) => updateContent('news', 'headline', e.target.value)} /></div>
                      <div className="space-y-2"><Label>Text</Label><Textarea value={content.news.subheadline} onChange={(e) => updateContent('news', 'subheadline', e.target.value)} /></div>
                      <div className="space-y-2"><Label>Button Text</Label><Input value={content.news.button_text} onChange={(e) => updateContent('news', 'button_text', e.target.value)} /></div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="seo">
                  <AccordionTrigger className="hover:no-underline hover:bg-slate-50 px-4 rounded-lg">SEO</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4 px-4">
                      <div className="space-y-2"><Label>Überschrift</Label><Input value={content.seo.headline} onChange={(e) => updateContent('seo', 'headline', e.target.value)} /></div>
                      <div className="space-y-2"><Label>Intro</Label><Textarea value={content.seo.intro} onChange={(e) => updateContent('seo', 'intro', e.target.value)} /></div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forum" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ImageIcon className="w-5 h-5"/> Sidebar Werbebanner</CardTitle>
              <CardDescription>Dieses Bild erscheint in der Sidebar des Forums.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="flex items-center justify-between border p-4 rounded-lg bg-slate-50">
                <div className="flex flex-col">
                   <Label className="text-base">Banner Aktiv</Label>
                   <span className="text-xs text-muted-foreground">Schaltet die Anzeige im Forum an/aus.</span>
                </div>
                <Switch checked={forumBanner.isActive} onCheckedChange={(c) => setForumBanner({...forumBanner, isActive: c})} />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Image Section */}
                <div className="space-y-3">
                  <Label>Banner Bild</Label>
                  <div className="space-y-3">
                      <div className="aspect-[5/3] w-full bg-slate-100 rounded-lg overflow-hidden border shadow-sm relative group">
                          {forumBanner.imageUrl ? (
                             <>
                               <img src={forumBanner.imageUrl} alt="Banner" className="w-full h-full object-cover" />
                               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="text-white font-medium">Vorschau</span>
                               </div>
                               <button 
                                 onClick={() => setForumBanner({...forumBanner, imageUrl: ""})}
                                 className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                               >
                                 <X className="w-4 h-4" />
                               </button>
                             </>
                          ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                               <ImageIcon className="w-8 h-8 opacity-20" />
                               <span className="text-xs">Kein Bild</span>
                             </div>
                          )}
                      </div>

                      <div className="flex gap-2">
                          <Input 
                              value={forumBanner.imageUrl} 
                              onChange={(e) => setForumBanner({...forumBanner, imageUrl: e.target.value})}
                              placeholder="Bild URL..."
                              className="flex-1"
                          />
                          <div className="relative">
                              <Button variant="outline" className="gap-2 cursor-pointer relative w-[120px]" disabled={isUploading}>
                                 {isUploading ? <Loader2 className="w-4 h-4 animate-spin"/> : <UploadCloud className="w-4 h-4" />}
                                 Upload
                              </Button>
                              <input 
                                  type="file" 
                                  accept="image/*"
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  onChange={handleImageUpload}
                                  disabled={isUploading}
                              />
                          </div>
                      </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Type className="w-4 h-4"/> Werbetext (Overlay)</Label>
                    <Input 
                        value={forumBanner.title} 
                        onChange={(e) => setForumBanner({...forumBanner, title: e.target.value})}
                        placeholder="Titel (z.B. Spezialangebot)"
                    />
                    <Textarea 
                        value={forumBanner.description} 
                        onChange={(e) => setForumBanner({...forumBanner, description: e.target.value})}
                        placeholder="Kurzbeschreibung (Max 2 Zeilen)..."
                        rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>CTA Button</Label>
                    <Input 
                        value={forumBanner.ctaText} 
                        onChange={(e) => setForumBanner({...forumBanner, ctaText: e.target.value})}
                        placeholder="Button Text (z.B. Jetzt ansehen)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Ziel-Link</Label>
                    <Input 
                        value={forumBanner.linkUrl} 
                        onChange={(e) => setForumBanner({...forumBanner, linkUrl: e.target.value})}
                        placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}