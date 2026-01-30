import { Link } from "react-router-dom";
import { ArrowRight, LayoutGrid, MapPin, Building2, Wrench, GraduationCap, TrendingUp, Newspaper } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useHomeContent } from "@/hooks/useSettings";
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
  const { content } = useHomeContent();

  if (!content) return null;

  const mainCategories = categories || [];
  // WICHTIG: Das Limit kommt aus dem CMS, Fallback auf 6
  const limit = content.categories.count || 6; 

  return (
    <section className="bg-white py-24 border-t border-slate-100">
      <div className="container mx-auto px-4">
        
        <div className="mb-16 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-secondary font-bold uppercase tracking-widest text-sm">Entdecken</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mt-2">
              {content.categories.headline}
            </h2>
          </div>
          <Button variant="outline" className="hidden sm:flex gap-2 border-primary/10 hover:border-primary/30 hover:bg-slate-50 text-primary" asChild>
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
            {/* Hier wenden wir das Limit an */}
            {mainCategories.slice(0, limit).map((category) => {
              const Icon = category.icon ? LayoutGrid : getIconForCategory(category.slug);
              
              return (
                <Link 
                  key={category.id} 
                  to={`/${category.slug}`}
                  className="group relative flex flex-col p-8 bg-white border border-slate-100 rounded-3xl hover:shadow-xl hover:shadow-slate-200/50 hover:border-secondary/30 transition-all duration-300 overflow-hidden"
                >
                  <div className="mb-6 h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-secondary group-hover:text-white transition-all duration-300 shadow-sm">
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <h3 className="mb-3 text-xl font-bold text-primary group-hover:text-secondary transition-colors">
                    {category.name}
                  </h3>
                  
                  <p className="text-slate-500 line-clamp-2 leading-relaxed text-sm mb-6">
                    {category.description || `Der zentrale Hub für ${category.name}. Vergleiche und Rankings.`}
                  </p>
                  
                  <div className="mt-auto flex items-center text-sm font-bold text-primary/80 group-hover:text-secondary transition-colors">
                    {content.categories.button_card || "Bereich erkunden"} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center sm:hidden">
          <Button className="w-full bg-primary text-white" asChild>
            <Link to="/kategorien">Alle Kategorien ansehen</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};