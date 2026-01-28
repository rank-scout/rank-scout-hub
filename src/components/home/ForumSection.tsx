import { Link } from "react-router-dom";
import { TrendingUp, Hash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useHomeForumTeaser } from "@/hooks/useSettings";

export function ForumSection() {
  const teaserConfig = useHomeForumTeaser(); 

  const { data: categories, isLoading } = useQuery({
    queryKey: ["forum-categories-home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_categories")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4">
           <Skeleton className="h-10 w-64 mx-auto mb-4" />
           <Skeleton className="h-4 w-96 mx-auto mb-10" />
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
           </div>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-24 bg-white border-t border-slate-100">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-4">
            {teaserConfig.headline}
          </h2>
          <p className="text-xl text-slate-500 leading-relaxed">
            {teaserConfig.subheadline}
          </p>
          <Link to="/forum" className="text-secondary font-bold mt-4 inline-block hover:underline">
            {teaserConfig.link_text}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            // WICHTIG: Link nutzt query param ?category=ID
            <Link key={category.id} to={`/forum?category=${category.id}`} className="group block h-full">
              <Card className="h-full border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-white group-hover:border-blue-100">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors duration-300 shrink-0 border border-slate-100">
                    <Hash className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-primary mb-2 group-hover:text-secondary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                      {category.description || "Tritt der Diskussion bei."}
                    </p>
                    
                    <div className="mt-4 flex items-center text-xs font-medium text-slate-400 group-hover:text-secondary transition-colors">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span>Jetzt ansehen</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="text-center md:hidden mt-8">
          <Button asChild className="w-full bg-slate-900 text-white">
            <Link to="/forum">
              {teaserConfig.mobile_button}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}