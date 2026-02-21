import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useHomeContent } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { 
  ArrowRight, 
  Calendar, 
  Layers,
  MessageSquare,
  Newspaper
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { FadeIn } from "@/components/ui/FadeIn";

type HybridFeedItem = {
  id: string;
  title: string;
  description: string;
  slug: string;
  image: string | null;
  date: string;
  type: "category" | "forum";
  categoryName: string;
};

export function NewsSection() {
  const { content } = useHomeContent();
  
  // Wir überschreiben das riskante CMS-Limit mit einem festen Fetch-Limit für den Slider.
  // 12 Beiträge garantieren eine massive Fülle an Content zum Durchklicken.
  const fetchLimit = 12;

  const { data: feedItems, isLoading } = useQuery({
    queryKey: ["hybrid-news-feed", fetchLimit],
    queryFn: async () => {
      // 1. Fetch Kategorien (Strikt NUR comparison und review - keine Hubs!)
      const { data: categories, error: catError } = await supabase
        .from("categories")
        .select("id, name, description, slug, created_at, icon, banner_override, card_image_url")
        .eq("is_active", true)
        .in("template", ["comparison", "review"])
        .order("created_at", { ascending: false })
        .limit(fetchLimit);

      if (catError) console.error("Fehler beim Laden der Kategorien:", catError);

      // 2. Fetch Magazin & Forum (Performance-optimiert über seo_description)
      const { data: threads, error: threadError } = await supabase
        .from("forum_threads")
        .select("id, title, seo_description, slug, created_at, featured_image, featured_image_url")
        .order("created_at", { ascending: false })
        .limit(fetchLimit);

      if (threadError) console.error("Fehler beim Laden der Forum-Threads:", threadError);

      const items: HybridFeedItem[] = [];

      if (categories) {
        categories.forEach(cat => {
          items.push({
            id: `cat-${cat.id}`,
            title: cat.name,
            description: cat.description || "Detaillierter Vergleich und Experten-Ratgeber.",
            slug: `/${cat.slug}`,
            image: cat.card_image_url || cat.banner_override || cat.icon || null,
            date: cat.created_at || new Date().toISOString(),
            type: "category",
            categoryName: "Vergleich"
          });
        });
      }

      if (threads) {
        threads.forEach(thread => {
          items.push({
            id: `forum-${thread.id}`,
            title: thread.title,
            description: thread.seo_description || "Spannende Einblicke und Analysen aus unserer Community.",
            slug: `/forum/${thread.slug}`,
            image: thread.featured_image || thread.featured_image_url || null, 
            date: thread.created_at || new Date().toISOString(),
            type: "forum",
            categoryName: "Community"
          });
        });
      }

      // 3. Globales Sortieren nach Datum und Capping auf die absoluten Top 12
      return items
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, fetchLimit);
    },
  });

  if (isLoading || !feedItems || feedItems.length === 0) return null;

  return (
    <section className="py-24 bg-white dark:bg-slate-950 relative overflow-hidden">
      <div className="container px-4 mx-auto relative z-10">
        
        {/* Section Header */}
        <FadeIn className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/10">
              <Newspaper className="w-4 h-4" />
              {content?.news?.headline || "Rank-Scout Magazin"}
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-4 leading-tight">
              {content?.news?.subheadline || "Aktuelles & Ratgeber"}
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
              Die neuesten Vergleiche, Artikel und Experten-Tipps aus unserer Redaktion.
            </p>
          </div>

          <div className="hidden md:flex gap-4">
              <Button variant="outline" className="rounded-full" asChild>
                 <Link to="/forum">Zum Magazin</Link>
              </Button>
          </div>
        </FadeIn>

        {/* Carousel */}
        <Carousel
          opts={{
            align: "start",
            loop: feedItems.length > 4, // Loop nur aktivieren, wenn wir über die 4 Desktop-Cards hinausgehen
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {feedItems.map((item) => {
              const dateFormatted = format(new Date(item.date), "d. MMM yyyy", { locale: de });
              
              // 4 Cards am Desktop (lg:basis-1/4)
              return (
                <CarouselItem key={item.id} className="pl-4 md:basis-1/2 lg:basis-1/4 h-full">
                  <Link to={item.slug} className="group block h-full">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 h-full flex flex-col transition-all duration-500 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1">
                      
                      {/* Image Area */}
                      <div className="aspect-[16/9] relative overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
                            {item.type === "category" ? <Layers className="w-12 h-12 opacity-20" /> : <MessageSquare className="w-12 h-12 opacity-20" />}
                          </div>
                        )}
                      </div>

                      {/* Content Area */}
                      <div className="p-8 flex flex-col flex-grow bg-white dark:bg-slate-900">
                        
                        {/* Meta-Zeile: Datum & Badge */}
                        <div className="flex items-center justify-between mb-5">
                           <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {dateFormatted}
                           </div>
                           <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider rounded-md border border-slate-200 dark:border-slate-700 shadow-sm">
                             {item.type === "category" ? <Layers className="w-3 h-3 text-primary" /> : <MessageSquare className="w-3 h-3 text-primary" />}
                             {item.categoryName}
                           </div>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">
                          {item.title}
                        </h3>
                        
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow min-h-[4.5rem]">
                          {item.description}
                        </p>

                        <div className="flex items-center text-sm font-bold text-primary mt-auto group/btn pt-2">
                          {item.type === "category" ? "Vergleich ansehen" : "Beitrag lesen"}
                          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          
          <div className="flex justify-end gap-2 mt-8">
            <CarouselPrevious className="static translate-y-0 bg-white" />
            <CarouselNext className="static translate-y-0 bg-white" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}