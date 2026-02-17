import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCategories } from "@/hooks/useCategories";
import { useProjects } from "@/hooks/useProjects";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { Helmet } from "react-helmet-async"; 
// KYRA FIX: Import für Tracking
import { useTrackView } from "@/hooks/useTrackView";

export default function Categories() {
  // KYRA FIX: Tracking für Kategorie-Übersicht aktivieren
  useTrackView("categories-overview", "page");

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
      case "FINANCE":
        return {
          bg: "bg-finance/10",
          border: "border-finance/20 hover:border-finance/50",
          text: "text-finance",
          gradient: "from-finance/20 to-transparent",
        };
      case "HEALTH":
        return {
          bg: "bg-health/10",
          border: "border-health/20 hover:border-health/50",
          text: "text-health",
          gradient: "from-health/20 to-transparent",
        };
      case "SOFTWARE":
        return {
          bg: "bg-software/10",
          border: "border-software/20 hover:border-software/50",
          text: "text-software",
          gradient: "from-software/20 to-transparent",
        };
      default:
        return {
          bg: "bg-slate-50",
          border: "border-slate-200 hover:border-primary/50",
          text: "text-slate-600",
          gradient: "from-slate-100 to-transparent",
        };
    }
  };

  const filteredCategories = categories.filter((category) => {
    if (!category.is_active) return false;
    if (searchQuery.trim() === "") return true;
    return (
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Helmet>
        <title>Alle Kategorien im Vergleich | Rank-Scout</title>
        <meta name="description" content="Finde den passenden Vergleich für deine Bedürfnisse. Alle Kategorien von Software bis Finanzen in der Übersicht." />
        <link rel="canonical" href="https://rank-scout.com/kategorien" />
      </Helmet>

      <Header />

      <main className="flex-grow pt-24 pb-16">
        <section className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h1 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
              Unsere Vergleiche
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Wähle eine Kategorie, um die besten Anbieter und Produkte zu finden.
            </p>
            
            <div className="relative max-w-md mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                type="text"
                placeholder="Kategorie suchen..."
                className="pl-10 h-12 rounded-xl bg-white shadow-sm border-slate-200 focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-muted-foreground">Keine Kategorien gefunden.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCategories.map((category) => {
                  const theme = getThemeClasses(category.theme);
                  const projectCount = getProjectCount(category.id);

                  return (
                    <Link 
                      key={category.id} 
                      to={`/kategorien/${category.slug}`}
                      className="group block h-full"
                    >
                      <div className={`h-full bg-white rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden flex flex-col ${theme.border} hover:shadow-lg`}>
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        
                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-2xl ${theme.bg} ${theme.text} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
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