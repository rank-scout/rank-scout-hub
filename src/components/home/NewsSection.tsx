import { ArrowRight, Calendar, TrendingUp, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHomeContent } from "@/hooks/useSettings";

export const NewsSection = () => {
  const { content } = useHomeContent();
  
  if (!content) return null;

  // Statische News-Beispiele (könnten später auch dynamisch werden, aber aktuell Fokus auf Layout-Texte)
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
        
        {/* Newsletter Box - DYNAMIC */}
        <div className="bg-[#0A0F1C] rounded-3xl p-8 md:p-12 relative overflow-hidden mb-24 shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                  <Mail className="w-5 h-5 text-secondary" />
                </span>
                <span className="text-secondary font-bold tracking-wider text-sm uppercase">Newsletter</span>
              </div>
              <h3 className="text-2xl md:text-4xl font-display font-bold text-white">
                {content.news.headline}
              </h3>
              <p className="text-slate-300 text-lg max-w-xl leading-relaxed mt-4">
                {content.news.subheadline}
              </p>
            </div>

            <div className="w-full lg:w-auto min-w-[380px]">
              <div className="bg-white/5 backdrop-blur-lg p-3 rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-3">
                <div className="relative">
                  <Input 
                    placeholder={content.news.placeholder} 
                    className="bg-black/20 border-white/10 text-white placeholder:text-white/40 h-14 pl-4 rounded-xl focus-visible:ring-secondary focus-visible:border-secondary/50 transition-all"
                  />
                </div>
                <Button className="w-full bg-secondary hover:bg-orange-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-secondary/20 transition-all hover:scale-[1.02]">
                  {content.news.button_text}
                </Button>
                <p className="text-center text-[11px] text-white/30">
                  Join 10.000+ Founders & CEOs. Unsubscribe anytime.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* News Grid (Static for now, can be removed via Layout Switch if needed) */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-display font-bold text-primary">Latest Insights</h2>
            <p className="text-muted-foreground mt-2">Analysen, Trends & Tacheles.</p>
          </div>
          <Button variant="outline" className="hidden sm:flex">Alle Artikel</Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {news.map((item, idx) => (
            <article key={idx} className="group cursor-pointer">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4 text-xs font-medium uppercase tracking-wider">
                  <span className="text-secondary">{item.category}</span>
                  <span className="text-slate-400">{item.readTime}</span>
                </div>
                <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-secondary transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-slate-500 mb-6 line-clamp-3 flex-grow">
                  {item.excerpt}
                </p>
                <div className="flex items-center text-sm font-bold text-primary group-hover:translate-x-1 transition-transform mt-auto">
                  Artikel lesen <ArrowRight className="ml-2 w-4 h-4 text-secondary" />
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};