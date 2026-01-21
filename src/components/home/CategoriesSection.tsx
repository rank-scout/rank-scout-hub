import { Link } from "react-router-dom";
import { ArrowRight, LayoutGrid, MapPin, Building2, Wrench, GraduationCap, TrendingUp, Newspaper } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// Icon-Mapping
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
  const { data: categories, isLoading } = useCategories();

  // Nur Hauptkategorien
  const mainCategories = categories?.filter(cat => !cat.parent_id) || [];

  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-4">
        
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-rose-700 font-bold tracking-wider text-sm uppercase mb-2 block">Marktübersicht</span>
            <h2 className="text-3xl font-bold tracking-tight text-blue-950 sm:text-4xl">
              Entdecke unsere Kompetenzbereiche
            </h2>
            <p className="mt-3 text-lg text-slate-600 max-w-2xl">
              Navigiere zielsicher durch das digitale Ökosystem. Von lokalen Dienstleistern bis zu globalen Software-Lösungen.
            </p>
          </div>
          <Button variant="outline" className="hidden sm:flex border-blue-200 text-blue-900 hover:bg-blue-50 hover:text-rose-700" asChild>
            <Link to="/categories" className="group">
              Alle Bereiche 
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-2xl bg-slate-50" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mainCategories.map((category) => {
              const Icon = getIconForCategory(category.slug);
              return (
                <Link
                  key={category.id}
                  to={`/${category.slug}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-100"
                >
                  <div className="relative z-10">
                    <div className="mb-6 inline-flex rounded-xl bg-slate-50 p-3 text-slate-700 group-hover:bg-blue-950 group-hover:text-white transition-all duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-blue-950 group-hover:text-rose-700 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-slate-500 line-clamp-3 leading-relaxed">
                      {category.description || `Der zentrale Hub für ${category.name}. Vergleiche, Rankings und Expertenwissen für fundierte Entscheidungen.`}
                    </p>
                  </div>
                  
                  <div className="mt-8 flex items-center text-sm font-bold text-blue-900 group-hover:text-rose-700 transition-colors">
                    Bereich erkunden <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>

                  {/* Dekorativer Hintergrund-Effekt */}
                  <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-slate-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center sm:hidden">
          <Button className="w-full bg-blue-950 text-white" asChild>
            <Link to="/categories">Alle Kategorien ansehen</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};