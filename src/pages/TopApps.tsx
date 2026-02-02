import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useTop100Apps } from "@/hooks/usePromotedApps";
import { useForceSEO } from "@/hooks/useForceSEO";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ExternalLink, Trophy, ShieldCheck, Zap } from "lucide-react";

export default function TopApps() {
  const { data: apps, isLoading } = useTop100Apps();

  // SEO Brechstange
  useForceSEO("Die Top 100 Apps im großen Vergleich. Wir zeigen dir die besten Anwendungen, Software und Tools für 2026. Geprüft & Bewertet von Rank-Scout.");

  if (isLoading) return <LoadingScreen />;

  const getRankBadge = (index: number) => {
    if (index === 0) return <Badge className="bg-yellow-400 hover:bg-yellow-500 text-yellow-950 border-none gap-1"><Trophy className="w-3 h-3" /> #1 Testsieger</Badge>;
    if (index === 1) return <Badge className="bg-slate-300 hover:bg-slate-400 text-slate-800 border-none">#2 Top-Wahl</Badge>;
    if (index === 2) return <Badge className="bg-orange-300 hover:bg-orange-400 text-orange-900 border-none">#3 Empfehlung</Badge>;
    return <Badge variant="outline" className="text-slate-500">#{index + 1}</Badge>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4">
          
          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1.5 text-sm">Offizielles Ranking 2026</Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">Die Top 100 Apps</h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Unsere Redaktion testet täglich hunderte Anwendungen. Hier ist die ultimative Bestenliste der nützlichsten Apps und Tools – sortiert nach Qualität, Nutzen und Community-Rating.
            </p>
          </div>

          {/* Die Liste */}
          <div className="max-w-5xl mx-auto space-y-4">
            {apps && apps.length > 0 ? (
              apps.map((app, index) => (
                <Card key={app.id} className={`border-none shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${index < 3 ? 'ring-2 ring-primary/5 bg-white' : 'bg-white/80'}`}>
                  <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
                    
                    {/* Rank & Logo */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center p-2">
                         {app.logo_url ? (
                           <img src={app.logo_url} alt={app.name} className="w-full h-full object-contain" />
                         ) : (
                           <span className="text-3xl">📱</span>
                         )}
                      </div>
                      <div className="sm:hidden flex-1">
                        <div className="mb-1">{getRankBadge(index)}</div>
                        <h3 className="text-xl font-bold text-slate-900">{app.name}</h3>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-center sm:text-left w-full">
                      <div className="hidden sm:block mb-2">{getRankBadge(index)}</div>
                      <h3 className="hidden sm:block text-2xl font-bold text-slate-900 mb-2">{app.name}</h3>
                      
                      <p className="text-slate-500 text-sm mb-3 line-clamp-2">
                        {app.short_description || `Entdecke ${app.name} - eine der führenden Apps in der Kategorie ${app.category}. Jetzt testen und Vorteile sichern.`}
                      </p>
                      
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded"><Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {app.rating?.toFixed(1) || "5.0"} Rating</span>
                        <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Geprüft</span>
                        {app.category && <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-blue-500" /> {app.category}</span>}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="w-full sm:w-auto flex-shrink-0">
                      <Button size="lg" className="w-full sm:w-auto gap-2 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all" asChild>
                        <a href={app.affiliate_link || "#"} target="_blank" rel="noopener noreferrer">
                          Zum Deal <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>

                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
                <p className="text-slate-500">Aktuell werden keine Apps gelistet. Schau später wieder vorbei.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}