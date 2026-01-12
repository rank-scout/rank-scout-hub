import { useState, useEffect } from "react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useDuplicateCategory, type Category } from "@/hooks/useCategories";
import { useCategoryProjects, useUpdateCategoryProjects } from "@/hooks/useCategoryProjects";
import { useGenerateCityContent } from "@/hooks/useGenerateCityContent";
import { useDomains } from "@/hooks/useDomains";
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
import { Plus, Pencil, Trash2, Loader2, ArrowUp, ArrowDown, Copy, FileText, Download, LayoutTemplate, Code, Flag, FileCheck, Sparkles, Palette, Wand2, AlertTriangle, Globe, Link2 } from "lucide-react";
import BulkImportDialog from "@/components/admin/BulkImportDialog";
import { supabase } from "@/integrations/supabase/client";
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
  const { data: domains = [] } = useDomains();
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
  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [domainFilter, setDomainFilter] = useState<string>("all");

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
  const targetDomain = watch("target_domain");

  // Filter categories by domain
  const filteredCategories = domainFilter === "all" 
    ? categories 
    : categories.filter(c => c.target_domain === domainFilter);

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
    const defaultDomain = domains.find(d => d.is_default)?.domain || "dating.rank-scout.com";
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
      target_domain: defaultDomain,
      is_active: true,
      sort_order: categories.length,
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category);
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
      target_domain: category.target_domain || "dating.rank-scout.com",
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-primary" />
            Landingpages
          </h2>
          <p className="text-muted-foreground">Erstelle und verwalte deine Affiliate-Landingpages.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Domain Filter */}
          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="w-[220px]">
              <Globe className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Alle Domains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Alle Domains ({categories.length})
                </span>
              </SelectItem>
              {domains.map((domain) => (
                <SelectItem key={domain.id} value={domain.domain}>
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {domain.display_name} ({categories.filter(c => c.target_domain === domain.domain).length})
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Bulk Import Button */}
          <BulkImportDialog />
          
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
                <TabsList className="grid w-full grid-cols-7">
                  <TabsTrigger value="basic">Grunddaten</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
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
                      <p className="text-xs text-muted-foreground mt-1">
                        {colorTheme === "dark" && "Klassisches dunkles Design"}
                        {colorTheme === "light" && "Helles, modernes Design"}
                        {colorTheme === "neon" && "Cyberpunk-Stil mit Neon-Farben"}
                      </p>
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

                  {/* Target Domain Selection */}
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <Label htmlFor="target_domain" className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-primary" />
                      Ziel-Domain
                    </Label>
                    <Select value={targetDomain} onValueChange={(v) => setValue("target_domain", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Domain wählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        {domains.map((domain) => (
                          <SelectItem key={domain.id} value={domain.domain}>
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              <span>{domain.display_name}</span>
                              {domain.is_default && (
                                <span className="text-xs bg-primary/20 text-primary px-1.5 rounded">Standard</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-2">
                      Diese Landingpage wird nur auf der gewählten Domain angezeigt.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4 pt-4">
                  {/* AI Generator with Keyword Input */}
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
                              toast({ 
                                title: "Kein Keyword", 
                                description: "Bitte gib ein Keyword ein", 
                                variant: "destructive" 
                              });
                              return;
                            }
                            const year = new Date().getFullYear();
                            // Generate ALL fields based on keyword
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

                  {/* Header & Hero Settings */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      Header & Hero Bereich
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="site_name">Seitenname im Header</Label>
                        <Input id="site_name" {...register("site_name")} placeholder="z.B. LGBTQ Dating" />
                        <p className="text-xs text-muted-foreground mt-1">Wird oben links im Header angezeigt</p>
                      </div>
                      <div>
                        <Label htmlFor="hero_pretitle">Hero Pretitle (klein, über Headline)</Label>
                        <Input id="hero_pretitle" {...register("hero_pretitle")} placeholder="z.B. Finde Singles in" />
                        <p className="text-xs text-muted-foreground mt-1">Der goldene Text über der Hauptüberschrift</p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="hero_headline">Hero Headline (groß, goldene Schrift)</Label>
                      <Input id="hero_headline" {...register("hero_headline")} placeholder="z.B. Lerne Lgbtq Singles kennen" />
                      <p className="text-xs text-muted-foreground mt-1">Die große Hauptüberschrift im Hero-Bereich</p>
                    </div>

                    <div>
                      <Label htmlFor="description">Hero Beschreibung</Label>
                      <Textarea id="description" {...register("description")} placeholder="Die ausführliche Beschreibung unter der Headline..." rows={3} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="hero_cta_text">CTA-Button Text</Label>
                        <Input id="hero_cta_text" {...register("hero_cta_text")} placeholder="z.B. LGBTQ Singles finden" />
                        <p className="text-xs text-muted-foreground mt-1">Text auf dem goldenen Button</p>
                      </div>
                      <div>
                        <Label htmlFor="hero_badge_text">Badge Text (unter Button)</Label>
                        <Input id="hero_badge_text" {...register("hero_badge_text")} placeholder="z.B. Geprüft für Stadt & Land LGBTQ" />
                        <p className="text-xs text-muted-foreground mt-1">Der grüne Haken-Text unter dem Button</p>
                      </div>
                    </div>
                  </div>

                  {/* SEO Meta Tags */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <h4 className="font-semibold text-foreground">SEO Meta Tags</h4>
                    
                    <div>
                      <Label htmlFor="h1_title">H1 Titel / Breadcrumb</Label>
                      <Input id="h1_title" {...register("h1_title")} placeholder="Singles in LGBTQ Dating - Die besten Dating Apps" />
                      <p className="text-xs text-muted-foreground mt-1">Wird auch in Breadcrumbs und als Untertitel verwendet</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="meta_title">Meta Title (max. 60 Zeichen)</Label>
                      <Input id="meta_title" {...register("meta_title")} placeholder="Singles LGBTQ 2025 » Top Dating Apps im Vergleich" maxLength={60} />
                      {errors.meta_title && <p className="text-sm text-destructive mt-1">{errors.meta_title.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="meta_description">Meta Description (max. 160 Zeichen)</Label>
                      <Textarea 
                        id="meta_description" 
                        {...register("meta_description")} 
                        placeholder="Finde Singles in LGBTQ mit den besten Dating Apps. ✓ Kostenlos testen ✓ Echte Matches ✓ Seriöse Plattformen"
                        maxLength={160}
                        rows={3}
                      />
                      {errors.meta_description && <p className="text-sm text-destructive mt-1">{errors.meta_description.message}</p>}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4 pt-4">
                  {/* AI Generator with Keyword and Word Count */}
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4">
                    <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-primary" />
                      KI-Content Generator
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generiere thematisch passenden Content mit moderner Schrift
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label htmlFor="content_keyword" className="text-sm">Keyword / Thema</Label>
                        <Input 
                          id="content_keyword" 
                          placeholder="z.B. LGBTQ Dating, 50+ Dating, Casual Dating" 
                          defaultValue={nameValue || "Dating"}
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Der Content wird 100% auf dieses Thema zugeschnitten</p>
                      </div>
                      <div>
                        <Label htmlFor="content_location" className="text-sm">Ort / Stadt</Label>
                        <Input 
                          id="content_location" 
                          placeholder="z.B. Wien, Salzburg, Österreich" 
                          defaultValue={nameValue || ""}
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Für lokalen Bezug im Content</p>
                      </div>
                      <div>
                        <Label htmlFor="content_wordcount" className="text-sm">Wortanzahl</Label>
                        <Select defaultValue="1000">
                          <SelectTrigger id="content_wordcount" className="mt-1">
                            <SelectValue placeholder="Wortanzahl wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1000">~1.000 Wörter (kurz)</SelectItem>
                            <SelectItem value="2000">~2.000 Wörter (mittel)</SelectItem>
                            <SelectItem value="3000">~3.000 Wörter (lang)</SelectItem>
                            <SelectItem value="4000">~4.000 Wörter (sehr lang)</SelectItem>
                            <SelectItem value="5000">~5.000 Wörter (umfangreich)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">Mehr Wörter = besseres SEO</p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      className="gap-2 w-full bg-primary hover:bg-primary/90"
                      disabled={isGenerating}
                      onClick={async () => {
                        const keywordInput = (document.getElementById("content_keyword") as HTMLInputElement)?.value || "Dating";
                        const locationInput = (document.getElementById("content_location") as HTMLInputElement)?.value || nameValue || "Österreich";
                        const wordCountSelect = (document.getElementById("content_wordcount") as HTMLSelectElement)?.value || "1000";
                        const wordCount = parseInt(wordCountSelect, 10);
                        
                        if (!locationInput) {
                          toast({ 
                            title: "Kein Ort angegeben", 
                            description: "Bitte gib einen Ort oder Seitennamen ein", 
                            variant: "destructive" 
                          });
                          return;
                        }
                        
                        toast({ 
                          title: "Content wird generiert...", 
                          description: `${wordCount} Wörter zum Thema "${keywordInput}" für "${locationInput}"` 
                        });
                        
                        const result = await generateContent(locationInput, keywordInput, wordCount);
                        if (result) {
                          setValue("long_content_top", result.contentTop);
                          setValue("long_content_bottom", result.contentBottom);
                          toast({ 
                            title: "Content generiert!", 
                            description: `${wordCount} Wörter zu "${keywordInput}" in "${locationInput}" wurden erstellt.` 
                          });
                        } else {
                          toast({ title: "Fehler bei der Generierung", variant: "destructive" });
                        }
                      }}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generiere Content...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Content generieren
                        </>
                      )}
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor="long_content_top">Content oben (HTML) - USP-Cards, Einleitung</Label>
                    <Textarea 
                      id="long_content_top" 
                      {...register("long_content_top")} 
                      placeholder={`<div class="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
  <div class="bg-card border border-border rounded-2xl p-6 text-center">
    <div class="text-4xl mb-4">💕</div>
    <h3 class="text-lg font-semibold text-foreground mb-2">Echte Singles</h3>
    <p class="text-muted-foreground text-sm">Verifizierte Profile aus deiner Stadt</p>
  </div>
</div>`}
                      rows={16}
                      className="font-mono text-sm min-h-[200px]"
                    />
                    <p className="text-xs text-muted-foreground mt-1">HTML-Content oberhalb der App-Liste. Nutze USP-Cards, Einleitungstexte etc.</p>
                  </div>

                  <div>
                    <Label htmlFor="long_content_bottom">Content unten (HTML) - SEO-Text, FAQs</Label>
                    <Textarea 
                      id="long_content_bottom" 
                      {...register("long_content_bottom")} 
                      placeholder={`<div class="bg-muted/30 rounded-2xl p-8 my-12">
  <h2 class="text-2xl font-display font-bold text-foreground mb-6">Dating in [Stadt]</h2>
  <p class="text-muted-foreground">SEO-Text hier...</p>
</div>

<div class="space-y-4 my-12">
  <details class="bg-card border border-border rounded-xl p-4">
    <summary class="font-semibold cursor-pointer">FAQ Frage hier?</summary>
    <p class="mt-3 text-muted-foreground text-sm">Antwort hier...</p>
  </details>
</div>`}
                      rows={16}
                      className="font-mono text-sm min-h-[200px]"
                    />
                    <p className="text-xs text-muted-foreground mt-1">HTML-Content unterhalb der App-Liste. Nutze FAQs, SEO-Texte etc.</p>
                  </div>

                  <div>
                    <Label htmlFor="banner_override" className="flex items-center gap-2">
                      <Flag className="w-4 h-4" />
                      Banner-Override (HTML)
                    </Label>
                    <Textarea 
                      id="banner_override" 
                      {...register("banner_override")} 
                      placeholder="<div class='banner'>Spezial-Banner nur für diese Seite...</div>"
                      rows={4}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leer lassen = globaler Banner wird verwendet. Eingetragen = überschreibt den globalen Banner für diese Seite.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="footer" className="space-y-4 pt-4">
                  <div className="border rounded-lg p-4 space-y-4">
                    <h4 className="font-semibold text-foreground">Footer-Einstellungen für diese Seite</h4>
                    <p className="text-sm text-muted-foreground">
                      Überschreibe die globalen Footer-Einstellungen für diese Landingpage.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="footer_site_name">Footer Logo-Text</Label>
                        <Input id="footer_site_name" {...register("footer_site_name")} placeholder="z.B. DatingAppVergleichAT" />
                        <p className="text-xs text-muted-foreground mt-1">Leer = Site Name aus Grunddaten wird verwendet</p>
                      </div>
                      <div>
                        <Label htmlFor="footer_copyright_text">Copyright-Text</Label>
                        <Input id="footer_copyright_text" {...register("footer_copyright_text")} placeholder="© 2026 DatingVergleichAT. Alle Rechte vorbehalten." />
                        <p className="text-xs text-muted-foreground mt-1">Leer = automatisch generiert</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="footer_designer_name">Designer Name</Label>
                        <Input id="footer_designer_name" {...register("footer_designer_name")} placeholder="Digital-Perfect" />
                      </div>
                      <div>
                        <Label htmlFor="footer_designer_url">Designer URL</Label>
                        <Input id="footer_designer_url" {...register("footer_designer_url")} placeholder="https://digital-perfect.at" />
                      </div>
                    </div>
                  </div>

                  {/* Popular Footer Links Editor */}
                  <div className="border rounded-lg p-4">
                    <CategoryFooterLinksEditor categoryId={editingCategory?.id || null} />
                  </div>

                  {/* Legal Links Editor */}
                  <div className="border rounded-lg p-4">
                    <CategoryLegalLinksEditor categoryId={editingCategory?.id || null} />
                  </div>
                </TabsContent>

                <TabsContent value="projects" className="space-y-4 pt-4">
                  <div>
                    <Label className="text-base font-semibold">Welche Anbieter sollen auf dieser Seite erscheinen?</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Wähle die Anbieter aus und ordne sie per Pfeilen. Die Reihenfolge bestimmt die Anzeige.
                    </p>
                    <ProjectCheckboxList
                      selectedIds={selectedProjectIds}
                      onChange={setSelectedProjectIds}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="tracking" className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="analytics_code" className="flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      Analytics/Tracking Code
                    </Label>
                    <Textarea 
                      id="analytics_code" 
                      {...register("analytics_code")} 
                      placeholder={`<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXX');
</script>

<!-- Facebook Pixel -->
<script>
  !function(f,b,e,v,n,t,s)...
</script>`}
                      rows={15}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Dieser Code wird im &lt;head&gt; der exportierten Seite eingefügt. 
                      Perfekt für Google Analytics, Facebook Pixel, etc.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="override" className="space-y-4 pt-4">
                  {/* URL Import Section */}
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold text-foreground">Schnell-Import von URL</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Gib die URL einer bestehenden Landingpage ein. HTML, Slug, Name und SEO-Daten werden automatisch extrahiert.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 relative">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          value={importUrl}
                          onChange={(e) => setImportUrl(e.target.value)}
                          placeholder="https://dating.rank-scout.com/singles-wien/"
                          className="pl-10"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="default"
                        className="gap-2 shrink-0"
                        disabled={isImporting || !importUrl.trim()}
                        onClick={async () => {
                          if (!importUrl.trim()) return;
                          setIsImporting(true);
                          try {
                            const { data, error } = await supabase.functions.invoke('fetch-html', {
                              body: { url: importUrl.trim() }
                            });
                            
                            if (error) throw error;
                            if (data.error) throw new Error(data.error);
                            
                            const { html, slug } = data;
                            
                            // Set the HTML
                            setValue("custom_html_override", html);
                            
                            // Set slug from URL
                            if (slug && !editingCategory) {
                              setValue("slug", slug);
                              // Convert slug to name
                              const name = slug
                                .split('-')
                                .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ');
                              setValue("name", name);
                            }
                            
                            // Extract SEO data
                            const extracted = extractMetaFromHtml(html);
                            if (extracted.title) setValue("meta_title", extracted.title);
                            if (extracted.metaDescription) setValue("meta_description", extracted.metaDescription);
                            if (extracted.h1Title) setValue("h1_title", extracted.h1Title);
                            
                            setImportUrl("");
                            toast({
                              title: "✅ Import erfolgreich!",
                              description: `HTML geladen, Slug "${slug}" und SEO-Daten automatisch gefüllt.`,
                            });
                          } catch (error) {
                            console.error('Import error:', error);
                            toast({
                              title: "Import fehlgeschlagen",
                              description: error instanceof Error ? error.message : "Konnte die URL nicht laden",
                              variant: "destructive",
                            });
                          } finally {
                            setIsImporting(false);
                          }
                        }}
                      >
                        {isImporting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Lade...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            HTML laden
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {customHtmlOverride && customHtmlOverride.trim() !== "" && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium text-green-400">Custom HTML aktiv</span>
                        <span className="text-xs text-muted-foreground">({customHtmlOverride.length} Zeichen)</span>
                      </div>
                      {editingCategory && (
                        <a 
                          href={`/kategorien/${editingCategory.slug}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          Vorschau öffnen →
                        </a>
                      )}
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                          🎨 Design Override (Experten-Modus)
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Füge hier komplettes HTML ein. Das Standard-Template wird vollständig ignoriert.
                          <br />
                          <strong className="text-amber-400">Nutze den Platzhalter <code className="bg-muted px-1 rounded">{"{{APPS}}"}</code> dort, wo die App-Liste erscheinen soll.</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="custom_html_override" className="flex items-center gap-2">
                        <Wand2 className="w-4 h-4" />
                        Vollständiges HTML Override
                      </Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={handleExtractFromHtml}
                        disabled={!customHtmlOverride || customHtmlOverride.trim() === ""}
                        className="gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Daten aus Code ziehen
                      </Button>
                    </div>
                    <Textarea 
                      id="custom_html_override" 
                      {...register("custom_html_override")} 
                      placeholder={`<!-- Dein komplettes HTML hier -->
<div class="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
  <header class="py-8">
    <div class="container mx-auto px-4">
      <h1 class="text-4xl font-bold text-white">Meine Landingpage</h1>
    </div>
  </header>
  
  <main>
    <section class="py-12">
      <div class="container mx-auto px-4">
        <p class="text-gray-300">Dein Content hier...</p>
        
        <!-- WICHTIG: Platzhalter für die App-Liste -->
        {{APPS}}
        
        <p class="text-gray-300">Mehr Content nach der Liste...</p>
      </div>
    </section>
  </main>
  
  <footer class="py-8 bg-slate-950">
    <div class="container mx-auto px-4 text-center text-gray-500">
      © 2025 Deine Seite
    </div>
  </footer>
</div>`}
                      rows={25}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      <strong>Leer lassen:</strong> Standard-Template wird verwendet.<br />
                      <strong>HTML eingeben:</strong> Überschreibt das gesamte Template. Tailwind-Klassen funktionieren automatisch.<br />
                      <strong>Daten extrahieren:</strong> Klicke "Daten aus Code ziehen" um Title, Meta Description und H1 automatisch in die SEO-Felder zu übernehmen.
                    </p>
                  </div>
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
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Ord.</TableHead>
                <TableHead>Seite</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>SEO</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Keine Landingpages vorhanden. Erstelle deine erste Landingpage.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category, index) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleMoveOrder(category, "up")}
                          disabled={index === 0}
                          className="p-1 hover:bg-muted rounded disabled:opacity-30"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleMoveOrder(category, "down")}
                          disabled={index === categories.length - 1}
                          className="p-1 hover:bg-muted rounded disabled:opacity-30"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
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
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                        <Globe className="w-3 h-3" />
                        {category.target_domain?.replace('.rank-scout.com', '') || 'dating'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {category.template === "review" ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                            <FileCheck className="w-3 h-3" />
                            Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            <LayoutTemplate className="w-3 h-3" />
                            Vergleich
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">/{category.slug}</code>
                    </TableCell>
                    <TableCell>
                      {category.meta_title ? (
                        <FileText className="w-4 h-4 text-green-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-muted-foreground/30" />
                      )}
                    </TableCell>
                    <TableCell>
                      {category.analytics_code ? (
                        <Code className="w-4 h-4 text-green-500" />
                      ) : (
                        <Code className="w-4 h-4 text-muted-foreground/30" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={category.is_active}
                        onCheckedChange={() => handleToggleActive(category)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleExport(category)}
                          title="FTP-Export"
                          className="text-primary hover:text-primary"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicate(category)}
                          title="Duplizieren"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(category)}
                          title="Bearbeiten"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(category.id)}
                          className="text-destructive hover:text-destructive"
                          title="Löschen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
