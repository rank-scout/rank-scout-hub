import { Link } from "react-router-dom";
import { ArrowRight, LayoutGrid, MapPin, Building2, Wrench, GraduationCap, TrendingUp, Newspaper, MessageSquare } from "lucide-react";
// WICHTIG: Wir nutzen jetzt die Forum-Datenquelle!
import { useForumCategories } from "@/hooks/useForum";
import { useHomeContent } from "@/hooks/useSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// Helper für Icons basierend auf dem Slug (angepasst für typische Forum-Slugs)
const getIconForCategory = (slug: string) => {
  if (slug.includes('agentur') || slug.includes('agency') || slug.includes('business')) return Building2;
  if (slug.includes('local') || slug.includes('stadt') || slug.includes('region')) return MapPin;
  if (slug.includes('tool') || slug.includes('software') || slug.includes('tech')) return Wrench;
  if (slug.includes('wissen') || slug.includes('kurs') || slug.includes('faq')) return GraduationCap;
  if (slug.includes('news') || slug.includes('aktuell')) return Newspaper;
  if (slug.includes('marketing') || slug.includes('seo') || slug.includes('growth')) return TrendingUp;
  if (slug.includes('dating') || slug.includes('love') || slug.includes('beziehung')) return MessageSquare;
  return LayoutGrid;
};

export const CategoriesSection = () => {
  // FIX: Wir laden hier jetzt die ECHTEN Forum-Kategorien
  const { data: forumCategories, isLoading: isCatsLoading } = useForumCategories(); 
  const { content } = useHomeContent();

  // Loading State
  if (isCatsLoading) {
    return (
      <section className="bg-white py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Fallback, falls Content noch nicht geladen
  if (!content) return null;

  // Wir filtern nur aktive Kategorien
  const mainCategories = forumCategories?.filter(c => c.is_active) || [];

  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-4">
        
        {/* Headline Section */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-blue-950 mb-6 font-display">
            {content.categories_headline || "Community Hub"}
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
             {content.categories_subheadline || "Wähle ein Thema und diskutiere mit unseren Experten."}
          </p>
        </div>

        {/* Categories Grid */}
        {mainCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainCategories.map((category) => {
              const Icon = getIconForCategory(category.slug);
              
              return (
                <Link
                  key={category.id}
                  to={`/forum/kategorie/${category.slug}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-slate-50 p-8 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border border-slate-100"
                >
                  {/* Icon Box */}
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100 group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors duration-300 text-blue-950">
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="mb-3 text-xl font-bold text-blue-950 group-hover:text-rose-700 transition-colors">
                    {category.name}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-slate-500 line-clamp-3 leading-relaxed mb-8">
                    {category.description || `Alles zum Thema ${category.name}. Diskutiere mit und teile deine Erfahrungen.`}
                  </p>
                  
                  {/* CTA Link Style */}
                  <div className="mt-auto flex items-center text-sm font-bold text-blue-900 group-hover:text-rose-700 transition-colors">
                    Zum Forum <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-slate-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-muted-foreground">Noch keine Forum-Kategorien angelegt.</p>
            <Button variant="link" asChild className="mt-2">
              <Link to="/admin/forum">Jetzt im Admin anlegen</Link>
            </Button>
          </div>
        )}

        {/* Mobile "View All" Button */}
        <div className="mt-10 text-center sm:hidden">
          <Button className="w-full" asChild>
             <Link to="/forum">Alle Themen ansehen</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};