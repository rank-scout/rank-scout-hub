import { useState, useEffect } from "react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useDuplicateCategory, type Category } from "@/hooks/useCategories";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, ArrowUp, ArrowDown, UploadCloud, LayoutTemplate, FileCheck, Sparkles, Bot, Database, Eye, Megaphone, Image as ImageIcon } from "lucide-react";
import ProjectCheckboxList from "@/components/admin/ProjectCheckboxList";
import { CategoryFooterLinksEditor } from "@/components/admin/CategoryFooterLinksEditor";
import { CategoryLegalLinksEditor } from "@/components/admin/CategoryLegalLinksEditor";
import { CategoryFAQEditor } from "@/components/admin/CategoryFAQEditor"; 
import { supabase } from "@/integrations/supabase/client";
import RichTextEditor from "@/components/ui/rich-text-editor";

// Router & Helmet für Deploy-Fix
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { renderToStaticMarkup } from "react-dom/server";
import { NewComparisonTemplate } from "@/components/templates/NewComparisonTemplate";
import { ReviewTemplate } from "@/components/templates/ReviewTemplate";

// --- HELPER: BILD UPLOAD ---
async function uploadImageToSupabase(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error: any) {
    toast({ title: "Upload Fehler", description: error.message, variant: "destructive" });
    return null;
  }
}

// Helper
function generateSlug(name: string): string {
  return name.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function Categories() {
  const { data: categories = [], isLoading } = useCategories(true);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const duplicateCategory = useDuplicateCategory();
  const updateCategoryProjects = useUpdateCategoryProjects();
   
  const { generateCategoryContent, isGenerating: isGenContent } = useGenerateCategoryContent();
    
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // MODUS: "landing" (Classic) oder "internal" (Ratgeber/AI)
  const [pageMode, setPageMode] = useState<"landing" | "internal">("landing");
  const [topicPrompt, setTopicPrompt] = useState("");

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

  const { register, handleSubmit, reset, setValue, watch, control } = form;

  useEffect(() => {
    if (editingCategory) {
      const isInternal = (editingCategory as any).is_internal_generated === true;
      setPageMode(isInternal ? "internal" : "landing");

      form.reset({
        name: editingCategory.name,
        slug: editingCategory.slug,
        description: editingCategory.description || "",
        theme: editingCategory.theme || "GENERIC",
        icon: editingCategory.icon || "",
        color_theme: editingCategory.color_theme || "slate",
        is_active: editingCategory.is_active,
        is_city: editingCategory.is_city || false,
        template: editingCategory.template || "comparison",
        meta_title: editingCategory.meta_title || "",
        meta_description: editingCategory.meta_description || "",
        h1_title: editingCategory.h1_title || "",
        custom_html: editingCategory.custom_html || "",
        custom_css: (editingCategory as any).custom_css || "",
        custom_html_override: editingCategory.custom_html_override || "",
        long_content_top: editingCategory.long_content_top || "",
        long_content_bottom: editingCategory.long_content_bottom || "",
        faq_data: editingCategory.faq_data || [],
        
        // NEU: Sidebar Ads & Hero Image (Jetzt sauber im Schema)
        sidebar_ad_html: (editingCategory as any).sidebar_ad_html || "",
        sidebar_ad_image: (editingCategory as any).sidebar_ad_image || "",
        hero_image_url: (editingCategory as any).hero_image_url || "", 

        // Legacy Fields
        site_name: editingCategory.site_name || "",
        hero_headline: editingCategory.hero_headline || "",
        hero_pretitle: editingCategory.hero_pretitle || "",
        hero_cta_text: editingCategory.hero_cta_text || "",
        hero_badge_text: editingCategory.hero_badge_text || "",
        analytics_code: editingCategory.analytics_code || "",
        banner_override: editingCategory.banner_override || "",
        footer_site_name: editingCategory.footer_site_name || "",
        footer_copyright_text: editingCategory.footer_copyright_text || "",
        navigation_settings: editingCategory.navigation_settings || { show_top3_dating_apps: true },
      } as any);
      setTopicPrompt(`Vergleich und Ratgeber für ${editingCategory.name}`);
    } else {
      setPageMode("landing");
      form.reset({ 
          name: "", slug: "", theme: "DATING", template: "comparison", is_active: true, 
          faq_data: [], meta_title: "", meta_description: "", sidebar_ad_html: '', sidebar_ad_image: '', hero_image_url: '' 
      } as any);
      setSelectedProjectIds([]);
      setTopicPrompt("");
    }
  }, [editingCategory, form]);

  async function onSubmit(data: CategoryInput) {
    try {
      const now = new Date().toISOString();
      const isInternal = pageMode === "internal";
      const rawData = { ...data } as any;

      delete rawData.faq_section; delete rawData.footer_links; delete rawData.popular_footer_links; delete rawData.legal_links; delete rawData.projects; delete rawData.category_projects; delete rawData.reviews; delete rawData.testimonials;

      const payload = { ...rawData, updated_at: now, is_internal_generated: isInternal };
      
      let catId = editingCategory?.id;
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, ...payload });
        toast({ title: "Gespeichert", description: isInternal ? "Ratgeber aktualisiert." : "Daten gespeichert." });
      } else {
        const result = await createCategory.mutateAsync(payload);
        catId = result.id;
        toast({ title: "Erstellt", description: "Neue Kategorie angelegt." });
      }

      if (catId) {
          await updateCategoryProjects.mutateAsync({ categoryId: catId, projectIds: selectedProjectIds });
      }
      setIsDialogOpen(false);
    } catch (error: any) { 
        toast({ title: "Fehler", description: error.message, variant: "destructive" }); 
    }
  }

  const handleGenerateContent = async () => {
    const catName = form.getValues("name");
    if (!catName) return toast({ title: "Fehler", description: "Name fehlt.", variant: "destructive" });
    const result = await generateCategoryContent(catName, topicPrompt || catName);
    if (result) {
      form.setValue("long_content_top", result.contentTop, { shouldDirty: true });
      form.setValue("long_content_bottom", result.contentBottom, { shouldDirty: true });
      toast({ title: "Generiert", description: "Content eingefügt." });
    }
  };

  const handleAutoFill = () => {
    const kw = form.watch("name");
    if(!kw) return;
    form.setValue("slug", generateSlug(kw), { shouldDirty: true });
    form.setValue("h1_title", kw, { shouldDirty: true });
    form.setValue("meta_title", `${kw} im Vergleich & Test 2026`, { shouldDirty: true });
    form.setValue("meta_description", `Alles über ${kw}. Wir haben die besten Anbieter getestet.`, { shouldDirty: true });
    toast({ title: "SEO Data Auto-Filled" });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: any) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const url = await uploadImageToSupabase(e.target.files[0]);
    if (url) {
        form.setValue(fieldName, url, { shouldDirty: true });
        toast({ title: "Bild hochgeladen", description: "URL wurde eingefügt." });
    }
    setIsUploading(false);
  };

  async function handleDeploy(category: Category) {
    setIsDeploying(category.id);
    const BRIDGE_URL = "https://dating.rank-scout.com/bridge.php"; 
    const API_KEY = "4382180593Rank-Scout"; 
    try {
      let finalHtml = "";
      if (category.custom_html_override && category.custom_html_override.trim() !== "") {
        finalHtml = category.custom_html_override;
      } else {
        const { data: catProjs } = await supabase.from('category_projects').select('project_id, sort_order').eq('category_id', category.id).order('sort_order', { ascending: true });
        let projects: any[] = [];
        if (catProjs && catProjs.length > 0) {
            const ids = catProjs.map(cp => cp.project_id);
            const { data: pData } = await supabase.from('projects').select('*').in('id', ids).eq('is_active', true);
            if (pData) projects = pData.sort((a, b) => (catProjs.find(cp => cp.project_id === a.id)?.sort_order || 0) - (catProjs.find(cp => cp.project_id === b.id)?.sort_order || 0));
        }
        const { data: settingsData } = await supabase.from('settings').select('*');
        const settings: any = {};
        settingsData?.forEach(s => settings[s.key] = s.value);
        let { data: legalLinks } = await supabase.from('footer_links').select('*').eq('category_id', category.id).eq('is_active', true).order('sort_order', { ascending: true });
        if (!legalLinks?.length) { const { data: g } = await supabase.from('footer_links').select('*').is('category_id', null).eq('is_active', true).order('sort_order', { ascending: true }); legalLinks = g || []; }
        let { data: popularLinks } = await supabase.from('popular_footer_links').select('*').eq('category_id', category.id).eq('is_active', true).order('sort_order', { ascending: true });
        if (!popularLinks?.length) { const { data: g } = await supabase.from('popular_footer_links').select('*').is('category_id', null).eq('is_active', true).order('sort_order', { ascending: true }); popularLinks = g || []; }

        const helmetContext = {};
        const Comp = category.template === 'review' ? ReviewTemplate : NewComparisonTemplate;
        const staticHtml = renderToStaticMarkup(
            <HelmetProvider context={helmetContext}>
                <MemoryRouter>
                    <Comp category={category as any} topProject={projects[0] || null} projects={projects} settings={settings} legalLinks={legalLinks || []} popularLinks={popularLinks || []} />
                </MemoryRouter>
            </HelmetProvider>
        );
        finalHtml = `<!DOCTYPE html>${staticHtml}`;
      }
      const response = await fetch(BRIDGE_URL, { method: "POST", headers: { "Content-Type": "application/json", "X-Auth-Token": API_KEY }, body: JSON.stringify({ html: finalHtml, slug: category.slug }) });
      const result = await response.json();
      if (response.ok && result.status === "success") toast({ title: "🚀 Update erfolgreich!", description: `Online: ${result.url}`, className: "bg-green-600 text-white" });
      else throw new Error(result.message || "Fehler");
    } catch (error) { toast({ title: "Deploy Fehler", description: String(error), variant: "destructive" }); } 
    finally { setIsDeploying(null); }
  }

  async function handleDelete(id: string) { if(confirm("Löschen?")) await deleteCategory.mutateAsync(id); }
  async function handleDuplicate(category: Category) { if(confirm("Duplizieren?")) await duplicateCategory.mutateAsync(category); }
  async function handleToggleActive(category: Category) { await updateCategory.mutateAsync({ id: category.id, is_active: !category.is_active }); }
  async function handleMoveOrder(category: Category, direction: "up" | "down") { 
      const idx = categories.findIndex((c) => c.id === category.id); 
      const newIdx = direction === "up" ? idx - 1 : idx + 1; 
      if (newIdx < 0 || newIdx >= categories.length) return; 
      const other = categories[newIdx]; 
      await Promise.all([ updateCategory.mutateAsync({ id: category.id, sort_order: other.sort_order }), updateCategory.mutateAsync({ id: other.id, sort_order: category.sort_order }) ]); 
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold flex items-center gap-2"><LayoutTemplate className="w-6 h-6 text-blue-600" />Kategorien & Seiten</h2><p className="text-muted-foreground">Verwalte Landingpages und Ratgeber.</p></div>
        <Button onClick={() => { setEditingCategory(null); setIsDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" />Neue Seite</Button>
      </div>

      <Card className="border shadow-sm"><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Pos</TableHead><TableHead>Name</TableHead><TableHead>Typ</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aktionen</TableHead></TableRow></TableHeader><TableBody>{categories.map((cat) => (
        <TableRow key={cat.id}>
            <TableCell><div className="flex flex-col gap-1"><button onClick={()=>handleMoveOrder(cat,"up")} className="hover:text-blue-600"><ArrowUp className="w-3 h-3"/></button><button onClick={()=>handleMoveOrder(cat,"down")} className="hover:text-blue-600"><ArrowDown className="w-3 h-3"/></button></div></TableCell>
            <TableCell>
                <div className="font-medium">{cat.name}</div>
                <div className="text-xs text-muted-foreground">/{cat.slug}</div>
            </TableCell>
            <TableCell>
                {(cat as any).is_internal_generated 
                    ? <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800"><Bot className="w-3 h-3 mr-1"/> Ratgeber (AI)</span>
                    : <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"><LayoutTemplate className="w-3 h-3 mr-1"/> Landingpage</span>
                }
            </TableCell>
            <TableCell><Switch checked={cat.is_active} onCheckedChange={()=>handleToggleActive(cat)} /></TableCell>
            <TableCell className="text-right"><div className="flex justify-end gap-1">
                {!(cat as any).is_internal_generated && (
                    <Button size="sm" variant="outline" onClick={()=>handleDeploy(cat)} disabled={isDeploying===cat.id} className="h-8 w-8 p-0 text-blue-600 border-blue-200 hover:bg-blue-50">
                        {isDeploying===cat.id?<Loader2 className="w-4 h-4 animate-spin"/>:<UploadCloud className="w-4 h-4"/>}
                    </Button>
                )}
                <Button variant="ghost" size="sm" onClick={()=>open(cat.slug.startsWith('http') ? cat.slug : `/${cat.slug}`, '_blank')} className="h-8 w-8 p-0"><Eye className="w-4 h-4"/></Button>
                <Button variant="ghost" size="sm" onClick={() => { setEditingCategory(cat); setIsDialogOpen(true); }} className="h-8 w-8 p-0"><Pencil className="w-4 h-4"/></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)} className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4"/></Button>
            </div></TableCell>
        </TableRow>
      ))}</TableBody></Table></CardContent></Card>

      {/* EDIT DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 bg-slate-50/50">
            <DialogHeader className="px-6 py-4 border-b bg-white">
                <div className="flex justify-between items-center">
                    <div>
                        <DialogTitle>{editingCategory ? "Seite bearbeiten" : "Neue Seite erstellen"}</DialogTitle>
                        <DialogDescription>Wähle den Typ und bearbeite Inhalte.</DialogDescription>
                    </div>
                    {/* MODUS SCHALTER */}
                    <div className="flex bg-slate-100 p-1 rounded-lg border">
                        <button onClick={() => setPageMode("landing")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${pageMode === "landing" ? "bg-white shadow text-blue-600" : "text-slate-500 hover:text-slate-700"}`}>
                            Landingpage (Classic)
                        </button>
                        <button onClick={() => setPageMode("internal")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${pageMode === "internal" ? "bg-white shadow text-purple-600" : "text-slate-500 hover:text-slate-700"}`}>
                            <Bot className="w-3 h-3 inline mr-1" /> Ratgeber (AI & Intern)
                        </button>
                    </div>
                </div>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto px-6 py-6">
                {/* ---------- INTERNE RATGEBER ANSICHT ---------- */}
                {pageMode === "internal" ? (
                    <div className="space-y-6 max-w-4xl mx-auto">
                        {/* 1. Header */}
                        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2 text-purple-700"><FileCheck className="w-5 h-5"/> Basis Daten</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Name (H1 Titel)</Label><Input {...register("name")} placeholder="z.B. Krypto Vergleich" /></div>
                                <div className="space-y-2"><Label>Slug</Label><div className="flex gap-2"><Input {...register("slug")} /><Button type="button" variant="outline" onClick={handleAutoFill} size="icon"><Sparkles className="w-4 h-4 text-yellow-500"/></Button></div></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-2"><Label>SEO Titel</Label><Input {...register("meta_title")} /></div>
                                <div className="space-y-2"><Label>SEO Beschreibung</Label><Textarea {...register("meta_description")} rows={2} /></div>
                            </div>
                        </div>

                        {/* 1.5 Hero Design - KYRA ADDED */}
                        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2 text-purple-700"><ImageIcon className="w-5 h-5"/> Hero Design</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <Label>Hintergrundbild URL (Optional)</Label>
                                    <p className="text-xs text-muted-foreground mb-2">Wenn leer, wählt das System automatisch ein passendes Bild (Krypto, Dating, etc.).</p>
                                    <div className="flex gap-2">
                                        <Input {...register("hero_image_url")} placeholder="https://..." />
                                        <div className="relative">
                                            <input type="file" id="upload-hero" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "hero_image_url")} disabled={isUploading} />
                                            <Button type="button" variant="outline" disabled={isUploading} onClick={() => document.getElementById('upload-hero')?.click()}>
                                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin"/> : <UploadCloud className="w-4 h-4"/>}
                                            </Button>
                                        </div>
                                    </div>
                                    {watch("hero_image_url") && <img src={watch("hero_image_url") || ""} alt="Preview" className="mt-2 h-40 w-full object-cover rounded-xl border" />}
                                </div>
                            </div>
                        </div>

                        {/* 2. Content */}
                        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2 text-purple-700"><Bot className="w-5 h-5"/> KI Content</h3>
                            <div className="flex gap-2 bg-purple-50 p-3 rounded-lg">
                                <Input value={topicPrompt} onChange={e=>setTopicPrompt(e.target.value)} placeholder="Thema für KI" className="bg-white" />
                                <Button onClick={handleGenerateContent} disabled={isGenContent} className="bg-purple-600 hover:bg-purple-700 text-white min-w-[120px]">{isGenContent?<Loader2 className="animate-spin"/>:"Generieren"}</Button>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <Label className="text-base font-bold text-slate-700 mb-2 block">Intro Text (Oben)</Label>
                                    <Controller name="long_content_top" control={form.control} render={({ field }) => (<RichTextEditor value={field.value || ''} onChange={field.onChange} />)}/>
                                </div>
                                <div>
                                    <Label className="text-base font-bold text-slate-700 mb-2 block">Haupttext (Unten - Volle Breite)</Label>
                                    <Controller name="long_content_bottom" control={form.control} render={({ field }) => (<RichTextEditor value={field.value || ''} onChange={field.onChange} />)}/>
                                </div>
                            </div>
                        </div>

                        {/* 3. Sidebar Ads (MIT UPLOAD) */}
                        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2 text-purple-700"><Megaphone className="w-5 h-5"/> Sidebar & Werbung</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <Label>Banner HTML Code (Hat Vorrang)</Label>
                                    <Controller name="sidebar_ad_html" control={form.control} render={({ field }) => (<RichTextEditor value={field.value || ''} onChange={field.onChange} />)}/>
                                </div>
                                <div>
                                    <Label>Oder: Banner Bild (Upload)</Label>
                                    <div className="flex gap-2">
                                        <Input {...register("sidebar_ad_image")} placeholder="https://..." />
                                        <div className="relative">
                                            <input type="file" id="upload-ad" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "sidebar_ad_image")} disabled={isUploading} />
                                            <Button type="button" variant="outline" disabled={isUploading} onClick={() => document.getElementById('upload-ad')?.click()}>
                                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin"/> : <UploadCloud className="w-4 h-4"/>}
                                            </Button>
                                        </div>
                                    </div>
                                    {watch("sidebar_ad_image") && <img src={watch("sidebar_ad_image") || ""} alt="Preview" className="mt-2 h-20 w-auto rounded border" />}
                                </div>
                            </div>
                        </div>

                        {/* 4. Projects & FAQ */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl border shadow-sm"><h3 className="font-semibold mb-4">Projekte</h3><ProjectCheckboxList selectedIds={selectedProjectIds} onChange={setSelectedProjectIds} /></div>
                            <div className="bg-white p-6 rounded-xl border shadow-sm"><h3 className="font-semibold mb-4">FAQs</h3><CategoryFAQEditor form={form} /></div>
                        </div>
                    </div>
                ) : (
                    /* ---------- CLASSIC ANSICHT ---------- */
                    <Tabs defaultValue="content" className="w-full">
                        <TabsList className="grid w-full grid-cols-5 mb-6">
                            <TabsTrigger value="basic">Basis</TabsTrigger>
                            <TabsTrigger value="content">Content & Ads</TabsTrigger>
                            <TabsTrigger value="nav">Navi & Footer</TabsTrigger>
                            <TabsTrigger value="projects">Projekte</TabsTrigger>
                            <TabsTrigger value="expert">Expert</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="space-y-4 bg-white p-6 rounded-xl border shadow-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Name</Label><Input {...register("name")} /></div>
                                <div><Label>Slug</Label><Input {...register("slug")} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div><Label>Theme</Label><Select onValueChange={v=>setValue("theme",v as any)} defaultValue={form.getValues("theme")}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="DATING">Dating</SelectItem><SelectItem value="CASINO">Casino</SelectItem><SelectItem value="GENERIC">Generisch</SelectItem></SelectContent></Select></div>
                                <div><Label>Template</Label><Select onValueChange={v=>setValue("template",v as any)} defaultValue={form.getValues("template")}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="comparison">Vergleich</SelectItem><SelectItem value="review">Review</SelectItem></SelectContent></Select></div>
                            </div>
                            <div className="flex items-center gap-2 pt-2"><Switch checked={watch("is_active")} onCheckedChange={c=>setValue("is_active",c)} /><Label>Seite aktiv</Label></div>
                        </TabsContent>

                        <TabsContent value="content" className="space-y-4 bg-white p-6 rounded-xl border shadow-sm">
                            <div><Label>Content Oben</Label><Controller name="long_content_top" control={form.control} render={({ field }) => (<RichTextEditor value={field.value || ''} onChange={field.onChange} />)}/></div>
                            <div><Label>Content Unten</Label><Controller name="long_content_bottom" control={form.control} render={({ field }) => (<RichTextEditor value={field.value || ''} onChange={field.onChange} />)}/></div>
                            
                            {/* AD SECTION (CLASSIC) */}
                            <div className="bg-slate-50 p-4 rounded-lg border my-4">
                                <h4 className="font-bold mb-2">Sidebar Werbung</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Banner HTML</Label>
                                        <Controller name="sidebar_ad_html" control={form.control} render={({ field }) => (<RichTextEditor value={field.value || ''} onChange={field.onChange} />)}/>
                                    </div>
                                    <div>
                                        <Label>Banner Bild</Label>
                                        <div className="flex gap-2">
                                            <Input {...register("sidebar_ad_image")} />
                                            <div className="relative">
                                                <input type="file" id="upload-ad-classic" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                                                <Button type="button" variant="outline" disabled={isUploading} onClick={() => document.getElementById('upload-ad-classic')?.click()}>
                                                    <UploadCloud className="w-4 h-4"/>
                                                </Button>
                                            </div>
                                        </div>
                                        {watch("sidebar_ad_image") && <img src={watch("sidebar_ad_image") || ""} alt="Preview" className="mt-2 h-20 w-auto rounded border" />}
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 border-t"><h4 className="font-bold mb-2">FAQ</h4><CategoryFAQEditor form={form} /></div>
                        </TabsContent>

                        <TabsContent value="nav" className="space-y-4 bg-white p-6 rounded-xl border shadow-sm">
                             <div className="grid grid-cols-2 gap-6">
                                <div><h4 className="font-bold mb-2">Navigation</h4>
                                {["show_top3_dating_apps", "show_singles_in_der_naehe", "show_chat_mit_einer_frau"].map(k => (
                                    <div key={k} className="flex justify-between items-center py-1 border-b"><span className="text-sm">{k}</span><Switch checked={watch(`navigation_settings.${k}` as any)} onCheckedChange={c=>setValue(`navigation_settings.${k}` as any,c)}/></div>
                                ))}</div>
                                <div><h4 className="font-bold mb-2">Footer</h4><CategoryFooterLinksEditor categoryId={editingCategory?.id || null} /><div className="mt-4"><CategoryLegalLinksEditor categoryId={editingCategory?.id || null} /></div></div>
                            </div>
                        </TabsContent>

                        <TabsContent value="projects" className="bg-white p-6 rounded-xl border shadow-sm">
                            <ProjectCheckboxList selectedIds={selectedProjectIds} onChange={setSelectedProjectIds} />
                        </TabsContent>

                        <TabsContent value="expert" className="space-y-4 bg-white p-6 rounded-xl border shadow-sm">
                            <div><Label>Analytics Code</Label><Textarea {...register("analytics_code")} className="font-mono text-xs" /></div>
                            <div><Label>HTML Override</Label><Textarea {...register("custom_html_override")} className="font-mono text-xs" rows={10} /></div>
                        </TabsContent>
                    </Tabs>
                )}
            </div>

            <div className="p-6 border-t bg-white flex justify-between items-center">
                 <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Abbrechen</Button>
                 <Button onClick={handleSubmit(onSubmit)} className={`${pageMode === 'internal' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'} min-w-[150px]`}>
                    <Database className="w-4 h-4 mr-2" /> Speichern {pageMode === 'internal' ? "(Live)" : ""}
                 </Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}