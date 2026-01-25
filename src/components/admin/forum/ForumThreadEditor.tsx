import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Save, Image, Plus, Eye, Code, FileText, Loader2 } from "lucide-react";
import { generateSlug } from "@/lib/seo";
import { useForumCategories, useCreateForumCategory } from "@/hooks/useForumCategories";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ForumThreadFormData {
  title: string;
  slug: string;
  content: string;
  raw_html_content: string;
  author_name: string;
  seo_title: string;
  seo_description: string;
  featured_image_url: string;
  category_id: string | null;
  status: "draft" | "published";
}

interface ForumThreadEditorProps {
  initialData?: Partial<ForumThreadFormData>;
  onSave: (data: ForumThreadFormData) => Promise<void>;
  isLoading?: boolean;
}

export function ForumThreadEditor({ initialData, onSave, isLoading }: ForumThreadEditorProps) {
  const [formData, setFormData] = useState<ForumThreadFormData>({
    title: "",
    slug: "",
    content: "",
    raw_html_content: "",
    author_name: "Redaktion",
    seo_title: "",
    seo_description: "",
    featured_image_url: "",
    category_id: null,
    status: "draft",
    ...initialData,
  });

  const [contentTab, setContentTab] = useState<"visual" | "code">("visual");
  const [isUploading, setIsUploading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  const { data: categories = [] } = useForumCategories();
  const createCategory = useCreateForumCategory();

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !initialData?.slug) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(formData.title),
      }));
    }
  }, [formData.title, initialData?.slug]);

  // Auto-fill SEO title from title
  useEffect(() => {
    if (formData.title && !formData.seo_title) {
      setFormData((prev) => ({
        ...prev,
        seo_title: formData.title.substring(0, 60),
      }));
    }
  }, [formData.title, formData.seo_title]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `threads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("forum-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("forum-images")
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, featured_image_url: publicUrl }));
      toast.success("Bild hochgeladen");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Fehler beim Hochladen");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const newCat = await createCategory.mutateAsync(newCategoryName.trim());
      setFormData((prev) => ({ ...prev, category_id: newCat.id }));
      setNewCategoryName("");
      setIsCategoryDialogOpen(false);
      toast.success("Kategorie erstellt");
    } catch (error) {
      toast.error("Fehler beim Erstellen der Kategorie");
    }
  };

  const handleSubmit = async (status: "draft" | "published") => {
    if (!formData.title.trim()) {
      toast.error("Titel ist erforderlich");
      return;
    }
    await onSave({ ...formData, status });
  };

  const seoTitleLength = formData.seo_title.length;
  const seoDescLength = formData.seo_description.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content - Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Title & Slug */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Thread-Titel eingeben..."
                className="text-lg font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/forum/</span>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-slug"
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Editor with Tabs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              Inhalt
              <Tabs value={contentTab} onValueChange={(v) => setContentTab(v as "visual" | "code")}>
                <TabsList className="h-8">
                  <TabsTrigger value="visual" className="text-xs gap-1">
                    <FileText className="h-3 w-3" /> Visual
                  </TabsTrigger>
                  <TabsTrigger value="code" className="text-xs gap-1">
                    <Code className="h-3 w-3" /> Code
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contentTab === "visual" ? (
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Thread-Inhalt (Markdown unterstützt)..."
                className="min-h-[300px] font-sans"
              />
            ) : (
              <Textarea
                value={formData.raw_html_content}
                onChange={(e) => setFormData((prev) => ({ ...prev, raw_html_content: e.target.value }))}
                placeholder="<!-- Raw HTML für Custom Tables, Widgets etc. -->"
                className="min-h-[300px] font-mono text-sm bg-muted/30"
              />
            )}
          </CardContent>
        </Card>

        {/* SEO Suite */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">SEO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="seo_title">SEO Titel</Label>
                <Badge variant={seoTitleLength > 60 ? "destructive" : seoTitleLength > 50 ? "secondary" : "outline"}>
                  {seoTitleLength}/60
                </Badge>
              </div>
              <Input
                id="seo_title"
                value={formData.seo_title}
                onChange={(e) => setFormData((prev) => ({ ...prev, seo_title: e.target.value.substring(0, 60) }))}
                placeholder="SEO-optimierter Titel (max. 60 Zeichen)"
                maxLength={60}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="seo_description">Meta Description</Label>
                <Badge variant={seoDescLength > 155 ? "destructive" : seoDescLength > 140 ? "secondary" : "outline"}>
                  {seoDescLength}/155
                </Badge>
              </div>
              <Textarea
                id="seo_description"
                value={formData.seo_description}
                onChange={(e) => setFormData((prev) => ({ ...prev, seo_description: e.target.value.substring(0, 155) }))}
                placeholder="Meta-Beschreibung für Suchmaschinen (max. 155 Zeichen)"
                maxLength={155}
                className="h-20 resize-none"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Right Column */}
      <div className="space-y-6">
        {/* Publish Box */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Veröffentlichen
              <Badge variant={formData.status === "published" ? "default" : "secondary"}>
                {formData.status === "published" ? "Live" : "Entwurf"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleSubmit("draft")}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                Entwurf
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleSubmit("published")}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4 mr-1" />}
                Veröffentlichen
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Category */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              Kategorie
              <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Neue Kategorie</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Kategorie-Name"
                    />
                    <Button onClick={handleCreateCategory} disabled={createCategory.isPending} className="w-full">
                      {createCategory.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Erstellen
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={formData.category_id || "none"}
              onValueChange={(v) => setFormData((prev) => ({ ...prev, category_id: v === "none" ? null : v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kategorie wählen..." />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                <SelectItem value="none">Keine Kategorie</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Featured Image */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Beitragsbild</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.featured_image_url ? (
              <div className="relative aspect-video rounded-md overflow-hidden border">
                <img
                  src={formData.featured_image_url}
                  alt="Featured"
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setFormData((prev) => ({ ...prev, featured_image_url: "" }))}
                >
                  Entfernen
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-video rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                {isUploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <Image className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Bild hochladen</span>
                  </>
                )}
              </label>
            )}
          </CardContent>
        </Card>

        {/* Author */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Autor</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={formData.author_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, author_name: e.target.value }))}
              placeholder="Autor-Name"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
