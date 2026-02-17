import { useEffect, useState, useRef } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { 
  useForumThread, 
  useThreadReplies, 
  useCreateReply, 
  useToggleLike, 
  useIncrementThreadView, // NEU IMPORTIERT
  ForumReplyWithLikes 
} from "@/hooks/useForum";
import { supabase } from "@/integrations/supabase/client";
import {
  MessageSquare, Pin, Clock, ArrowLeft, Send, User, Lock, CheckCircle, ThumbsUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import DOMPurify from "dompurify";
import { ForumSidebar } from "@/components/forum/ForumSidebar";
import { Helmet } from "react-helmet-async"; 
import { useForceSEO } from "@/hooks/useForceSEO"; 
import { FadeIn } from "@/components/ui/FadeIn";
// KYRA FIX: Import für Admin-Tracking
import { useTrackView } from "@/hooks/useTrackView";

export default function ForumThread() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // KYRA FIX: Admin-Tracking aktivieren (Wanze)
  // Trackt parallel zum öffentlichen Counter für dein Dashboard
  useTrackView(slug, "forum");
  
  // Ref um View-Increment nur 1x pro Session/Load zu feuern (Public Counter)
  const viewIncremented = useRef(false);
   
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user?.id || null);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setCurrentUserId(session?.user?.id || null);
    });
    
    return () => subscription.unsubscribe();
  }, []);
   
  const { data: thread, isLoading: threadLoading } = useForumThread(slug || "");
  const { data: replies, isLoading: repliesLoading } = useThreadReplies(thread?.id || "", currentUserId || undefined);
  const createReply = useCreateReply();
  const toggleLike = useToggleLike();
  const incrementView = useIncrementThreadView(); // NEU: Hook nutzen

  // --- VIEW COUNTING LOGIC (Public visible views) ---
  useEffect(() => {
    if (thread?.id && !viewIncremented.current) {
      incrementView.mutate(thread.id);
      viewIncremented.current = true;
    }
  }, [thread?.id, incrementView]);
  // ---------------------------

  const [replyName, setReplyName] = useState("");
  const [replyContent, setReplyContent] = useState("");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyName.trim() || !replyContent.trim()) {
      toast.error("Bitte fülle alle Felder aus");
      return;
    }
    if (!thread?.id) return;

    try {
      await createReply.mutateAsync({
        thread_id: thread.id,
        author_name: replyName.trim(),
        content: replyContent.trim(),
      });
      setReplyName("");
      setReplyContent("");
      toast.success("Dein Kommentar wurde eingereicht und wird geprüft");
    } catch (error) {
      toast.error("Fehler beim Senden des Kommentars");
    }
  };
   
  const handleLikeClick = async (reply: ForumReplyWithLikes) => {
    if (!currentUserId) {
      toast.error("Bitte melde dich an, um Kommentare zu liken");
      return;
    }
    try {
      await toggleLike.mutateAsync({
        replyId: reply.id,
        userId: currentUserId,
        isLiked: reply.user_has_liked,
      });
    } catch (error) {
      toast.error("Fehler beim Liken");
    }
  };

  const renderContent = () => {
    if (!thread) return { __html: "" };
    const htmlContent = thread.raw_html_content || thread.content;
    return { 
      __html: DOMPurify.sanitize(htmlContent, {
        ADD_ATTR: ['class', 'style', 'target', 'rel'],
        ADD_TAGS: ['iframe', 'figure', 'figcaption']
      }) 
    };
  };

  const seoTitle = thread?.seo_title && thread.seo_title.trim() !== "" 
    ? thread.seo_title 
    : (thread ? `${thread.title} | Forum` : "Lade Beitrag...");

  let seoDescription = "";
  if (thread) {
    if (thread.seo_description && thread.seo_description.trim() !== "") {
      seoDescription = thread.seo_description;
    } else {
      const cleanContent = thread.content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
      seoDescription = cleanContent.substring(0, 155) + (cleanContent.length > 155 ? "..." : "");
    }
  }

  useForceSEO(seoDescription);
  const canonicalUrl = window.location.href;

  if (threadLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-32 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12 text-center">
          <MessageSquare className="w-20 h-20 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Beitrag nicht gefunden</h1>
          <p className="text-muted-foreground mb-6">Der gesuchte Beitrag existiert nicht oder wurde entfernt.</p>
          <Button asChild><Link to="/forum">Zurück zum Forum</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet key={location.pathname}>
        <title>{seoTitle}</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        {thread.featured_image_url && <meta property="og:image" content={thread.featured_image_url} />}
      </Helmet>
      <Header />
      <main className="flex-grow">
        <div className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 mb-8">
            <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                 <Link to="/forum" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
                    Zurück zur Übersicht
                 </Link>
                 <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="font-bold text-slate-700">{thread.views}</span> Aufrufe
                 </div>
            </div>
        </div>
        
        <section className="pb-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="flex-1 lg:w-[70%]">
                <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    {thread.is_pinned && <Badge variant="secondary" className="gap-1 bg-slate-100 text-slate-700 hover:bg-slate-200"><Pin className="w-3 h-3" /> Angepinnt</Badge>}
                    {thread.is_locked && <Badge variant="outline" className="gap-1 border-slate-200"><Lock className="w-3 h-3" /> Geschlossen</Badge>}
                    {thread.is_answered && <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 gap-1 hover:bg-emerald-100"><CheckCircle className="w-3 h-3" /> Beantwortet</Badge>}
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 leading-[1.1] text-slate-900 tracking-tight">
                    {thread.title}
                  </h1>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground border-b border-slate-100 pb-8">
                    <span className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex flex-col">
                          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Autor</span>
                          <span className="font-bold text-slate-900">{thread.author_name}</span>
                      </div>
                    </span>
                    <div className="h-8 w-px bg-slate-100 mx-2"></div>
                    <span className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                             <Clock className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Veröffentlicht</span>
                            <span className="font-bold text-slate-900">{formatDate(thread.created_at || "")}</span>
                        </div>
                    </span>
                  </div>
                </div>
                <FadeIn>
                    <div className="mb-16">
                        <div 
                            className="prose prose-lg md:prose-xl prose-slate dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-strong:font-bold prose-img:rounded-[2.5rem] prose-img:shadow-2xl prose-img:w-full prose-img:object-cover prose-img:my-12 prose-img:border prose-img:border-slate-100 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-slate-50 prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic prose-blockquote:font-medium prose-blockquote:text-slate-800" 
                            dangerouslySetInnerHTML={renderContent()} 
                        />
                    </div>
                </FadeIn>
                <Separator className="my-12 bg-slate-100" />
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-slate-900">
                    <MessageSquare className="w-8 h-8 text-primary" /> 
                    Kommentare <span className="text-slate-300 text-2xl font-normal">({replies?.length || 0})</span>
                  </h2>
                  {repliesLoading ? (
                    <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-3xl" />)}</div>
                  ) : replies && replies.length > 0 ? (
                    <div className="space-y-6">
                      {replies.map((reply) => (
                        <Card key={reply.id} className="border-none shadow-sm bg-slate-50/50 hover:bg-slate-50 transition-colors rounded-3xl overflow-hidden">
                          <CardContent className="p-8">
                            <div className="flex items-start gap-5">
                              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-slate-100">
                                <User className="w-6 h-6 text-slate-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-3">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                    <span className="font-bold text-slate-900 text-lg">{reply.author_name}</span>
                                    <span className="hidden sm:inline text-slate-300">•</span>
                                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{formatDate(reply.created_at || "")}</span>
                                  </div>
                                </div>
                                <div className="text-slate-600 leading-relaxed text-base mb-4">{reply.content}</div>
                                <div className="flex items-center gap-4">
                                  <Button 
                                    variant={reply.user_has_liked ? "default" : "outline"} 
                                    size="sm" 
                                    className={`h-9 gap-2 px-4 rounded-full transition-all ${reply.user_has_liked ? "bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary/90" : "border-slate-200 text-slate-500 hover:border-primary/30 hover:text-primary hover:bg-white"}`} 
                                    onClick={() => handleLikeClick(reply)} 
                                    disabled={toggleLike.isPending}
                                  >
                                    <ThumbsUp className={`w-4 h-4 ${reply.user_has_liked ? "fill-current" : ""}`} />
                                    <span className="text-xs font-bold">{reply.like_count}</span>
                                  </Button>
                                  <button className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Antworten</button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                             <MessageSquare className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Noch keine Kommentare</h3>
                        <p className="text-slate-500">Sei der Erste, der diesen Beitrag kommentiert!</p>
                    </div>
                  )}
                </div>
                {!thread.is_locked ? (
                  <Card className="border border-slate-200 shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                        <CardTitle className="text-xl font-bold text-slate-900">Deine Meinung zählt</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <form onSubmit={handleSubmitReply} className="space-y-6">
                        <div className="grid gap-2">
                             <label className="text-sm font-bold text-slate-700 ml-1">Dein Name</label>
                             <Input 
                               placeholder="Max Mustermann" 
                               value={replyName} 
                               onChange={(e) => setReplyName(e.target.value)} 
                               maxLength={50} 
                               required 
                               className="bg-slate-50 border-slate-200 h-12 rounded-xl focus:ring-primary/20 focus:border-primary transition-all" 
                            />
                        </div>
                        <div className="grid gap-2">
                             <label className="text-sm font-bold text-slate-700 ml-1">Dein Kommentar</label>
                             <Textarea 
                               placeholder="Schreibe deine Gedanken hier..." 
                               value={replyContent} 
                               onChange={(e) => setReplyContent(e.target.value)} 
                               rows={5} 
                               maxLength={1000} 
                               required 
                               className="bg-slate-50 border-slate-200 rounded-xl min-h-[150px] focus:ring-primary/20 focus:border-primary transition-all p-4" 
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
                          <p className="text-xs text-slate-400 font-medium order-2 sm:order-1 flex items-center gap-1">
                             <Lock className="w-3 h-3" /> Moderiert • Respektvoller Umgang
                          </p>
                          <Button type="submit" disabled={createReply.isPending} className="w-full sm:w-auto order-1 sm:order-2 h-12 px-8 rounded-full text-base font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5">
                             <Send className="w-4 h-4 mr-2" /> 
                             {createReply.isPending ? "Wird gesendet..." : "Kommentar absenden"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-slate-50 border-none rounded-3xl">
                    <CardContent className="py-12 text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <Lock className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Diskussion geschlossen</h3>
                        <p className="text-slate-500 font-medium">Zu diesem Beitrag sind keine weiteren Kommentare möglich.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
              <aside className="lg:w-[30%]">
                 <div className="sticky top-24">
                    <ForumSidebar />
                 </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}