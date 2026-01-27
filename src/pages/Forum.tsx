import { useState, useMemo } from "react";
import {
  useForumThreads,
  useCreateThread,
  useUpdateThread,
  useDeleteThread,
  useAllReplies,
  useUpdateReply,
  useForumCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  generateSlug,
  ForumThread,
  ForumCategory,
} from "@/hooks/useForum";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Pin,
  Lock,
  Eye,
  CheckCircle,
  Search,
  Image as ImageIcon,
  Code,
  FileText,
  MessageCircle,
  AlertTriangle,
  FolderOpen,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// --- KONSTANTEN (Ausgelagert für Performance) ---
const EMPTY_THREAD = {
  title: "",
  slug: "",
  content: "",
  raw_html_content: "",
  author_name: "Redaktion",
  seo_title: "",
  seo_description: "",
  featured_image_url: "",
  is_pinned: false,
  is_locked: false,
  is_answered: false,
  is_active: true,
  admin_notes: "",
  status: "published",
  category_id: null as string | null,
};

const EMPTY_CATEGORY = {
  name: "",
  slug: "",
  description: "",
  sort_order: 0,
  is_active: true,
};

// --- HELPER (Ausgelagert um Re-Renders zu verhindern) ---
const processImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file); // URL erstellen
    img.src = objectUrl;
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const TARGET_WIDTH = 1024;
      const TARGET_HEIGHT = 559;
      
      canvas.width = TARGET_WIDTH;
      canvas.height = TARGET_HEIGHT;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(objectUrl); // Cleanup
        reject(new Error("Canvas Context konnte nicht erstellt werden"));
        return;
      }

      const scale = Math.max(TARGET_WIDTH / img.width, TARGET_HEIGHT / img.height);
      const x = (TARGET_WIDTH / scale - img.width) / 2;
      const y = (TARGET_HEIGHT / scale - img.height) / 2;

      ctx.drawImage(img, x * scale, y * scale, img.width * scale, img.height * scale);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl); // WICHTIG: Speicher freigeben
          if (blob) resolve(blob);
          else reject(new Error("Bildkonvertierung fehlgeschlagen"));
        },
        "image/webp",
        0.85
      );
    };
    
    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl); // Cleanup bei Fehler
      reject(err);
    };
  });
};

export default function AdminForum() {
  const { data: threads, isLoading } = useForumThreads();
  const { data: allReplies } = useAllReplies();
  const { data: categories, isLoading: isCatsLoading } = useForumCategories(true);
  
  const createThread = useCreateThread();
  const updateThread = useUpdateThread();
  const deleteThread = useDeleteThread();
  const updateReply = useUpdateReply();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  // Thread state
  const [searchQuery, setSearchQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingThread, setEditingThread] = useState<Partial<ForumThread> | null>(null);
  const [editorMode, setEditorMode] = useState<"visual" | "code">("visual");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [formData, setFormData] = useState(EMPTY_THREAD);

  // Category state
  const [categoryEditorOpen, setCategoryEditorOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<ForumCategory> | null>(null);
  const [categoryFormData, setCategoryFormData] = useState(EMPTY_CATEGORY);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // MEMOIZED FILTERS (Verhindert Render-Loops)
  const filteredThreads = useMemo(() => {
    return threads?.filter(
      (t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.author_name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  }, [threads, searchQuery]);

  const pendingReplies = useMemo(() => {
    return allReplies?.filter((r) => !r.is_active && !r.is_spam) || [];
  }, [allReplies]);

  // ============ THREAD HANDLERS ============

  const handleNewThread = () => {
    setEditingThread(null);
    setFormData(EMPTY_THREAD);
    setEditorOpen(true);
  };

  const handleEditThread = (thread: ForumThread) => {
    setEditingThread(thread);
    setFormData({
      title: thread.title,
      slug: thread.slug,
      content: thread.content,
      raw_html_content: thread.raw_html_content || "",
      author_name: thread.author_name,
      seo_title: thread.seo_title || "",
      seo_description: thread.seo_description || "",
      featured_image_url: thread.featured_image_url || "",
      is_pinned: thread.is_pinned || false,
      is_locked: thread.is_locked || false,
      is_answered: thread.is_answered || false,
      is_active: thread.is_active !== false,
      admin_notes: thread.admin_notes || "",
      status: thread.status || "published",
      category_id: thread.category_id || null,
    });
    setEditorOpen(true);
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: !editingThread ? generateSlug(title) : prev.slug,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const processedBlob = await processImage(file);
      const processedFile = new File([processedBlob], "image.webp", { type: "image/webp" });
      const fileName = `forum-${Date.now()}.webp`; 

      const { error: uploadError } = await supabase.storage
        .from("forum-images")
        .upload(fileName, processedFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("forum-images")
        .getPublicUrl(fileName);

      setFormData((prev) => ({
        ...prev,
        featured_image_url: urlData.publicUrl,
      }));

      toast.success("Bild zugeschnitten & hochgeladen!");
    } catch (error) {
      console.error(error);
      toast.error("Fehler beim Bild-Upload");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSaveThread = async () => {
    if (!formData.title || !formData.content) {
      toast.error("Titel und Inhalt sind erforderlich");
      return;
    }

    try {
      if (editingThread?.id) {
        await updateThread.mutateAsync({
          id: editingThread.id,
          ...formData,
        });
        toast.success("Beitrag aktualisiert");
      } else {
        await createThread.mutateAsync(formData);
        toast.success("Beitrag erstellt");
      }
      setEditorOpen(false);
    } catch (error) {
      toast.error("Fehler beim Speichern");
    }
  };

  const handleDeleteThread = async () => {
    if (!threadToDelete) return;
    try {
      await deleteThread.mutateAsync(threadToDelete);
      toast.success("Beitrag gelöscht");
    } catch (error) {
      toast.error("Fehler beim Löschen");
    } finally {
      setDeleteDialogOpen(false);
      setThreadToDelete(null);
    }
  };

  // ============ CATEGORY HANDLERS ============

  const handleNewCategory = () => {
    setEditingCategory(null);
    setCategoryFormData(EMPTY_CATEGORY);
    setCategoryEditorOpen(true);
  };

  const handleEditCategory = (category: ForumCategory) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      sort_order: category.sort_order,
      is_active: category.is_active,
    });
    setCategoryEditorOpen(true);
  };

  const handleCategoryNameChange = (name: string) => {
    setCategoryFormData((prev) => ({
      ...prev,
      name,
      slug: !editingCategory ? generateSlug(name) : prev.slug,
    }));
  };

  const handleSaveCategory = async () => {
    if (!categoryFormData.name || !categoryFormData.slug) {
      toast.error("Name und Slug sind erforderlich");
      return;
    }

    try {
      if (editingCategory?.id) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          ...categoryFormData,
        });
        toast.success("Kategorie aktualisiert");
      } else {
        await createCategory.mutateAsync(categoryFormData);
        toast.success("Kategorie erstellt");
      }
      setCategoryEditorOpen(false);
    } catch (error) {
      toast.error("Fehler beim Speichern");
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory.mutateAsync(categoryToDelete);
      toast.success("Kategorie gelöscht");
    } catch (error) {
      toast.error("Fehler beim Löschen");
    } finally {
      setDeleteCategoryDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  // ============ REPLY HANDLERS ============

  const handleApproveReply = async (id: string) => {
    await updateReply.mutateAsync({ id, is_active: true });
    toast.success("Kommentar freigegeben");
  };

  const handleRejectReply = async (id: string) => {
    await updateReply.mutateAsync({ id, is_spam: true, is_active: false });
    toast.success("Kommentar als Spam markiert");
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId || !categories) return null;
    return categories.find((c) => c.id === categoryId)?.name || null;
  };

  // Wenn initial geladen wird, zeigen wir einen Loader um UI-Freeze zu vermeiden
  if (isLoading || isCatsLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="w-8 h-8" />
            Magazin Verwaltung
          </h1>
          <p className="text-muted-foreground">
            Beiträge erstellen, Kategorien verwalten und Kommentare moderieren
          </p>
        </div>
        <Button onClick={handleNewThread}>
          <Plus className="w-4 h-4 mr-2" />
          Neuer Beitrag
        </Button>
      </div>

      <Tabs defaultValue="threads">
        <TabsList>
          <TabsTrigger value="threads" className="gap-2">
            <FileText className="w-4 h-4" />
            Beiträge ({filteredThreads.length})
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <FolderOpen className="w-4 h-4" />
            Kategorien ({categories?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="moderation" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            Moderation
            {pendingReplies.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {pendingReplies.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Threads Tab */}
        <TabsContent value="threads" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Beiträge suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-3">
            {filteredThreads.map((thread) => (
              <Card key={thread.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {thread.is_pinned && (
                          <Pin className="w-3 h-3 text-secondary" />
                        )}
                        {thread.is_locked && (
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        )}
                        {thread.is_answered && (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        )}
                        {!thread.is_active && (
                          <Badge variant="outline">Entwurf</Badge>
                        )}
                        {thread.category_id && (
                          <Badge variant="secondary" className="text-xs">
                            {getCategoryName(thread.category_id)}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold truncate">{thread.title}</h3>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span>{thread.author_name}</span>
                        <span>{formatDate(thread.created_at || "")}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {thread.view_count || 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        title="Beitrag ansehen"
                      >
                        <a href={`/forum/${thread.slug}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 text-blue-500" />
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditThread(thread)}
                        title="Bearbeiten"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setThreadToDelete(thread.id);
                          setDeleteDialogOpen(true);
                        }}
                        title="Löschen"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredThreads.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Keine Beiträge gefunden</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleNewCategory}>
              <Plus className="w-4 h-4 mr-2" />
              Neue Kategorie
            </Button>
          </div>

          <div className="space-y-3">
            {categories?.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{category.name}</h3>
                        {!category.is_active && (
                          <Badge variant="outline">Inaktiv</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        /{category.slug} • Reihenfolge: {category.sort_order}
                      </p>
                      {category.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCategoryToDelete(category.id);
                          setDeleteCategoryDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {categories?.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Noch keine Kategorien</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Moderation Tab */}
        <TabsContent value="moderation" className="space-y-4">
          {pendingReplies.length > 0 ? (
            pendingReplies.map((reply: any) => (
              <Card key={reply.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">
                        Zu: {reply.forum_threads?.title || "Unbekannt"}
                      </p>
                      <p className="font-medium">{reply.author_name}</p>
                      <p className="text-muted-foreground mt-1">{reply.content}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveReply(reply.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Freigeben
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRejectReply(reply.id)}
                      >
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Spam
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Keine Kommentare zur Moderation
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Editor & Dialogs */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingThread ? "Beitrag bearbeiten" : "Neuer Beitrag"}
            </DialogTitle>
            <DialogDescription>
              Erstelle oder bearbeite Magazin-Beiträge mit SEO-Optimierung
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">SEO Suite</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>
                    Meta Title ({formData.seo_title?.length || 0}/60)
                  </Label>
                  <Input
                    value={formData.seo_title}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, seo_title: e.target.value }))
                    }
                    maxLength={60}
                    placeholder="SEO Titel für Suchergebnisse"
                  />
                  <div className="h-1 bg-muted rounded mt-1">
                    <div
                      className={`h-full rounded transition-all ${
                        (formData.seo_title?.length || 0) > 50
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          ((formData.seo_title?.length || 0) / 60) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label>
                    Meta Description ({formData.seo_description?.length || 0}/155)
                  </Label>
                  <Textarea
                    value={formData.seo_description}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        seo_description: e.target.value,
                      }))
                    }
                    maxLength={155}
                    rows={2}
                    placeholder="Beschreibung für Suchergebnisse"
                  />
                  <div className="h-1 bg-muted rounded mt-1">
                    <div
                      className={`h-full rounded transition-all ${
                        (formData.seo_description?.length || 0) > 120
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          ((formData.seo_description?.length || 0) / 155) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Titel *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Beitragstitel"
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, slug: e.target.value }))
                  }
                  placeholder="url-slug"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Autor</Label>
                <Input
                  value={formData.author_name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, author_name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Kategorie</Label>
                <Select
                  value={formData.category_id || "none"}
                  onValueChange={(value) =>
                    setFormData((p) => ({
                      ...p,
                      category_id: value === "none" ? null : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Keine Kategorie</SelectItem>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Featured Image (Auto-Crop 4:3)</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.featured_image_url}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        featured_image_url: e.target.value,
                      }))
                    }
                    placeholder="Bild-URL"
                    className="flex-1"
                    readOnly 
                  />
                  <Button variant="outline" asChild disabled={imageUploading}>
                    <label className="cursor-pointer">
                      {imageUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ImageIcon className="w-4 h-4" />
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Wird automatisch auf 800x600px zugeschnitten.
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Inhalt *</Label>
                <div className="flex gap-1">
                  <Button
                    variant={editorMode === "visual" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setEditorMode("visual")}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Visual
                  </Button>
                  <Button
                    variant={editorMode === "code" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setEditorMode("code")}
                  >
                    <Code className="w-4 h-4 mr-1" />
                    HTML
                  </Button>
                </div>
              </div>

              {editorMode === "visual" ? (
                <Textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, content: e.target.value }))
                  }
                  rows={10}
                  placeholder="Beitragsinhalt..."
                />
              ) : (
                <Textarea
                  value={formData.raw_html_content}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      raw_html_content: e.target.value,
                    }))
                  }
                  rows={10}
                  className="font-mono text-sm"
                  placeholder="<p>Raw HTML Content...</p>"
                />
              )}
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_pinned}
                  onCheckedChange={(v) =>
                    setFormData((p) => ({ ...p, is_pinned: v }))
                  }
                />
                <Label>Angepinnt</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_locked}
                  onCheckedChange={(v) =>
                    setFormData((p) => ({ ...p, is_locked: v }))
                  }
                />
                <Label>Geschlossen</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_answered}
                  onCheckedChange={(v) =>
                    setFormData((p) => ({ ...p, is_answered: v }))
                  }
                />
                <Label>Beantwortet</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(v) =>
                    setFormData((p) => ({ ...p, is_active: v }))
                  }
                />
                <Label>Veröffentlicht</Label>
              </div>
            </div>

            <div>
              <Label>Admin Notizen (intern)</Label>
              <Textarea
                value={formData.admin_notes}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, admin_notes: e.target.value }))
                }
                rows={2}
                placeholder="Interne Notizen..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setEditorOpen(false)}>
                Abbrechen
              </Button>
              <Button
                onClick={handleSaveThread}
                disabled={createThread.isPending || updateThread.isPending}
              >
                {createThread.isPending || updateThread.isPending
                  ? "Speichern..."
                  : "Speichern"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={categoryEditorOpen} onOpenChange={setCategoryEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Kategorie bearbeiten" : "Neue Kategorie"}
            </DialogTitle>
            <DialogDescription>
              Kategorien helfen beim Organisieren der Magazin-Beiträge
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={categoryFormData.name}
                onChange={(e) => handleCategoryNameChange(e.target.value)}
                placeholder="Kategoriename"
              />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input
                value={categoryFormData.slug}
                onChange={(e) =>
                  setCategoryFormData((p) => ({ ...p, slug: e.target.value }))
                }
                placeholder="url-slug"
              />
            </div>
            <div>
              <Label>Beschreibung</Label>
              <Textarea
                value={categoryFormData.description}
                onChange={(e) =>
                  setCategoryFormData((p) => ({ ...p, description: e.target.value }))
                }
                rows={2}
                placeholder="Kurze Beschreibung..."
              />
            </div>
            <div>
              <Label>Reihenfolge</Label>
              <Input
                type="number"
                value={categoryFormData.sort_order}
                onChange={(e) =>
                  setCategoryFormData((p) => ({
                    ...p,
                    sort_order: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={categoryFormData.is_active}
                onCheckedChange={(v) =>
                  setCategoryFormData((p) => ({ ...p, is_active: v }))
                }
              />
              <Label>Aktiv</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setCategoryEditorOpen(false)}>
                Abbrechen
              </Button>
              <Button
                onClick={handleSaveCategory}
                disabled={createCategory.isPending || updateCategory.isPending}
              >
                {createCategory.isPending || updateCategory.isPending
                  ? "Speichern..."
                  : "Speichern"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Beitrag löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Der Beitrag und
              alle zugehörigen Kommentare werden dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteThread}
              className="bg-destructive text-destructive-foreground"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteCategoryDialogOpen} onOpenChange={setDeleteCategoryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kategorie löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Die Kategorie
              wird dauerhaft gelöscht. Beiträge bleiben erhalten, verlieren aber
              ihre Kategorie-Zuordnung.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}