import { useState } from "react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useDuplicateCategory, type Category } from "@/hooks/useCategories";
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
import { Plus, Pencil, Trash2, Loader2, ArrowUp, ArrowDown, Copy, FileText } from "lucide-react";

export default function AdminCategories() {
  const { data: categories = [], isLoading } = useCategories(true);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const duplicateCategory = useDuplicateCategory();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

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
      theme: "GENERIC",
      is_active: true,
      sort_order: 0,
    },
  });

  const theme = watch("theme");
  const isActive = watch("is_active");

  function openCreateDialog() {
    setEditingCategory(null);
    reset({
      slug: "",
      name: "",
      description: "",
      icon: "📊",
      theme: "GENERIC",
      meta_title: "",
      meta_description: "",
      h1_title: "",
      long_content_top: "",
      long_content_bottom: "",
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
      icon: category.icon || "📊",
      theme: category.theme,
      meta_title: category.meta_title || "",
      meta_description: category.meta_description || "",
      h1_title: category.h1_title || "",
      long_content_top: category.long_content_top || "",
      long_content_bottom: category.long_content_bottom || "",
      is_active: category.is_active,
      sort_order: category.sort_order,
    });
    setIsDialogOpen(true);
  }

  async function onSubmit(data: CategoryInput) {
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, input: data });
        toast({ title: "Kategorie aktualisiert" });
      } else {
        await createCategory.mutateAsync(data);
        toast({ title: "Kategorie erstellt" });
      }
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
    if (!confirm("Möchtest du diese Kategorie wirklich löschen?")) return;
    try {
      await deleteCategory.mutateAsync(id);
      toast({ title: "Kategorie gelöscht" });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Kategorie konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  }

  async function handleDuplicate(category: Category) {
    try {
      await duplicateCategory.mutateAsync(category);
      toast({ title: "Kategorie dupliziert", description: "Du kannst die Kopie jetzt bearbeiten." });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Kategorie konnte nicht dupliziert werden",
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
          <h2 className="font-display text-2xl font-bold text-foreground">Kategorien</h2>
          <p className="text-muted-foreground">Verwalte deine Landingpages und SEO-Inhalte.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="w-4 h-4" />
              Neue Kategorie
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingCategory ? "Kategorie bearbeiten" : "Neue Kategorie"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Grunddaten</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 pt-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1">
                      <Label htmlFor="icon">Icon</Label>
                      <Input
                        id="icon"
                        {...register("icon")}
                        className="text-center text-2xl"
                        placeholder="📊"
                      />
                    </div>
                    <div className="col-span-3">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" {...register("name")} placeholder="Dating Apps" />
                      {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input id="slug" {...register("slug")} placeholder="dating-apps" />
                    {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="description">Kurzbeschreibung</Label>
                    <Textarea id="description" {...register("description")} placeholder="Die besten Dating Apps..." rows={2} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="theme">Theme</Label>
                      <Select value={theme} onValueChange={(v) => setValue("theme", v as CategoryInput["theme"])}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GENERIC">Generisch</SelectItem>
                          <SelectItem value="DATING">Dating</SelectItem>
                          <SelectItem value="CASINO">Casino</SelectItem>
                          <SelectItem value="ADULT">Adult</SelectItem>
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
                  <div>
                    <Label htmlFor="meta_title">Meta Title (max. 60 Zeichen)</Label>
                    <Input id="meta_title" {...register("meta_title")} placeholder="Beste Dating Apps 2025 im Vergleich" maxLength={60} />
                    {errors.meta_title && <p className="text-sm text-destructive mt-1">{errors.meta_title.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="meta_description">Meta Description (max. 160 Zeichen)</Label>
                    <Textarea 
                      id="meta_description" 
                      {...register("meta_description")} 
                      placeholder="Vergleiche die besten Dating Apps und finde die perfekte App für dich..."
                      maxLength={160}
                      rows={3}
                    />
                    {errors.meta_description && <p className="text-sm text-destructive mt-1">{errors.meta_description.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="h1_title">H1 Titel</Label>
                    <Input id="h1_title" {...register("h1_title")} placeholder="Die besten Dating Apps im Vergleich" />
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="long_content_top">Content oben (HTML)</Label>
                    <Textarea 
                      id="long_content_top" 
                      {...register("long_content_top")} 
                      placeholder="<p>Einleitungstext für die Landingpage...</p>"
                      rows={8}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">HTML-formatierter Content, der oberhalb der Projektliste angezeigt wird.</p>
                  </div>

                  <div>
                    <Label htmlFor="long_content_bottom">Content unten (HTML)</Label>
                    <Textarea 
                      id="long_content_bottom" 
                      {...register("long_content_bottom")} 
                      placeholder="<h2>FAQ</h2><p>Häufig gestellte Fragen...</p>"
                      rows={8}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">HTML-formatierter Content, der unterhalb der Projektliste angezeigt wird.</p>
                  </div>
                </TabsContent>
              </Tabs>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={createCategory.isPending || updateCategory.isPending}
              >
                {(createCategory.isPending || updateCategory.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingCategory ? "Speichern" : "Erstellen"}
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
                <TableHead>Kategorie</TableHead>
                <TableHead>Theme</TableHead>
                <TableHead>SEO</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Keine Kategorien vorhanden. Erstelle deine erste Kategorie.
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
                        <span className="text-xl">{category.icon || "📊"}</span>
                        <div>
                          <p className="font-medium text-foreground">{category.name}</p>
                          <p className="text-xs text-muted-foreground">/{category.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        category.theme === "DATING" ? "bg-dating/10 text-dating" :
                        category.theme === "CASINO" ? "bg-casino/10 text-casino" :
                        category.theme === "ADULT" ? "bg-adult/10 text-adult" :
                        "bg-primary/10 text-primary"
                      }`}>
                        {category.theme}
                      </span>
                    </TableCell>
                    <TableCell>
                      {category.meta_title ? (
                        <FileText className="w-4 h-4 text-green-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-muted-foreground/30" />
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
    </div>
  );
}
