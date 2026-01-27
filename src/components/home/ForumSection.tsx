import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Users, Hash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export function ForumSection() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["forum-categories-home"],
    queryFn: async () => {
      // Holt die Kategorien, die wir per SQL angelegt haben
      const { data, error } = await supabase
        .from("forum_categories")
        .select("*")
        .order('created_at', { ascending: false }) // WICHTIG: Die neuesten zuerst
        .limit(6);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-secondary font-bold uppercase tracking-widest text-xs mb-3">
              <Users className="w-4 h-4" />
              <span>Community Hub</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-4">
              Diskutiere mit den Besten.
            </h2>
            <p className="text-slate-500 text-lg">
              Tauche in unsere beliebtesten Themenbereiche ein und vernetze dich mit Experten.
            </p>
          </div>

          <Button asChild variant="ghost" className="hidden md:flex gap-2 text-slate-500 hover:text-primary">
            <Link to="/forum">
              Alle Foren anzeigen <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {categories.map((category) => (
            <Link key={category.id} to={`/forum?category=${category.slug}`} className="group">
              <Card className="h-full border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:border-secondary/20 transition-all duration-300 rounded-2xl overflow-hidden group-hover:-translate-y-1">
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
        <div className="text-center md:hidden">
          <Button asChild className="w-full bg-slate-900 text-white">
            <Link to="/forum">
              Zum Community Forum
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}