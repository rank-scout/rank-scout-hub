import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { 
  Pin, PinOff, Lock, Unlock, Trash2, Eye, EyeOff, Search, Plus,
  MessageSquare, AlertTriangle, ChevronDown, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { 
  useAllThreads,
  useAllReplies,
  useCreateThread,
  useTogglePinThread,
  useToggleLockThread,
  useToggleActiveThread,
  useDeleteThread,
  useUpdateThread,
  useDeleteReply,
  useToggleSpamReply,
  ForumThread,
  ForumReply
} from "@/hooks/useForum";

export default function AdminForum() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pinned" | "locked" | "hidden">("all");
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "thread" | "reply"; id: string } | null>(null);
  const [editThread, setEditThread] = useState<ForumThread | null>(null);
  const [expandedThread, setExpandedThread] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newThread, setNewThread] = useState({ title: "", content: "", author_name: "Redaktion" });

  const { data: threads = [], isLoading } = useAllThreads();
  const createThread = useCreateThread();
  const togglePin = useTogglePinThread();
  const toggleLock = useToggleLockThread();
  const toggleActive = useToggleActiveThread();
  const deleteThreadMutation = useDeleteThread();
  const updateThread = useUpdateThread();
  const deleteReplyMutation = useDeleteReply();
  const toggleSpam = useToggleSpamReply();

  // Stats
  const totalThreads = threads.length;
  const activeThreads = threads.filter(t => t.is_active).length;
  const pinnedThreads = threads.filter(t => t.is_pinned).length;
  const lockedThreads = threads.filter(t => t.is_locked).length;
  const totalReplies = threads.reduce((sum, t) => sum + (t.view_count || 0), 0); // approximation

  // Filter threads
  const filteredThreads = threads.filter(thread => {
    const matchesSearch = thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          thread.author_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" ||
                          (filterStatus === "pinned" && thread.is_pinned) ||
                          (filterStatus === "locked" && thread.is_locked) ||
                          (filterStatus === "hidden" && !thread.is_active);
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

  async function handleCreateThread() {
    if (!newThread.title.trim() || !newThread.content.trim()) {
      toast({ title: "Fehler", description: "Titel und Inhalt sind erforderlich", variant: "destructive" });
      return;
    }
    try {
      await createThread.mutateAsync({
        title: newThread.title,
        content: newThread.content,
        author_name: newThread.author_name || "Redaktion",
      });
      toast({ title: "Thread erstellt!" });
      setNewThread({ title: "", content: "", author_name: "Redaktion" });
      setIsCreateOpen(false);
    } catch (error: any) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    }
  }

  async function handleUpdateThread() {
    if (!editThread) return;
    try {
      await updateThread.mutateAsync({
        id: editThread.id,
        title: editThread.title,
        content: editThread.content,
        admin_notes: editThread.admin_notes,
      });
      toast({ title: "Thread aktualisiert!" });
      setEditThread(null);
    } catch (error: any) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Forum-Moderation</h1>
          <p className="text-muted-foreground text-sm">Threads und Antworten verwalten</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Neuer Thread
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Threads</CardDescription>
            <CardTitle className="text-2xl">{totalThreads}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aktiv</CardDescription>
            <CardTitle className="text-2xl text-green-600">{activeThreads}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Gepinnt</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{pinnedThreads}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Gesperrt</CardDescription>
            <CardTitle className="text-2xl text-orange-500">{lockedThreads}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Views</CardDescription>
            <CardTitle className="text-2xl text-purple-600">{totalReplies}</CardTitle>
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
            <TabsTrigger value="pinned">Gepinnt</TabsTrigger>
            <TabsTrigger value="locked">Gesperrt</TabsTrigger>
            <TabsTrigger value="hidden">Versteckt</TabsTrigger>
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
              filteredThreads.map((thread) => (
                <Collapsible key={thread.id} open={expandedThread === thread.id}>
                  <TableRow className={!thread.is_active ? "opacity-50" : ""}>
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
                      <div className="flex items-center gap-2">
                        {thread.is_pinned && <Pin className="w-4 h-4 text-blue-500" />}
                        {thread.is_locked && <Lock className="w-4 h-4 text-orange-500" />}
                        <span className="font-medium">{thread.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {thread.content.substring(0, 80)}...
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{thread.author_name}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {thread.is_active ? (
                          <Badge className="bg-green-500/10 text-green-600 border-green-200">Aktiv</Badge>
                        ) : (
                          <Badge variant="secondary">Versteckt</Badge>
                        )}
                        {thread.is_answered && (
                          <Badge className="bg-purple-500/10 text-purple-600 border-purple-200">Beantwortet</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {thread.created_at && format(new Date(thread.created_at), "dd.MM.yy HH:mm", { locale: de })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
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
                          onClick={() => setEditThread(thread)}
                          title="Bearbeiten"
                        >
                          <MessageSquare className="w-4 h-4" />
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
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Edit Thread Dialog */}
      <Dialog open={!!editThread} onOpenChange={() => setEditThread(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thread bearbeiten</DialogTitle>
          </DialogHeader>
          {editThread && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Titel</label>
                <Input 
                  value={editThread.title}
                  onChange={(e) => setEditThread({ ...editThread, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Inhalt</label>
                <Textarea 
                  value={editThread.content}
                  onChange={(e) => setEditThread({ ...editThread, content: e.target.value })}
                  rows={6}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Admin-Notizen (nur intern)</label>
                <Textarea 
                  value={editThread.admin_notes || ""}
                  onChange={(e) => setEditThread({ ...editThread, admin_notes: e.target.value })}
                  rows={3}
                  placeholder="Interne Notizen zur Moderation..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditThread(null)}>Abbrechen</Button>
            <Button onClick={handleUpdateThread} disabled={updateThread.isPending}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              Endgültig löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Thread Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Neuer Forum-Thread</DialogTitle>
            <DialogDescription>Erstelle einen neuen Beitrag als Redaktion</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="thread-title">Titel *</Label>
              <Input 
                id="thread-title"
                value={newThread.title}
                onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                placeholder="Frage oder Diskussionsthema..."
              />
            </div>
            <div>
              <Label htmlFor="thread-content">Inhalt *</Label>
              <Textarea 
                id="thread-content"
                value={newThread.content}
                onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                placeholder="Dein ausführlicher Beitrag..."
                rows={6}
              />
            </div>
            <div>
              <Label htmlFor="thread-author">Autor</Label>
              <Input 
                id="thread-author"
                value={newThread.author_name}
                onChange={(e) => setNewThread({ ...newThread, author_name: e.target.value })}
                placeholder="Redaktion"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Abbrechen</Button>
            <Button onClick={handleCreateThread} disabled={createThread.isPending}>
              Thread erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sub-component for thread replies
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
      <h4 className="text-sm font-medium">Antworten ({replies.length})</h4>
      {replies.map((reply) => (
        <div 
          key={reply.id} 
          className={`p-3 bg-background rounded-lg border ${reply.is_spam ? "border-red-200 bg-red-50" : ""}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{reply.author_name}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground text-xs">
                  {reply.created_at && format(new Date(reply.created_at), "dd.MM.yy HH:mm", { locale: de })}
                </span>
                {reply.is_spam && (
                  <Badge variant="destructive" className="text-xs">Spam</Badge>
                )}
                {!reply.is_active && !reply.is_spam && (
                  <Badge variant="secondary" className="text-xs">Versteckt</Badge>
                )}
              </div>
              <p className="text-sm mt-1">{reply.content}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={() => onToggleSpam(reply.id, !reply.is_spam)}
                title={reply.is_spam ? "Kein Spam" : "Als Spam markieren"}
              >
                <AlertTriangle className={`w-4 h-4 ${reply.is_spam ? "text-red-500" : ""}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => onDeleteReply(reply.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
