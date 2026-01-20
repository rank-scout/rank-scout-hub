import { useState, useEffect } from "react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useDuplicateCategory, type Category } from "@/hooks/useCategories";
import { useCategoryProjects, useUpdateCategoryProjects } from "@/hooks/useCategoryProjects";
import { useGenerateCityContent } from "@/hooks/useGenerateCityContent";
import { useForm } from "react-hook-form";
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
import { Plus, Pencil, Trash2, Loader2, ArrowUp, ArrowDown, Copy, Download, LayoutTemplate, FileCheck, Sparkles, Wand2, UploadCloud, Clock, Zap, AlertTriangle } from "lucide-react";
import ProjectCheckboxList from "@/components/admin/ProjectCheckboxList";
import CityExportDialog from "@/components/admin/CityExportDialog";
import { CategoryFooterLinksEditor } from "@/components/admin/CategoryFooterLinksEditor";
import { CategoryLegalLinksEditor } from "@/components/admin/CategoryLegalLinksEditor";
import { supabase } from "@/integrations/supabase/client";

// --- NEU: Generator Importe ---
import { renderToStaticMarkup } from "react-dom/server";
import { NewComparisonTemplate } from "@/components/templates/NewComparisonTemplate";
import { ReviewTemplate } from "@/components/templates/ReviewTemplate";

// Helper: Datum formatieren
const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

function generateSlug(name: string): string {
  return name.toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function extractMetaFromHtml(html: string): { title: string | null; metaDescription: string | null; h1Title: string | null } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return {
    title: doc.querySelector('title')?.textContent?.trim() || null,
    metaDescription: doc.querySelector('meta[name="description"]')?.getAttribute('content') || null,
    h1Title: doc.querySelector('h1')?.textContent?.trim() || null,
  };
}

export default function AdminCategories() {
  const { data: categories = [], isLoading } = useCategories(true);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const duplicateCategory = useDuplicateCategory();
  const updateCategoryProjects = useUpdateCategoryProjects();
  const { generateContent } = useGenerateCityContent();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [exportCategory, setExportCategory] = useState<Category | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState<string | null>(null);

  const { data: categoryProjects = [] } = useCategoryProjects(editingCategory?.id);

  useEffect(() => {
    if (categoryProjects.length > 0) {
      const sorted = [...categoryProjects].sort((a, b) => a.sort_order - b.sort_order);
      setSelectedProjectIds(sorted.map((cp) => cp.project_id));
    } else if (!editingCategory) {
      setSelectedProjectIds([]);
    }
  }, [categoryProjects, editingCategory]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { theme: "DATING", template: "comparison", is_active: true, sort_order: 0 },
  });

  const theme = watch("theme");
  const template = watch("template");
  const colorTheme = watch("color_theme");
  const isActive = watch("is_active");
  const nameValue = watch("name");
  const customHtmlOverride = watch("custom_html_override");

  // --- LIVE SEO COUNTER ---
  const currentMetaTitle = watch("meta_title") || "";
  const currentMetaDesc = watch("meta_description") || "";

  // --- ERROR HANDLER ---
  const onInvalid = (errors: any) => {
    console.error("Form Errors:", errors);
    
    const errorMessages = [];
    if (errors.name) errorMessages.push("Name (Grunddaten)");
    if (errors.slug) errorMessages.push("Slug (Grunddaten)");
    if (errors.meta_title) errorMessages.push("Meta Title (SEO)");
    if (errors.meta_description) errorMessages.push("Meta Description (SEO)");
    if (errors.h1_title) errorMessages.push("H1 Titel (SEO)");
    
    const msg = errorMessages.length > 0 
        ? `Fehlende Felder: ${errorMessages.join(", ")}`
        : "Bitte überprüfe alle Tabs auf rote Felder.";

    toast({
      title: "Speichern nicht möglich ❌",
      description: msg,
      variant: "destructive",
      duration: 5000,
    });
  };

  // --- 🧠 INTELLIGENTE AUTO-FILL FUNKTION ---
  const handleAutoFill = () => {
    const kw = (document.getElementById('keyword-input') as HTMLInputElement).value;
    if (!kw) return toast({ title: "Fehler", description: "Bitte Keyword eingeben.", variant: "destructive" });

    // WICHTIG: { shouldValidate: true } entfernt sofort die rote Fehlermeldung
    if (!nameValue) setValue("name", kw, { shouldValidate: true });
    setValue("slug", generateSlug(kw), { shouldValidate: true });

    // SEO / Header Settings
    setValue("site_name", `Vergleich: ${kw}`, { shouldValidate: true });
    setValue("hero_pretitle", "Die besten Anbieter für", { shouldValidate: true });
    setValue("hero_headline", kw, { shouldValidate: true });
    setValue("description", `Du suchst nach ${kw}? Wir haben die besten Plattformen getestet. Erfahre hier, wo sich eine Anmeldung wirklich lohnt.`, { shouldValidate: true });
    setValue("hero_cta_text", "Jetzt vergleichen", { shouldValidate: true });
    setValue("hero_badge_text", "Geprüft & Seriös 2026", { shouldValidate: true });

    // Meta Settings
    setValue("h1_title", `${kw} im großen Vergleich`, { shouldValidate: true });
    setValue("meta_title", `${kw} 2026: Die besten Anbieter im Test & Vergleich`, { shouldValidate: true });
    setValue("meta_description", `Unser großer Testbericht für ${kw} 2026. Wir haben Preise, Mitgliederzahlen und Erfolgschancen verglichen. Hier sind die aktuellen Testsieger.`, { shouldValidate: true });

    toast({ title: "✨ Alles ausgefüllt!", className: "bg-blue-600 text-white" });
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
        if (!legalLinks || legalLinks.length === 0) {
             const { data: globalLegal } = await supabase.from('footer_links').select('*').is('category_id', null).eq('is_active', true).order('sort_order', { ascending: true });
             legalLinks = globalLegal || [];
        }

        let { data: popularLinks } = await supabase.from('popular_footer_links').select('*').eq('category_id', category.id).eq('is_active', true).order('sort_order', { ascending: true });
        if (!popularLinks || popularLinks.length === 0) {
             const { data: globalPop } = await supabase.from('popular_footer_links').select('*').is('category_id', null).eq('is_active', true).order('sort_order', { ascending: true });
             popularLinks = globalPop || [];
        }

        let staticHtml = "";
        if (category.template === 'review') {
            staticHtml = renderToStaticMarkup(<ReviewTemplate category={category as any} topProject={projects[0] || null} settings={settings} legalLinks={legalLinks || []} popularLinks={popularLinks || []} />);
        } else {
            staticHtml = renderToStaticMarkup(<NewComparisonTemplate category={category as any} projects={projects} settings={settings} legalLinks={legalLinks || []} popularLinks={popularLinks || []} />);
        }
        finalHtml = `<!DOCTYPE html>${staticHtml}`;
      }

      const response = await fetch(BRIDGE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": API_KEY },
        body: JSON.stringify({ html: finalHtml, slug: category.slug })
      });
      const result = await response.json();
      if (response.ok && result.status === "success") {
        toast({ title: "🚀 Update erfolgreich!", description: `Online: ${result.url}`, className: "bg-green-600 text-white border-green-700" });
      } else { throw new Error(result.message || "Fehler"); }
    } catch (error) { toast({ title: "Deploy Fehler", description: String(error), variant: "destructive" }); } 
    finally { setIsDeploying(null); }
  }

  function handleExtractFromHtml() {
    const html = customHtmlOverride;
    if (!html?.trim()) return toast({ title: "Kein HTML", variant: "destructive" });
    const extracted = extractMetaFromHtml(html);
    if (extracted.title) setValue("meta_title", extracted.title, { shouldValidate: true });
    if (extracted.metaDescription) setValue("meta_description", extracted.metaDescription, { shouldValidate: true });
    if (extracted.h1Title) setValue("h1_title", extracted.h1Title, { shouldValidate: true });
    toast({ title: "Extrahiert!" });
  }

  useEffect(() => { if (!editingCategory && nameValue) setValue("slug", generateSlug(nameValue)); }, [nameValue, editingCategory, setValue]);

  function openCreateDialog() {
    setEditingCategory(null); setSelectedProjectIds([]);
    reset({
      slug: "", name: "", description: "", icon: "📍", theme: "DATING", template: "comparison", color_theme: "dark", site_name: "", hero_headline: "", hero_pretitle: "Finde Singles in", hero_cta_text: "", hero_badge_text: "", meta_title: "", meta_description: "", h1_title: "", long_content_top: "", long_content_bottom: "", analytics_code: "", banner_override: "", custom_html_override: "", footer_site_name: "", footer_copyright_text: "", footer_designer_name: "Digital-Perfect", footer_designer_url: "https://digital-perfect.at",
      navigation_settings: { show_top3_dating_apps: true, show_singles_in_der_naehe: true, show_chat_mit_einer_frau: true, show_online_dating_cafe: true, show_bildkontakte_login: true, show_18plus_hint_box: true, }, is_active: true, sort_order: categories.length,
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category);
    reset({
      slug: category.slug, name: category.name, description: category.description || "", icon: category.icon || "📍", theme: category.theme, template: category.template || "comparison", color_theme: category.color_theme || "dark", site_name: category.site_name || "", hero_headline: category.hero_headline || "", hero_pretitle: category.hero_pretitle || "", hero_cta_text: category.hero_cta_text || "", hero_badge_text: category.hero_badge_text || "", meta_title: category.meta_title || "", meta_description: category.meta_description || "", h1_title: category.h1_title || "", long_content_top: category.long_content_top || "", long_content_bottom: category.long_content_bottom || "", analytics_code: category.analytics_code || "", banner_override: category.banner_override || "", custom_html_override: category.custom_html_override || "", footer_site_name: category.footer_site_name || "", footer_copyright_text: category.footer_copyright_text || "", footer_designer_name: category.footer_designer_name || "", footer_designer_url: category.footer_designer_url || "",
      navigation_settings: category.navigation_settings || { show_top3_dating_apps: true }, is_active: category.is_active, sort_order: category.sort_order,
    });
    setIsDialogOpen(true);
  }

  async function onSubmit(data: CategoryInput) {
    try {
      const now = new Date().toISOString();
      let categoryForDeploy: Category;
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, input: { ...data, updated_at: now } as any });
        categoryForDeploy = { ...editingCategory, ...data, updated_at: now } as Category;
        toast({ title: "Gespeichert... Starte Deployment 🚀" });
      } else {
        const result = await createCategory.mutateAsync(data);
        categoryForDeploy = { id: result.id, created_at: now, updated_at: now, user_id: 'system', ...data } as Category;
        toast({ title: "Erstellt... Starte Deployment 🚀" });
      }
      await updateCategoryProjects.mutateAsync({ categoryId: categoryForDeploy.id, projectIds: selectedProjectIds });
      await handleDeploy(categoryForDeploy);
      setIsDialogOpen(false);
    } catch (error) { toast({ title: "Fehler", description: String(error), variant: "destructive" }); }
  }

  async function handleDelete(id: string) { if (!confirm("Löschen?")) return; try { await deleteCategory.mutateAsync(id); toast({ title: "Gelöscht" }); } catch { toast({ title: "Fehler", variant: "destructive" }); } }
  async function handleDuplicate(category: Category) { try { await duplicateCategory.mutateAsync(category); toast({ title: "Dupliziert" }); } catch { toast({ title: "Fehler", variant: "destructive" }); } }
  async function handleToggleActive(category: Category) { try { await updateCategory.mutateAsync({ id: category.id, input: { is_active: !category.is_active } }); } catch { toast({ title: "Fehler", variant: "destructive" }); } }
  async function handleMoveOrder(category: Category, direction: "up" | "down") { const currentIndex = categories.findIndex((c) => c.id === category.id); const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1; if (newIndex < 0 || newIndex >= categories.length) return; const otherCategory = categories[newIndex]; try { await Promise.all([ updateCategory.mutateAsync({ id: category.id, input: { sort_order: otherCategory.sort_order } }), updateCategory.mutateAsync({ id: otherCategory.id, input: { sort_order: category.sort_order } }), ]); } catch { toast({ title: "Fehler", variant: "destructive" }); } }
  function handleExport(category: Category) { setExportCategory(category); setIsExportOpen(true); }

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="font-display text-2xl font-bold flex items-center gap-2"><LayoutTemplate className="w-6 h-6 text-primary" />Landingpages</h2><p className="text-muted-foreground">Verwalte deine Affiliate-Landingpages.</p></div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button onClick={openCreateDialog} className="gap-2"><Plus className="w-4 h-4" />Neue Landingpage</Button></DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>{editingCategory ? "Bearbeiten" : "Neu anlegen"}</DialogTitle>
                <DialogDescription>Erstelle oder bearbeite eine Landingpage für das Portal.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
              <Tabs defaultValue="seo" className="w-full">
                <TabsList className="grid w-full grid-cols-8"><TabsTrigger value="basic">Grunddaten</TabsTrigger><TabsTrigger value="seo">SEO & AI</TabsTrigger><TabsTrigger value="content">Content</TabsTrigger><TabsTrigger value="navigation">Navi</TabsTrigger><TabsTrigger value="footer">Footer</TabsTrigger><TabsTrigger value="projects">Apps</TabsTrigger><TabsTrigger value="tracking">Tracking</TabsTrigger><TabsTrigger value="override"><Wand2 className="w-3 h-3" /></TabsTrigger></TabsList>
                
                <TabsContent value="seo" className="space-y-4 pt-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
                    <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Turbo-Generator</h4>
                    <p className="text-sm text-blue-700 mb-4">Gib dein Keyword ein und wir füllen ALLE Felder automatisch aus.</p>
                    <div className="flex gap-3">
                        <Input id="keyword-input" placeholder="z.B. Singles ab 50" className="flex-1 bg-white text-black" defaultValue={nameValue || ""} />
                        <Button type="button" onClick={handleAutoFill} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md font-bold">✨ Alles ausfüllen</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Seitenname Header</Label><Input {...register("site_name")} className={errors.site_name ? "border-red-500" : ""} /></div>
                    <div><Label>Hero Pretitle</Label><Input {...register("hero_pretitle")} className={errors.hero_pretitle ? "border-red-500" : ""} /></div>
                  </div>
                  <div><Label>Hero Headline</Label><Input {...register("hero_headline")} className={errors.hero_headline ? "border-red-500" : ""} /></div>
                  <div><Label>Hero Beschreibung</Label><Textarea {...register("description")} rows={2} className={errors.description ? "border-red-500" : ""} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>CTA Text</Label><Input {...register("hero_cta_text")} className={errors.hero_cta_text ? "border-red-500" : ""} /></div>
                    <div><Label>Badge Text</Label><Input {...register("hero_badge_text")} className={errors.hero_badge_text ? "border-red-500" : ""} /></div>
                  </div>
                  <div><Label>H1 Titel <span className="text-red-500">*</span></Label><Input {...register("h1_title")} className={errors.h1_title ? "border-red-500" : ""} /></div>
                  
                  {/* META TITLE MIT COUNTER */}
                  <div>
                    <Label>Meta Title <span className="text-red-500">*</span></Label>
                    <Input {...register("meta_title")} className={errors.meta_title ? "border-red-500" : ""} />
                    <div className="flex justify-between text-xs mt-1">
                        <span className="text-muted-foreground">SEO-Empfehlung: max. 60 Zeichen</span>
                        <span className={currentMetaTitle.length > 60 ? "text-red-500 font-bold" : "text-green-600"}>
                            {currentMetaTitle.length} / 60
                        </span>
                    </div>
                  </div>

                  {/* META DESCRIPTION MIT COUNTER */}
                  <div>
                    <Label>Meta Description <span className="text-red-500">*</span></Label>
                    <Textarea {...register("meta_description")} className={errors.meta_description ? "border-red-500" : ""} />
                    <div className="flex justify-between text-xs mt-1">
                        <span className="text-muted-foreground">SEO-Empfehlung: max. 155 Zeichen</span>
                        <span className={currentMetaDesc.length > 155 ? "text-orange-500 font-bold" : "text-green-600"}>
                            {currentMetaDesc.length} / 155
                        </span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="basic" className="space-y-4 pt-4">
                  <div className="grid grid-cols-4 gap-4"><div className="col-span-1"><Label>Icon</Label><Input {...register("icon")} className="text-center text-2xl" /></div><div className="col-span-3"><Label>Interner Name <span className="text-red-500">*</span></Label><Input {...register("name")} className={errors.name ? "border-red-500" : ""} /></div></div>
                  <div><Label>Slug <span className="text-red-500">*</span></Label><Input {...register("slug")} className={errors.slug ? "border-red-500" : ""} /></div>
                  <div className="grid grid-cols-2 gap-4"><div><Label>Theme</Label><Select value={theme} onValueChange={v=>setValue("theme",v as any)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="DATING">Dating</SelectItem><SelectItem value="GENERIC">Generisch</SelectItem><SelectItem value="CASINO">Casino</SelectItem><SelectItem value="ADULT">Adult</SelectItem></SelectContent></Select></div><div><Label>Template</Label><Select value={template} onValueChange={v=>setValue("template",v as any)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="comparison">Vergleich (Neu)</SelectItem><SelectItem value="review">Review</SelectItem></SelectContent></Select></div></div>
                  <div className="flex items-center justify-between pt-6"><Label>Aktiv</Label><Switch checked={isActive} onCheckedChange={c=>setValue("is_active",c)} /></div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4 pt-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-4 items-end">
                    <div className="flex-1"><Label className="text-orange-900">Keyword (für AI)</Label><Input id="ck" defaultValue={nameValue||"Dating"} className="bg-white text-black font-medium" /></div>
                    <div className="flex-1"><Label className="text-orange-900">Ort/Thema</Label><Input id="cl" defaultValue={nameValue||""} className="bg-white text-black font-medium" /></div>
                    <Button type="button" onClick={async()=>{ const k=(document.getElementById('ck')as any).value;const l=(document.getElementById('cl')as any).value;if(l){
                        toast({title:"🤖 Generiere 5.000 Wörter...", description:"Bitte warten, das kann 30-60 Sekunden dauern."});
                        const r=await generateContent(l,k,5000);
                        if(r){
                            setValue("long_content_top",r.contentTop, { shouldValidate: true });
                            setValue("long_content_bottom",r.contentBottom, { shouldValidate: true });
                            toast({title:"✅ Content erfolgreich erstellt!", description:"5.000 Wörter wurden eingefügt.", className:"bg-green-600 text-white"});
                        }
                    } }} className="bg-orange-600 hover:bg-orange-700 text-white font-bold"><Sparkles className="w-4 h-4 mr-2"/>Text (5k)</Button>
                  </div>
                  <div><Label>Content Oben</Label><Textarea {...register("long_content_top")} rows={8} className="font-mono text-sm" /></div>
                  <div><Label>Content Unten (mit FAQ)</Label><Textarea {...register("long_content_bottom")} rows={8} className="font-mono text-sm" /></div>
                  <div><Label>Banner Override</Label><Textarea {...register("banner_override")} rows={4} className="font-mono text-sm" /></div>
                </TabsContent>

                <TabsContent value="navigation" className="space-y-4 pt-4"><div className="space-y-3 border rounded-lg p-4">{["show_top3_dating_apps", "show_singles_in_der_naehe", "show_chat_mit_einer_frau", "show_online_dating_cafe", "show_bildkontakte_login", "show_18plus_hint_box"].map(k => (<div key={k} className="flex items-center justify-between py-2 border-b"><Label>{k}</Label><Switch checked={watch(`navigation_settings.${k}` as any)??true} onCheckedChange={c=>setValue(`navigation_settings.${k}` as any,c)}/></div>))}</div></TabsContent>
                <TabsContent value="footer" className="space-y-4 pt-4"><div className="grid grid-cols-2 gap-4"><div><Label>Footer Logo</Label><Input {...register("footer_site_name")} /></div><div><Label>Copyright</Label><Input {...register("footer_copyright_text")} /></div></div><CategoryFooterLinksEditor categoryId={editingCategory?.id || null} /><CategoryLegalLinksEditor categoryId={editingCategory?.id || null} /></TabsContent>
                <TabsContent value="projects" className="space-y-4 pt-4"><ProjectCheckboxList selectedIds={selectedProjectIds} onChange={setSelectedProjectIds} /></TabsContent>
                <TabsContent value="tracking" className="space-y-4 pt-4"><Label>Analytics Code</Label><Textarea {...register("analytics_code")} rows={10} /></TabsContent>
                <TabsContent value="override" className="space-y-4 pt-4"><div className="flex justify-between mb-2"><Label>HTML Override</Label><Button type="button" size="sm" variant="outline" onClick={handleExtractFromHtml}>Extrahieren</Button></div><Textarea {...register("custom_html_override")} rows={20} /></TabsContent>
              </Tabs>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 text-lg" disabled={isDeploying===editingCategory?.id}>{isDeploying ? <Loader2 className="animate-spin" /> : (editingCategory ? "Speichern & Deployen" : "Seite Erstellen")}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="bg-card border-border"><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Pos</TableHead><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead>Update</TableHead><TableHead>Aktiv</TableHead><TableHead className="text-right">Aktionen</TableHead></TableRow></TableHeader><TableBody>{categories.map((cat, idx) => (<TableRow key={cat.id}><TableCell><div className="flex flex-col gap-1"><button onClick={()=>handleMoveOrder(cat,"up")}><ArrowUp className="w-3 h-3"/></button><button onClick={()=>handleMoveOrder(cat,"down")}><ArrowDown className="w-3 h-3"/></button></div></TableCell><TableCell><div className="font-medium">{cat.name}</div></TableCell><TableCell><code className="text-xs bg-muted px-2 py-1 rounded">/{cat.slug}</code></TableCell><TableCell>{formatDate(cat.updated_at)}</TableCell><TableCell><Switch checked={cat.is_active} onCheckedChange={()=>handleToggleActive(cat)} /></TableCell><TableCell className="text-right"><div className="flex justify-end gap-1"><Button size="sm" onClick={()=>handleDeploy(cat)} disabled={isDeploying===cat.id} className="bg-green-600 hover:bg-green-700 text-white gap-2 mr-2">{isDeploying===cat.id?<Loader2 className="w-4 h-4 animate-spin"/>:<UploadCloud className="w-4 h-4"/>}{isDeploying===cat.id?"...":"Live"}</Button><Button variant="ghost" size="icon" onClick={()=>openEditDialog(cat)}><Pencil className="w-4 h-4"/></Button><Button variant="ghost" size="icon" onClick={()=>handleDelete(cat.id)}><Trash2 className="w-4 h-4"/></Button></div></TableCell></TableRow>))}</TableBody></Table></CardContent></Card><CityExportDialog open={isExportOpen} onOpenChange={setIsExportOpen} category={exportCategory} />
    </div>
  );
}