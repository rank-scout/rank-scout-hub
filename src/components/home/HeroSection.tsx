import { SearchBar } from "./SearchBar";
import { useHomeContent } from "@/hooks/useSettings"; // Neuer Hook
import { Sparkles } from "lucide-react";

export const HeroSection = () => {
  const { content } = useHomeContent();
  
  // Safety Check falls Content noch undefined (sollte durch Index Loading abgefangen sein, aber sicher ist sicher)
  if (!content) return null; 

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-primary">
      {/* ... Background Code ... */}

      <div className="container px-4 mx-auto relative z-10">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-10">
          
          <div className="space-y-8 animate-fade-in">
            
            {/* Dynamic Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-slate-300 tracking-wide">
                {content.hero.badge}
              </span>
            </div>

            {/* Dynamic Titles */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tight leading-[1.1]">
                {content.hero.title}
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
                {content.hero.subtitle}
              </p>
            </div>
          </div>

          <div className="w-full max-w-3xl animate-slide-up relative z-20 mt-8">
            <div className="relative bg-white rounded-xl shadow-2xl shadow-black/20 p-2 border border-white/20">
               <div className="absolute -top-8 left-4 flex items-center gap-2 text-xs font-bold text-white/90 uppercase tracking-widest">
                 <Sparkles className="w-3 h-3 text-secondary" />
                 <span>{content.hero.search_label}</span>
               </div>
               
               {/* SearchBar muss auch angepasst werden, siehe unten */}
               <SearchBar placeholder={content.hero.search_placeholder} />
            </div>
          </div>
          
          {/* ... Rest der Component ... */}
        </div>
      </div>
    </section>
  );
};