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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, ArrowUp, ArrowDown, Copy, FileText, Download, LayoutTemplate, Code, Flag, FileCheck, Sparkles, Palette, Wand2, AlertTriangle, UploadCloud, Globe } from "lucide-react";
import ProjectCheckboxList from "@/components/admin/ProjectCheckboxList";
import CityExportDialog from "@/components/admin/CityExportDialog";
import { CategoryFooterLinksEditor } from "@/components/admin/CategoryFooterLinksEditor";
import { CategoryLegalLinksEditor } from "@/components/admin/CategoryLegalLinksEditor";
import { supabase } from "@/integrations/supabase/client";

// --- 🔥 SAUBERE STRUKTUR: IMPORTS DER TEMPLATES ---
// Das '?raw' lädt den Inhalt der HTML-Dateien als Text-String
import comparisonTemplate from "@/templates/comparison.html?raw";
import reviewTemplate from "@/templates/review.html?raw";

// Helper to generate slug from page name
function generateSlug(name: string): string {
  return name.toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Helper to extract SEO data from HTML
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
  const { generateContent, isGenerating } = useGenerateCityContent();
  
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
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      theme: "DATING",
      template: "comparison",
      is_active: true,
      sort_order: 0,
    },
  });

  const theme = watch("theme");
  const template = watch("template");
  const colorTheme = watch("color_theme");
  const isActive = watch("is_active");
  const nameValue = watch("name");
  const customHtmlOverride = watch("custom_html_override");

  // --- DEPLOYMENT LOGIC ---
  async function handleDeploy(category: Category) {
    setIsDeploying(category.id);
    
    // ⚠️ HIER DEIN ECHTES BRIDGE-PASSWORT REIN:
    const BRIDGE_URL = "https://dating.rank-scout.com/bridge.php"; 
    const API_KEY = "4382180593Rank-Scout"; 

    try {
      let htmlContent = "";

      // 1. Manuelles Override (hat immer Vorrang)
      if (category.custom_html_override && category.custom_html_override.trim() !== "") {
        htmlContent = category.custom_html_override;
      } 
      // 2. Seitentyp: Erfahrungsbericht (Laden aus src/templates/review.html)
      else if (category.template === 'review') {
        htmlContent = reviewTemplate;
      }
      // 3. Seitentyp: Vergleichstabelle (Laden aus src/templates/comparison.html)
      else {
        htmlContent = comparisonTemplate; // Default Fallback
      }

      // Senden an die Bridge
      const response = await fetch(BRIDGE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": API_KEY },
        body: JSON.stringify({
          html: htmlContent,
          slug: category.slug
        })
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        toast({
          title: "🚀 Update erfolgreich!",
          description: `Online: ${result.url}`,
          className: "bg-green-600 text-white border-green-700"
        });
      } else {
        throw new Error(result.message || "Fehler");
      }

    } catch (error) {
      console.error(error);
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive"
      });
    } finally {
      setIsDeploying(null);
    }
  }

  // --- RESTLICHE FUNKTIONEN (unverändert) ---
  function handleExtractFromHtml() {
    const html = customHtmlOverride;
    if (!html || html.trim() === "") {
      toast({ title: "Kein HTML", description: "Füge HTML ein.", variant: "destructive" });
      return;
    }
    const extracted = extractMetaFromHtml(html);
    if (extracted.title) setValue("meta_title", extracted.title);
    if (extracted.metaDescription) setValue("meta_description", extracted.metaDescription);
    if (extracted.h1Title) setValue("h1_title", extracted.h1Title);
    toast({ title: "Extrahiert!" });
  }

  useEffect(() => {
    if (!editingCategory && nameValue) {
      setValue("slug", generateSlug(nameValue));
    }
  }, [nameValue, editingCategory, setValue]);

  function openCreateDialog() {
    setEditingCategory(null);
    setSelectedProjectIds([]);
    reset({
      slug: "",
      name: "",
      description: "",
      icon: "📍",
      theme: "DATING",
      template: "comparison",
      color_theme: "dark",
      site_name: "",
      hero_headline: "",
      hero_pretitle: "Finde Singles in",
      hero_cta_text: "",
      hero_badge_text: "",
      meta_title: "",
      meta_description: "",
      h1_title: "",
      long_content_top: "",
      long_content_bottom: "",
      analytics_code: "",
      banner_override: "",
      custom_html_override: "",
      footer_site_name: "",
      footer_copyright_text: "",
      footer_designer_name: "Digital-Perfect",
      footer_designer_url: "https://digital-perfect.at",
      navigation_settings: {
        show_top3_dating_apps: true,
        show_singles_in_der_naehe: true,
        show_chat_mit_einer_frau: true,
        show_online_dating_cafe: true,
        show_bildkontakte_login: true,
        show_18plus_hint_box: true,
      },
      is_active: true,
      sort_order: categories.length,
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category);
    const defaultNavSettings = {
      show_top3_dating_apps: true,
      show_singles_in_der_naehe: true,
      show_chat_mit_einer_frau: true,
      show_online_dating_cafe: true,
      show_bildkontakte_login: true,
      show_18plus_hint_box: true,
    };
    reset({
      slug: category.slug,
      name: category.name,
      description: category.description || "",
      icon: category.icon || "📍",
      theme: category.theme,
      template: category.template || "comparison",
      color_theme: category.color_theme || "dark",
      site_name: category.site_name || "",
      hero_headline: category.hero_headline || "",
      hero_pretitle: category.hero_pretitle || "Finde Singles in",
      hero_cta_text: category.hero_cta_text || "",
      hero_badge_text: category.hero_badge_text || "",
      meta_title: category.meta_title || "",
      meta_description: category.meta_description || "",
      h1_title: category.h1_title || "",
      long_content_top: category.long_content_top || "",
      long_content_bottom: category.long_content_bottom || "",
      analytics_code: category.analytics_code || "",
      banner_override: category.banner_override || "",
      custom_html_override: category.custom_html_override || "",
      footer_site_name: category.footer_site_name || "",
      footer_copyright_text: category.footer_copyright_text || "",
      footer_designer_name: category.footer_designer_name || "Digital-Perfect",
      footer_designer_url: category.footer_designer_url || "https://digital-perfect.at",
      navigation_settings: category.navigation_settings || defaultNavSettings,
      is_active: category.is_active,
      sort_order: category.sort_order,
    });
    setIsDialogOpen(true);
  }

  async function onSubmit(data: CategoryInput) {
    try {
      let categoryId: string;
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, input: data });
        categoryId = editingCategory.id;
        toast({ title: "Landingpage aktualisiert" });
      } else {
        const result = await createCategory.mutateAsync(data);
        categoryId = result.id;
        toast({ title: "Landingpage erstellt" });
      }
      await updateCategoryProjects.mutateAsync({
        categoryId,
        projectIds: selectedProjectIds,
      });
      setIsDialogOpen(false);
    } catch (error) {
      toast({ title: "Fehler", description: error instanceof Error ? error.message : "Fehler", variant: "destructive" });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Löschen?")) return;
    try { await deleteCategory.mutateAsync(id); toast({ title: "Gelöscht" }); } catch (error) { toast({ title: "Fehler", variant: "destructive" }); }
  }

  async function handleDuplicate(category: Category) {
    try { await duplicateCategory.mutateAsync(category); toast({ title: "Dupliziert" }); } catch (error) { toast({ title: "Fehler", variant: "destructive" }); }
  }

  async function handleToggleActive(category: Category) {
    try { await updateCategory.mutateAsync({ id: category.id, input: { is_active: !category.is_active } }); } catch (error) { toast({ title: "Fehler", variant: "destructive" }); }
  }

  async function handleMoveOrder(category: Category, direction: "up" | "down") {
    const currentIndex = categories.findIndex((c) => c.id === category.id);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;
    const otherCategory = categories[newIndex];
    try {
      await Promise.all([
        updateCategory.mutateAsync({ id: category.id, input: { sort_order: otherCategory.sort_order } }),
        updateCategory.mutateAsync({ id: otherCategory.id, input: { sort_order: category.sort_order } }),
      ]);
    } catch (error) { toast({ title: "Fehler", variant: "destructive" }); }
  }

  function handleExport(category: Category) {
    setExportCategory(category);
    setIsExportOpen(true);
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2"><LayoutTemplate className="w-6 h-6 text-primary" />Landingpages</h2>
          <p className="text-muted-foreground">Verwalte deine Affiliate-Landingpages.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button onClick={openCreateDialog} className="gap-2"><Plus className="w-4 h-4" />Neue Landingpage</Button></DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display flex items-center gap-2"><LayoutTemplate className="w-5 h-5" />{editingCategory ? "Landingpage bearbeiten" : "Neue Landingpage anlegen"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-8">
                  <TabsTrigger value="basic">Grunddaten</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="navigation">Navigation</TabsTrigger>
                  <TabsTrigger value="footer">Footer</TabsTrigger>
                  <TabsTrigger value="projects">Apps</TabsTrigger>
                  <TabsTrigger value="tracking">Tracking</TabsTrigger>
                  <TabsTrigger value="override" className="flex items-center gap-1"><Wand2 className="w-3 h-3" />Override</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 pt-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1"><Label htmlFor="icon">Icon</Label><Input id="icon" {...register("icon")} className="text-center text-2xl" placeholder="📍" /></div>
                    <div className="col-span-3"><Label htmlFor="name">Seitenname (intern)</Label><Input id="name" {...register("name")} placeholder="z.B. Salzburg" /><p className="text-xs text-muted-foreground mt-1">Slug wird automatisch generiert.</p></div>
                  </div>
                  <div><Label htmlFor="slug">Slug (URL-Pfad)</Label><Input id="slug" {...register("slug")} placeholder="singles-salzburg" /></div>
                  <div><Label htmlFor="description">Kurzbeschreibung</Label><Textarea id="description" {...register("description")} placeholder="Beschreibung..." rows={2} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label htmlFor="theme">Branchen-Theme</Label><Select value={theme} onValueChange={(v) => setValue("theme", v as any)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="DATING">💕 Dating</SelectItem><SelectItem value="GENERIC">📊 Generisch</SelectItem><SelectItem value="CASINO">🎰 Casino</SelectItem><SelectItem value="ADULT">🔞 Adult</SelectItem></SelectContent></Select></div>
                    <div><Label htmlFor="template">Seitentyp</Label><Select value={template} onValueChange={(v) => setValue("template", v as any)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="comparison"><div className="flex items-center gap-2"><LayoutTemplate className="w-4 h-4" /><span>Vergleichstabelle</span></div></SelectItem><SelectItem value="review"><div className="flex items-center gap-2"><FileCheck className="w-4 h-4" /><span>Erfahrungsbericht</span></div></SelectItem></SelectContent></Select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label htmlFor="color_theme">Farbmodus</Label><Select value={colorTheme} onValueChange={(v) => setValue("color_theme", v as any)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dark">Dark Mode</SelectItem><SelectItem value="light">Light Mode</SelectItem><SelectItem value="neon">Neon Mode</SelectItem></SelectContent></Select></div>
                    <div className="flex items-center justify-between pt-6"><Label htmlFor="is_active">Aktiv</Label><Switch id="is_active" checked={isActive} onCheckedChange={(checked) => setValue("is_active", checked)} /></div>
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4 pt-4">
                  <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4">
                    <div className="flex flex-col gap-3">
                      <h4 className="font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4" />KI-Generator</h4>
                      <div className="flex gap-2">
                        <Input id="keyword-input" placeholder="Keyword (z.B. LGBTQ Dating)" className="flex-1" defaultValue={nameValue || ""} />
                        <Button type="button" variant="outline" onClick={() => { const kw = (document.getElementById('keyword-input') as HTMLInputElement).value; if(kw){ setValue("site_name", kw+"AT"); setValue("hero_pretitle","Finde Singles in"); setValue("hero_headline", `Lerne ${kw} Singles kennen`); setValue("meta_title", `Singles ${kw} 2026`); setValue("h1_title", `Singles ${kw}`); toast({title:"Generiert!"}); } }}>Alles generieren</Button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label htmlFor="site_name">Seitenname Header</Label><Input id="site_name" {...register("site_name")} /></div>
                    <div><Label htmlFor="hero_pretitle">Hero Pretitle</Label><Input id="hero_pretitle" {...register("hero_pretitle")} /></div>
                  </div>
                  <div><Label htmlFor="hero_headline">Hero Headline</Label><Input id="hero_headline" {...register("hero_headline")} /></div>
                  <div><Label htmlFor="description">Hero Beschreibung</Label><Textarea id="description" {...register("description")} rows={2} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label htmlFor="hero_cta_text">CTA Text</Label><Input id="hero_cta_text" {...register("hero_cta_text")} /></div>
                    <div><Label htmlFor="hero_badge_text">Badge Text</Label><Input id="hero_badge_text" {...register("hero_badge_text")} /></div>
                  </div>
                  <div><Label htmlFor="h1_title">H1 Titel</Label><Input id="h1_title" {...register("h1_title")} /></div>
                  <div><Label htmlFor="meta_title">Meta Title</Label><Input id="meta_title" {...register("meta_title")} /></div>
                  <div><Label htmlFor="meta_description">Meta Description</Label><Textarea id="meta_description" {...register("meta_description")} /></div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4 pt-4">
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex gap-4 items-end">
                    <div className="flex-1"><Label>Keyword</Label><Input id="ck" defaultValue={nameValue||"Dating"} /></div>
                    <div className="flex-1"><Label>Ort</Label><Input id="cl" defaultValue={nameValue||""} /></div>
                    <Button type="button" onClick={async()=>{ const k=(document.getElementById('ck')as any).value; const l=(document.getElementById('cl')as any).value; if(l){ toast({title:"Generiere..."}); const r=await generateContent(l,k,1000); if(r){setValue("long_content_top",r.contentTop); setValue("long_content_bottom",r.contentBottom); toast({title:"Fertig"});} } }}><Sparkles className="w-4 h-4 mr-2"/>Text</Button>
                  </div>
                  <div><Label>Content oben (HTML)</Label><Textarea {...register("long_content_top")} rows={8} className="font-mono text-sm" /></div>
                  <div><Label>Content unten (HTML)</Label><Textarea {...register("long_content_bottom")} rows={8} className="font-mono text-sm" /></div>
                  <div><Label>Banner Override</Label><Textarea {...register("banner_override")} rows={4} className="font-mono text-sm" /></div>
                </TabsContent>

                <TabsContent value="navigation" className="space-y-4 pt-4">
                  <div className="space-y-3 border rounded-lg p-4">
                    {["show_top3_dating_apps", "show_singles_in_der_naehe", "show_chat_mit_einer_frau", "show_online_dating_cafe", "show_bildkontakte_login", "show_18plus_hint_box"].map(k => (
                      <div key={k} className="flex items-center justify-between py-2 border-b"><Label>{k.replace(/_/g,' ')}</Label><Switch checked={watch(`navigation_settings.${k}` as any)??true} onCheckedChange={c=>setValue(`navigation_settings.${k}` as any,c)}/></div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="footer" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Footer Logo</Label><Input {...register("footer_site_name")} /></div>
                    <div><Label>Copyright</Label><Input {...register("footer_copyright_text")} /></div>
                  </div>
                  <CategoryFooterLinksEditor categoryId={editingCategory?.id || null} />
                  <CategoryLegalLinksEditor categoryId={editingCategory?.id || null} />
                </TabsContent>

                <TabsContent value="projects" className="space-y-4 pt-4">
                  <ProjectCheckboxList selectedIds={selectedProjectIds} onChange={setSelectedProjectIds} />
                </TabsContent>

                <TabsContent value="tracking" className="space-y-4 pt-4">
                  <Label>Analytics Code</Label><Textarea {...register("analytics_code")} rows={10} className="font-mono text-sm" />
                </TabsContent>

                <TabsContent value="override" className="space-y-4 pt-4">
                  <div className="flex justify-between mb-2"><Label>HTML Override</Label><Button type="button" size="sm" variant="outline" onClick={handleExtractFromHtml}>Extrahieren</Button></div>
                  <Textarea {...register("custom_html_override")} rows={20} className="font-mono text-sm" />
                </TabsContent>
              </Tabs>
              <Button type="submit" className="w-full" disabled={createCategory.isPending || updateCategory.isPending}>{editingCategory ? "Speichern" : "Erstellen"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Ord.</TableHead><TableHead>Seite</TableHead><TableHead>Typ</TableHead><TableHead>Slug</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aktionen</TableHead></TableRow></TableHeader>
            <TableBody>
              {categories.map((cat, idx) => (
                <TableRow key={cat.id}>
                  <TableCell><div className="flex flex-col gap-1"><button onClick={()=>handleMoveOrder(cat,"up")} disabled={idx===0}><ArrowUp className="w-3 h-3"/></button><button onClick={()=>handleMoveOrder(cat,"down")} disabled={idx===categories.length-1}><ArrowDown className="w-3 h-3"/></button></div></TableCell>
                  <TableCell><div className="flex gap-3"><span className="text-xl">{cat.icon}</span><div><div className="font-medium">{cat.name}</div><div className="text-xs text-muted-foreground">{cat.theme}</div></div></div></TableCell>
                  <TableCell>{cat.template==='review'?<span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">Review</span>:<span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Vergleich</span>}</TableCell>
                  <TableCell><code className="text-xs bg-muted px-2 py-1 rounded">/{cat.slug}</code></TableCell>
                  <TableCell><Switch checked={cat.is_active} onCheckedChange={()=>handleToggleActive(cat)} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" onClick={()=>handleDeploy(cat)} disabled={isDeploying===cat.id} className="bg-green-600 hover:bg-green-700 text-white gap-2 mr-2">{isDeploying===cat.id?<Loader2 className="w-4 h-4 animate-spin"/>:<UploadCloud className="w-4 h-4"/>}{isDeploying===cat.id?"...":"Live"}</Button>
                      <Button variant="ghost" size="icon" onClick={()=>handleExport(cat)}><Download className="w-4 h-4"/></Button>
                      <Button variant="ghost" size="icon" onClick={()=>handleDuplicate(cat)}><Copy className="w-4 h-4"/></Button>
                      <Button variant="ghost" size="icon" onClick={()=>openEditDialog(cat)}><Pencil className="w-4 h-4"/></Button>
                      <Button variant="ghost" size="icon" onClick={()=>handleDelete(cat.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4"/></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <CityExportDialog open={isExportOpen} onOpenChange={setIsExportOpen} category={exportCategory} />
    </div>
  );
}