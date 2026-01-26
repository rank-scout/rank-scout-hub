import { Star, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/hooks/useProjects";

export function ForumSidebar() {
  const { data: projects, isLoading } = useProjects();

  // Get top 3 projects by rating
  const topProjects = projects
    ?.filter((p) => p.is_active)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating / 2);
    const hasHalfStar = rating % 2 >= 1;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <Star className="w-3.5 h-3.5 fill-yellow-400/50 text-yellow-400" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-3.5 h-3.5 text-muted-foreground/30" />
        ))}
        <span className="ml-1.5 text-sm font-medium text-foreground">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!topProjects || topProjects.length === 0) {
    return null;
  }

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" />
          Top Empfehlungen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topProjects.map((project, index) => (
          <div
            key={project.id}
            className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
          >
            {/* Rank Badge */}
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
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
        ))}
      </CardContent>
    </Card>
  );
}
