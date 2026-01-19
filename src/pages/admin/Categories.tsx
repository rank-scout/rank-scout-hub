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
  
  // State für Export & Deploy
  const [exportCategory, setExportCategory] = useState<Category | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState<string | null>(null);

  // Fetch assigned projects when editing
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

  // --- DEPLOYMENT LOGIC START ---
  async function handleDeploy(category: Category) {
    setIsDeploying(category.id);
    
    // KONFIGURATION: Bridge-URL und Passwort
    const BRIDGE_URL = "https://dating.rank-scout.com/bridge.php"; 
    const API_KEY = "CHANGE_ME_123"; // <--- HIER DEIN PASSWORT REIN!

    try {
      // 1. HTML Generieren
      let htmlContent = "";

      if (category.custom_html_override && category.custom_html_override.trim() !== "") {
        htmlContent = category.custom_html_override;
      } else {
        htmlContent = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${category.meta_title || category.name}</title>
    <meta name="description" content="${category.meta_description || ''}">
    <script src="https://cdn.tailwindcss.com"></script>
    ${category.analytics_code || ''}
    <style>body { font-family: 'Inter', sans-serif; }</style>
</head>
<body class="${category.color_theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}">
    <header class="py-16 text-center">
        <h1 class="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-600">
            ${category.hero_headline || category.name}
        </h1>
        <p class="text-lg opacity-80 max-w-2xl mx-auto">${category.description || ''}</p>
        ${category.hero_cta_text ? `<a href="#vergleich" class="inline-block mt-8 bg-amber-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform">${category.hero_cta_text}</a>` : ''}
    </header>
    <main class="max-w-5xl mx-auto px-4 py-12">
        ${category.long_content_top ? `<div class="prose ${category.color_theme === 'dark' ? 'prose-invert' : ''} max-w-none mb-12">${category.long_content_top}</div>` : ''}
        <div id="vergleich" class="bg-card border border-white/10 rounded-xl p-8 text-center my-12">
            <h2 class="text-2xl font-bold mb-2">Vergleichstabelle wird geladen...</h2>
            <p class="opacity-60">Hier werden die Apps geladen.</p>
        </div>
        ${category.long_content_bottom ? `<div class="prose ${category.color_theme === 'dark' ? 'prose-invert' : ''} max-w-none mt-12">${category.long_content_bottom}</div>` : ''}
    </main>
    <footer class="py-8 text-center opacity-60 border-t border-white/10 mt-12">
        <p>${category.footer_copyright_text || `© ${new Date().getFullYear()} ${category.site_name || 'Rank Scout'}`}</p>
    </footer>
</body>
</html>`;
      }

      // 2. An Bridge senden
      const response = await fetch(BRIDGE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": API_KEY },
        body: JSON.stringify({
          html: htmlContent,
          slug: category.slug // Erstellt Ordner z.B. /wien/
        })
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        toast({
          title: "🚀 Live geschaltet!",
          description: `Seite online: ${result.url}`,
          className: "bg-green-600 text-white border-green-700"
        });
      } else {
        throw new Error(result.message || "Fehler bei der Übertragung");
      }

    } catch (error) {
      console.error(error);
      toast({
        title: "Fehler beim Deployment",
        description: error instanceof Error ? error.message : "Verbindung fehlgeschlagen",
        variant: "destructive"
      });
    } finally {
      setIsDeploying(null);
    }
  }
  // --- DEPLOYMENT LOGIC END ---

  // Auto-fill SEO fields from HTML
  function handleExtractFromHtml() {
    const html = customHtmlOverride;
    if (!html || html.trim() === "") {
      toast({ title: "Kein HTML vorhanden", description: "Füge zuerst HTML-Code ein.", variant: "destructive" });
      return;
    }

    const extracted = extractMetaFromHtml(html);
    const updates: string[] = [];

    const currentMetaTitle = watch("meta_title");
    const currentMetaDescription = watch("meta_description");
    const currentH1Title = watch("h1_title");

    if (extracted.title && !currentMetaTitle) {
      setValue("meta_title", extracted.title);
      updates.push(`Meta-Titel: "${extracted.title}"`);
    }
    if (extracted.metaDescription && !currentMetaDescription) {
      setValue("meta_description", extracted.metaDescription);
      updates.push(`Meta-Beschreibung: "${extracted.metaDescription.substring(0, 50)}..."`);
    }
    if (extracted.h1Title && !currentH1Title) {
      setValue("h1_title", extracted.h1Title);
      updates.push(`H1-Titel: "${extracted.h1Title}"`);
    }

    if (updates.length > 0) {
      toast({ 
        title: "SEO-Daten extrahiert", 
        description: updates.join("\n"),
      });
    } else {
      const foundItems: string[] = [];
      if (extracted.title) foundItems.push("Title");
      if (extracted.metaDescription) foundItems.push("Meta Description");
      if (extracted.h1Title) foundItems.push("H1");
      
      if (foundItems.length > 0) {
        toast({ 
          title: "Felder bereits gefüllt", 
          description: `Gefunden: ${foundItems.join(", ")} - aber Felder sind bereits gefüllt.`,
        });
      } else {
        toast({ 
          title: "Keine SEO-Daten gefunden", 
          description: "Der HTML-Code enthält kein <title>, <meta description> oder <h1>.",
          variant: "destructive",
        });
      }
    }
  }

  // Auto-generate slug when name changes (only for new pages)
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

      // Update project assignments
      await updateCategoryProjects.mutateAsync({
        categoryId,
        projectIds: selectedProjectIds,
      });

      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Möchtest du diese Landingpage wirklich löschen?")) return;
    try {
      await deleteCategory.mutateAsync(id);
      toast({ title: "Landingpage gelöscht" });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Landingpage konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  }

  async function handleDuplicate(category: Category) {
    try {
      await duplicateCategory.mutateAsync(category);
      toast({ title: "Landingpage dupliziert", description: "Du kannst die Kopie jetzt bearbeiten." });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Landingpage konnte nicht dupliziert werden",
        variant: "destructive",
      });
    }
  }

  async function handleToggleActive(category: Category) {
    try {
      await updateCategory.mutateAsync({
        id: category.id,
        input: { is_active: !category.is_active },
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Status konnte nicht geändert werden",
        variant: "destructive",
      });
    }
  }

  async function handleMoveOrder(category: Category, direction: "up" | "down") {
    const currentIndex = categories.findIndex((c) => c.id === category.id);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= categories.length) return;

    const otherCategory = categories[newIndex];
    
    try {
      await Promise.all([
        updateCategory.mutateAsync({
          id: category.id,
          input: { sort_order: otherCategory.sort_order },
        }),
        updateCategory.mutateAsync({
          id: otherCategory.id,
          input: { sort_order: category.sort_order },
        }),
      ]);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Reihenfolge konnte nicht geändert werden",
        variant: "destructive",
      });
    }
  }

  function handleExport(category: Category) {
    setExportCategory(category);
    setIsExportOpen(true);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-primary" />
            Landingpages
          </h2>
          <p className="text-muted-foreground">Erstelle und verwalte deine Affiliate-Landingpages.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="w-4 h-4" />
              Neue Landingpage
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5" />
                {editingCategory ? "Landingpage bearbeiten" : "Neue Landingpage anlegen"}
              </DialogTitle>
            </DialogHeader>
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
                  <TabsTrigger value="override" className="flex items-center gap-1">
                    <Wand2 className="w-3 h-3" />
                    Override
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 pt-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1">
                      <Label htmlFor="icon">Icon</Label>
                      <Input
                        id="icon"
                        {...register("icon")}
                        className="text-center text-2xl"
                        placeholder="📍"
                      />
                    </div>
                    <div className="col-span-3">
                      <Label htmlFor="name">Seitenname (intern)</Label>
                      <Input id="name" {...register("name")} placeholder="z.B. Salzburg, Linz, Graz" />
                      {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                      <p className="text-xs text-muted-foreground mt-1">Der Slug wird automatisch generiert.</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="slug">Slug (URL-Pfad)</Label>
                    <Input id="slug" {...register("slug")} placeholder="singles-salzburg" />
                    {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="description">Kurzbeschreibung</Label>
                    <Textarea id="description" {...register("description")} placeholder="Die besten Dating Apps in Salzburg..." rows={2} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="theme">Branchen-Theme</Label>
                      <Select value={theme} onValueChange={(v) => setValue("theme", v as CategoryInput["theme"])}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DATING">💕 Dating</SelectItem>
                          <SelectItem value="GENERIC">📊 Generisch</SelectItem>
                          <SelectItem value="CASINO">🎰 Casino</SelectItem>
                          <SelectItem value="ADULT">🔞 Adult</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="template">Seitentyp</Label>
                      <Select value={template} onValueChange={(v) => setValue("template", v as CategoryInput["template"])}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comparison">
                            <div className="flex items-center gap-2">
                              <LayoutTemplate className="w-4 h-4" />
                              <span>Vergleichstabelle</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="review">
                            <div className="flex items-center gap-2">
                              <FileCheck className="w-4 h-4" />
                              <span>Erfahrungsbericht</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="color_theme" className="flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        Farbmodus
                      </Label>
                      <Select value={colorTheme} onValueChange={(v) => setValue("color_theme", v as "dark" | "light" | "neon")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dark">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-700" />
                              <span>Dark Mode</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="light">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-white border border-gray-300" />
                              <span>Light Mode</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="neon">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500" />
                              <span>Neon Mode</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between pt-6">
                      <Label htmlFor="is_active">Aktiv</Label>
                      <Switch
                        id="is_active"
                        checked={isActive}
                        onCheckedChange={(checked) => setValue("is_active", checked)}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4 pt-4">
                  <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 border border-secondary/20 rounded-xl p-4">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-secondary" />
                        <h4 className="font-semibold text-foreground">KI-Generator für alle Felder</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Gib dein Keyword ein und alle SEO- und Hero-Felder werden automatisch optimiert generiert.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                          id="keyword-input"
                          placeholder="Keyword eingeben (z.B. LGBTQ Dating, Salzburg, 50+ Singles...)"
                          className="flex-1"
                          defaultValue={nameValue || ""}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="gap-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground shrink-0"
                          disabled={isGenerating}
                          onClick={async () => {
                            const keywordInput = document.getElementById('keyword-input') as HTMLInputElement;
                            const keyword = keywordInput?.value || nameValue;
                            if (!keyword) {
                              toast({ title: "Kein Keyword", description: "Bitte gib ein Keyword ein", variant: "destructive" });
                              return;
                            }
                            const year = new Date().getFullYear();
                            setValue("site_name", keyword.replace(/\s+/g, '') + "AT");
                            setValue("hero_pretitle", "Finde Singles in");
                            setValue("hero_headline", `Lerne ${keyword} Singles kennen`);
                            setValue("hero_cta_text", `${keyword} Singles finden`);
                            setValue("hero_badge_text", `Geprüft für Stadt & Land ${keyword}`);
                            setValue("meta_title", `Singles ${keyword} ${year} » Top Dating Apps im Vergleich`);
                            setValue("meta_description", `Finde Singles in ${keyword} mit den besten Dating Apps. ✓ Kostenlos testen ✓ Echte Matches ✓ Seriöse Plattformen im Vergleich.`);
                            setValue("h1_title", `Singles in ${keyword} – Die besten Dating Apps`);
                            setValue("description", `Ob ${keyword} oder Umgebung – du musst nicht alleine sein. Wir haben geprüft, welche Dating-Apps in ${keyword} wirklich funktionieren.`);
                            toast({ title: "Alle Felder generiert!", description: `Optimierte Inhalte für "${keyword}" wurden erstellt.` });
                          }}
                        >
                          <Sparkles className="w-4 h-4" />
                          Alles generieren
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 space-y-4">
                    <h4 className="font-semibold text-foreground">Header & Hero Bereich</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="site_name">Seitenname im Header</Label>
                        <Input id="site_name" {...register("site_name")} placeholder="z.B. LGBTQ Dating" />
                      </div>
                      <div>
                        <Label htmlFor="hero_pretitle">Hero Pretitle</Label>
                        <Input id="hero_pretitle" {...register("hero_pretitle")} placeholder="z.B. Finde Singles in" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="hero_headline">Hero Headline</Label>
                      <Input id="hero_headline" {...register("hero_headline")} placeholder="z.B. Lerne Lgbtq Singles kennen" />
                    </div>
                    <div>
                      <Label htmlFor="description">Hero Beschreibung</Label>
                      <Textarea id="description" {...register("description")} placeholder="Die ausführliche Beschreibung..." rows={3} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="hero_cta_text">CTA-Button Text</Label>
                        <Input id="hero_cta_text" {...register("hero_cta_text")} placeholder="z.B. LGBTQ Singles finden" />
                      </div>
                      <div>
                        <Label htmlFor="hero_badge_text">Badge Text</Label>
                        <Input id="hero_badge_text" {...register("hero_badge_text")} placeholder="z.B. Geprüft für Stadt & Land LGBTQ" />
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 space-y-4">
                    <h4 className="font-semibold text-foreground">SEO Meta Tags</h4>
                    <div>
                      <Label htmlFor="h1_title">H1 Titel</Label>
                      <Input id="h1_title" {...register("h1_title")} placeholder="Singles in LGBTQ Dating" />
                    </div>
                    <div>
                      <Label htmlFor="meta_title">Meta Title</Label>
                      <Input id="meta_title" {...register("meta_title")} placeholder="Singles LGBTQ 2025" maxLength={60} />
                    </div>
                    <div>
                      <Label htmlFor="meta_description">Meta Description</Label>
                      <Textarea id="meta_description" {...register("meta_description")} placeholder="Finde Singles in LGBTQ..." maxLength={160} rows={3} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4 pt-4">
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4">
                    <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-primary" />
                      KI-Content Generator
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label htmlFor="content_keyword" className="text-sm">Keyword</Label>
                        <Input id="content_keyword" defaultValue={nameValue || "Dating"} className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="content_location" className="text-sm">Ort</Label>
                        <Input id="content_location" defaultValue={nameValue || ""} className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="content_wordcount" className="text-sm">Wortanzahl</Label>
                        <Select defaultValue="1000">
                          <SelectTrigger id="content_wordcount" className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1000">1.000 Wörter</SelectItem>
                            <SelectItem value="2000">2.000 Wörter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      type="button"
                      className="w-full gap-2"
                      onClick={async () => {
                        const kw = (document.getElementById("content_keyword") as HTMLInputElement)?.value;
                        const loc = (document.getElementById("content_location") as HTMLInputElement)?.value;
                        const wc = parseInt((document.getElementById("content_wordcount") as HTMLSelectElement)?.value || "1000");
                        if (!loc) return toast({ title: "Fehler", description: "Ort fehlt", variant: "destructive" });
                        toast({ title: "Generiere...", description: "Bitte warten." });
                        const res = await generateContent(loc, kw, wc);
                        if (res) {
                          setValue("long_content_top", res.contentTop);
                          setValue("long_content_bottom", res.contentBottom);
                          toast({ title: "Fertig!" });
                        }
                      }}
                    >
                      <Sparkles className="w-4 h-4" /> Generieren
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor="long_content_top">Content oben (HTML)</Label>
                    <Textarea id="long_content_top" {...register("long_content_top")} rows={10} className="font-mono text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="long_content_bottom">Content unten (HTML)</Label>
                    <Textarea id="long_content_bottom" {...register("long_content_bottom")} rows={10} className="font-mono text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="banner_override">Banner-Override (HTML)</Label>
                    <Textarea id="banner_override" {...register("banner_override")} rows={4} className="font-mono text-sm" />
                  </div>
                </TabsContent>

                <TabsContent value="navigation" className="space-y-4 pt-4">
                  <div className="space-y-3 border rounded-lg p-4">
                    <div className="flex items-center justify-between py-2 border-b">
                      <Label>⭐ Top 3 Dating Apps</Label>
                      <Switch checked={watch("navigation_settings.show_top3_dating_apps") ?? true} onCheckedChange={(c) => setValue("navigation_settings.show_top3_dating_apps", c)} />
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <Label>📍 Singles in der Nähe</Label>
                      <Switch checked={watch("navigation_settings.show_singles_in_der_naehe") ?? true} onCheckedChange={(c) => setValue("navigation_settings.show_singles_in_der_naehe", c)} />
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <Label>💬 Chat mit einer Frau</Label>
                      <Switch checked={watch("navigation_settings.show_chat_mit_einer_frau") ?? true} onCheckedChange={(c) => setValue("navigation_settings.show_chat_mit_einer_frau", c)} />
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <Label>☕ Online Dating Cafe</Label>
                      <Switch checked={watch("navigation_settings.show_online_dating_cafe") ?? true} onCheckedChange={(c) => setValue("navigation_settings.show_online_dating_cafe", c)} />
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <Label>🖼️ Bildkontakte Login</Label>
                      <Switch checked={watch("navigation_settings.show_bildkontakte_login") ?? true} onCheckedChange={(c) => setValue("navigation_settings.show_bildkontakte_login", c)} />
                    </div>
                    <div className="flex items-center justify-between py-2 bg-red-500/5 px-2 rounded">
                      <Label className="text-red-400">🔞 18+ Hinweis Box</Label>
                      <Switch checked={watch("navigation_settings.show_18plus_hint_box") ?? true} onCheckedChange={(c) => setValue("navigation_settings.show_18plus_hint_box", c)} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="footer" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="footer_site_name">Footer Logo-Text</Label>
                      <Input id="footer_site_name" {...register("footer_site_name")} />
                    </div>
                    <div>
                      <Label htmlFor="footer_copyright_text">Copyright-Text</Label>
                      <Input id="footer_copyright_text" {...register("footer_copyright_text")} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="footer_designer_name">Designer Name</Label>
                      <Input id="footer_designer_name" {...register("footer_designer_name")} />
                    </div>
                    <div>
                      <Label htmlFor="footer_designer_url">Designer URL</Label>
                      <Input id="footer_designer_url" {...register("footer_designer_url")} />
                    </div>
                  </div>
                  <CategoryFooterLinksEditor categoryId={editingCategory?.id || null} />
                  <CategoryLegalLinksEditor categoryId={editingCategory?.id || null} />
                </TabsContent>

                <TabsContent value="projects" className="space-y-4 pt-4">
                  <ProjectCheckboxList selectedIds={selectedProjectIds} onChange={setSelectedProjectIds} />
                </TabsContent>

                <TabsContent value="tracking" className="space-y-4 pt-4">
                  <Label htmlFor="analytics_code">Analytics/Tracking Code</Label>
                  <Textarea id="analytics_code" {...register("analytics_code")} rows={10} className="font-mono text-sm" />
                </TabsContent>

                <TabsContent value="override" className="space-y-4 pt-4">
                  <div className="flex justify-between mb-2">
                    <Label className="flex items-center gap-2"><Wand2 className="w-4 h-4" /> Vollständiges HTML Override</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleExtractFromHtml} disabled={!customHtmlOverride} className="gap-2">
                      <Sparkles className="w-4 h-4" /> Daten extrahieren
                    </Button>
                  </div>
                  <Textarea id="custom_html_override" {...register("custom_html_override")} rows={20} className="font-mono text-sm" placeholder="" />
                </TabsContent>
              </Tabs>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={createCategory.isPending || updateCategory.isPending || updateCategoryProjects.isPending}
              >
                {(createCategory.isPending || updateCategory.isPending || updateCategoryProjects.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingCategory ? "Speichern" : "Landingpage erstellen"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Ord.</TableHead>
                <TableHead>Seite</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>SEO</TableHead>
                <TableHead>Tracking</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Keine Landingpages vorhanden. Erstelle deine erste Landingpage.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category, index) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <button onClick={() => handleMoveOrder(category, "up")} disabled={index === 0} className="p-1 hover:bg-muted rounded disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button>
                        <button onClick={() => handleMoveOrder(category, "down")} disabled={index === categories.length - 1} className="p-1 hover:bg-muted rounded disabled:opacity-30"><ArrowDown className="w-3 h-3" /></button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{category.icon || "📍"}</span>
                        <div>
                          <p className="font-medium text-foreground">{category.name}</p>
                          <p className="text-xs text-muted-foreground">{category.theme}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {category.template === "review" ? <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">Review</span> : <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Vergleich</span>}
                    </TableCell>
                    <TableCell><code className="text-xs bg-muted px-2 py-1 rounded">/{category.slug}</code></TableCell>
                    <TableCell>{category.meta_title ? <FileText className="w-4 h-4 text-green-500" /> : <FileText className="w-4 h-4 text-muted-foreground/30" />}</TableCell>
                    <TableCell>{category.analytics_code ? <Code className="w-4 h-4 text-green-500" /> : <Code className="w-4 h-4 text-muted-foreground/30" />}</TableCell>
                    <TableCell>
                      <Switch checked={category.is_active} onCheckedChange={() => handleToggleActive(category)} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* NEU: Live schalten Button */}
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleDeploy(category)}
                          disabled={isDeploying === category.id}
                          className="bg-green-600 hover:bg-green-700 text-white gap-2 mr-2 shadow-sm"
                          title="Auf dating.rank-scout.com veröffentlichen"
                        >
                          {isDeploying === category.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                          {isDeploying === category.id ? "..." : "Live"}
                        </Button>

                        <Button variant="ghost" size="icon" onClick={() => handleExport(category)} title="FTP-Export"><Download className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDuplicate(category)} title="Duplizieren"><Copy className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(category)} title="Bearbeiten"><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)} className="text-destructive hover:text-destructive" title="Löschen"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CityExportDialog
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        category={exportCategory}
      />
    </div>
  );
}