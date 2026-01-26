import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2, Clock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function NewsSection() {
  // Wir holen die neuesten 6 veröffentlichten Beiträge für das Grid
  const { data: posts, isLoading } = useQuery({
    queryKey: ["latest-news-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_threads")
        .select(`
          id,
          title,
          slug,
          content,
          seo_description,
          created_at,
          author_name,
          featured_image_url,
          view_count,
          forum_categories ( name, slug )
        `)
        .eq("status", "published")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Hilfsfunktion: HTML-Tags entfernen für sauberen Vorschau-Text
  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gray-50/50">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header-Bereich mit Apps-Finder Style (Rote Linie) */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-4 border-b border-gray-200 pb-4 relative">
          <div>
            <h2 className="text-3xl font-bold uppercase tracking-tight text-foreground mb-2">
              Neueste Artikel
            </h2>
            {/* Die rote Zierlinie unten links */}
            <div className="absolute bottom-0 left-0 h-[3px] w-[60px] bg-[#f55a4a]"></div>
          </div>
          
          <Link 
            to="/forum" 
            className="text-sm font-medium text-muted-foreground hover:text-[#f55a4a] transition-colors flex items-center gap-1 mb-1"
          >
            Alle News anzeigen <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid Layout: 1 Spalte Mobil, 2 Tablet, 3 Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article key={post.id} className="group flex flex-col h-full">
              <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden flex flex-col">
                
                {/* Bild-Bereich: Format 1024/559 erzwungen */}
                <div className="relative overflow-hidden w-full aspect-[1024/559]">
                  <Link to={`/forum/${post.slug}`}>
                    {post.featured_image_url ? (
                      <img 
                        src={post.featured_image_url} 
                        alt={post.title}
                        className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      // Fallback, falls kein Bild da ist
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <span className="text-sm font-medium">Kein Bild</span>
                      </div>
                    )}
                    
                    {/* Kategorie Badge oben links im Bild */}
                    {post.forum_categories && (
                      <Badge className="absolute top-4 left-4 bg-[#f55a4a] hover:bg-[#d14030] text-white border-none shadow-sm text-xs font-semibold px-3 py-1">
                        {post.forum_categories.name}
                      </Badge>
                    )}
                  </Link>
                </div>

                {/* Karten-Inhalt */}
                <CardHeader className="p-6 pb-2 space-y-3">
                  {/* Meta-Daten: Datum und Autor */}
                  <div className="flex items-center text-xs text-muted-foreground gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(post.created_at)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="flex items-center gap-1">
                       <span className="font-medium text-[#f55a4a]">{post.author_name}</span>
                    </span>
                  </div>

                  {/* Titel */}
                  <h3 className="text-xl font-bold leading-snug line-clamp-2 group-hover:text-[#f55a4a] transition-colors">
                    <Link to={`/forum/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>
                </CardHeader>

                {/* Text-Vorschau */}
                <CardContent className="p-6 pt-2 flex-grow">
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                    {post.seo_description || stripHtml(post.content).substring(0, 120) + "..."}
                  </p>
                </CardContent>

                {/* Footer mit Weiterlesen-Button */}
                <CardFooter className="p-6 pt-0 mt-auto border-t border-gray-50 bg-gray-50/30">
                  <Link 
                    to={`/forum/${post.slug}`} 
                    className="w-full flex items-center justify-between text-sm font-semibold text-foreground group-hover:text-[#f55a4a] transition-colors py-3"
                  >
                    Weiterlesen
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </CardFooter>
              </Card>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}