import { Link } from "react-router-dom";
import { useLatestThreads } from "@/hooks/useForum";
import { MessageSquare, Eye, Pin, ArrowRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function ForumSection() {
  const { data: threads, isLoading } = useLatestThreads(4);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!threads || threads.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">
            <MessageSquare className="inline-block w-8 h-8 mr-2 text-primary" />
            Community Forum
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Aktuelle Diskussionen, Tipps und Erfahrungsberichte aus unserer Community
          </p>
        </div>

        {/* Thread Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {threads.map((thread) => (
            <Link key={thread.id} to={`/forum/${thread.slug}`}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group border-border/50">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {thread.is_pinned && (
                          <Pin className="w-3 h-3 text-secondary" />
                        )}
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {thread.title}
                        </h3>
                      </div>

                      {/* Excerpt from content */}
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {thread.content.replace(/<[^>]*>/g, "").substring(0, 120)}...
                      </p>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(thread.created_at || "")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {thread.view_count || 0} Views
                        </span>
                        {thread.is_answered && (
                          <Badge variant="secondary" className="text-xs py-0">
                            Beantwortet
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/forum" className="inline-flex items-center gap-2">
              Alle Beiträge ansehen
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default ForumSection;
