import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, Tag, Loader2 } from "lucide-react";
import { useHomeContent } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";

export function NewsSection() {
  const { content } = useHomeContent();
  const limit = content?.news?.count || 3; // Dynamisches Limit aus Settings

  // 1. Echte Daten laden (Behalten wir bei!)
  const { data: posts, isLoading } = useQuery({
    queryKey: ["latest-news-posts", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_threads")
        .select(`
          id, title, slug, content, seo_description, created_at, author_name, featured_image_url,
          forum_categories ( name, slug )
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

  if (!content) return null;

  // Loading State (Modernisiert)
  if (isLoading) {
    return (
      <section className="py-24 bg-white">
        <div className="container px-4 mx-auto flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  // Fallback, falls keine News da sind
  if (!posts || posts.length === 0) return null;

  return (
    <section className="py-24 bg-white border-t border-slate-100">
      <div className="container px-4 mx-auto">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="text-secondary font-bold uppercase tracking-widest text-sm">
              Wissen & News
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mt-3">
              {content.news?.headline || "Aktuelles & Ratgeber"}
            </h2>
            <p className="text-slate-500 mt-4 text-lg leading-relaxed">
              {content.news?.subheadline || "Expertenwissen für deinen digitalen Erfolg. Strategien, Updates und Insights."}
            </p>
          </div>
          <Button variant="outline" className="hidden md:flex border-slate-200 text-primary hover:bg-slate-50 hover:text-secondary transition-colors" asChild>
            <Link to="/forum">Alle Beiträge <ArrowRight className="ml-2 w-4 h-4" /></Link>
          </Button>
        </div>

        {/* 2. Das neue Layout: Mobile Snap-Slider / Desktop Grid */}
        <div className="flex overflow-x-auto pb-8 -mx-4 px-4 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:p-0 snap-x snap-mandatory scrollbar-hide">
          
          {posts.map((post) => {
            // Helper Values für das Design
            const date = new Date(post.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' });
            const readTime = Math.max(1, Math.ceil((post.content?.length || 0) / 1000)) + " Min";
            // @ts-ignore - Supabase Typen-Handling für Joins kann tricky sein
            const categoryName = post.forum_categories?.name || "Allgemein";
            const imageUrl = post.featured_image_url || "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80&w=800"; // Fallback Bild

            return (
              <Link 
                key={post.id} 
                to={`/forum/${post.slug}`}
                className="group flex-shrink-0 w-[85vw] md:w-auto snap-center relative flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
              >
                {/* Image Container (Frameless) */}
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                  
                  {/* Category Badge top-left */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-bold text-primary shadow-sm">
                      <Tag className="w-3 h-3 mr-1.5 text-secondary" />
                      {categoryName}
                    </span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex flex-col flex-grow p-8">
                  {/* Meta Data Row */}
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-400 mb-4 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {date}
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {readTime}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-primary mb-3 leading-tight group-hover:text-secondary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  {/* Excerpt */}
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">
                    {post.seo_description || "Klicke hier, um den ganzen Artikel zu lesen und mehr zu erfahren..."}
                  </p>

                  {/* Action Link */}
                  <div className="flex items-center text-sm font-bold text-primary group-hover:text-secondary transition-colors mt-auto">
                    {content.news?.read_more || "Artikel lesen"} <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Mobile Button Bottom */}
        <div className="mt-8 text-center md:hidden">
            <Button className="w-full bg-primary text-white" asChild>
                <Link to="/forum">Zum Ratgeber</Link>
            </Button>
        </div>

      </div>
    </section>
  );
}