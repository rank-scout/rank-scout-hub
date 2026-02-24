import { Link } from "react-router-dom";
import { ArrowRight, Calendar, User, BookOpen } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function ForumSection() {
  
  // Wir holen die neuesten 3 Beiträge (Magazine Style)
  const { data: latestPosts, isLoading } = useQuery({
    queryKey: ["home-latest-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_threads")
        .select(`
          id, 
          title, 
          slug, 
          featured_image_url, 
          created_at, 
          author_name, 
          seo_description,
          category_id,
          forum_categories ( name )
        `)
        .eq("is_active", true)
        .eq("status", "published")
        .order('created_at', { ascending: false })
        .limit(6); // Limit etwas erhöht, damit der Slider mehr Futter hat (falls vorhanden)
      
      if (error) throw error;
      return data;
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  // Helper Component für die Karte, damit wir den Code nicht doppelt schreiben müssen
  const PostCard = ({ post }: { post: any }) => (
    <Link to={`/forum/${post.slug}`} className="group h-full block">
      {/* KYRA DESIGN: "Inset Card" Look - Rund, Weich, Schatten */}
      <Card className="h-full bg-white border border-slate-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 rounded-[2rem] overflow-hidden group-hover:-translate-y-2 flex flex-col p-3">
        
        {/* Bild Container */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-slate-100 shadow-inner">
          {post.featured_image_url ? (
            <img 
              src={post.featured_image_url} 
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-700" 
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <BookOpen className="w-12 h-12" />
            </div>
          )}
        </div>

        {/* Content Wrapper */}
        <div className="flex flex-col flex-grow px-2 pt-2">
            <CardHeader className="p-0 pt-4 pb-2 space-y-3">
              {/* Badge */}
              {post.forum_categories && (
                <div className="mb-1">
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">
                    {/* @ts-ignore */}
                    {post.forum_categories.name}
                  </Badge>
                </div>
              )}

              <div className="flex items-center text-xs font-medium text-slate-400 gap-4 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(post.created_at)}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {post.author_name || "Redaktion"}
                </span>
              </div>
              
              <h3 className="font-bold text-xl text-slate-900 leading-snug group-hover:text-secondary transition-colors line-clamp-2">
                {post.title}
              </h3>
            </CardHeader>

            <CardContent className="p-0 py-2 flex-grow">
              <p className="text-slate-500 line-clamp-3 text-sm leading-relaxed">
                {post.seo_description || "Lies den ganzen Artikel in unserem Magazin..."}
              </p>
            </CardContent>

            <CardFooter className="p-0 pt-4 mt-auto pb-2">
              <span className="text-sm font-bold text-secondary flex items-center group-hover:underline">
                Artikel lesen <ArrowRight className="ml-1 w-4 h-4" />
              </span>
            </CardFooter>
        </div>
      </Card>
    </Link>
  );

  if (isLoading) {
    return (
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4">
           <div className="flex justify-between items-end mb-10">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1,2,3].map(i => <Skeleton key={i} className="h-[400px] w-full rounded-3xl" />)}
           </div>
        </div>
      </section>
    );
  }

  if (!latestPosts || latestPosts.length === 0) return null;

  return (
    <section className="py-24 bg-slate-50 border-t border-slate-200 overflow-hidden">
      <div className="container mx-auto px-4">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-secondary" />
              Aktuelles aus dem Magazin
            </h2>
            <p className="text-lg text-slate-600">
              Die neuesten Ratgeber, Finanz-Tipps und Analysen unserer Redaktion.
            </p>
          </div>
          <Button variant="outline" asChild className="hidden md:flex group rounded-full px-6">
            <Link to="/forum">
              Alle Beiträge ansehen 
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* --- DESKTOP VIEW (Grid) --- */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestPosts.slice(0, 3).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* --- MOBILE VIEW (Slider 1:1 wie NewsSection) --- */}
        <div className="md:hidden -mx-4 px-4">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {latestPosts.map((post) => (
                // basis-[85%] sorgt für den "Peek"-Effekt, damit man sieht, dass man swipen kann
                <CarouselItem key={post.id} className="pl-4 basis-[85%] sm:basis-[70%]">
                  <div className="h-full py-2"> {/* Padding für den Hover-Schatten */}
                    <PostCard post={post} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* Optional: Controls if needed, usually hidden on mobile for cleaner look */}
            {/* <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" /> */}
          </Carousel>
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center md:hidden">
          <Button asChild className="w-full rounded-full" size="lg">
            <Link to="/forum">
              Zum Magazin
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}