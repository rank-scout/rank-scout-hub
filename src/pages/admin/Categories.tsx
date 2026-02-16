import { useState, useEffect } from "react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, type Category } from "@/hooks/useCategories";
import { useCategoryProjects, useUpdateCategoryProjects } from "@/hooks/useCategoryProjects";
import { useGenerateCategoryContent } from "@/hooks/useGenerateCategoryContent";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, type CategoryInput } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, UploadCloud, Database, Eye, Bot, Settings2, Code, FileText } from "lucide-react";
import ProjectCheckboxList from "@/components/admin/ProjectCheckboxList";
import { CategoryFAQEditor } from "@/components/admin/CategoryFAQEditor"; 
import { supabase } from "@/integrations/supabase/client";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

// --- KI CONFIG DIALOG ---
const AIConfigDialog = () => {
    const [open, setOpen] = useState(false);
    const [provider, setProvider] = useState("google");
    const [googleKey, setGoogleKey] = useState("");
    const [openaiKey, setOpenaiKey] = useState("");

    useEffect(() => {
        if(open) {
            setProvider(localStorage.getItem("ai_provider") || "google");
            setGoogleKey(localStorage.getItem("ai_key_google") || "");
            setOpenaiKey(localStorage.getItem("ai_key_openai") || "");
        }
    }, [open]);

    const saveConfig = () => {
        localStorage.setItem("ai_provider", provider);
        localStorage.setItem("ai_key_google", googleKey.trim());
        localStorage.setItem("ai_key_openai", openaiKey.trim());
        setOpen(false);
        toast({ title: "Gespeichert", description: `KI auf ${provider === 'google' ? 'Google Gemini' : 'OpenAI GPT'} eingestellt.` });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Button variant="outline" onClick={() => setOpen(true)} className="gap-2 border-orange-200 hover:bg-orange-50 text-orange-700 shadow-sm">
                <Bot className="w-4 h-4" /> KI Settings
            </Button>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader><DialogTitle>KI Konfiguration</DialogTitle><DialogDescription>Keys werden lokal gespeichert.</DialogDescription></DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label>Anbieter</Label>
                        <Select value={provider} onValueChange={setProvider}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="google">⚡ Google Gemini</SelectItem><SelectItem value="openai">🧠 OpenAI GPT-4o</SelectItem></SelectContent>
                        </Select>
                    </div>
                    {provider === 'google' && (<div className="space-y-2"><Label>Google Key</Label><Input value={googleKey} onChange={e => setGoogleKey(e.target.value)} type="password" /></div>)}
                    {provider === 'openai' && (<div className="space-y-2"><Label>OpenAI Key</Label><Input value={openaiKey} onChange={e => setOpenaiKey(e.target.value)} type="password" /></div>)}
                </div>
                <DialogFooter><Button onClick={saveConfig} className="w-full">Speichern</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Helper
function generateSlug(name: string): string {
  return name.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function uploadImageToSupabase(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;
    const { error } = await supabase.storage.from('images').upload(filePath, file);
    if (error) throw error;
    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error: any) {
    toast({ title: "Upload Fehler", description: error.message, variant: "destructive" });
    return null;
  }
}

export default function Categories() {
  const { data: categories = [] } = useCategories(true);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const updateCategoryProjects = useUpdateCategoryProjects();
  const { generateCategoryContent, isGenerating: isGenContent } = useGenerateCategoryContent();
    
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [selectedHubSlugs, setSelectedHubSlugs] = useState<string[]>([]);
  const [topicPrompt, setTopicPrompt] = useState("");
  
  // HTML VIEW STATES
  const [showHtmlTop, setShowHtmlTop] = useState(false);
  const [showHtmlBottom, setShowHtmlBottom] = useState(false);

  const { data: categoryProjects = [] } = useCategoryProjects(editingCategory?.id);

  useEffect(() => {
    let newIds: string[] = [];
    if (categoryProjects && categoryProjects.length > 0) {
      newIds = [...categoryProjects].sort((a, b) => a.sort_order - b.sort_order).map((cp) => cp.project_id);
    }
    setSelectedProjectIds(prev => JSON.stringify(prev) !== JSON.stringify(newIds) ? newIds : prev);
  }, [categoryProjects]); 

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { theme: "DATING", template: "comparison", is_active: true, sort_order: 0, faq_data: [], meta_title: "", meta_description: "" },
  });

  const { register, handleSubmit, setValue, watch, control } = form;
  const currentTemplate = watch("template");

  useEffect(() => {
    if (editingCategory) {
      form.reset({
        name: editingCategory.name, slug: editingCategory.slug, description: editingCategory.description || "",
        theme: editingCategory.theme || "GENERIC", template: editingCategory.template || "comparison",
        is_active: editingCategory.is_active, meta_title: editingCategory.meta_title || "",
        meta_description: editingCategory.meta_description || "", h1_title: editingCategory.h1_title || "",
        custom_css: (editingCategory as any).custom_css || "", 
        sidebar_ad_html: (editingCategory as any).sidebar_ad_html || "",
        sidebar_ad_image: (editingCategory as any).sidebar_ad_image || "",
        hero_image_url: (editingCategory as any).hero_image_url || "", 
        long_content_top: editingCategory.long_content_top || "",
        long_content_bottom: editingCategory.long_content_bottom || "",
        faq_data: editingCategory.faq_data || [],
        custom_html_override: editingCategory.custom_html_override || "",
      } as any);
      setTopicPrompt(`Content für ${editingCategory.name}`);
      const savedSlugs = (editingCategory as any).custom_css ? (editingCategory as any).custom_css.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
      setSelectedHubSlugs(savedSlugs);
    } else {
      form.reset({ name: "", slug: "", theme: "GENERIC", template: "comparison", is_active: true, faq_data: [], meta_title: "", meta_description: "", sidebar_ad_html: '', sidebar_ad_image: '', hero_image_url: '', custom_css: '' } as any);
      setSelectedProjectIds([]); setSelectedHubSlugs([]); setTopicPrompt("");
    }
    setShowHtmlTop(false);
    setShowHtmlBottom(false);
  }, [editingCategory, form]);

  async function onSubmit(data: CategoryInput) {
    try {
      const now = new Date().toISOString();
      const rawData = { ...data } as any;
      const finalHubConfig = selectedHubSlugs.join(',');

      delete rawData.custom_html; 
      delete rawData.faq_section; delete rawData.footer_links; delete rawData.popular_footer_links; 
      delete rawData.legal_links; delete rawData.projects; delete rawData.category_projects; 
      delete rawData.reviews; delete rawData.testimonials;

      const payload = { ...rawData, updated_at: now, is_internal_generated: true, custom_css: finalHubConfig };
      
      let catId = editingCategory?.id;
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, ...payload });
        toast({ title: "Gespeichert", description: "Einstellungen erfolgreich übernommen." });
      } else {
        const result = await createCategory.mutateAsync(payload);
        catId = result.id;
        toast({ title: "Erstellt", description: "Seite erfolgreich angelegt." });
      }
      if (catId && selectedProjectIds.length > 0) {
          await updateCategoryProjects.mutateAsync({ categoryId: catId, projectIds: selectedProjectIds });
      }
      setIsDialogOpen(false);
    } catch (error: any) { 
        console.error("Save Error:", error);
        toast({ title: "Fehler beim Speichern", description: error.message, variant: "destructive" }); 
    }
  }

  const handleGenerateContent = async () => {
    const catName = form.getValues("name");
    const provider = localStorage.getItem("ai_provider") || "google";
    const key = localStorage.getItem(provider === "google" ? "ai_key_google" : "ai_key_openai");
    
    if(!key) return toast({ title: "Kein API Key", description: "Bitte oben rechts 'KI Settings' prüfen.", variant: "destructive" });

    const result = await generateCategoryContent(catName, topicPrompt || catName);
    if (result) {
      form.setValue("long_content_top", result.contentTop, { shouldDirty: true });
      form.setValue("long_content_bottom", result.contentBottom, { shouldDirty: true });
      if (result.faqData && Array.isArray(result.faqData) && result.faqData.length > 0) {
          form.setValue("faq_data", result.faqData, { shouldDirty: true });
          toast({ title: "Erfolg", description: "Content & FAQs wurden generiert!" });
      } else {
          toast({ title: "Content generiert", description: "Keine FAQs erhalten." });
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: any) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const url = await uploadImageToSupabase(e.target.files[0]);
    if (url) { form.setValue(fieldName, url, { shouldDirty: true }); toast({ title: "Bild hochgeladen" }); }
  };

  const toggleHubSlug = (slug: string) => {
    setSelectedHubSlugs(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  };

  const handleDelete = async (id: string) => {
      if(confirm("Wirklich löschen?")) await deleteCategory.mutateAsync(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-3xl font-bold flex items-center gap-3 text-slate-800"><Settings2 className="w-8 h-8 text-primary" /> Seiten-Manager</h2><p className="text-slate-500 mt-1">Erstelle Hubs, Vergleiche und Landingpages.</p></div>
        <div className="flex gap-3"><AIConfigDialog /><Button onClick={() => { setEditingCategory(null); setIsDialogOpen(true); }} size="lg" className="shadow-lg"><Plus className="w-5 h-5 mr-2" /> Neue Seite erstellen</Button></div>
      </div>

      <Card className="border shadow-sm overflow-hidden">
        <CardContent className="p-0">
            <Table>
                <TableHeader className="bg-slate-50"><TableRow><TableHead className="w-[80px]">Pos</TableHead><TableHead>Name & URL</TableHead><TableHead>Typ</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aktionen</TableHead></TableRow></TableHeader>
                <TableBody>
                    {categories.map((cat) => (
                    <TableRow key={cat.id} className="hover:bg-slate-50/50">
                        <TableCell><div className="flex flex-col gap-1 text-slate-400"><ArrowUp className="w-4 h-4 cursor-pointer" /><ArrowDown className="w-4 h-4 cursor-pointer" /></div></TableCell>
                        <TableCell><div className="font-bold text-slate-800 text-base">{cat.name}</div><div className="text-xs text-slate-500 font-mono bg-slate-100 inline-block px-1.5 py-0.5 rounded mt-1">/{cat.slug}</div></TableCell>
                        <TableCell>{cat.template === 'hub_overview' ? <Badge className="bg-yellow-500">Hub</Badge> : (cat.template === 'comparison' ? <Badge className="bg-blue-600">Vergleich</Badge> : <Badge className="bg-slate-600">Artikel</Badge>)}</TableCell>
                        <TableCell><Switch checked={cat.is_active} /></TableCell>
                        <TableCell className="text-right"><div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={()=>open(`/${cat.slug}`, '_blank')}><Eye className="w-4 h-4"/></Button>
                                <Button variant="outline" size="sm" onClick={() => { setEditingCategory(cat); setIsDialogOpen(true); }}><Pencil className="w-4 h-4"/></Button>
                                <Button variant="outline" size="sm" onClick={()=>handleDelete(cat.id)}><Trash2 className="w-4 h-4"/></Button>
                        </div></TableCell>
                    </TableRow>))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] h-[90vh] flex flex-col p-0 bg-slate-50/50 rounded-2xl overflow-hidden border-0 shadow-2xl">
            <div className="px-8 py-5 border-b bg-white flex justify-between items-center shadow-sm z-10">
                <div><DialogTitle className="text-2xl font-bold text-slate-900">{editingCategory ? "Bearbeiten" : "Neu"}</DialogTitle><DialogDescription>Seite konfigurieren</DialogDescription></div>
                <div className="flex gap-3"><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Abbrechen</Button><Button onClick={handleSubmit(onSubmit)} className="bg-primary text-white"><Database className="w-4 h-4 mr-2" /> Speichern</Button></div>
            </div>
            
            <div className="flex-1 overflow-y-auto"><div className="max-w-6xl mx-auto p-8">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div><Label className="text-lg font-bold text-slate-800 mb-2 block">Seitentyp</Label>
                                <Controller control={control} name="template" render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value || "comparison"}>
                                        <SelectTrigger className="h-12 text-lg font-medium"><SelectValue placeholder="Wähle Typ..." /></SelectTrigger>
                                        <SelectContent><SelectItem value="comparison">⚡ Vergleichsseite</SelectItem><SelectItem value="hub_overview">🌐 Themen-Hub</SelectItem><SelectItem value="review">📖 Ratgeber</SelectItem></SelectContent>
                                    </Select>
                                )} />
                            </div>
                        </div>
                    </div>

                    <Tabs defaultValue="basis" className="w-full">
                        <TabsList className="w-full justify-start h-14 bg-white p-1 rounded-xl border border-slate-200 shadow-sm mb-6">
                            <TabsTrigger value="basis" className="h-11 px-6 rounded-lg font-bold">Basis & SEO</TabsTrigger>
                            <TabsTrigger value="content" className="h-11 px-6 rounded-lg font-bold">Inhalt</TabsTrigger>
                            {currentTemplate === 'hub_overview' ? <TabsTrigger value="hub" className="h-11 px-6 rounded-lg font-bold bg-yellow-50 text-yellow-700">Hub Config</TabsTrigger> : <TabsTrigger value="projects" className="h-11 px-6 rounded-lg font-bold bg-blue-50 text-blue-700">Partner</TabsTrigger>}
                            <TabsTrigger value="design" className="h-11 px-6 rounded-lg font-bold">Design & Ads</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basis" className="space-y-6"><div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2"><Label>Name *</Label><Input {...register("name")} /></div>
                                    <div className="space-y-2"><Label>Slug *</Label><Input {...register("slug")} /></div>
                                </div>
                                <div className="space-y-2"><Label>H1 Titel</Label><Input {...register("h1_title")} /></div>
                                <div className="space-y-4 pt-4 border-t"><div className="space-y-2"><Label>Meta Title</Label><Input {...register("meta_title")} /></div><div className="space-y-2"><Label>Meta Description</Label><Textarea {...register("meta_description")} /></div></div>
                            </div></TabsContent>

                        <TabsContent value="content" className="space-y-6"><div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                                <div className="flex gap-2 mb-4"><Input value={topicPrompt} onChange={e=>setTopicPrompt(e.target.value)} placeholder="KI Thema (z.B. Beste Dating Apps im Vergleich)" /><Button onClick={handleGenerateContent} disabled={isGenContent}>KI Schreiben</Button></div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <Label>Oben</Label>
                                            <Button variant="ghost" size="sm" onClick={()=>setShowHtmlTop(!showHtmlTop)} className="h-6 text-xs gap-1">
                                                {showHtmlTop ? <><FileText className="w-3 h-3"/> Editor</> : <><Code className="w-3 h-3"/> HTML</>}
                                            </Button>
                                        </div>
                                        <Controller name="long_content_top" control={control} render={({ field }) => (
                                            showHtmlTop ? 
                                            <Textarea value={field.value || ''} onChange={field.onChange} className="font-mono text-xs min-h-[400px]" /> :
                                            <RichTextEditor value={field.value || ''} onChange={field.onChange} />
                                        )}/>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <Label>Unten</Label>
                                            <Button variant="ghost" size="sm" onClick={()=>setShowHtmlBottom(!showHtmlBottom)} className="h-6 text-xs gap-1">
                                                {showHtmlBottom ? <><FileText className="w-3 h-3"/> Editor</> : <><Code className="w-3 h-3"/> HTML</>}
                                            </Button>
                                        </div>
                                        <Controller name="long_content_bottom" control={control} render={({ field }) => (
                                            showHtmlBottom ?
                                            <Textarea value={field.value || ''} onChange={field.onChange} className="font-mono text-xs min-h-[400px]" /> :
                                            <RichTextEditor value={field.value || ''} onChange={field.onChange} />
                                        )}/>
                                    </div>
                                </div>
                                <div className="pt-8 border-t"><CategoryFAQEditor form={form} /></div>
                            </div></TabsContent>

                        {/* ... Rest der Tabs (Hub, Projects, Design) wie zuvor ... */}
                        <TabsContent value="hub" className="space-y-6"><div className="bg-white p-8 rounded-2xl border border-yellow-200 shadow-lg">
                                <div className="flex items-center justify-between mb-4"><div><Label className="text-lg font-bold">Seiten auswählen</Label></div><Badge variant="secondary">{selectedHubSlugs.length} ausgewählt</Badge></div>
                                <ScrollArea className="h-[400px] w-full border rounded-xl bg-slate-50 p-4 shadow-inner">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{categories.filter(c => c.id !== editingCategory?.id).map((cat) => (
                                            <div key={cat.id} className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-white ${selectedHubSlugs.includes(cat.slug) ? 'bg-white border-primary shadow-sm' : 'border-transparent'}`} onClick={() => toggleHubSlug(cat.slug)}>
                                                <Checkbox checked={selectedHubSlugs.includes(cat.slug)} onCheckedChange={() => toggleHubSlug(cat.slug)} /><Label className="font-bold cursor-pointer">{cat.name}</Label>
                                            </div>))}</div>
                                </ScrollArea>
                            </div></TabsContent>

                        <TabsContent value="projects"><div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm"><ProjectCheckboxList selectedIds={selectedProjectIds} onChange={setSelectedProjectIds} /></div></TabsContent>

                        <TabsContent value="design" className="space-y-6"><div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                                <div className="grid grid-cols-2 gap-8">
                                    <div><Label>Hero Bild</Label><div className="flex gap-2"><Input {...register("hero_image_url")} /><input type="file" className="hidden" id="upload-hero" onChange={(e)=>handleImageUpload(e,"hero_image_url")}/><Button variant="outline" type="button" onClick={()=>document.getElementById('upload-hero')?.click()}><UploadCloud className="w-4 h-4"/></Button></div>{watch("hero_image_url") && <img src={watch("hero_image_url") || ""} className="mt-2 h-32 w-full object-cover rounded" />}</div>
                                    <div><Label>Sidebar Werbung (HTML)</Label><Textarea {...register("sidebar_ad_html")} rows={4} className="font-mono text-xs"/></div>
                                </div>
                            </div></TabsContent>
                    </Tabs>
                </div></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}