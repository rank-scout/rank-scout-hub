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
  Clock, 
  Tag, 
  Newspaper // Nutze Lucide Icons, da Solar Icons Probleme machten
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const getOptimizedImageUrl = (url: string | null | undefined, width = 600) => {
  if (!url) return "";
  if (url.includes("images.unsplash.com")) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}w=${width}&q=80&auto=format&fit=crop`;
  }
  return url;
};

export function NewsSection() {
  const { content } = useHomeContent();
  const limit = content?.news?.count || 6;

  // Wir holen Threads aus der Kategorie 'magazin' oder einfach die neuesten gepinnten Threads
  const { data: posts, isLoading } = useQuery({
    queryKey: ["latest-news-magazin", limit],
    queryFn: async () => {
      // 1. Erst die Kategorie ID holen (optional, aber sauberer)
      const { data: catData } = await supabase
        .from('forum_categories')
        .select('id')
        .eq('slug', 'magazin')
        .single();
      
      let query = supabase
        .from("forum_threads")
        .select("*, forum_categories(name, slug)")
        .order("created_at", { ascending: false })
        .limit(limit);

      // Wenn wir die Kategorie gefunden haben, filtern wir danach
      if (catData) {
        query = query.eq('category_id', catData.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !posts || posts.length === 0) return null;

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container px-4 mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/10">
              <Newspaper className="w-4 h-4" />
              Rank-Scout Magazin
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-4 leading-tight">
              {content?.news?.headline || "Insights & Tech Trends"}
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed max-w-xl">
              {content?.news?.subheadline || "Deep-Dives in die Welt von Software, Krypto und AI."}
            </p>
          </div>

          <div className="hidden md:flex gap-4">
             <Button variant="outline" className="rounded-full" asChild>
                <Link to="/forum">Zum Forum</Link>
             </Button>
          </div>
        </div>

        {/* Carousel */}
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {posts.map((post) => {
              const date = post.created_at ? format(new Date(post.created_at), "d. MMM yyyy", { locale: de }) : "Heute";
              // Lesezeit schätzen (Wörter / 200)
              const wordCount = post.content ? post.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
              const readTime = Math.max(1, Math.ceil(wordCount / 200)) + " Min.";

              return (
                <CarouselItem key={post.id} className="pl-4 md:basis-1/2 lg:basis-1/3 h-full">
                  <Link to={`/forum/${post.slug}`} className="group block h-full">
                    <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 h-full flex flex-col transition-all duration-500 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1">
                      
                      {/* Image Area */}
                      <div className="aspect-[16/9] relative overflow-hidden">
                        <div className="absolute inset-0 bg-slate-200 animate-pulse" />
                        {post.featured_image && (
                          <img 
                            src={getOptimizedImageUrl(post.featured_image)} 
                            alt={post.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60" />
                        
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold rounded-full shadow-sm">
                            {post.forum_categories?.name || "News"}
                          </span>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-8 flex flex-col flex-grow">
                        <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                              <Calendar className="w-3.5 h-3.5 text-primary" />
                              {date}
                           </div>
                           <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                              <Clock className="w-3.5 h-3.5 text-primary" />
                              {readTime}
                           </div>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">
                          {post.seo_description || "Lies den vollständigen Artikel im Forum..."}
                        </p>

                        <div className="flex items-center text-sm font-bold text-primary mt-auto group/btn">
                          Artikel lesen
                          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <div className="flex justify-end gap-2 mt-8 md:hidden">
            <CarouselPrevious className="static translate-y-0" />
            <CarouselNext className="static translate-y-0" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}