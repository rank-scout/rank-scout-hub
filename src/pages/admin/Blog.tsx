import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { 
  Plus, Pencil, Trash2, Eye, EyeOff, Star, Search, 
  FileText, Calendar, Clock, Image as ImageIcon, Save, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  useAllBlogPosts, 
  useCreateBlogPost, 
  useUpdateBlogPost, 
  useDeleteBlogPost,
  useTogglePublishBlogPost,
  BlogPost 
} from "@/hooks/useBlog";

const BLOG_CATEGORIES = [
  "Allgemein",
  "Markt-Analyse",
  "SEO & Traffic",
  "KI-Trends",
  "Dating-Tipps",
  "Produktvergleiche",
  "News",
];

const blogPostSchema = z.object({
  title: z.string().min(3, "Titel muss mindestens 3 Zeichen haben").max(100),
  slug: z.string().optional(),
  excerpt: z.string().max(300, "Excerpt max. 300 Zeichen").optional(),
  content: z.string().min(50, "Inhalt muss mindestens 50 Zeichen haben"),
  featured_image: z.string().url("Muss eine gültige URL sein").optional().or(z.literal("")),
  author_name: z.string().default("Redaktion"),
  category: z.string().default("Allgemein"),
  read_time: z.coerce.number().min(1).max(60).default(5),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(false),
  meta_title: z.string().max(60, "Meta-Title max. 60 Zeichen").optional(),
  meta_description: z.string().max(160, "Meta-Desc max. 160 Zeichen").optional(),
});

type BlogPostFormData = z.infer<typeof blogPostSchema>;

export default function AdminBlog() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");

  const { data: posts = [], isLoading } = useAllBlogPosts();
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const deletePost = useDeleteBlogPost();
  const togglePublish = useTogglePublishBlogPost();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      author_name: "Redaktion",
      category: "Allgemein",
      read_time: 5,
      is_featured: false,
      is_published: false,
    },
  });

  const watchTitle = watch("title", "");
  const watchMetaTitle = watch("meta_title", "");
  const watchMetaDesc = watch("meta_description", "");

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" ||
                          (filterStatus === "published" && post.is_published) ||
                          (filterStatus === "draft" && !post.is_published);
    return matchesSearch && matchesStatus;
  });

  const publishedCount = posts.filter(p => p.is_published).length;
  const draftCount = posts.filter(p => !p.is_published).length;
  const featuredCount = posts.filter(p => p.is_featured).length;

  function openCreateDialog() {
    setEditingPost(null);
    reset({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featured_image: "",
      author_name: "Redaktion",
      category: "Allgemein",
      read_time: 5,
      is_featured: false,
      is_published: false,
      meta_title: "",
      meta_description: "",
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(post: BlogPost) {
    setEditingPost(post);
    reset({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      featured_image: post.featured_image || "",
      author_name: post.author_name,
      category: post.category || "Allgemein",
      read_time: post.read_time || 5,
      is_featured: post.is_featured || false,
      is_published: post.is_published || false,
      meta_title: post.meta_title || "",
      meta_description: post.meta_description || "",
    });
    setIsDialogOpen(true);
  }

  async function onSubmit(data: BlogPostFormData) {
    try {
      if (editingPost) {
        await updatePost.mutateAsync({
          id: editingPost.id,
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          featured_image: data.featured_image,
          author_name: data.author_name,
          category: data.category,
          read_time: data.read_time,
          is_featured: data.is_featured,
          is_published: data.is_published,
          meta_title: data.meta_title,
          meta_description: data.meta_description,
          published_at: editingPost.published_at,
        });
        toast({ title: "Beitrag aktualisiert!" });
      } else {
        await createPost.mutateAsync({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          featured_image: data.featured_image,
          author_name: data.author_name,
          category: data.category,
          read_time: data.read_time,
          is_featured: data.is_featured,
          is_published: data.is_published,
          meta_title: data.meta_title,
          meta_description: data.meta_description,
        });
        toast({ title: "Beitrag erstellt!" });
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    }
  }

  async function handleDelete(id: string) {
    try {
      await deletePost.mutateAsync(id);
      toast({ title: "Beitrag gelöscht!" });
      setDeleteConfirm(null);
    } catch (error: any) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    }
  }

  async function handleTogglePublish(post: BlogPost) {
    try {
      await togglePublish.mutateAsync({ id: post.id, is_published: !post.is_published });
      toast({ title: post.is_published ? "Auf Entwurf gesetzt" : "Veröffentlicht!" });
    } catch (error: any) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Blog-Verwaltung</h1>
          <p className="text-muted-foreground text-sm">WordPress-Style Content Management</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="w-4 h-4" /> Neuer Beitrag
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Gesamt</CardDescription>
            <CardTitle className="text-3xl">{posts.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Veröffentlicht</CardDescription>
            <CardTitle className="text-3xl text-green-600">{publishedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Entwürfe</CardDescription>
            <CardTitle className="text-3xl text-orange-500">{draftCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Featured</CardDescription>
            <CardTitle className="text-3xl text-purple-600">{featuredCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Suche nach Titel oder Kategorie..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">Alle ({posts.length})</TabsTrigger>
            <TabsTrigger value="published">Live ({publishedCount})</TabsTrigger>
            <TabsTrigger value="draft">Entwürfe ({draftCount})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Posts Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Titel</TableHead>
              <TableHead>Kategorie</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Lade Beiträge...
                </TableCell>
              </TableRow>
            ) : filteredPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Keine Beiträge gefunden
                </TableCell>
              </TableRow>
            ) : (
              filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      {post.featured_image ? (
                        <img 
                          src={post.featured_image} 
                          alt="" 
                          className="w-12 h-12 object-cover rounded-lg bg-muted"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {post.title}
                          {post.is_featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3" /> {post.read_time} Min.
                          <span className="text-slate-300">•</span>
                          {post.author_name}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{post.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {post.is_published ? (
                      <Badge className="bg-green-500/10 text-green-600 border-green-200">
                        <Eye className="w-3 h-3 mr-1" /> Live
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <EyeOff className="w-3 h-3 mr-1" /> Entwurf
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {post.published_at 
                      ? format(new Date(post.published_at), "dd.MM.yy", { locale: de })
                      : format(new Date(post.created_at!), "dd.MM.yy", { locale: de })
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleTogglePublish(post)}
                        title={post.is_published ? "Auf Entwurf setzen" : "Veröffentlichen"}
                      >
                        {post.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(post)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteConfirm(post.id)}
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
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Beitrag bearbeiten" : "Neuer Beitrag"}</DialogTitle>
            <DialogDescription>
              WordPress-ähnlicher Editor für Blog-Beiträge
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content - 2 Columns */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <Label htmlFor="title">Titel *</Label>
                  <Input id="title" {...register("title")} placeholder="Dein aussagekräftiger Titel..." />
                  {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt / Teaser</Label>
                  <Textarea 
                    id="excerpt" 
                    {...register("excerpt")} 
                    placeholder="Kurze Zusammenfassung für die Vorschau..."
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{(watchMetaDesc || "").length}/300 Zeichen</p>
                </div>

                <div>
                  <Label htmlFor="content">Inhalt * (Markdown unterstützt)</Label>
                  <Textarea 
                    id="content" 
                    {...register("content")} 
                    placeholder="Dein ausführlicher Beitrag..."
                    rows={15}
                    className="font-mono text-sm"
                  />
                  {errors.content && <p className="text-sm text-destructive mt-1">{errors.content.message}</p>}
                </div>
              </div>

              {/* Sidebar - 1 Column */}
              <div className="space-y-6">
                {/* Publish Box */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Veröffentlichung</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is_published">Status</Label>
                      <div className="flex items-center gap-2">
                        <Switch 
                          id="is_published"
                          checked={watch("is_published")}
                          onCheckedChange={(v) => setValue("is_published", v)}
                        />
                        <span className="text-sm">{watch("is_published") ? "Live" : "Entwurf"}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is_featured">Featured</Label>
                      <Switch 
                        id="is_featured"
                        checked={watch("is_featured")}
                        onCheckedChange={(v) => setValue("is_featured", v)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Category & Author */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Kategorie</Label>
                      <Select 
                        value={watch("category")} 
                        onValueChange={(v) => setValue("category", v)}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {BLOG_CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="author_name">Autor</Label>
                      <Input id="author_name" {...register("author_name")} />
                    </div>
                    <div>
                      <Label htmlFor="read_time">Lesezeit (Min.)</Label>
                      <Input id="read_time" type="number" {...register("read_time")} min={1} max={60} />
                    </div>
                  </CardContent>
                </Card>

                {/* Featured Image */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Beitragsbild</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input 
                      {...register("featured_image")} 
                      placeholder="https://..." 
                    />
                    {watch("featured_image") && (
                      <img 
                        src={watch("featured_image")} 
                        alt="Preview" 
                        className="mt-2 w-full h-32 object-cover rounded-lg bg-muted"
                      />
                    )}
                  </CardContent>
                </Card>

                {/* SEO */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">SEO</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="meta_title">Meta Title</Label>
                      <Input id="meta_title" {...register("meta_title")} placeholder={watchTitle} />
                      <p className="text-xs text-muted-foreground mt-1">
                        {(watchMetaTitle || watchTitle || "").length}/60
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="meta_description">Meta Description</Label>
                      <Textarea id="meta_description" {...register("meta_description")} rows={2} />
                      <p className="text-xs text-muted-foreground mt-1">
                        {(watchMetaDesc || "").length}/160
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={createPost.isPending || updatePost.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {editingPost ? "Aktualisieren" : "Erstellen"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Beitrag löschen?</DialogTitle>
            <DialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Abbrechen</Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={deletePost.isPending}
            >
              Endgültig löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
