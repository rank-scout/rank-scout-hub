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
  AltArrowRight, 
  Calendar, 
  ClockCircle, 
  Tag, 
  Widget
} from "@solar-icons/react";

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

  const { data: posts, isLoading } = useQuery({
    queryKey: ["latest-news-precision-tight", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_threads")
        .select(`
          id, title, slug, content, seo_description, created_at, featured_image_url,
          forum_categories ( name )
        `)
        .eq("status", "published")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    enabled: !!content
  });

  if (!content || !posts || posts.length === 0) return null;

  if (isLoading) {
    return <div className="py-16 animate-pulse container bg-white h-80 rounded-[2rem]" />;
  }

  return (
    <section className="py-16 bg-white border-t border-slate-100">
      <div className="container px-4 mx-auto">
        
        {/* Header - Gestrafft & Präzise */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.25em] text-[10px] mb-3">
              <Widget weight="Bold" className="w-4 h-4" />
              Wissen & News
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary tracking-tight">
              Aktuelles & Ratgeber
            </h2>
            <p className="text-slate-500 mt-4 text-lg leading-relaxed font-light">
              Tipps und Tricks unserer Experten. Wir bringen dir den Wissensvorsprung, den du brauchst.
            </p>
          </div>
          
          <div className="hidden md:block">
             <Button variant="ghost" className="group text-sm font-bold text-slate-400 hover:text-primary transition-all px-0" asChild>
                <Link to="/forum" className="flex items-center gap-2">
                    Alle Beiträge 
                    <AltArrowRight weight="Bold" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
             </Button>
          </div>
        </div>

        {/* --- CAROUSEL --- */}
        <Carousel
          opts={{ align: "start", loop: true }}
          className="w-full"
        >
          <CarouselContent className="-ml-6 md:-ml-8">
            {posts.map((post) => (
              <CarouselItem key={post.id} className="pl-6 md:pl-8 md:basis-1/2 lg:basis-1/3">
                <NewsCard post={post} />
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Navigation Buttons - JETZT ZENTRIERT UNTER DEM SLIDER */}
          <div className="flex justify-center items-center gap-4 mt-12">
            <CarouselPrevious className="static translate-y-0 h-12 w-12 border-primary/10 hover:border-primary/40 hover:bg-white text-primary transition-all" />
            <div className="h-px w-8 bg-slate-100 md:block hidden" />
            <CarouselNext className="static translate-y-0 h-12 w-12 border-primary/10 hover:border-primary/40 hover:bg-white text-primary transition-all" />
          </div>
        </Carousel>

        {/* Mobile Button - Nur falls nötig */}
        <div className="mt-10 md:hidden">
            <Button className="w-full py-6 rounded-xl bg-primary text-white font-bold" asChild>
                <Link to="/forum">Alle Beiträge lesen</Link>
            </Button>
        </div>

      </div>
    </section>
  );
}

function NewsCard({ post }: { post: any }) {
    const date = new Date(post.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
    const readTime = Math.max(1, Math.ceil((post.content?.length || 0) / 1000)) + " Min. Lesezeit";
    // @ts-ignore
    const categoryName = post.forum_categories?.name || "Insights";

    return (
        <Link 
            to={`/forum/${post.slug}`}
            className="group flex flex-col h-full bg-white border border-primary/10 rounded-[2rem] overflow-hidden transition-all duration-500 hover:border-primary/40 hover:bg-slate-50/30 active:scale-[0.98]"
        >
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-50">
                <img 
                    src={getOptimizedImageUrl(post.featured_image_url, 600)} 
                    alt={post.title} 
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
            </div>

            <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-4 mb-5">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-primary/5 text-[10px] font-bold text-primary uppercase tracking-widest border border-primary/10">
                        <Tag weight="Bold" className="w-3.5 h-3.5 mr-2 text-secondary" />
                        {categoryName}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                        <Calendar weight="Bold" className="w-3.5 h-3.5" />
                        {date}
                    </div>
                </div>

                <h3 className="text-xl font-display font-bold text-primary mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                </h3>
                
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-8 flex-grow font-light">
                    {post.seo_description}
                </p>

                <div className="w-full h-px bg-slate-100 mb-6" />

                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-primary/50 uppercase">
                        <ClockCircle weight="Bold" className="w-4 h-4" />
                        {readTime}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-3 transition-all">
                        Beitrag lesen
                        <AltArrowRight weight="Bold" className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </div>
                </div>
            </div>
        </Link>
    );
}