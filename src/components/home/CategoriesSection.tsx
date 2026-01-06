import { useCategories } from "@/hooks/useCategories";
import { useProjects } from "@/hooks/useProjects";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function CategoriesSection() {
  const { data: categories = [], isLoading } = useCategories();
  const { data: projects = [] } = useProjects();

  // Get project counts per category
  const getProjectCount = (categoryId: string) => {
    return projects.filter((p) => p.category_id === categoryId).length;
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-card rounded-2xl animate-pulse" />
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.slice(0, 6).map((category, index) => {
            const theme = getThemeClasses(category.theme);
            const projectCount = getProjectCount(category.id);

            return (
              <Link
                key={category.id}
                to={`/kategorie/${category.slug}`}
                className={`group relative bg-card rounded-2xl p-6 border ${theme.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${theme.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <span className="text-2xl">{category.icon || "📊"}</span>
                </div>

                {/* Content */}
                <h3 className="font-display font-semibold text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                
                {category.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {category.description}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${theme.text}`}>
                    {projectCount} Anbieter
                  </span>
                  <ArrowRight className={`w-4 h-4 ${theme.text} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
