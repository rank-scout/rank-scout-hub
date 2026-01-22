import { Link } from "react-router-dom";
import { ArrowRight, LayoutGrid, MapPin, Building2, Wrench, GraduationCap, TrendingUp, Newspaper } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useHomeContent } from "@/hooks/useSettings"; // NEW
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const getIconForCategory = (slug: string) => {
  if (slug.includes('agentur') || slug.includes('agency')) return Building2;
  if (slug.includes('local') || slug.includes('stadt')) return MapPin;
  if (slug.includes('tool') || slug.includes('software')) return Wrench;
  if (slug.includes('wissen') || slug.includes('kurs')) return GraduationCap;
  if (slug.includes('news') || slug.includes('aktuell')) return Newspaper;
  if (slug.includes('marketing') || slug.includes('seo')) return TrendingUp;
  return LayoutGrid;
};

export const CategoriesSection = () => {
  const { data: categories, isLoading: isCatsLoading } = useCategories();
  const { content } = useHomeContent(); // Settings laden

  if (!content) return null; // Warten auf Settings

  const mainCategories = categories?.filter(cat => !cat.parent_id) || [];

  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-4">
        
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-display font-bold text-primary">
              {content.categories.headline}
            </h2>
          </div>
          <Button variant="ghost" className="hidden sm:flex gap-2 text-muted-foreground hover:text-primary" asChild>
            <Link to="/kategorien">Alle anzeigen <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </div>

        {isCatsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainCategories.slice(0, 6).map((category) => {
              const Icon = category.icon ? LayoutGrid : getIconForCategory(category.slug);
              
              return (
                <Link 
                  key={category.id} 
                  to={`/${category.slug}`}
                  className="group relative flex flex-col p-8 bg-white border border-slate-100 rounded-3xl hover:shadow-xl hover:border-blue-100 transition-all duration-300 overflow-hidden"
                >
                  <div className="mb-6 h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-blue-950 group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors duration-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-blue-950 group-hover:text-rose-700 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-slate-500 line-clamp-3 leading-relaxed">
                    {category.description || `Der zentrale Hub für ${category.name}. Vergleiche, Rankings und Expertenwissen für fundierte Entscheidungen.`}
                  </p>
                  
                  <div className="mt-8 flex items-center text-sm font-bold text-blue-900 group-hover:text-rose-700 transition-colors">
                    Bereich erkunden <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>

                  <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-slate-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center sm:hidden">
          <Button className="w-full bg-blue-950 text-white" asChild>
            <Link to="/kategorien">Alle Kategorien ansehen</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};