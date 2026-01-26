import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useForumThread, useThreadReplies, useCreateReply, useToggleLike, ForumReplyWithLikes } from "@/hooks/useForum";
import { supabase } from "@/integrations/supabase/client";
import {
  MessageSquare,
  Eye,
  Pin,
  Clock,
  ArrowLeft,
  Send,
  User,
  Lock,
  CheckCircle,
  ThumbsUp,
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

export default function ForumThread() {
  const { slug } = useParams<{ slug: string }>();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Get current user
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

  const [replyName, setReplyName] = useState("");
  const [replyContent, setReplyContent] = useState("");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  // SEO: Update document head
  useEffect(() => {
    if (thread) {
      document.title = thread.seo_title || `${thread.title} | Forum`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          "content",
          thread.seo_description || thread.content.replace(/<[^>]*>/g, "").substring(0, 155)
        );
      }
    }
  }, [thread]);

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
          <p className="text-muted-foreground mb-6">
            Der gesuchte Beitrag existiert nicht oder wurde entfernt.
          </p>
          <Button asChild>
            <Link to="/forum">Zurück zum Forum</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  // Render HTML content safely
  const renderContent = () => {
    const htmlContent = thread.raw_html_content || thread.content;
    return { __html: DOMPurify.sanitize(htmlContent) };
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-grow">
        {/* Breadcrumb */}
        <div className="bg-muted/30 border-b py-4">
          <div className="container mx-auto px-4">
            <Link
              to="/forum"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück zum Forum
            </Link>
          </div>
        </div>

        {/* Main Content with Sidebar */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Content - 70% on desktop */}
              <div className="flex-1 lg:w-[70%]">
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {thread.is_pinned && (
                      <Badge variant="secondary" className="gap-1">
                        <Pin className="w-3 h-3" />
                        Angepinnt
                      </Badge>
                    )}
                    {thread.is_locked && (
                      <Badge variant="outline" className="gap-1">
                        <Lock className="w-3 h-3" />
                        Geschlossen
                      </Badge>
                    )}
                    {thread.is_answered && (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20 gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Beantwortet
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold mb-4">{thread.title}</h1>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{thread.author_name}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(thread.created_at || "")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {thread.view_count || 0} Aufrufe
                    </span>
                  </div>
                </div>

                {/* Featured Image */}
                {thread.featured_image_url && (
                  <div className="mb-8 rounded-xl overflow-hidden">
                    <img
                      src={thread.featured_image_url}
                      alt={thread.title}
                      className="w-full h-auto max-h-[400px] object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <Card className="mb-12">
                  <CardContent className="p-6 md:p-8">
                    <div
                      className="prose prose-slate dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={renderContent()}
                    />
                  </CardContent>
                </Card>

                <Separator className="my-8" />

                {/* Replies Section */}
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <MessageSquare className="w-6 h-6" />
                    Kommentare ({replies?.length || 0})
                  </h2>

                  {repliesLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24" />
                      ))}
                    </div>
                  ) : replies && replies.length > 0 ? (
                    <div className="space-y-4">
                      {replies.map((reply) => (
                        <Card key={reply.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-muted-foreground" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{reply.author_name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(reply.created_at || "")}
                                  </span>
                                </div>
                                <p className="text-muted-foreground mb-3">{reply.content}</p>
                                
                                {/* Like Button */}
                                <Button
                                  variant={reply.user_has_liked ? "default" : "ghost"}
                                  size="sm"
                                  className="h-8 gap-1.5"
                                  onClick={() => handleLikeClick(reply)}
                                  disabled={toggleLike.isPending}
                                >
                                  <ThumbsUp className={`w-4 h-4 ${reply.user_has_liked ? "fill-current" : ""}`} />
                                  <span>{reply.like_count}</span>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Noch keine Kommentare. Sei der Erste!
                    </p>
                  )}
                </div>

                {/* Reply Form */}
                {!thread.is_locked && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Kommentar schreiben</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmitReply} className="space-y-4">
                        <Input
                          placeholder="Dein Name"
                          value={replyName}
                          onChange={(e) => setReplyName(e.target.value)}
                          maxLength={50}
                          required
                        />
                        <Textarea
                          placeholder="Dein Kommentar..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          rows={4}
                          maxLength={1000}
                          required
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            Kommentare werden vor der Veröffentlichung geprüft
                          </p>
                          <Button type="submit" disabled={createReply.isPending}>
                            <Send className="w-4 h-4 mr-2" />
                            {createReply.isPending ? "Senden..." : "Absenden"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {thread.is_locked && (
                  <Card className="bg-muted/50">
                    <CardContent className="py-8 text-center">
                      <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        Dieser Beitrag ist geschlossen. Keine weiteren Kommentare möglich.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar - 30% on desktop */}
              <aside className="lg:w-[30%]">
                <ForumSidebar />
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "DiscussionForumPosting",
          headline: thread.title,
          author: {
            "@type": "Person",
            name: thread.author_name,
          },
          datePublished: thread.created_at,
          dateModified: thread.updated_at,
          interactionStatistic: {
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/ViewAction",
            userInteractionCount: thread.view_count || 0,
          },
        })}
      </script>
    </div>
  );
}
