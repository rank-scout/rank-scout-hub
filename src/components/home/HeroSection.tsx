import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, ShieldCheck, Users } from "lucide-react";
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

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-primary">
      
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:32px_32px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary/95 to-primary" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8 animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-sm font-medium text-slate-300">{content.hero.badge}</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 tracking-tight leading-[1.1] animate-fade-in animation-delay-100">
            {content.hero.title}
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in animation-delay-200">
            {content.hero.subtitle}
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 p-2 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl max-w-2xl mx-auto shadow-2xl animate-fade-in animation-delay-300 transition-all focus-within:bg-white/10 focus-within:border-white/20">
            <Input 
              type="text" 
              placeholder={content.hero.search_placeholder} 
              className="flex-grow bg-transparent border-none h-12 text-white placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg px-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" className="bg-secondary hover:bg-secondary/90 text-white rounded-full h-12 px-8 font-bold text-base shadow-lg hover:shadow-orange-500/20 transition-all shrink-0">
              {content.hero.search_label}
            </Button>
          </form>
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-8 animate-fade-in animation-delay-500 text-slate-400 text-sm font-medium uppercase tracking-widest">
            <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-secondary" /><span>50+ Kategorien</span></div>
            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-secondary" /><span>10k+ Community</span></div>
             <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-secondary" /><span>Geprüfte Anbieter</span></div>
        </div>
      </div>
    </section>
  );
};