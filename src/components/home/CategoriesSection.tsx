import { Link } from "react-router-dom";
import { ArrowRight, LayoutGrid, MapPin, Building2, Wrench, GraduationCap, TrendingUp, Newspaper, Coins, ShieldCheck, Gamepad2 } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useHomeContent } from "@/hooks/useSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const getIconForCategory = (slug: string) => {
  if (slug.includes('agentur') || slug.includes('agency')) return Building2;
  if (slug.includes('local') || slug.includes('stadt')) return MapPin;
  if (slug.includes('tool') || slug.includes('software')) return Wrench;
  if (slug.includes('wissen') || slug.includes('kurs')) return GraduationCap;
  if (slug.includes('news') || slug.includes('aktuell')) return Newspaper;
  if (slug.includes('marketing') || slug.includes('seo')) return TrendingUp;
  if (slug.includes('finanz') || slug.includes('krypto') || slug.includes('money')) return Coins;
  if (slug.includes('versich') || slug.includes('recht')) return ShieldCheck;
  if (slug.includes('game') || slug.includes('spiel')) return Gamepad2;
  return LayoutGrid;
};

export const CategoriesSection = () => {
  const { data: categories, isLoading: isCatsLoading } = useCategories();
  const { content } = useHomeContent();

  if (!content) return null;

  const mainCategories = categories || [];
  const limit = content.categories.count || 6; 

  return (
    <section className="py-20 bg-white relative overflow-hidden" id="categories">
      {/* Subtle Background */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-50 via-white to-white opacity-50 pointer-events-none" />
      
      <div className="container px-4 mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4 px-3 py-1 text-xs font-bold uppercase tracking-wider bg-orange-50 text-orange-600 border-orange-200">
             Marktübersicht
          </Badge>
          {/* FIX: text-primary für "Unser Blau" */}
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary mb-4 font-display">
            {content.categories.title || "Wählen Sie Ihren Bereich"}
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            {content.categories.subtitle || "Detaillierte Vergleiche und Bestenlisten für jede Branche."}
          </p>
        </div>

        {/* Grid Section */}
        {isCatsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {mainCategories.slice(0, limit).map((category) => {
              const Icon = getIconForCategory(category.slug);
              
              return (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="group relative flex flex-col p-8 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-orange-500/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  {/* Hover Effect (Orange Glow) */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-50 to-orange-100 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 opacity-0 group-hover:opacity-100 duration-300" />
                  
                  {/* Icon Wrapper: Slate (Standard) -> Orange (Hover) */}
                  <div className="relative mb-6 h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shadow-sm border border-slate-100 group-hover:border-orange-600">
                    <Icon className="h-7 w-7" />
                  </div>
                  
                  {/* Content: Slate (Standard) -> Orange (Hover) */}
                  <h3 className="relative text-xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">
                    {category.name}
                  </h3>
                  
                  <p className="relative text-slate-500 line-clamp-2 leading-relaxed text-sm mb-6 flex-grow">
                    {category.description || `Finde die besten Anbieter und Tools im Bereich ${category.name}. Unabhängig getestet.`}
                  </p>
                  
                  {/* CTA: Primary (Blau) -> Orange (Hover) */}
                  <div className="relative mt-auto flex items-center text-sm font-bold text-primary group-hover:text-orange-600 group-hover:translate-x-1 transition-transform">
                    {content.categories.button_card || "Vergleich ansehen"} 
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* View All Button */}
        <div className="mt-16 text-center">
          <Button variant="outline" size="lg" className="gap-2 h-12 px-8 text-base shadow-sm hover:bg-slate-50 hover:text-orange-600 hover:border-orange-200 transition-colors" asChild>
            <Link to="/kategorien">
              <LayoutGrid className="w-4 h-4" />
              Alle Kategorien durchstöbern
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};