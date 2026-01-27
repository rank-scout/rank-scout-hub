import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, TrendingUp, ShieldCheck, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useHomeContent } from "@/hooks/useSettings";

export const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { content } = useHomeContent();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
        navigate(`/kategorien?search=${encodeURIComponent(searchQuery)}`);
    } else {
      toast.error("Bitte gib einen Suchbegriff ein.");
    }
  };

  const heroTitle = content?.hero_title || "Suche & finde die besten Tools für deinen Erfolg.";
  const heroSubtitle = content?.hero_subtitle || "Vergleiche, entdecke und nutze die Top-Angebote aus KI, Software und Lifestyle. Unabhängig geprüft.";
  const heroImage = content?.hero_image || "/placeholder.svg";

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-primary">
      
      {/* BACKGROUND IMAGE MIT OVERLAY */}
      <div className="absolute inset-0 z-0">
          {/* Dunklerer Overlay für besseren Text-Kontrast */}
          <div className="absolute inset-0 bg-primary/90 mix-blend-multiply z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent z-20" />
          <img 
              src={heroImage}
              alt="Hero Background" 
              className="w-full h-full object-cover opacity-50 filter blur-sm scale-105"
          />
      </div>

      {/* --- LUXURY GLITTER PARTICLES START --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`, 
              height: `${Math.random() * 3 + 1}px`,
              opacity: Math.random() * 0.4 + 0.1, 
              animationDuration: `${Math.random() * 4 + 3}s`, 
              animationDelay: `${Math.random() * 3}s`,
              boxShadow: "0 0 6px 1px rgba(255, 255, 255, 0.3)" 
            }}
          />
        ))}
      </div>
      {/* --- LUXURY GLITTER PARTICLES END --- */}

      {/* CONTENT */}
      <div className="container px-4 mx-auto relative z-30 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20 mb-8 animate-fade-in shadow-lg">
          <Sparkles className="w-4 h-4 text-secondary" />
          <span className="text-sm font-medium tracking-wide uppercase">Der ultimative Vergleichs-Hub</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-8 leading-tight animate-fade-in tracking-tight drop-shadow-lg">
          {heroTitle}
        </h1>
        
        <p className="text-lg md:text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in animation-delay-200 drop-shadow-md">
          {heroSubtitle}
        </p>
        
        {/* SUCHLEISTE */}
        <div className="max-w-2xl mx-auto relative animate-fade-in animation-delay-300">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl transform scale-105 opacity-50"></div>
          <form onSubmit={handleSearch} className="relative flex items-center p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl focus-within:border-secondary/50 transition-all">
            <Search className="w-6 h-6 text-slate-400 ml-4" />
            <Input 
              type="text" 
              placeholder="Was suchst du heute? (z.B. 'KI Tools', 'Dating')" 
              className="flex-grow bg-transparent border-none h-12 text-white placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg px-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" className="bg-secondary hover:bg-secondary/90 text-white rounded-full h-12 px-8 font-bold text-base shadow-lg hover:shadow-orange-500/20 transition-all shrink-0">
              Finden
            </Button>
          </form>
        </div>

        {/* TRUST BADGES */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 animate-fade-in animation-delay-500 text-slate-400 text-sm font-medium uppercase tracking-widest">
            <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-secondary" />
                <span>50+ Kategorien</span>
            </div>
            <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-secondary" />
                <span>10k+ Community</span>
            </div>
             <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-secondary" />
                <span>Geprüfte Anbieter</span>
            </div>
        </div>
      </div>
    </section>
  );
};