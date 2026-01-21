import { ArrowRight, Calendar, TrendingUp, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const NewsSection = () => {
  const news = [
    {
      category: "Markt-Analyse",
      title: "Die Top 10 CRM-Systeme für den Mittelstand 2026",
      date: "Aktuell",
      excerpt: "Warum Salesforce nicht immer die Antwort ist: Ein Deep-Dive in die effizientesten Lösungen für KMUs.",
      readTime: "5 Min."
    },
    {
      category: "SEO & Traffic",
      title: "Google Core Update: Gewinner & Verlierer",
      date: "Aktuell",
      excerpt: "Unsere Daten zeigen massive Verschiebungen bei B2B-Keywords. Das müssen Marketing-Leads jetzt tun.",
      readTime: "8 Min."
    },
    {
      category: "KI-Trends",
      title: "Agentur-Sterben durch KI? Ein Realitätscheck.",
      date: "Aktuell",
      excerpt: "Wie generative KI das Geschäftsmodell klassischer Content-Agenturen bedroht – und wer überlebt.",
      readTime: "6 Min."
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden border-t border-slate-100">
      <div className="container px-4 mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wider mb-4">
              <TrendingUp className="w-3 h-3" />
              Rank-Scout Magazin
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-4">
              Markt-Insights & <span className="text-secondary">Analysen</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Bleiben Sie dem Wettbewerb voraus. Wir analysieren Trends, testen Tools und liefern entscheidungskritische Daten.
            </p>
          </div>
          <Button variant="outline" className="hidden md:flex gap-2 group hover:text-secondary hover:border-secondary">
            Alle Beiträge lesen <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* News Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {news.map((item, index) => (
            <div key={index} className="group flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-secondary/5 hover:-translate-y-1 transition-all duration-300">
              <div className="h-48 bg-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-md text-xs font-bold text-primary border border-slate-100">
                  {item.category}
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Calendar className="w-3 h-3" />
                  {item.date}
                  <span className="mx-1">•</span>
                  {item.readTime}
                </div>
                <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-secondary transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-3">
                  {item.excerpt}
                </p>
                <div className="mt-auto pt-6 border-t border-slate-50">
                  <span className="text-sm font-bold text-primary flex items-center gap-2 group-hover:gap-3 transition-all cursor-pointer hover:text-secondary">
                    Artikel lesen <ArrowRight className="w-4 h-4 text-secondary" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lead Magnet / Newsletter Box (Updated) */}
        <div className="bg-primary rounded-3xl p-8 md:p-12 relative overflow-hidden text-center md:text-left">
          {/* Background FX */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 md:mb-0 border border-white/5 shadow-inner">
                <Mail className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-2xl md:text-4xl font-display font-bold text-white">
                Der "Unfair Advantage" Newsletter
              </h3>
              <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
                Erhalten Sie kuratierte Top-Tools und geheime Markt-Daten, bevor Ihre Konkurrenz davon erfährt. Keine Theorie, nur validiertes Wachstum.
              </p>
            </div>

            <div className="w-full lg:w-auto min-w-[380px]">
              <div className="bg-white/5 backdrop-blur-lg p-3 rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-3">
                <div className="relative">
                  <Input 
                    placeholder="ihre@firmen-email.de" 
                    className="bg-black/20 border-white/10 text-white placeholder:text-white/40 h-14 pl-4 rounded-xl focus-visible:ring-secondary focus-visible:border-secondary/50 transition-all"
                  />
                </div>
                <Button className="w-full bg-secondary hover:bg-orange-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-secondary/20 transition-all hover:scale-[1.02]">
                  Kostenlos anmelden
                </Button>
                <p className="text-center text-[11px] text-white/30">
                  Join 10.000+ Founders. 1-Click Unsubscribe.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};