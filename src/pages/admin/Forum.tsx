import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { 
  Pin, PinOff, Lock, Unlock, Trash2, Eye, EyeOff, Search, Plus,
  MessageSquare, ChevronDown, ChevronRight, ArrowLeft, Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { 
  useAllThreads,
  useAllReplies,
  useTogglePinThread,
  useToggleLockThread,
  useToggleActiveThread,
  useDeleteThread,
  useUpdateThread,
  useDeleteReply,
  useToggleSpamReply,
  ForumThread,
} from "@/hooks/useForum";
import { ForumThreadEditor } from "@/components/admin/forum/ForumThreadEditor";
import { supabase } from "@/integrations/supabase/client";
import { generateSlug } from "@/lib/seo";

type ViewMode = "list" | "create" | "edit";

export default function AdminForum() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft" | "pinned" | "locked">("all");
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "thread" | "reply"; id: string } | null>(null);
  const [expandedThread, setExpandedThread] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data: threads = [], isLoading, refetch } = useAllThreads();
  const togglePin = useTogglePinThread();
  const toggleLock = useToggleLockThread();
  const toggleActive = useToggleActiveThread();
  const deleteThreadMutation = useDeleteThread();
  const updateThread = useUpdateThread();
  const deleteReplyMutation = useDeleteReply();
  const toggleSpam = useToggleSpamReply();

  // Find thread being edited
  const editingThread = editingThreadId ? threads.find(t => t.id === editingThreadId) : null;

  // Stats
  const totalThreads = threads.length;
  const publishedThreads = threads.filter(t => (t as any).status === "published" || t.is_active).length;
  const draftThreads = threads.filter(t => (t as any).status === "draft").length;
  const pinnedThreads = threads.filter(t => t.is_pinned).length;

  // Filter threads
  const filteredThreads = threads.filter(thread => {
    const matchesSearch = thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          thread.author_name.toLowerCase().includes(searchTerm.toLowerCase());
    const status = (thread as any).status || "published";
    const matchesFilter = filterStatus === "all" ||
                          (filterStatus === "published" && status === "published") ||
                          (filterStatus === "draft" && status === "draft") ||
                          (filterStatus === "pinned" && thread.is_pinned) ||
                          (filterStatus === "locked" && thread.is_locked);
    return matchesSearch && matchesFilter;
  });

  async function handleTogglePin(thread: ForumThread) {
    try {
      await togglePin.mutateAsync({ id: thread.id, is_pinned: !thread.is_pinned });
      toast({ title: thread.is_pinned ? "Thread gelöst" : "Thread angepinnt!" });
    } catch (error: any) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    }
  }

  async function handleToggleLock(thread: ForumThread) {
    try {
      await toggleLock.mutateAsync({ id: thread.id, is_locked: !thread.is_locked });
      toast({ title: thread.is_locked ? "Thread entsperrt" : "Thread gesperrt!" });
    } catch (error: any) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    }
  }

  async function handleToggleActive(thread: ForumThread) {
    try {
      await toggleActive.mutateAsync({ id: thread.id, is_active: !thread.is_active });
      toast({ title: thread.is_active ? "Thread versteckt" : "Thread sichtbar!" });
    } catch (error: any) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === "thread") {
        await deleteThreadMutation.mutateAsync(deleteConfirm.id);
        toast({ title: "Thread gelöscht!" });
      } else {
        await deleteReplyMutation.mutateAsync(deleteConfirm.id);
        toast({ title: "Antwort gelöscht!" });
      }
      setDeleteConfirm(null);
    } catch (error: any) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    }
  }

  async function handleSaveThread(data: any) {
    setIsSaving(true);
    try {
      if (viewMode === "create") {
        // Create new thread
        const slug = data.slug || generateSlug(data.title) + "-" + Date.now().toString(36);
        const { error } = await supabase.from("forum_threads").insert({
          title: data.title.trim(),
          slug,
          content: data.content.trim(),
          raw_html_content: data.raw_html_content || null,
          author_name: data.author_name.trim(),
          category_id: data.category_id || null,
          seo_title: data.seo_title || null,
          seo_description: data.seo_description || null,
          featured_image_url: data.featured_image_url || null,
          status: data.status,
          is_active: data.status === "published",
        });
        if (error) throw error;
        toast({ title: "Thread erstellt!" });
      } else if (viewMode === "edit" && editingThreadId) {
        // Update existing thread
        const { error } = await supabase.from("forum_threads")
          .update({
            title: data.title.trim(),
            slug: data.slug,
            content: data.content.trim(),
            raw_html_content: data.raw_html_content || null,
            author_name: data.author_name.trim(),
            category_id: data.category_id || null,
            seo_title: data.seo_title || null,
            seo_description: data.seo_description || null,
            featured_image_url: data.featured_image_url || null,
            status: data.status,
            is_active: data.status === "published",
          })
          .eq("id", editingThreadId);
        if (error) throw error;
        toast({ title: "Thread aktualisiert!" });
      }
      refetch();
      setViewMode("list");
      setEditingThreadId(null);
    } catch (error: any) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }

  function handleEditThread(thread: ForumThread) {
    setEditingThreadId(thread.id);
    setViewMode("edit");
  }

  // Editor View
  if (viewMode === "create" || viewMode === "edit") {
    const initialData = editingThread ? {
      title: editingThread.title,
      slug: editingThread.slug,
      content: editingThread.content,
      raw_html_content: (editingThread as any).raw_html_content || "",
      author_name: editingThread.author_name,
      seo_title: (editingThread as any).seo_title || "",
      seo_description: (editingThread as any).seo_description || "",
      featured_image_url: (editingThread as any).featured_image_url || "",
      category_id: editingThread.category_id,
      status: ((editingThread as any).status || "published") as "draft" | "published",
    } : undefined;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => { setViewMode("list"); setEditingThreadId(null); }}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {viewMode === "create" ? "Neuer Thread" : "Thread bearbeiten"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {viewMode === "create" ? "Erstelle einen neuen Forum-Beitrag" : editingThread?.title}
            </p>
          </div>
        </div>

        <ForumThreadEditor
          initialData={initialData}
          onSave={handleSaveThread}
          isLoading={isSaving}
        />
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Forum-Verwaltung</h1>
          <p className="text-muted-foreground text-sm">Threads erstellen und moderieren</p>
        </div>
        <Button onClick={() => setViewMode("create")} className="gap-2">
          <Plus className="w-4 h-4" /> Neuer Thread
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Gesamt</CardDescription>
            <CardTitle className="text-2xl">{totalThreads}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Veröffentlicht</CardDescription>
            <CardTitle className="text-2xl text-green-600">{publishedThreads}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Entwürfe</CardDescription>
            <CardTitle className="text-2xl text-amber-600">{draftThreads}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Gepinnt</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{pinnedThreads}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Suche nach Titel oder Autor..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">Alle</TabsTrigger>
            <TabsTrigger value="published">Live</TabsTrigger>
            <TabsTrigger value="draft">Entwurf</TabsTrigger>
            <TabsTrigger value="pinned">Gepinnt</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Threads Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead className="w-[40%]">Thread</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Erstellt</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Lade Threads...
                </TableCell>
              </TableRow>
            ) : filteredThreads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Keine Threads gefunden
                </TableCell>
              </TableRow>
            ) : (
              filteredThreads.map((thread) => {
                const status = (thread as any).status || "published";
                const featuredImage = (thread as any).featured_image_url;
                
                return (
                  <Collapsible key={thread.id} open={expandedThread === thread.id}>
                    <TableRow className={status === "draft" ? "opacity-70" : ""}>
                      <TableCell>
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => setExpandedThread(expandedThread === thread.id ? null : thread.id)}
                          >
                            {expandedThread === thread.id ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {featuredImage && (
                            <img 
                              src={featuredImage} 
                              alt="" 
                              className="w-12 h-8 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {thread.is_pinned && <Pin className="w-3 h-3 text-blue-500 flex-shrink-0" />}
                              {thread.is_locked && <Lock className="w-3 h-3 text-orange-500 flex-shrink-0" />}
                              <span className="font-medium truncate">{thread.title}</span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              /{thread.slug}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{thread.author_name}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {status === "published" ? (
                            <Badge className="bg-green-500/10 text-green-600 border-green-200">Live</Badge>
                          ) : (
                            <Badge variant="secondary">Entwurf</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {thread.created_at && format(new Date(thread.created_at), "dd.MM.yy", { locale: de })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditThread(thread)}
                            title="Bearbeiten"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleTogglePin(thread)}
                            title={thread.is_pinned ? "Lösen" : "Anpinnen"}
                          >
                            {thread.is_pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleToggleLock(thread)}
                            title={thread.is_locked ? "Entsperren" : "Sperren"}
                          >
                            {thread.is_locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleToggleActive(thread)}
                            title={thread.is_active ? "Verstecken" : "Anzeigen"}
                          >
                            {thread.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteConfirm({ type: "thread", id: thread.id })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <CollapsibleContent asChild>
                      <TableRow>
                        <TableCell colSpan={6} className="bg-muted/30 p-4">
                          <ThreadReplies 
                            threadId={thread.id} 
                            onDeleteReply={(id) => setDeleteConfirm({ type: "reply", id })}
                            onToggleSpam={async (id, is_spam) => {
                              await toggleSpam.mutateAsync({ id, is_spam });
                              toast({ title: is_spam ? "Als Spam markiert" : "Spam-Markierung entfernt" });
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteConfirm?.type === "thread" ? "Thread" : "Antwort"} löschen?
            </DialogTitle>
            <DialogDescription>
              {deleteConfirm?.type === "thread" 
                ? "Der Thread und alle Antworten werden permanent gelöscht."
                : "Die Antwort wird permanent gelöscht."
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Abbrechen</Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteThreadMutation.isPending || deleteReplyMutation.isPending}
            >
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Thread Replies Sub-Component
function ThreadReplies({ 
  threadId, 
  onDeleteReply,
  onToggleSpam 
}: { 
  threadId: string;
  onDeleteReply: (id: string) => void;
  onToggleSpam: (id: string, is_spam: boolean) => void;
}) {
  const { data: replies = [], isLoading } = useAllReplies(threadId);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Lade Antworten...</p>;
  }

  if (replies.length === 0) {
    return <p className="text-sm text-muted-foreground">Keine Antworten</p>;
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">{replies.length} Antworten</h4>
      {replies.map((reply) => (
        <div 
          key={reply.id} 
          className={`flex items-start gap-3 p-3 rounded-lg border ${reply.is_spam ? "bg-destructive/10 border-destructive/30" : "bg-background"}`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{reply.author_name}</span>
              {reply.is_spam && <Badge variant="destructive" className="text-xs">Spam</Badge>}
              {!reply.is_active && <Badge variant="secondary" className="text-xs">Versteckt</Badge>}
              <span className="text-xs text-muted-foreground">
                {reply.created_at && format(new Date(reply.created_at), "dd.MM.yy HH:mm", { locale: de })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{reply.content}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={() => onToggleSpam(reply.id, !reply.is_spam)}
              title={reply.is_spam ? "Kein Spam" : "Als Spam markieren"}
            >
              <MessageSquare className="w-3 h-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => onDeleteReply(reply.id)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
