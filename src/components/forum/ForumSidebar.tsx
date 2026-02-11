import { Link } from "react-router-dom";
import { useForumThreads } from "@/hooks/useForum";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Flame, Clock, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function ForumSidebar() {
  const { data: threads, isLoading } = useForumThreads();

  // Wir sortieren zwar nach Views, zeigen sie aber nicht mehr an
  const trendingThreads = threads
    ? [...threads].sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 5)
    : [];

  const recentThreads = threads
    ? [...threads].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)
    : [];

  if (isLoading) {
    return <SidebarSkeleton />;
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-md bg-gradient-to-br from-white to-slate-50 overflow-hidden">
        <div className="h-1 w-full bg-primary" />
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            Aktuell Heiß
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {trendingThreads.map((thread) => (
            <div key={thread.id} className="group">
              <Link to={`/forum/${thread.slug}`} className="block">
                <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {thread.title}
                </h3>
                {/* Views Anzeige entfernt */}
              </Link>
              <Separator className="mt-3 opacity-50" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-primary" />
            Neueste Beiträge
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {recentThreads.map((thread) => (
            <div key={thread.id} className="group">
              <Link to={`/forum/${thread.slug}`} className="block">
                <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {thread.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  von {thread.author_name}
                </p>
              </Link>
            </div>
          ))}
          
          <Link 
            to="/forum" 
            className="flex items-center justify-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors mt-2 pt-2 border-t border-dashed"
          >
            Alle Diskussionen anzeigen <ArrowRight className="w-3 h-3" />
          </Link>
        </CardContent>
      </Card>

      <div className="bg-primary/5 rounded-xl p-5 border border-primary/10 text-center">
        <h4 className="font-bold text-primary mb-2">Selbst aktiv werden?</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Teile dein Wissen mit der Community.
        </p>
        <Link to="/forum?new=true">
          <Button className="w-full h-9">Beitrag erstellen</Button>
        </Link>
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
        </CardContent>
      </Card>
    </div>
  );
}