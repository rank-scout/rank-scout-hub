import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { MessageSquare, User, Clock, Eye, ArrowLeft, Send, Pin, Lock, CheckCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useThread, useCreateReply } from "@/hooks/useForum";
import { formatSeoTitle, formatSeoDescription } from "@/lib/seo";
import { toast } from "sonner";
import DOMPurify from "dompurify";

export default function ForumThread() {
  const { slug } = useParams<{ slug: string }>();
  const { data: thread, isLoading, error } = useThread(slug || "");
  const createReply = useCreateReply();

  const [replyForm, setReplyForm] = useState({
    author_name: "",
    content: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return <ThreadSkeleton />;
  }

  if (error || !thread) {
    return <ThreadNotFound />;
  }

  const pageTitle = formatSeoTitle((thread as any).seo_title || thread.title);
  const pageDescription = formatSeoDescription(
    (thread as any).seo_description || thread.content.substring(0, 155)
  );
  const canonicalUrl = `${window.location.origin}/forum/${thread.slug}`;
  const featuredImage = (thread as any).featured_image_url;
  const rawHtmlContent = (thread as any).raw_html_content;

  // JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    "headline": thread.title,
    "text": thread.content,
    "author": {
      "@type": "Person",
      "name": thread.author_name,
    },
    "datePublished": thread.created_at,
    "dateModified": thread.updated_at || thread.created_at,
    "url": canonicalUrl,
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/CommentAction",
      "userInteractionCount": thread.replies?.length || 0,
    },
    ...(thread.replies && thread.replies.length > 0 && {
      "comment": thread.replies.map((reply) => ({
        "@type": "Comment",
        "text": reply.content,
        "author": {
          "@type": "Person",
          "name": reply.author_name,
        },
        "datePublished": reply.created_at,
      })),
    }),
  };

  async function handleSubmitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyForm.author_name.trim() || !replyForm.content.trim()) {
      toast.error("Bitte fülle alle Felder aus");
      return;
    }

    setIsSubmitting(true);
    try {
      await createReply.mutateAsync({
        thread_id: thread.id,
        author_name: replyForm.author_name.trim(),
        content: replyForm.content.trim(),
      });
      setReplyForm({ author_name: "", content: "" });
      toast.success("Antwort wurde gesendet!");
    } catch (error: any) {
      toast.error("Fehler beim Senden: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        {featuredImage && <meta property="og:image" content={featuredImage} />}
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-grow py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              {/* Back Link */}
              <Link 
                to="/forum" 
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Zurück zum Forum
              </Link>

              {/* Main Thread Card */}
              <Card className="mb-8 overflow-hidden">
                {featuredImage && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={featuredImage} 
                      alt={thread.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {thread.is_pinned && (
                      <Badge className="bg-primary/10 text-primary border-primary/30">
                        <Pin className="w-3 h-3 mr-1" />
                        Angepinnt
                      </Badge>
                    )}
                    {thread.is_locked && (
                      <Badge variant="secondary">
                        <Lock className="w-3 h-3 mr-1" />
                        Geschlossen
                      </Badge>
                    )}
                    {thread.is_answered && (
                      <Badge className="bg-green-500/10 text-green-600 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Beantwortet
                      </Badge>
                    )}
                  </div>
                  
                  <CardTitle className="text-2xl md:text-3xl font-display">
                    {thread.title}
                  </CardTitle>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {thread.author_name}
                    </span>
                    {thread.created_at && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {format(new Date(thread.created_at), "dd. MMMM yyyy, HH:mm", { locale: de })}
                      </span>
                    )}
                    {thread.view_count !== null && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {thread.view_count} Aufrufe
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Content */}
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                      {thread.content}
                    </p>
                  </div>

                  {/* Raw HTML Content (for custom tables, etc.) */}
                  {rawHtmlContent && (
                    <div 
                      className="mt-6 forum-custom-content"
                      dangerouslySetInnerHTML={{ 
                        __html: DOMPurify.sanitize(rawHtmlContent, {
                          ADD_TAGS: ['style'],
                          ADD_ATTR: ['target'],
                        }) 
                      }}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Replies Section */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {thread.replies?.length || 0} Antworten
                </h2>

                {thread.replies && thread.replies.length > 0 ? (
                  <div className="space-y-4">
                    {thread.replies.map((reply, index) => (
                      <Card key={reply.id} className="overflow-hidden">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-foreground">
                                  {reply.author_name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  #{index + 1}
                                </span>
                                {reply.created_at && (
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(reply.created_at), "dd.MM.yyyy HH:mm", { locale: de })}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="text-center py-8">
                    <CardContent>
                      <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground">
                        Noch keine Antworten. Sei der Erste!
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Reply Form */}
                {!thread.is_locked && (
                  <>
                    <Separator className="my-8" />
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Antwort schreiben</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSubmitReply} className="space-y-4">
                          <div>
                            <Input
                              placeholder="Dein Name"
                              value={replyForm.author_name}
                              onChange={(e) => setReplyForm(prev => ({ ...prev, author_name: e.target.value }))}
                              maxLength={50}
                            />
                          </div>
                          <div>
                            <Textarea
                              placeholder="Deine Antwort..."
                              value={replyForm.content}
                              onChange={(e) => setReplyForm(prev => ({ ...prev, content: e.target.value }))}
                              rows={4}
                              maxLength={2000}
                            />
                          </div>
                          <Button type="submit" disabled={isSubmitting} className="gap-2">
                            <Send className="w-4 h-4" />
                            {isSubmitting ? "Wird gesendet..." : "Antwort senden"}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </>
                )}

                {thread.is_locked && (
                  <Card className="bg-muted/50">
                    <CardContent className="py-6 text-center">
                      <Lock className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        Dieser Thread ist geschlossen. Keine neuen Antworten möglich.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
        <ScrollToTop />
      </div>
    </>
  );
}

function ThreadSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Skeleton className="h-4 w-32 mb-6" />
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ThreadNotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow py-12 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Thread nicht gefunden</h1>
          <p className="text-muted-foreground mb-6">
            Dieser Beitrag existiert nicht oder wurde entfernt.
          </p>
          <Button asChild>
            <Link to="/forum">Zum Forum</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
