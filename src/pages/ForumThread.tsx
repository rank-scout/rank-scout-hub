import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  useForumThread,
  useThreadReplies,
  useCreateReply,
  useToggleLike,
  ForumReplyWithLikes,
} from "@/hooks/useForum";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import {
  MessageSquare,
  ArrowLeft,
  Send,
  User,
  Lock,
  ThumbsUp,
  Clock,
  Megaphone, // Icon für Werbung
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import DOMPurify from "dompurify";
import { ForumSidebar } from "@/components/forum/ForumSidebar";

// Hilfsfunktion für Avatare
const getAvatarColor = (name: string) => {
  const colors = [
    "bg-red-100 text-red-600", "bg-blue-100 text-blue-600", "bg-green-100 text-green-600",
    "bg-amber-100 text-amber-700", "bg-purple-100 text-purple-600", "bg-pink-100 text-pink-600",
    "bg-indigo-100 text-indigo-600", "bg-orange-100 text-orange-600", "bg-teal-100 text-teal-700"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function ForumThread() {
  const { slug } = useParams<{ slug: string }>();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [replyName, setReplyName] = useState("");
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user?.id || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setCurrentUserId(session?.user?.id || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const { data: thread, isLoading: threadLoading } = useForumThread(slug || "");
  const { data: replies, isLoading: repliesLoading } = useThreadReplies(
    thread?.id || "",
    currentUserId || undefined
  );
  
  const createReply = useCreateReply();
  const toggleLike = useToggleLike();

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleReplySubmit = async () => {
    if (!thread) return;
    
    if (!replyContent.trim()) {
      toast.error("Bitte gib einen Text ein.");
      return;
    }
    
    if (!currentUserId && !replyName.trim()) {
       toast.error("Bitte gib deinen Namen ein.");
       return;
    }

    try {
      const payload = {
        thread_id: thread.id,
        content: replyContent,
        user_id: currentUserId || null,
        author_name: currentUserId ? "RankScout User" : replyName
      };

      await createReply.mutateAsync(payload);
      
      setReplyContent("");
      if (!currentUserId) setReplyName(""); 
      
      toast.success("Antwort erfolgreich gesendet!");
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes("Could not find the 'user_id' column")) {
        toast.error("System-Info: Bitte in Supabase 'Reload Schema Cache' klicken.");
      } else {
        toast.error("Fehler beim Senden: " + error.message);
      }
    }
  };

  const backLink = thread?.category_id
    ? `/forum?category=${thread.category_id}`
    : "/forum";

  if (threadLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50 relative overflow-hidden">
         <Header />
         <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-orange-50/50 via-zinc-50 to-zinc-50 -z-10" />
        <main className="pt-24 container mx-auto px-4 pb-12 relative z-10">
          <Skeleton className="h-12 w-3/4 mb-6 rounded-lg" />
          <Card className="h-96 w-full rounded-2xl shadow-sm border-0 bg-white/80 backdrop-blur" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50 relative overflow-hidden">
        <SEO title="Beitrag nicht gefunden | Forum" noindex />
        <Header />
        <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-orange-50/50 via-zinc-50 to-zinc-50 -z-10" />
        <main className="pt-32 container mx-auto px-4 text-center flex-grow relative z-10">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-4">
            Beitrag nicht gefunden
          </h1>
          <Button asChild size="lg" className="font-bold shadow-md hover:shadow-lg transition-all bg-slate-900 hover:bg-orange-600">
            <Link to="/forum">Zurück zum Forum</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const renderContent = () => ({
    __html: DOMPurify.sanitize(
      thread.raw_html_content || thread.content
    ),
  });

  return (
    <div className="min-h-screen flex flex-col relative bg-zinc-50 overflow-hidden">
      <SEO
        title={thread.seo_title || `${thread.title} | Forum`}
        description={thread.content.replace(/<[^>]*>/g, "").substring(0, 155)}
        type="article"
      />

      <Header />

      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-orange-100/40 via-zinc-50/80 to-zinc-50 -z-10 pointer-events-none" />

      <main className="flex-grow pt-24 relative z-10">
        <div className="py-6 container mx-auto px-4">
            <Link
              to={backLink}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück zur Übersicht
            </Link>
        </div>

        <section className="pb-16 md:pb-24">
          <div className="container mx-auto px-4 flex gap-8 lg:gap-12 items-start">
            
            {/* LINKER CONTENT BEREICH */}
            <div className="flex-1 w-full lg:max-w-[calc(100%-350px)]">
              
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-8 tracking-tight leading-tight">
                {thread.title}
              </h1>

              <Card className="bg-white shadow-xl shadow-slate-200/60 rounded-2xl border-0 ring-1 ring-slate-900/5 overflow-hidden transition-shadow hover:shadow-slate-200/80 mb-12 relative">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-400/80 to-orange-600/80" />
                
                <CardContent className="prose prose-lg prose-slate max-w-none p-8 md:p-12 prose-headings:font-bold prose-a:text-orange-600 hover:prose-a:text-orange-700 prose-img:rounded-xl prose-img:shadow-sm mt-1">
                  <div dangerouslySetInnerHTML={renderContent()} />
                </CardContent>
                
                <div className="bg-slate-50/80 backdrop-blur-sm px-8 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {formatDate(thread.created_at)}
                    </div>
                    <Button variant="ghost" size="sm" className="hover:text-orange-600 gap-2 group transition-all" onClick={() => toggleLike.mutate(thread.id)}>
                        <ThumbsUp className={`w-4 h-4 transition-transform group-hover:scale-110 ${thread.user_has_liked ? "fill-orange-600 text-orange-600" : ""}`} />
                        {thread.likes_count || 0}
                    </Button>
                </div>
              </Card>

              {/* Kommentare */}
              <div className="mt-16">
                <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-orange-600" />
                    {replies?.length || 0} Kommentare
                </h3>

                <div className="space-y-6 mb-12">
                    {repliesLoading ? (
                        <Skeleton className="h-24 w-full rounded-xl" />
                    ) : replies && replies.length > 0 ? (
                        replies.map((reply: ForumReplyWithLikes) => {
                            const displayName = reply.author_name || (reply.user_id ? "RankScout User" : "Gast");
                            const avatarColorClass = getAvatarColor(displayName);

                            return (
                            <Card key={reply.id} className="bg-white border-0 shadow-md shadow-slate-100/50 ring-1 ring-slate-900/5 rounded-xl overflow-hidden transition-all hover:shadow-lg hover:shadow-slate-200/40">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${avatarColorClass}`}>
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">
                                                    {displayName}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {formatDate(reply.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="prose prose-sm prose-slate max-w-none text-slate-700 pl-14">
                                        {reply.content}
                                    </div>
                                </CardContent>
                            </Card>
                        )})
                    ) : (
                        <Card className="bg-slate-50/50 border-dashed border-2 border-slate-200 shadow-none rounded-xl p-8 text-center">
                            <p className="text-slate-500 italic flex flex-col items-center gap-2">
                                <MessageSquare className="w-8 h-8 text-slate-300" />
                                Noch keine Kommentare. Sei der Erste!
                            </p>
                        </Card>
                    )}
                </div>

                <Card className="bg-white border-0 shadow-xl shadow-slate-200/50 rounded-2xl ring-1 ring-slate-900/5 relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-400/80 to-orange-600/80" />
                    <CardHeader className="mt-2">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            Antwort verfassen
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!currentUserId && (
                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-slate-700">Dein Name</label>
                                <Input 
                                    placeholder="Gast" 
                                    value={replyName}
                                    onChange={(e) => setReplyName(e.target.value)}
                                    className="border-slate-200 focus:ring-orange-500/20 focus:border-orange-500 bg-slate-50/50"
                                />
                            </div>
                        )}
                        <div className="flex items-start gap-4">
                             <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm hidden md:flex ${getAvatarColor(currentUserId ? "RankScout User" : (replyName || "Gast"))}`}>
                                <User className="w-5 h-5" />
                            </div>
                            <div className="grid gap-2 flex-grow">
                                <label className="text-sm font-medium text-slate-700 md:hidden">Nachricht</label>
                                <Textarea 
                                    placeholder="Schreib etwas Konstruktives..." 
                                    className="min-h-[120px] border-slate-200 focus:ring-orange-500/20 focus:border-orange-500 resize-y bg-slate-50/50"
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2 pl-0 md:pl-14">
                             {!currentUserId ? (
                                <p className="text-xs text-slate-400 flex items-center gap-1 font-medium px-2 py-1 rounded bg-slate-100">
                                    <Lock className="w-3 h-3" /> Gast-Modus
                                </p>
                             ) : (
                                <p className="text-xs text-green-600 flex items-center gap-1 font-medium px-2 py-1 rounded bg-green-50">
                                    <User className="w-3 h-3" /> Angemeldet
                                </p>
                             )}
                             <Button 
                                onClick={handleReplySubmit} 
                                disabled={createReply.isPending}
                                className="bg-slate-900 hover:bg-orange-600 text-white transition-all duration-300 shadow-md hover:shadow-orange-500/20 px-6"
                             >
                                {createReply.isPending ? "Sendet..." : "Antworten"}
                                <Send className="w-4 h-4 ml-2" />
                             </Button>
                        </div>
                    </CardContent>
                </Card>

              </div>
            </div>

            {/* RECHTE SIDEBAR (STICKY) */}
            <aside className="w-[320px] hidden lg:block sticky top-28 z-10 space-y-8">
              
              {/* --- NEU: Dynamischer Werbe-Slot --- */}
              {/* Wir greifen auf die neue Spalte 'show_ad' zu. Achtung: Das muss im Interface/DB existieren! */}
              {/* Wenn die Spalte noch nicht existiert, ist das hier undefined und wird einfach nicht angezeigt -> Crash-Sicher */}
              {(thread as any).show_ad && (
                  <Card className="bg-white border-0 shadow-lg shadow-orange-500/10 ring-1 ring-orange-500/20 rounded-2xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-bl">
                        Anzeige
                    </div>
                    <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 mb-2">
                            <Megaphone className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-1">Empfehlung der Redaktion</h4>
                            <p className="text-sm text-slate-500">
                                Hier könnte dein Produkt stehen. Nutze die Reichweite von RankScout.
                            </p>
                        </div>
                        <Button variant="outline" className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800 hover:border-orange-300">
                            Jetzt ansehen
                        </Button>
                    </CardContent>
                  </Card>
              )}

              {/* Bestehende Sidebar */}
              <ForumSidebar />
            </aside>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}