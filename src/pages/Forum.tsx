import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { MessageSquare, Pin, Eye, Clock, User, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLatestThreads } from "@/hooks/useForum";
import { useForumCategories } from "@/hooks/useForumCategories";
import { formatSeoTitle, formatSeoDescription } from "@/lib/seo";

export default function Forum() {
  const { data: threads = [], isLoading } = useLatestThreads(50);
  const { data: categories = [] } = useForumCategories();

  const pageTitle = formatSeoTitle("Community Forum");
  const pageDescription = formatSeoDescription("Diskutiere mit der Community über Dating, Beziehungen und mehr. Stelle Fragen und teile deine Erfahrungen.");

  // Group threads: pinned first, then by date
  const pinnedThreads = threads.filter(t => t.is_pinned);
  const regularThreads = threads.filter(t => !t.is_pinned);

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null;
    return categories.find(c => c.id === categoryId)?.name;
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`${window.location.origin}/forum`} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="relative py-16 md:py-24 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
            <div className="container mx-auto px-4 relative">
              <div className="max-w-3xl mx-auto text-center">
                <Badge variant="outline" className="mb-4 text-primary border-primary/30">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Community
                </Badge>
                <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
                  Forum & Diskussionen
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Tausche dich mit anderen Nutzern aus, stelle Fragen und teile deine Erfahrungen.
                </p>
              </div>
            </div>
          </section>

          {/* Thread List */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto space-y-4">
                {isLoading ? (
                  // Loading Skeleton
                  Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : threads.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        Noch keine Beiträge
                      </h3>
                      <p className="text-muted-foreground">
                        Schau bald wieder vorbei für neue Diskussionen!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Pinned Threads */}
                    {pinnedThreads.length > 0 && (
                      <div className="space-y-3">
                        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                          <Pin className="w-4 h-4" />
                          Angepinnt
                        </h2>
                        {pinnedThreads.map((thread) => (
                          <ThreadCard 
                            key={thread.id} 
                            thread={thread} 
                            categoryName={getCategoryName(thread.category_id)}
                            isPinned
                          />
                        ))}
                      </div>
                    )}

                    {/* Regular Threads */}
                    {regularThreads.length > 0 && (
                      <div className="space-y-3">
                        {pinnedThreads.length > 0 && (
                          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mt-8">
                            Neueste Beiträge
                          </h2>
                        )}
                        {regularThreads.map((thread) => (
                          <ThreadCard 
                            key={thread.id} 
                            thread={thread}
                            categoryName={getCategoryName(thread.category_id)}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </section>
        </main>

        <Footer />
        <ScrollToTop />
      </div>
    </>
  );
}

interface ThreadCardProps {
  thread: {
    id: string;
    title: string;
    slug: string;
    content: string;
    author_name: string;
    view_count: number | null;
    created_at: string | null;
    is_answered: boolean | null;
  };
  categoryName?: string | null;
  isPinned?: boolean;
}

function ThreadCard({ thread, categoryName, isPinned }: ThreadCardProps) {
  const excerpt = thread.content.length > 120 
    ? thread.content.substring(0, 120).trim() + "..." 
    : thread.content;

  return (
    <Link to={`/forum/${thread.slug}`}>
      <Card className={`overflow-hidden transition-all hover:shadow-md hover:border-primary/30 group ${isPinned ? "border-primary/20 bg-primary/5" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Avatar/Icon */}
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {isPinned && (
                  <Pin className="w-3 h-3 text-primary flex-shrink-0" />
                )}
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {thread.title}
                </h3>
                {thread.is_answered && (
                  <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 border-green-200">
                    Beantwortet
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {excerpt}
              </p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {thread.author_name}
                </span>
                {thread.created_at && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(thread.created_at), "dd. MMM yyyy", { locale: de })}
                  </span>
                )}
                {thread.view_count !== null && thread.view_count > 0 && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {thread.view_count}
                  </span>
                )}
                {categoryName && (
                  <Badge variant="outline" className="text-xs">
                    {categoryName}
                  </Badge>
                )}
              </div>
            </div>

            {/* Arrow */}
            <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
