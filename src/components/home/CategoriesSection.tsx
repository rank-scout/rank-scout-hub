import { useCategories } from "@/hooks/useCategories";
import { useProjects } from "@/hooks/useProjects";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function CategoriesSection() {
  const { data: categories = [], isLoading } = useCategories();
  const { data: projects = [] } = useProjects();

  // Get projects for a category (top 4)
  const getCategoryProjects = (categoryId: string) => {
    return projects
      .filter((p) => p.category_id === categoryId && p.is_active)
      .slice(0, 4);
  };

  // Get theme color class
  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case "DATING":
        return {
          bg: "bg-dating/10",
          border: "border-dating/20 hover:border-dating/50",
          text: "text-dating",
        };
      case "CASINO":
        return {
          bg: "bg-casino/10",
          border: "border-casino/20 hover:border-casino/50",
          text: "text-casino",
        };
      case "ADULT":
        return {
          bg: "bg-adult/10",
          border: "border-adult/20 hover:border-adult/50",
          text: "text-adult",
        };
      default:
        return {
          bg: "bg-primary/10",
          border: "border-primary/20 hover:border-primary/50",
          text: "text-primary",
        };
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-card rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
            Beliebte Vergleichskategorien
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Entdecke alle Bereiche und finde die besten Anbieter in jeder Kategorie.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.slice(0, 4).map((category, index) => {
            const theme = getThemeClasses(category.theme);
            const categoryProjects = getCategoryProjects(category.id);

            return (
              <div
                key={category.id}
                className={`group relative bg-card rounded-2xl p-6 border ${theme.border} transition-all duration-300 hover:shadow-lg`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${theme.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <span className="text-2xl">{category.icon || "📊"}</span>
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-xl text-foreground group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className={`text-sm ${theme.text}`}>
                        {categoryProjects.length} Anbieter
                      </p>
                    </div>
                  </div>
                  <Link 
                    to={`/kategorien/${category.slug}`}
                    className={`text-sm font-medium ${theme.text} flex items-center gap-1 hover:underline`}
                  >
                    Alle anzeigen
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                
                {category.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {category.description}
                  </p>
                )}

                {/* Projects List */}
                {categoryProjects.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {categoryProjects.map((project) => (
                      <Link
                        key={project.id}
                        to={`/go/${project.slug}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group/item"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate group-hover/item:text-primary transition-colors">
                            {project.name}
                          </p>
                          {project.short_description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {project.short_description}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover/item:text-primary shrink-0 ml-2" />
                      </Link>
                    ))}
                  </div>
                )}

                {categoryProjects.length === 0 && (
                  <p className="text-sm text-muted-foreground italic mt-4">
                    Noch keine Anbieter in dieser Kategorie.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* View All Link */}
        <div className="text-center mt-10">
          <Link to="/kategorien">
            <Button variant="outline" size="lg" className="gap-2">
              Alle Kategorien ansehen
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
