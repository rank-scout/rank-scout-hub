import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCategories } from "@/hooks/useCategories";
import { useProjects } from "@/hooks/useProjects";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Loader2 } from "lucide-react";

export default function Categories() {
  const { data: categories = [], isLoading } = useCategories();
  const { data: projects = [] } = useProjects();
  const [searchQuery, setSearchQuery] = useState("");

  const getProjectCount = (categoryId: string) => {
    return projects.filter((p) => p.category_id === categoryId && p.is_active).length;
  };

  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case "DATING":
        return {
          bg: "bg-dating/10",
          border: "border-dating/20 hover:border-dating/50",
          text: "text-dating",
          gradient: "from-dating/20 to-transparent",
        };
      case "CASINO":
        return {
          bg: "bg-casino/10",
          border: "border-casino/20 hover:border-casino/50",
          text: "text-casino",
          gradient: "from-casino/20 to-transparent",
        };
      case "ADULT":
        return {
          bg: "bg-adult/10",
          border: "border-adult/20 hover:border-adult/50",
          text: "text-adult",
          gradient: "from-adult/20 to-transparent",
        };
      default:
        return {
          bg: "bg-primary/10",
          border: "border-primary/20 hover:border-primary/50",
          text: "text-primary",
          gradient: "from-primary/20 to-transparent",
        };
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {/* Hero */}
        <section className="bg-hero-gradient py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
                Alle Kategorien
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Entdecke alle Vergleichskategorien und finde die besten Anbieter für deine Bedürfnisse.
              </p>
              
              {/* Search */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Kategorien durchsuchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-muted/50 border-border/50 rounded-xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">
                  {searchQuery ? `Keine Kategorien gefunden für "${searchQuery}"` : "Keine Kategorien vorhanden."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category, index) => {
                  const theme = getThemeClasses(category.theme);
                  const projectCount = getProjectCount(category.id);

                  return (
                    <Link
                      key={category.id}
                      to={`/kategorien/${category.slug}`}
                      className={`group relative bg-card rounded-2xl p-6 border ${theme.border} transition-all duration-300 hover:-translate-y-2 hover:shadow-lg overflow-hidden`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {/* Gradient overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                      
                      <div className="relative z-10">
                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-xl ${theme.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                          <span className="text-3xl">{category.icon || "📊"}</span>
                        </div>

                        {/* Content */}
                        <h2 className="font-display font-bold text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                          {category.name}
                        </h2>
                        
                        {category.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {category.description}
                          </p>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                          <span className={`text-sm font-medium ${theme.text}`}>
                            {projectCount} {projectCount === 1 ? "Anbieter" : "Anbieter"}
                          </span>
                          <ArrowRight className={`w-5 h-5 ${theme.text} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
