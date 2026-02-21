import { useState } from "react";
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
import { useForumAds } from "@/hooks/useSettings"; 
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
  DollarSign, 
  Megaphone, 
  Link as LinkIcon,
  Search as SearchIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; 
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
  show_ad: true, 
  ad_type: "image",
  ad_image_url: "",
  ad_link_url: "",
  ad_html_code: "",
  ad_cta_text: "Jetzt ansehen",
};

const EMPTY_CATEGORY = {
  name: "",
  slug: "",
  description: "",
  sort_order: 0,
  is_active: true,
  seo_title: "",
  seo_description: "",
  ad_enabled: false,
  assigned_ad_id: "",
  ad_image_url: "",
  ad_link_url: "",
  ad_html_code: "", 
  ad_headline: "", 
  ad_subheadline: "", 
  ad_cta_text: "" 
};

export default function AdminForum() {
  // KYRA FIX: useForumThreads wird jetzt mit includeInactive=true aufgerufen!
  const { data: threads, isLoading } = useForumThreads(undefined, true);
  const { data: allReplies } = useAllReplies();
  const { data: categories } = useForumCategories(true);
  const adsPool = useForumAds(); 

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
  const [manualAdType, setManualAdType] = useState<"image" | "code">("image"); 

  const filteredThreads = threads?.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.author_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingReplies = allReplies?.filter((r) => !r.is_active && !r.is_spam);

  const processImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const TARGET_WIDTH = 1024;
        const TARGET_HEIGHT = 559;
        canvas.width = TARGET_WIDTH;
        canvas.height = TARGET_HEIGHT;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas Error")); return; }
        const scale = Math.max(TARGET_WIDTH / img.width, TARGET_HEIGHT / img.height);
        const x = (TARGET_WIDTH / scale - img.width) / 2;
        const y = (TARGET_HEIGHT / scale - img.height) / 2;
        ctx.drawImage(img, x * scale, y * scale, img.width * scale, img.height * scale);
        canvas.toBlob((blob) => { if (blob) resolve(blob); else reject(new Error("Error")); }, "image/webp", 0.85);
      };
      img.onerror = (err) => reject(err);
    });
  };

  const handleNewThread = () => { setEditingThread(null); setFormData(EMPTY_THREAD); setEditorOpen(true); };
  
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
      show_ad: (thread as any).show_ad ?? true,
      ad_type: (thread as any).ad_type || "image",
      ad_image_url: (thread as any).ad_image_url || "",
      ad_link_url: (thread as any).ad_link_url || "",
      ad_html_code: (thread as any).ad_html_code || "",
      ad_cta_text: (thread as any).ad_cta_text || "Jetzt ansehen",
    });
    setEditorOpen(true);
  };
  
  const handleTitleChange = (title: string) => { setFormData((prev) => ({ ...prev, title, slug: !editingThread ? generateSlug(title) : prev.slug, })); };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; setImageUploading(true);
    try {
      const processedBlob = await processImage(file);
      const processedFile = new File([processedBlob], "image.webp", { type: "image/webp" });
      const fileName = `forum-${Date.now()}.webp`;
      const { error: uploadError } = await supabase.storage.from("forum-images").upload(fileName, processedFile);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("forum-images").getPublicUrl(fileName);
      setFormData((prev) => ({ ...prev, featured_image_url: urlData.publicUrl, }));
      toast.success("Bild zugeschnitten & hochgeladen!");
    } catch (error) { toast.error("Fehler beim Bild-Upload"); } finally { setImageUploading(false); }
  };

  const handleSaveThread = async () => {
    if (!formData.title || !formData.content) { toast.error("Titel und Inhalt sind erforderlich"); return; }
    try {
      if (editingThread?.id) { 
          await updateThread.mutateAsync({ id: editingThread.id, ...formData, }); 
          toast.success("Beitrag aktualisiert"); 
      } else { 
          await createThread.mutateAsync(formData); 
          toast.success("Beitrag erstellt"); 
      }
      setEditorOpen(false);
    } catch (error: any) { 
        console.error(error);
        toast.error("Fehler beim Speichern: " + (error.message || "Datenbankfehler. Prüfe fehlende Spalten!")); 
    }
  };
  
  const handleDeleteThread = async () => { if (!threadToDelete) return; try { await deleteThread.mutateAsync(threadToDelete); toast.success("Beitrag gelöscht"); } catch (error) { toast.error("Fehler beim Löschen"); } finally { setDeleteDialogOpen(false); setThreadToDelete(null); } };

  const handleNewCategory = () => { 
      setEditingCategory(null); 
      setCategoryFormData(EMPTY_CATEGORY); 
      setManualAdType("image");
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
      seo_title: (category as any).seo_title || "",
      seo_description: (category as any).seo_description || "",
      ad_enabled: (category as any).ad_enabled || false,
      assigned_ad_id: (category as any).assigned_ad_id || "",
      ad_image_url: (category as any).ad_image_url || "",
      ad_link_url: (category as any).ad_link_url || "",
      ad_html_code: (category as any).ad_html_code || "",
      ad_headline: (category as any).ad_headline || "",
      ad_subheadline: (category as any).ad_subheadline || "",
      ad_cta_text: (category as any).ad_cta_text || "",
    });
    setManualAdType((category as any).ad_html_code ? "code" : "image");
    setCategoryEditorOpen(true);
  };
  const handleCategoryNameChange = (name: string) => { setCategoryFormData((prev) => ({ ...prev, name, slug: !editingCategory ? generateSlug(name) : prev.slug, })); };
  
  const handleSaveCategory = async () => {
    if (!categoryFormData.name || !categoryFormData.slug) { toast.error("Name und Slug sind erforderlich"); return; }
    try {
      if (editingCategory?.id) { await updateCategory.mutateAsync({ id: editingCategory.id, ...categoryFormData, }); toast.success("Kategorie aktualisiert"); } else { await createCategory.mutateAsync(categoryFormData); toast.success("Kategorie erstellt"); }
      setCategoryEditorOpen(false);
    } catch (error) { toast.error("Fehler beim Speichern"); }
  };
  const handleDeleteCategory = async () => { if (!categoryToDelete) return; try { await deleteCategory.mutateAsync(categoryToDelete); toast.success("Kategorie gelöscht"); } catch (error) { toast.error("Fehler beim Löschen"); } finally { setDeleteCategoryDialogOpen(false); setCategoryToDelete(null); } };

  const handleApproveReply = async (id: string) => { await updateReply.mutateAsync({ id, is_active: true }); toast.success("Kommentar freigegeben"); };
  const handleRejectReply = async (id: string) => { await updateReply.mutateAsync({ id, is_spam: true, is_active: false }); toast.success("Kommentar als Spam markiert"); };
  const formatDate = (d: string) => new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric", });
  const getCategoryName = (categoryId: string | null) => { if (!categoryId) return null; return categories?.find((c) => c.id === categoryId)?.name || null; };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold flex items-center gap-2"><BookOpen className="w-8 h-8" />Magazin Verwaltung</h1><p className="text-muted-foreground">Beiträge erstellen, Kategorien verwalten und Kommentare moderieren</p></div>
        <Button onClick={handleNewThread}><Plus className="w-4 h-4 mr-2" />Neuer Beitrag</Button>
      </div>

      <Tabs defaultValue="threads">
        <TabsList>
          <TabsTrigger value="threads" className="gap-2"><FileText className="w-4 h-4" />Beiträge ({threads?.length || 0})</TabsTrigger>
          <TabsTrigger value="categories" className="gap-2"><FolderOpen className="w-4 h-4" />Kategorien ({categories?.length || 0})</TabsTrigger>
          <TabsTrigger value="moderation" className="gap-2"><MessageCircle className="w-4 h-4" />Moderation {(pendingReplies?.length || 0) > 0 && (<Badge variant="destructive" className="ml-1">{pendingReplies?.length}</Badge>)}</TabsTrigger>
        </TabsList>

        <TabsContent value="threads" className="space-y-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Beiträge suchen..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
          {isLoading ? (<p>Laden...</p>) : (<div className="space-y-3">{filteredThreads?.map((thread) => (<Card key={thread.id} className="hover:shadow-md transition-shadow"><CardContent className="p-4"><div className="flex items-start justify-between gap-4"><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1 flex-wrap">{thread.is_pinned && (<Pin className="w-3 h-3 text-secondary" />)}{thread.is_locked && (<Lock className="w-3 h-3 text-muted-foreground" />)}{thread.is_answered && (<CheckCircle className="w-3 h-3 text-green-500" />)}{!thread.is_active && (<Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">Offline</Badge>)}{thread.category_id && (<Badge variant="secondary" className="text-xs">{getCategoryName(thread.category_id)}</Badge>)}</div><h3 className={`font-semibold truncate ${!thread.is_active ? 'text-muted-foreground' : ''}`}>{thread.title}</h3><div className="flex items-center gap-4 text-xs text-muted-foreground mt-1"><span>{thread.author_name}</span><span>{formatDate(thread.created_at || "")}</span><span className="flex items-center gap-1"><Eye className="w-3 h-3" />{thread.view_count || 0}</span></div></div><div className="flex gap-2"><Button variant="outline" size="sm" asChild title="Beitrag ansehen"><a href={`/forum/${thread.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4 text-blue-500" /></a></Button><Button variant="outline" size="sm" onClick={() => handleEditThread(thread)} title="Bearbeiten"><Edit className="w-4 h-4" /></Button><Button variant="outline" size="sm" onClick={() => { setThreadToDelete(thread.id); setDeleteDialogOpen(true); }} title="Löschen"><Trash2 className="w-4 h-4 text-destructive" /></Button></div></div></CardContent></Card>))}{filteredThreads?.length === 0 && (<Card><CardContent className="py-12 text-center"><FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Keine Beiträge gefunden</p></CardContent></Card>)}</div>)}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-end"><Button onClick={handleNewCategory}><Plus className="w-4 h-4 mr-2" />Neue Kategorie</Button></div>
          <div className="space-y-3">{categories?.map((category) => (<Card key={category.id} className="hover:shadow-md transition-shadow"><CardContent className="p-4"><div className="flex items-center justify-between gap-4"><div className="flex-1"><div className="flex items-center gap-2 mb-1"><h3 className="font-semibold">{category.name}</h3>{!category.is_active && (<Badge variant="outline">Inaktiv</Badge>)}{(category as any).ad_enabled && (<Badge variant="secondary" className="bg-green-100 text-green-700">Mit Werbung</Badge>)}</div><p className="text-sm text-muted-foreground">/{category.slug} • Reihenfolge: {category.sort_order}</p>{category.description && (<p className="text-sm text-muted-foreground mt-1">{category.description}</p>)}</div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => handleEditCategory(category)}><Edit className="w-4 h-4" /></Button><Button variant="outline" size="sm" onClick={() => { setCategoryToDelete(category.id); setDeleteCategoryDialogOpen(true); }}><Trash2 className="w-4 h-4 text-destructive" /></Button></div></div></CardContent></Card>))}{categories?.length === 0 && (<Card><CardContent className="py-12 text-center"><FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Noch keine Kategorien</p></CardContent></Card>)}</div>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-4">
          {pendingReplies && pendingReplies.length > 0 ? (pendingReplies.map((reply: any) => (<Card key={reply.id}><CardContent className="p-4"><div className="flex items-start justify-between gap-4"><div className="flex-1"><p className="text-sm text-muted-foreground mb-1">Zu: {reply.forum_threads?.title || "Unbekannt"}</p><p className="font-medium">{reply.author_name}</p><p className="text-muted-foreground mt-1">{reply.content}</p></div><div className="flex gap-2"><Button size="sm" onClick={() => handleApproveReply(reply.id)}><CheckCircle className="w-4 h-4 mr-1" />Freigeben</Button><Button variant="destructive" size="sm" onClick={() => handleRejectReply(reply.id)}><AlertTriangle className="w-4 h-4 mr-1" />Spam</Button></div></div></CardContent></Card>))) : (<Card><CardContent className="py-12 text-center"><CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" /><p className="text-muted-foreground">Keine Kommentare zur Moderation</p></CardContent></Card>)}
        </TabsContent>
      </Tabs>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader><DialogTitle>{editingThread ? "Beitrag bearbeiten" : "Neuer Beitrag"}</DialogTitle><DialogDescription>Erstelle oder bearbeite Magazin-Beiträge mit SEO-Optimierung</DialogDescription></DialogHeader>
          <div className="space-y-6">
            <Card><CardHeader className="pb-3"><CardTitle className="text-base">SEO Suite</CardTitle></CardHeader><CardContent className="space-y-4"><div><Label>Meta Title ({formData.seo_title?.length || 0}/60)</Label><Input value={formData.seo_title} onChange={(e) => setFormData((p) => ({ ...p, seo_title: e.target.value }))} maxLength={60} placeholder="SEO Titel für Suchergebnisse" /><div className="h-1 bg-muted rounded mt-1"><div className={`h-full rounded transition-all ${(formData.seo_title?.length || 0) > 50 ? "bg-green-500" : "bg-yellow-500"}`} style={{ width: `${Math.min(((formData.seo_title?.length || 0) / 60) * 100, 100)}%`, }} /></div></div><div><Label>Meta Description ({formData.seo_description?.length || 0}/155)</Label><Textarea value={formData.seo_description} onChange={(e) => setFormData((p) => ({ ...p, seo_description: e.target.value, }))} maxLength={155} rows={2} placeholder="Beschreibung für Suchergebnisse" /><div className="h-1 bg-muted rounded mt-1"><div className={`h-full rounded transition-all ${(formData.seo_description?.length || 0) > 120 ? "bg-green-500" : "bg-yellow-500"}`} style={{ width: `${Math.min(((formData.seo_description?.length || 0) / 155) * 100, 100)}%`, }} /></div></div></CardContent></Card>
            <div className="grid md:grid-cols-2 gap-4"><div><Label>Titel *</Label><Input value={formData.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Beitragstitel" /></div><div><Label>Slug</Label><Input value={formData.slug} onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))} placeholder="url-slug" /></div></div>
            <div className="grid md:grid-cols-3 gap-4"><div><Label>Autor</Label><Input value={formData.author_name} onChange={(e) => setFormData((p) => ({ ...p, author_name: e.target.value }))} /></div><div><Label>Kategorie</Label><Select value={formData.category_id || "none"} onValueChange={(value) => setFormData((p) => ({ ...p, category_id: value === "none" ? null : value, }))}><SelectTrigger><SelectValue placeholder="Kategorie wählen" /></SelectTrigger><SelectContent><SelectItem value="none">Keine Kategorie</SelectItem>{categories?.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent></Select></div><div><Label>Featured Image (Auto-Crop 4:3)</Label><div className="flex gap-2"><Input value={formData.featured_image_url} onChange={(e) => setFormData((p) => ({ ...p, featured_image_url: e.target.value, }))} placeholder="Bild-URL" className="flex-1" readOnly /><Button variant="outline" asChild disabled={imageUploading}><label className="cursor-pointer">{imageUploading ? (<Loader2 className="w-4 h-4 animate-spin" />) : (<ImageIcon className="w-4 h-4" />)}<input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} /></label></Button></div><p className="text-xs text-muted-foreground mt-1">Wird automatisch auf 800x600px zugeschnitten.</p></div></div>
            <div><div className="flex items-center justify-between mb-2"><Label>Inhalt *</Label><div className="flex gap-1"><Button variant={editorMode === "visual" ? "secondary" : "ghost"} size="sm" onClick={() => setEditorMode("visual")}><FileText className="w-4 h-4 mr-1" />Visual</Button><Button variant={editorMode === "code" ? "secondary" : "ghost"} size="sm" onClick={() => setEditorMode("code")}><Code className="w-4 h-4 mr-1" />HTML</Button></div></div>{editorMode === "visual" ? (<Textarea value={formData.content} onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))} rows={10} placeholder="Beitragsinhalt..." />) : (<Textarea value={formData.raw_html_content} onChange={(e) => setFormData((p) => ({ ...p, raw_html_content: e.target.value, }))} rows={10} className="font-mono text-sm" placeholder="<p>Raw HTML Content...</p>" />)}</div>
            
            <div className="flex flex-wrap gap-6 items-center border-t pt-4">
                <div className="flex items-center gap-2"><Switch checked={formData.is_pinned} onCheckedChange={(v) => setFormData((p) => ({ ...p, is_pinned: v }))} /><Label>Angepinnt</Label></div>
                <div className="flex items-center gap-2"><Switch checked={formData.is_locked} onCheckedChange={(v) => setFormData((p) => ({ ...p, is_locked: v }))} /><Label>Geschlossen</Label></div>
                <div className="flex items-center gap-2"><Switch checked={formData.is_answered} onCheckedChange={(v) => setFormData((p) => ({ ...p, is_answered: v }))} /><Label>Beantwortet</Label></div>
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200"><Switch checked={formData.is_active} onCheckedChange={(v) => setFormData((p) => ({ ...p, is_active: v }))} className="data-[state=checked]:bg-emerald-500" /><Label className="font-bold text-slate-800">Veröffentlicht / Online</Label></div>
                
                <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full border border-orange-200">
                    <Megaphone className="w-4 h-4 text-orange-600" />
                    <Switch checked={formData.show_ad} onCheckedChange={(v) => setFormData((p) => ({ ...p, show_ad: v }))} className="data-[state=checked]:bg-orange-600" />
                    <Label className="text-orange-900 font-bold cursor-pointer">Werbung anzeigen</Label>
                </div>
            </div>

            {formData.show_ad && (
                <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Label className="font-bold text-orange-800">Werbe-Inhalt konfigurieren</Label>
                    </div>

                    <RadioGroup 
                        value={formData.ad_type || "image"} 
                        onValueChange={(v) => setFormData(p => ({...p, ad_type: v}))} 
                        className="flex gap-4 mb-4"
                    >
                        <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded border shadow-sm">
                            <RadioGroupItem value="image" id="t_img" />
                            <Label htmlFor="t_img" className="flex items-center gap-2 cursor-pointer"><ImageIcon className="w-3 h-3"/> Bild & Link</Label>
                        </div>
                        <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded border shadow-sm">
                            <RadioGroupItem value="code" id="t_code" />
                            <Label htmlFor="t_code" className="flex items-center gap-2 cursor-pointer"><Code className="w-3 h-3"/> HTML / Script</Label>
                        </div>
                    </RadioGroup>

                    {formData.ad_type === 'image' ? (
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label>Bild URL</Label>
                                <div className="flex gap-2">
                                    <Input value={formData.ad_image_url} onChange={(e) => setFormData(p => ({...p, ad_image_url: e.target.value}))} placeholder="https://..." />
                                </div>
                            </div>
                            <div>
                                <Label>Ziel-Link</Label>
                                <div className="flex gap-2">
                                    <LinkIcon className="w-4 h-4 text-muted-foreground mt-3" />
                                    <Input value={formData.ad_link_url} onChange={(e) => setFormData(p => ({...p, ad_link_url: e.target.value}))} placeholder="https://dein-angebot.de" />
                                </div>
                            </div>
                            <div>
                                <Label>Button Text (CTA)</Label>
                                <Input value={formData.ad_cta_text} onChange={(e) => setFormData(p => ({...p, ad_cta_text: e.target.value}))} placeholder="Jetzt ansehen" />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <Label>HTML / JS Code</Label>
                            <Textarea 
                                value={formData.ad_html_code} 
                                onChange={(e) => setFormData(p => ({...p, ad_html_code: e.target.value}))} 
                                rows={4} 
                                className="font-mono text-xs bg-slate-900 text-green-400"
                                placeholder="<script>...</script>" 
                            />
                            <p className="text-xs text-muted-foreground mt-1">Vorsicht bei Scripts. Nur vertrauenswürdige Quellen nutzen.</p>
                        </div>
                    )}
                </div>
            )}

            <div><Label>Admin Notizen (intern)</Label><Textarea value={formData.admin_notes} onChange={(e) => setFormData((p) => ({ ...p, admin_notes: e.target.value }))} rows={2} placeholder="Interne Notizen..." /></div>
            <div className="flex justify-end gap-2 pt-4 border-t"><Button variant="outline" onClick={() => setEditorOpen(false)}>Abbrechen</Button><Button onClick={handleSaveThread} disabled={createThread.isPending || updateThread.isPending}>{createThread.isPending || updateThread.isPending ? "Speichern..." : "Speichern"}</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={categoryEditorOpen} onOpenChange={setCategoryEditorOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingCategory ? "Kategorie bearbeiten" : "Neue Kategorie"}</DialogTitle><DialogDescription>Kategorien helfen beim Organisieren der Magazin-Beiträge</DialogDescription></DialogHeader>
          <Tabs defaultValue="basic">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basisdaten</TabsTrigger>
              <TabsTrigger value="seo" className="text-blue-700 bg-blue-50"><SearchIcon className="w-4 h-4 mr-2"/> SEO</TabsTrigger>
              <TabsTrigger value="ads" className="text-green-700 bg-green-50"><DollarSign className="w-4 h-4 mr-2"/> Werbung</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 pt-4">
                <div><Label>Name *</Label><Input value={categoryFormData.name} onChange={(e) => handleCategoryNameChange(e.target.value)} placeholder="Kategoriename" /></div>
                <div><Label>Slug *</Label><Input value={categoryFormData.slug} onChange={(e) => setCategoryFormData((p) => ({ ...p, slug: e.target.value }))} placeholder="url-slug" /></div>
                <div><Label>Beschreibung (intern & Frontend)</Label><Textarea value={categoryFormData.description} onChange={(e) => setCategoryFormData((p) => ({ ...p, description: e.target.value }))} rows={2} placeholder="Kurze Beschreibung..." /></div>
                <div><Label>Reihenfolge</Label><Input type="number" value={categoryFormData.sort_order} onChange={(e) => setCategoryFormData((p) => ({ ...p, sort_order: parseInt(e.target.value) || 0, }))} /></div>
                <div className="flex items-center gap-2"><Switch checked={categoryFormData.is_active} onCheckedChange={(v) => setCategoryFormData((p) => ({ ...p, is_active: v }))} /><Label>Aktiv</Label></div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4 pt-4">
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-base">Kategorie SEO Einstellungen</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Meta Title ({categoryFormData.seo_title?.length || 0}/60)</Label>
                            <Input 
                                value={categoryFormData.seo_title} 
                                onChange={(e) => setCategoryFormData((p) => ({ ...p, seo_title: e.target.value }))} 
                                maxLength={60} 
                                placeholder="z.B. Beste Dating Apps 2026 im Vergleich" 
                            />
                            <div className="h-1 bg-muted rounded mt-1">
                                <div 
                                    className={`h-full rounded transition-all ${(categoryFormData.seo_title?.length || 0) > 40 && (categoryFormData.seo_title?.length || 0) <= 60 ? "bg-green-500" : "bg-yellow-500"}`} 
                                    style={{ width: `${Math.min(((categoryFormData.seo_title?.length || 0) / 60) * 100, 100)}%`, }} 
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Meta Description ({categoryFormData.seo_description?.length || 0}/155)</Label>
                            <Textarea 
                                value={categoryFormData.seo_description} 
                                onChange={(e) => setCategoryFormData((p) => ({ ...p, seo_description: e.target.value, }))} 
                                maxLength={155} 
                                rows={3} 
                                placeholder="z.B. Vergleiche jetzt die besten Anbieter und finde deinen Testsieger..." 
                            />
                            <div className="h-1 bg-muted rounded mt-1">
                                <div 
                                    className={`h-full rounded transition-all ${(categoryFormData.seo_description?.length || 0) > 120 && (categoryFormData.seo_description?.length || 0) <= 155 ? "bg-green-500" : "bg-yellow-500"}`} 
                                    style={{ width: `${Math.min(((categoryFormData.seo_description?.length || 0) / 155) * 100, 100)}%`, }} 
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="ads" className="space-y-4 pt-4">
                <div className="bg-slate-50 p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-4">
                        <Label className="font-bold text-base">Werbung für diese Kategorie aktivieren</Label>
                        <Switch checked={categoryFormData.ad_enabled} onCheckedChange={(v) => setCategoryFormData((p) => ({ ...p, ad_enabled: v }))} />
                    </div>
                    
                    {categoryFormData.ad_enabled && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="bg-white p-3 rounded border border-blue-200">
                                <Label className="text-blue-600 font-bold mb-1 block">Verknüpfter Banner (aus Pool)</Label>
                                <Select 
                                    value={categoryFormData.assigned_ad_id || "none"} 
                                    onValueChange={(val) => setCategoryFormData(p => ({...p, assigned_ad_id: val === "none" ? "" : val}))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Wähle einen Banner..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">-- Keine Verknüpfung (Manuell) --</SelectItem>
                                        {adsPool.map(ad => (
                                            <SelectItem key={ad.id} value={ad.id}>
                                                {ad.name} ({ad.type})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">Wenn ausgewählt, werden die manuellen Felder unten ignoriert.</p>
                            </div>

                            <div className={`space-y-4 ${categoryFormData.assigned_ad_id ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                                <div className="flex items-center gap-2 my-2">
                                    <div className="h-px bg-slate-300 flex-1"></div>
                                    <span className="text-xs text-slate-400 font-bold">ODER MANUELL</span>
                                    <div className="h-px bg-slate-300 flex-1"></div>
                                </div>

                                <RadioGroup 
                                    value={manualAdType} 
                                    onValueChange={(v: "image" | "code") => setManualAdType(v)} 
                                    className="flex gap-4 mb-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="image" id="m1" />
                                        <Label htmlFor="m1">Bild & Text</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="code" id="m2" />
                                        <Label htmlFor="m2">HTML Code</Label>
                                    </div>
                                </RadioGroup>

                                {manualAdType === 'image' ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><Label>Bild URL</Label><Input value={categoryFormData.ad_image_url} onChange={(e) => setCategoryFormData(p => ({...p, ad_image_url: e.target.value}))} placeholder="https://..." /></div>
                                            <div><Label>Ziel Link</Label><Input value={categoryFormData.ad_link_url} onChange={(e) => setCategoryFormData(p => ({...p, ad_link_url: e.target.value}))} placeholder="/ziel oder https://..." /></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><Label>Headline (Overlay)</Label><Input value={categoryFormData.ad_headline} onChange={(e) => setCategoryFormData(p => ({...p, ad_headline: e.target.value}))} /></div>
                                            <div><Label>Subheadline</Label><Input value={categoryFormData.ad_subheadline} onChange={(e) => setCategoryFormData(p => ({...p, ad_subheadline: e.target.value}))} /></div>
                                        </div>
                                        <div><Label>Button Text</Label><Input value={categoryFormData.ad_cta_text} onChange={(e) => setCategoryFormData(p => ({...p, ad_cta_text: e.target.value}))} /></div>
                                    </div>
                                ) : (
                                    <div>
                                        <Label>HTML / Script Code</Label>
                                        <Textarea 
                                            value={categoryFormData.ad_html_code} 
                                            onChange={(e) => setCategoryFormData(p => ({...p, ad_html_code: e.target.value}))} 
                                            rows={6}
                                            className="font-mono text-xs"
                                            placeholder="<script>...</script>" 
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setCategoryEditorOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSaveCategory} disabled={createCategory.isPending || updateCategory.isPending}>{createCategory.isPending || updateCategory.isPending ? "Speichern..." : "Speichern"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Beitrag löschen?</AlertDialogTitle><AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden. Der Beitrag und alle zugehörigen Kommentare werden dauerhaft gelöscht.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Abbrechen</AlertDialogCancel><AlertDialogAction onClick={handleDeleteThread} className="bg-destructive text-destructive-foreground">Löschen</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <AlertDialog open={deleteCategoryDialogOpen} onOpenChange={setDeleteCategoryDialogOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Kategorie löschen?</AlertDialogTitle><AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden. Die Kategorie wird dauerhaft gelöscht.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Abbrechen</AlertDialogCancel><AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive text-destructive-foreground">Löschen</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}