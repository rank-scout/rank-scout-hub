import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, ShieldCheck, Users, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useHomeContent } from "@/hooks/useSettings";

export const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { content } = useHomeContent();
  
  if (!content) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
        navigate(`/kategorien?search=${encodeURIComponent(searchQuery)}`);
    } else {
      toast.error("Bitte gib einen Suchbegriff ein.");
    }
  };

  return (
    // KYRA UPDATE: Padding unten massiv reduziert (pb-20 / md:pb-28) für weniger "leeren Raum"
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-10 overflow-hidden bg-primary selection:bg-secondary/30">
      
      {/* 1. Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary to-primary z-0" />

      {/* 2. Cyber Dot Grid - HOHE SICHTBARKEIT */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.35]" 
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.9) 1.5px, transparent 1.5px)`,
          backgroundSize: '40px 40px',
          maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', 
          WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
        }}
      />

      {/* 3. Ambient Glow Orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* --- CONTENT --- */}
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/80 border border-white/20 backdrop-blur-md mb-8 shadow-lg animate-fade-in hover:bg-white/5 transition-colors cursor-default group">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
            </span>
            <span className="text-sm font-medium text-slate-100 tracking-wide group-hover:text-white transition-colors">{content.hero.badge}</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 tracking-tight leading-[1.1] animate-fade-in animation-delay-100 drop-shadow-2xl">
            {content.hero.title}
          </h1>
          
          <p className="text-lg md:text-xl text-slate-200 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in animation-delay-200 font-light">
            {content.hero.subtitle}
          </p>

          <form onSubmit={handleSearch} className="relative group max-w-2xl mx-auto animate-fade-in animation-delay-300">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary/40 to-blue-500/40 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative flex flex-col sm:flex-row gap-2 p-2 bg-primary/95 border border-white/20 backdrop-blur-xl rounded-2xl sm:rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 focus-within:border-white/40 hover:border-white/30">
              <div className="flex-grow flex items-center px-4 h-14">
                <Search className="w-5 h-5 text-slate-300 mr-3 shrink-0" />
                <Input 
                  type="text" 
                  placeholder={content.hero.search_placeholder} 
                  className="bg-transparent border-none h-full w-full text-white placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg p-0 font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="rounded-xl sm:rounded-full h-14 px-8 bg-secondary hover:bg-secondary/90 text-white font-bold text-base shadow-lg shadow-secondary/20 hover:shadow-secondary/40 transition-all shrink-0">
                {content.hero.search_label}
              </Button>
            </div>
          </form>

          {/* KYRA UPDATE: mt-12 statt mt-16 für kompakteren Look */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16 animate-fade-in animation-delay-500">
             <div className="flex items-center gap-3 group select-none">
                <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors border border-white/10 shadow-sm"><TrendingUp className="w-5 h-5 text-secondary" /></div>
                <div className="text-left"><div className="text-white font-bold leading-none">50+</div><div className="text-slate-300 text-xs font-medium uppercase tracking-wider mt-1">Kategorien</div></div>
             </div>
             <div className="flex items-center gap-3 group select-none">
                <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors border border-white/10 shadow-sm"><Users className="w-5 h-5 text-secondary" /></div>
                <div className="text-left"><div className="text-white font-bold leading-none">10k+</div><div className="text-slate-300 text-xs font-medium uppercase tracking-wider mt-1">Community</div></div>
             </div>
             <div className="flex items-center gap-3 group select-none">
                <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors border border-white/10 shadow-sm"><ShieldCheck className="w-5 h-5 text-secondary" /></div>
                <div className="text-left"><div className="text-white font-bold leading-none">100%</div><div className="text-slate-300 text-xs font-medium uppercase tracking-wider mt-1">Geprüft</div></div>
             </div>
          </div>
        </div>
      </div>

      {/* --- THE ARROW (PFEIL) --- */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] transform translate-y-[1px] z-20">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[60px]">
              <path d="M600,112.77C268.63,112.77,0,65.52,0,7.23V120H1200V7.23C1200,65.52,931.37,112.77,600,112.77Z" className="fill-background"></path>
          </svg>
      </div>

    </section>
  );
};