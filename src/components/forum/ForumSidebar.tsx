import { 
  Star, 
  ExternalLink, 
  // Neue Icons importiert:
  LayoutGrid, 
  Search, 
  BarChart3, 
  Code2, 
  Heart, 
  Briefcase, 
  Cpu, 
  Megaphone, 
  Globe,
  Zap,
  MessageSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/hooks/useProjects";
import { useForumCategories } from "@/hooks/useForum";
import { cn } from "@/lib/utils"; // Hilfsfunktion für saubere Klassen

interface ForumSidebarProps {
  activeCategorySlug?: string;
  onSelectCategory?: (slug: string | null) => void;
}

export function ForumSidebar({ activeCategorySlug, onSelectCategory }: ForumSidebarProps) {
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const { data: categories, isLoading: isLoadingCategories } = useForumCategories();

  // --- LOGIK: ICON MAPPING ---
  // Wählt das passende Icon basierend auf dem Slug Keywords
  const getCategoryIcon = (slug: string) => {
    const s = slug.toLowerCase();
    if (s.includes('seo') || s.includes('rank')) return Search;
    if (s.includes('finan') || s.includes('money') || s.includes('invest')) return BarChart3;
    if (s.includes('soft') || s.includes('tech') || s.includes('code') || s.includes('saas')) return Code2;
    if (s.includes('date') || s.includes('love') || s.includes('bezieh')) return Heart;
    if (s.includes('agent') || s.includes('b2b') || s.includes('busi')) return Briefcase;
    if (s.includes('ai') || s.includes('intelli') || s.includes('bot')) return Cpu;
    if (s.includes('market') || s.includes('ads') || s.includes('social')) return Megaphone;
    if (s.includes('web') || s.includes('host') || s.includes('domain')) return Globe;
    if (s.includes('tool') || s.includes('util')) return Zap;
    
    // Fallback Icon für allgemeine Kategorien
    return MessageSquare;
  };

  // Get top 3 projects by rating
  const topProjects = projects
    ?.filter((p) => p.is_active)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating / 2);
    const hasHalfStar = rating % 2 >= 1;
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <Star className="w-3.5 h-3.5 fill-yellow-400/50 text-yellow-400" />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Categories Navigation */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-primary" />
            Themenbereiche
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {isLoadingCategories ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              {/* "Alle Themen" Button */}
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left font-medium h-11 transition-all duration-200",
                  !activeCategorySlug 
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
                onClick={() => onSelectCategory && onSelectCategory(null)}
              >
                <div className={cn(
                  "mr-3 p-1.5 rounded-md transition-colors",
                  !activeCategorySlug ? "bg-primary text-white" : "bg-slate-200 text-slate-500"
                )}>
                  <LayoutGrid className="w-4 h-4" />
                </div>
                Alle Themen
              </Button>

              {/* Dynamische Kategorien Liste */}
              {categories?.map((category) => {
                const Icon = getCategoryIcon(category.slug);
                const isActive = activeCategorySlug === category.slug;

                return (
                  <Button
                    key={category.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left font-medium h-11 transition-all duration-200 group",
                      isActive 
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                    onClick={() => onSelectCategory && onSelectCategory(category.slug)}
                  >
                    <div className={cn(
                      "mr-3 p-1.5 rounded-md transition-colors group-hover:bg-white group-hover:text-secondary group-hover:shadow-sm",
                      isActive ? "bg-primary text-white" : "bg-slate-200 text-slate-500"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {category.name}
                  </Button>
                );
              })}
            </>
          )}
        </CardContent>
      </Card>

      {/* Top Rated Projects Sidebar Widget */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardHeader className="pb-3 bg-slate-50/50 border-b">
          <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            Top Empfehlungen
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {isLoadingProjects ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            topProjects?.map((project, index) => (
              <div key={project.id} className="flex gap-3 items-start group">
                {/* Rank Badge */}
                <div className="w-5 h-5 -mt-1 -ml-1 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </div>

                {/* Logo */}
                {project.logo_url ? (
                  <img
                    src={project.logo_url}
                    alt={project.name}
                    className="w-10 h-10 rounded-lg object-contain bg-white border flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-muted-foreground">
                      {project.name.charAt(0)}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{project.name}</h4>
                  {renderStars(project.rating || 0)}
                  
                  <Button
                    asChild
                    size="sm"
                    className="mt-2 w-full h-7 text-xs"
                  >
                    <a
                      href={project.affiliate_link || project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Zum Anbieter
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}