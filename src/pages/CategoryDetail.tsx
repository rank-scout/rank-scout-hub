import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCategoryBySlug } from "@/hooks/useCategories";
import { useProjects } from "@/hooks/useProjects";
import { useTheme, useCategoryTheme } from "@/hooks/useTheme";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ChevronRight, ExternalLink, Loader2, ArrowLeft } from "lucide-react";

export default function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: category, isLoading: categoryLoading } = useCategoryBySlug(slug || "");
  const { data: allProjects = [], isLoading: projectsLoading } = useProjects();
  const { setTheme } = useTheme();
  const categoryColorTheme = useCategoryTheme((category as any)?.color_theme);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Apply category theme when it loads
  useEffect(() => {
    if (category) {
      setTheme(categoryColorTheme);
    }
    // Reset to dark theme when leaving the page
    return () => {
      setTheme("dark");
    };
  }, [category, categoryColorTheme, setTheme]);
  
  const projects = useMemo(() => {
    return allProjects.filter((p) => p.category_id === category?.id && p.is_active);
  }, [allProjects, category?.id]);

  // Get all unique tags from projects
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    projects.forEach((p) => p.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags);
  }, [projects]);

  // Filter projects by search and tags
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = 
        !searchQuery ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.short_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTags = 
        selectedTags.length === 0 ||
        selectedTags.some((tag) => project.tags?.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [projects, searchQuery, selectedTags]);

  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case "DATING":
        return { bg: "bg-dating/10", text: "text-dating", border: "border-dating/30" };
      case "CASINO":
        return { bg: "bg-casino/10", text: "text-casino", border: "border-casino/30" };
      case "ADULT":
        return { bg: "bg-adult/10", text: "text-adult", border: "border-adult/30" };
      default:
        return { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30" };
    }
  };

  const getCountryScopeLabel = (scope: string) => {
    switch (scope) {
      case "AT": return "🇦🇹 Österreich";
      case "DE": return "🇩🇪 Deutschland";
      case "DACH": return "🇩🇪🇦🇹🇨🇭 DACH";
      case "EU": return "🇪🇺 EU";
      default: return scope;
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const isLoading = categoryLoading || projectsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer category={category} />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <section className="py-20">
            <div className="container mx-auto px-4 text-center">
              <h1 className="font-display font-bold text-4xl text-foreground mb-4">
                Kategorie nicht gefunden
              </h1>
              <p className="text-muted-foreground mb-8">
                Die gesuchte Kategorie existiert nicht oder wurde entfernt.
              </p>
              <Link to="/kategorien">
                <Button className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Zurück zu allen Kategorien
                </Button>
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  const theme = getThemeClasses(category.theme);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {/* Hero */}
        <section className="bg-hero-gradient py-16 md:py-20">
          <div className="container mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <Link to="/" className="hover:text-foreground transition-colors">Startseite</Link>
              <ChevronRight className="w-4 h-4" />
              <Link to="/kategorien" className="hover:text-foreground transition-colors">Kategorien</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground">{category.name}</span>
            </nav>

            <div className="flex items-start gap-6">
              <div className={`w-20 h-20 rounded-2xl ${theme.bg} flex items-center justify-center shrink-0`}>
                <span className="text-4xl">{category.icon || "📊"}</span>
              </div>
              <div>
                <h1 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-3">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-lg text-muted-foreground max-w-2xl">
                    {category.description}
                  </p>
                )}
                <p className={`mt-4 text-sm font-medium ${theme.text}`}>
                  {filteredProjects.length} {filteredProjects.length === 1 ? "Anbieter" : "Anbieter"} verfügbar
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Anbieter suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50 border-border/50"
                />
              </div>

              {/* Tag Chips */}
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {allTags.slice(0, 8).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedTags.includes(tag)
                          ? `${theme.bg} ${theme.text} ${theme.border} border`
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                  {selectedTags.length > 0 && (
                    <button
                      onClick={() => setSelectedTags([])}
                      className="px-3 py-1.5 rounded-full text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      Filter löschen
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  {searchQuery || selectedTags.length > 0
                    ? "Keine Anbieter gefunden. Versuche andere Suchbegriffe."
                    : "Keine Anbieter in dieser Kategorie."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project, index) => (
                  <div
                    key={project.id}
                    className="group bg-card rounded-2xl border border-border hover:border-primary/30 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {getCountryScopeLabel(project.country_scope)}
                      </Badge>
                    </div>

                    {project.short_description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {project.short_description}
                      </p>
                    )}

                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {project.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <Link to={`/go/${project.slug}`}>
                      <Button className="w-full gap-2 group-hover:bg-primary">
                        Zum Anbieter
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Back Link */}
        <section className="pb-16">
          <div className="container mx-auto px-4 text-center">
            <Link to="/kategorien" className="inline-flex items-center gap-2 text-primary hover:underline">
              <ArrowLeft className="w-4 h-4" />
              Alle Kategorien anzeigen
            </Link>
          </div>
        </section>
      </main>
      <Footer category={category} />
    </div>
  );
}
