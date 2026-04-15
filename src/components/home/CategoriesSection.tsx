import { Link } from "react-router-dom";
import { 
  AltArrowRight, 
  Widget, 
  MapPoint, 
  Buildings, 
  Settings, 
  Diploma, 
  GraphUp, 
  Notes, 
  Banknote, 
  ShieldCheck, 
  Gamepad 
} from "@solar-icons/react";
import { useCategories } from "@/hooks/useCategories";
import { useHomeContent } from "@/hooks/useSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCategoriesRoute, getCategoryRoute } from "@/lib/routes";

const getIconForCategory = (slug: string) => {
  const s = slug.toLowerCase();
  if (s.includes('agentur') || s.includes('agency')) return Buildings;
  if (s.includes('local') || s.includes('stadt')) return MapPoint;
  if (s.includes('tool') || s.includes('software')) return Settings;
  if (s.includes('wissen') || s.includes('kurs')) return Diploma;
  if (s.includes('news') || s.includes('aktuell')) return Notes;
  if (s.includes('marketing') || s.includes('seo')) return GraphUp;
  if (s.includes('finanz') || s.includes('krypto') || s.includes('money')) return Banknote;
  if (s.includes('versich') || s.includes('recht')) return ShieldCheck;
  if (s.includes('game') || s.includes('spiel')) return Gamepad;
  return Widget;
};

export const CategoriesSection = () => {
  const { data: categories, isLoading: isCatsLoading } = useCategories();
  const { content } = useHomeContent();

  if (!content) return null;

  const mainCategories = categories || [];
  const limit = content.categories.count || 6; 

  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden" id="categories">
      {/* Background Glow - Jetzt mit Orange-Touch oben rechts */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-secondary/5 blur-[120px] pointer-events-none z-0" />
      
      <div className="container px-4 mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge 
            variant="outline" 
            className="mb-6 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] bg-secondary/10 text-secondary border-secondary/20 rounded-full"
          >
              Marktübersicht
          </Badge>
          <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-primary mb-6">
            {content.categories.title || "Wähle deinen Bereich"}
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed font-light">
            {content.categories.subtitle || "Detaillierte Vergleiche und Übersichten für verschiedene Branchen."}
          </p>
        </div>

        {/* Grid Section */}
        {isCatsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 rounded-[2rem] bg-slate-50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {mainCategories.slice(0, limit).map((category) => {
              const CategoryIcon = getIconForCategory(category.slug);
              
              const customText = (category as any).button_text;
              const globalFallback = content.categories.button_card;
              const finalButtonText = (customText && customText.trim() !== "")
                ? customText
                : (globalFallback || "Vergleich ansehen");
              
              return (
                <Link
                  key={category.id}
                  to={getCategoryRoute(category.slug)}
                  className="group relative flex flex-col p-8 bg-white rounded-[2rem] border border-primary/10 transition-all duration-500 hover:border-secondary/40 hover:bg-secondary/[0.02] active:scale-[0.98] overflow-hidden"
                >
                  {/* Icon Wrapper: Blau (Normal) -> Orange (Hover) */}
                  <div className="relative mb-8 h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-secondary group-hover:text-white transition-all duration-500 border border-primary/10 group-hover:border-secondary shadow-sm">
                    <CategoryIcon weight="Bold" className="h-8 w-8" />
                  </div>
                  
                  {/* Content Area: Titel wird bei Hover Orange */}
                  <h3 className="text-xl md:text-2xl font-display font-bold text-primary mb-3 group-hover:text-secondary transition-colors duration-300">
                    {category.name}
                  </h3>
                  
                  <p className="text-slate-500 leading-relaxed text-sm mb-8 flex-grow font-light">
                    {category.description || `Vergleiche Anbieter, Tools und Modelle im Bereich ${category.name} im Überblick.`}
                  </p>
                  
                  {/* Footer CTA: Blau -> Orange */}
                  <div className="mt-auto flex items-center text-xs font-bold text-primary/60 group-hover:text-secondary group-hover:gap-3 gap-2 transition-all uppercase tracking-widest">
                    {finalButtonText}
                    <AltArrowRight weight="Bold" className="h-5 w-5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* View All Button - Dezent Orange bei Hover */}
        <div className="mt-16 text-center">
          <Button 
            variant="outline" 
            size="lg" 
            className="gap-3 h-14 px-10 rounded-full border-primary/10 text-primary font-bold hover:bg-secondary hover:text-white hover:border-secondary transition-all duration-300 shadow-none" 
            asChild
          >
            <Link to={getCategoriesRoute()}>
              <Widget weight="Bold" className="w-5 h-5" />
              Alle Kategorien durchstöbern
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};