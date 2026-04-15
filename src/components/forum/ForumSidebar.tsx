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
    ? [...threads].sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 4)
    : [];

  const recentThreads = threads
    ? [...threads].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 4)
    : [];

  if (isLoading) {
    return <SidebarSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* TRENDING CARD */}
      <Card className="overflow-hidden border-none bg-gradient-to-br from-white to-slate-50 shadow-md">
        <div className="h-1 w-full bg-primary" />
        <CardHeader className="px-5 pb-2 pt-5">
          <h2 className="flex items-center gap-2 text-base font-semibold leading-none tracking-tight">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            Aktuell Heiß
          </h2>
        </CardHeader>
        <CardContent className="grid gap-3 px-5 pb-5">
          {trendingThreads.map((thread) => (
            <div key={thread.id} className="group">
              <Link to={`/forum/${thread.slug}`} className="block">
                <h3 className="line-clamp-2 text-[13px] font-medium leading-5 text-foreground transition-colors group-hover:text-primary">
                  {thread.title}
                </h3>
              </Link>
              <Separator className="mt-2 opacity-50" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* RECENT CARD */}
      <Card className="border shadow-sm">
        <CardHeader className="px-5 pb-2 pt-5">
          <h2 className="flex items-center gap-2 text-base font-semibold leading-none tracking-tight">
            <Clock className="w-5 h-5 text-primary" />
            Neueste Beiträge
          </h2>
        </CardHeader>
        <CardContent className="grid gap-3 px-5 pb-5">
          {recentThreads.map((thread) => (
            <div key={thread.id} className="group">
              <Link to={`/forum/${thread.slug}`} className="block">
                <h3 className="line-clamp-2 text-[13px] font-medium leading-5 text-foreground transition-colors group-hover:text-primary">
                  {thread.title}
                </h3>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  von {thread.author_name}
                </p>
              </Link>
            </div>
          ))}
          
          <Link 
            to="/forum" 
            className="mt-1 flex items-center justify-center gap-1 border-t border-dashed pt-2 text-[11px] font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Alle Diskussionen anzeigen <ArrowRight className="w-3 h-3" />
          </Link>
        </CardContent>
      </Card>

      {/* PARTNER BLOCK (FIXED) */}
      <div className="group relative overflow-hidden rounded-xl border border-slate-800 bg-[#0A0F1C] p-5 text-center">
        {/* Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Content Wrapper (Clickable Fix) */}
        <div className="relative z-10">
          <Handshake className="mx-auto mb-2.5 h-9 w-9 text-orange-400" />
          <h4 className="mb-1.5 font-bold text-white">Partner werden?</h4>
          <p className="mb-3 text-xs leading-relaxed text-slate-400">
            Platziere deine Produkte in unseren Premium-Vergleichen.
          </p>
          
          <Link to="/kontakt">
            <Button className="h-10 w-full cursor-pointer border-none bg-orange-500 font-bold text-white hover:bg-orange-600">
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
    <div className="space-y-4">
      <Card>
        <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
        </CardContent>
      </Card>
    </div>
  );
}