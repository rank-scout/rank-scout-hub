import { SearchBar } from "./SearchBar";
import { useHeroTitle, useHeroSubtitle } from "@/hooks/useSettings";
import { Sparkles } from "lucide-react";

export const HeroSection = () => {
  const heroTitle = useHeroTitle();
  const heroSubtitle = useHeroSubtitle();

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Decor - Reduziert, damit das Grid wirkt */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-10">
          
          <div className="space-y-6 animate-fade-in">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-primary/10 shadow-sm text-primary text-sm font-semibold tracking-wide uppercase mb-4 hover:border-secondary/50 transition-colors cursor-default">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              Deutschlands B2B-Vergleichsportal Nr. 1
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight text-primary text-balance drop-shadow-sm">
              {heroTitle || "Entscheidungssicherheit für die C-Suite"}
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto text-balance leading-relaxed font-light">
              {heroSubtitle || "Validierte Daten, echte Experten-Analysen und maximale Transparenz für digitale Dienstleistungen & Software."}
            </p>
          </div>

          {/* AI-Style Search Container */}
          <div className="w-full max-w-3xl animate-slide-up relative group" style={{ animationDelay: "0.2s" }}>
            {/* Glowing Border Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500" />
            
            <div className="relative bg-white rounded-xl shadow-2xl shadow-primary/10 p-2">
               {/* Label oberhalb der Suche für AI-Feeling */}
               <div className="absolute -top-8 left-4 flex items-center gap-1.5 text-xs font-bold text-secondary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 <Sparkles className="w-3 h-3" />
                 AI-Live-Search
               </div>
               <SearchBar />
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-2 hover:text-secondary transition-colors cursor-pointer group">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary group-hover:scale-125 transition-transform"></span>
                Topnews & Insights
              </span>
              <span className="flex items-center gap-2 hover:text-secondary transition-colors cursor-pointer group">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary group-hover:scale-125 transition-transform"></span>
                Geprüfte Vergleiche
              </span>
              <span className="flex items-center gap-2 hover:text-secondary transition-colors cursor-pointer group">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary group-hover:scale-125 transition-transform"></span>
                Premium Netzwerk
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};