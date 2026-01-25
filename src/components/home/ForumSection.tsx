import { useState } from "react";
import { useLatestThreads, useThreadReplies, useCreateThread, useCreateReply, type ForumThread } from "@/hooks/useForum";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { MessageSquarePlus, MessageCircle, Clock, User, Pin, Loader2, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { ForumJsonLd } from "@/components/seo/JsonLdSchema";

export function ForumSection() {
  const { data: threads = [], isLoading } = useLatestThreads(5);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      {/* JSON-LD Schema */}
      <ForumJsonLd threads={threads} />
      
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display font-bold text-3xl text-foreground mb-2">
                Community Forum
              </h2>
              <p className="text-muted-foreground">
                Stellen Sie Fragen, teilen Sie Erfahrungen und helfen Sie anderen.
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500">
                  <MessageSquarePlus className="w-4 h-4" />
                  Frage stellen
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-display">Neue Frage stellen</DialogTitle>
                </DialogHeader>
                <CreateThreadForm onSuccess={() => setIsDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Threads List */}
          {threads.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border border-border">
              <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Noch keine Fragen</h3>
              <p className="text-muted-foreground mb-4">Sei der Erste und stelle eine Frage!</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-3">
              {threads.map((thread) => (
                <ThreadItem key={thread.id} thread={thread} />
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </section>
  );
}

function ThreadItem({ thread }: { thread: ForumThread }) {
  const { data: replies = [], isLoading: repliesLoading } = useThreadReplies(thread.id);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(thread.created_at), {
    addSuffix: true,
    locale: de,
  });

  return (
    <AccordionItem
      value={thread.id}
      className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <AccordionTrigger className="px-6 py-4 hover:no-underline [&[data-state=open]]:bg-muted/50">
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 mb-1">
            {thread.is_pinned && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Pin className="w-3 h-3" />
                Gepinnt
              </Badge>
            )}
            <h3 className="font-medium text-foreground">{thread.title}</h3>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {thread.author_name}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {replies.length} Antworten
            </span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-4">
        {/* Thread Content */}
        <div className="prose prose-sm prose-invert max-w-none mb-6 p-4 bg-muted/30 rounded-lg">
          <p className="text-foreground whitespace-pre-wrap">{thread.content}</p>
        </div>

        {/* Replies */}
        {repliesLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : replies.length > 0 ? (
          <div className="space-y-3 mb-4">
            <h4 className="text-sm font-medium text-muted-foreground">Antworten ({replies.length})</h4>
            {replies.map((reply) => (
              <div key={reply.id} className="pl-4 border-l-2 border-primary/30">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <User className="w-3 h-3" />
                  <span className="font-medium">{reply.author_name}</span>
                  <span>•</span>
                  <span>
                    {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true, locale: de })}
                  </span>
                </div>
                <p className="text-sm text-foreground">{reply.content}</p>
              </div>
            ))}
          </div>
        ) : null}

        {/* Reply Form Toggle */}
        {showReplyForm ? (
          <ReplyForm threadId={thread.id} onCancel={() => setShowReplyForm(false)} />
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReplyForm(true)}
            className="gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Antworten
          </Button>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

function CreateThreadForm({ onSuccess }: { onSuccess: () => void }) {
  const createThread = useCreateThread();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Spam protection

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check
    if (honeypot) return;

    if (title.length < 3 || content.length < 10 || authorName.length < 2) {
      toast({ title: "Bitte alle Felder ausfüllen", variant: "destructive" });
      return;
    }

    try {
      await createThread.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        author_name: authorName.trim(),
        category_id: null,
      });
      toast({ title: "Frage erfolgreich gestellt!" });
      onSuccess();
    } catch (error) {
      toast({ title: "Fehler beim Erstellen", variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot field - hidden from users */}
      <input
        type="text"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="absolute -left-[9999px]"
        tabIndex={-1}
        autoComplete="off"
      />

      <div>
        <Label htmlFor="title">Titel (max. 60 Zeichen)</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 60))}
          placeholder="Kurze, prägnante Frage..."
          maxLength={60}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">{title.length}/60</p>
      </div>

      <div>
        <Label htmlFor="content">Ihre Frage</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Beschreiben Sie Ihre Frage ausführlich..."
          rows={4}
          maxLength={5000}
          required
        />
      </div>

      <div>
        <Label htmlFor="author">Ihr Name</Label>
        <Input
          id="author"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value.slice(0, 50))}
          placeholder="Max Mustermann"
          maxLength={50}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={createThread.isPending}>
        {createThread.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : null}
        Frage veröffentlichen
      </Button>
    </form>
  );
}

function ReplyForm({ threadId, onCancel }: { threadId: string; onCancel: () => void }) {
  const createReply = useCreateReply();
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (content.length < 5 || authorName.length < 2) {
      toast({ title: "Bitte alle Felder ausfüllen", variant: "destructive" });
      return;
    }

    try {
      await createReply.mutateAsync({
        thread_id: threadId,
        content: content.trim(),
        author_name: authorName.trim(),
      });
      toast({ title: "Antwort veröffentlicht!" });
      setContent("");
      setAuthorName("");
      onCancel();
    } catch (error) {
      toast({ title: "Fehler beim Antworten", variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-muted/30 rounded-lg">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Ihre Antwort..."
        rows={3}
        maxLength={2000}
        required
      />
      <div className="flex gap-3">
        <Input
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value.slice(0, 50))}
          placeholder="Ihr Name"
          maxLength={50}
          className="max-w-[200px]"
          required
        />
        <Button type="submit" size="sm" disabled={createReply.isPending} className="gap-2">
          {createReply.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Senden
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
