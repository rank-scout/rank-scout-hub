import { Link } from "react-router-dom";
import { useForumThreads } from "@/hooks/useForum";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Flame, Clock, ArrowRight, Handshake } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function ForumSidebar() {
  const { data: threads, isLoading } = useForumThreads();

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
      {/* TRENDING CARD */}
      <Card className="border-none shadow-md bg-gradient-to-br from-white to-slate-50 overflow-hidden">
        <div className="h-1 w-full bg-primary" />
        <CardHeader className="pb-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold leading-none tracking-tight">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            Aktuell Heiß
          </h2>
        </CardHeader>
        <CardContent className="grid gap-4">
          {trendingThreads.map((thread) => (
            <div key={thread.id} className="group">
              <Link to={`/forum/${thread.slug}`} className="block">
                <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {thread.title}
                </h3>
              </Link>
              <Separator className="mt-3 opacity-50" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* RECENT CARD */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold leading-none tracking-tight">
            <Clock className="w-5 h-5 text-primary" />
            Neueste Beiträge
          </h2>
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

      {/* PARTNER BLOCK (FIXED) */}
      <div className="bg-[#0A0F1C] rounded-xl p-6 border border-slate-800 text-center relative overflow-hidden group">
        {/* Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Content Wrapper (Clickable Fix) */}
        <div className="relative z-10">
          <Handshake className="w-10 h-10 text-orange-400 mx-auto mb-3" />
          <h4 className="font-bold text-white mb-2">Partner werden?</h4>
          <p className="text-sm text-slate-400 mb-4 leading-relaxed">
            Platziere deine Produkte in unseren Premium-Vergleichen.
          </p>
          
          <Link to="/kontakt">
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold border-none cursor-pointer">
              Jetzt anfragen
            </Button>
          </Link>
        </div>
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