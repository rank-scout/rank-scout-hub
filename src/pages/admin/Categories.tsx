import { useState, useEffect } from "react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useDuplicateCategory, type Category } from "@/hooks/useCategories";
import { useCategoryProjects, useUpdateCategoryProjects } from "@/hooks/useCategoryProjects";
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
import { Plus, Pencil, Trash2, Loader2, ArrowUp, ArrowDown, Copy, FileText, Download, LayoutTemplate, Code, Flag, FileCheck } from "lucide-react";
import ProjectCheckboxList from "@/components/admin/ProjectCheckboxList";
import CityExportDialog from "@/components/admin/CityExportDialog";

// Helper to generate slug from page name
function generateSlug(name: string): string {
  return `singles-${name.toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

export default function AdminCategories() {
  const { data: categories = [], isLoading } = useCategories(true);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const duplicateCategory = useDuplicateCategory();
  const updateCategoryProjects = useUpdateCategoryProjects();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [exportCategory, setExportCategory] = useState<Category | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

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
  const isActive = watch("is_active");
  const nameValue = watch("name");

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
      meta_title: "",
      meta_description: "",
      h1_title: "",
      long_content_top: "",
      long_content_bottom: "",
      analytics_code: "",
      banner_override: "",
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
      meta_title: category.meta_title || "",
      meta_description: category.meta_description || "",
      h1_title: category.h1_title || "",
      long_content_top: category.long_content_top || "",
      long_content_bottom: category.long_content_bottom || "",
      analytics_code: category.analytics_code || "",
      banner_override: category.banner_override || "",
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
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="basic">Grunddaten</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="projects">Apps</TabsTrigger>
                  <TabsTrigger value="tracking">Tracking</TabsTrigger>
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

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="theme">Theme</Label>
                      <Select value={theme} onValueChange={(v) => setValue("theme", v as CategoryInput["theme"])}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DATING">Dating</SelectItem>
                          <SelectItem value="GENERIC">Generisch</SelectItem>
                          <SelectItem value="CASINO">Casino</SelectItem>
                          <SelectItem value="ADULT">Adult</SelectItem>
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
                      <p className="text-xs text-muted-foreground mt-1">
                        {template === "comparison" ? "Standard-Vergleichsliste mit mehreren Apps" : "Einzelner Artikel mit Sidebar-Widget"}
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
                </TabsContent>

                <TabsContent value="seo" className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="h1_title">H1 Titel</Label>
                    <Input id="h1_title" {...register("h1_title")} placeholder="Singles in Salzburg - Die besten Dating Apps" />
                  </div>
                  
                  <div>
                    <Label htmlFor="meta_title">Meta Title (max. 60 Zeichen)</Label>
                    <Input id="meta_title" {...register("meta_title")} placeholder="Singles Salzburg 2025 » Top Dating Apps im Vergleich" maxLength={60} />
                    {errors.meta_title && <p className="text-sm text-destructive mt-1">{errors.meta_title.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="meta_description">Meta Description (max. 160 Zeichen)</Label>
                    <Textarea 
                      id="meta_description" 
                      {...register("meta_description")} 
                      placeholder="Finde Singles in Salzburg mit den besten Dating Apps. ✓ Kostenlos testen ✓ Echte Matches ✓ Seriöse Plattformen"
                      maxLength={160}
                      rows={3}
                    />
                    {errors.meta_description && <p className="text-sm text-destructive mt-1">{errors.meta_description.message}</p>}
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="long_content_top">Content oben (HTML) - USP-Cards, Einleitung</Label>
                    <Textarea 
                      id="long_content_top" 
                      {...register("long_content_top")} 
                      placeholder={`<div class="usp-section">
  <div class="usp-grid">
    <div class="usp-card">
      <div class="usp-icon">💕</div>
      <h3>Echte Singles</h3>
      <p>Verifizierte Profile aus deiner Stadt</p>
    </div>
  </div>
</div>`}
                      rows={12}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">HTML-Content oberhalb der App-Liste. Nutze USP-Cards, Einleitungstexte etc.</p>
                  </div>

                  <div>
                    <Label htmlFor="long_content_bottom">Content unten (HTML) - SEO-Text, FAQs</Label>
                    <Textarea 
                      id="long_content_bottom" 
                      {...register("long_content_bottom")} 
                      placeholder={`<h2>Häufig gestellte Fragen</h2>
<details>
  <summary>Welche Dating App ist in Salzburg am beliebtesten?</summary>
  <p>In Salzburg sind besonders Tinder und Bumble beliebt...</p>
</details>`}
                      rows={12}
                      className="font-mono text-sm"
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
