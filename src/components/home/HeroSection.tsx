import { SearchBar } from "./SearchBar";
import { useHeroTitle, useHeroSubtitle } from "@/hooks/useSettings";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export const HeroSection = () => {
  const heroTitle = useHeroTitle();
  const heroSubtitle = useHeroSubtitle();

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-primary">
      
      {/* HINTERGRUND: Deep Navy + Weiße Punkte */}
      <div className="absolute inset-0 dots-white opacity-60 pointer-events-none" />
      
      {/* AURORA EFFEKT (Dezent im Hintergrund) */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      <div className="container px-4 mx-auto relative z-10">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-10">
          
          <div className="space-y-8 animate-fade-in">
            
            {/* Badge: Clean & Modern */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-md shadow-lg text-white text-sm font-medium tracking-wide transition-all hover:bg-white/15 cursor-default">
              <CheckCircle2 className="w-4 h-4 text-secondary" />
              <span className="text-slate-100">Deutschlands B2B-Vergleichsportal Nr. 1</span>
            </div>
            
            {/* Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight text-white text-balance drop-shadow-xl">
              {heroTitle || "Entscheidungssicherheit für die C-Suite"}
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto text-balance leading-relaxed font-light tracking-wide">
              {heroSubtitle || "Validierte Daten, echte Experten-Analysen und maximale Transparenz für digitale Dienstleistungen & Software."}
            </p>
          </div>

          {/* Search Box: Pop-Out Effekt */}
          <div className="w-full max-w-3xl animate-slide-up relative z-20 mt-8">
            <div className="relative bg-white rounded-xl shadow-2xl shadow-black/20 p-2 border border-white/20">
               {/* Label */}
               <div className="absolute -top-8 left-4 flex items-center gap-2 text-xs font-bold text-white/90 uppercase tracking-widest">
                 <Sparkles className="w-3 h-3 text-secondary" />
                 <span>AI-Live-Search</span>
               </div>
               
               <SearchBar />
            </div>

            {/* Quick Links */}
            <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-slate-400">
              <a href="#news" className="flex items-center gap-2 hover:text-white transition-colors group">
                <ArrowRight className="w-4 h-4 text-secondary group-hover:translate-x-1 transition-transform" />
                Topnews & Insights
              </a>
              <a href="#vergleich" className="flex items-center gap-2 hover:text-white transition-colors group">
                <ArrowRight className="w-4 h-4 text-secondary group-hover:translate-x-1 transition-transform" />
                Geprüfte Vergleiche
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};