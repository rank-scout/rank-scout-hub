import { useState, useEffect, useRef } from "react";
import { X, Search, ExternalLink, Send, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/hooks/useProjects";

export const MascotWidget = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: projects = [] } = useProjects();
  const scrollRef = useRef<HTMLDivElement>(null);
  // DEIN PARTNER TAG HIER EINTRAGEN:
  const AMAZON_TAG = "rankscout-21"; 

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const filteredInternal = searchQuery.length >= 2
    ? projects.filter((project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 3)
    : [];

  const handleAmazonRedirect = () => {
    if (!searchQuery) return;
    const url = `https://www.amazon.de/s?k=${encodeURIComponent(searchQuery)}&tag=${AMAZON_TAG}`;
    window.open(url, '_blank');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-4 animate-slide-up">
      
      {/* CHAT FENSTER */}
      {isOpen && (
        <div className="bg-white border border-primary/10 shadow-2xl rounded-2xl w-[360px] overflow-hidden flex flex-col animate-fade-in origin-bottom-right mb-2 ring-1 ring-black/5">
          
          {/* Header */}
          <div className="bg-[#030E3E] p-4 flex items-center justify-between text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xl relative">
                🕵️‍♂️
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#030E3E] rounded-full animate-pulse"></span>
              </div>
              <div>
                <h4 className="font-bold text-base leading-none mb-1">Scouty</h4>
                <p className="text-[11px] text-blue-200">Dein Vergleichs-Assistent</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 relative z-10"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Chat Body */}
          <div className="bg-[#F8F9FC] p-4 h-[350px] flex flex-col gap-4 overflow-y-auto custom-scrollbar" ref={scrollRef}>
            
            {/* Intro */}
            <div className="flex gap-3 animate-message-in">
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-sm flex-shrink-0 shadow-sm">
                🕵️‍♂️
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-600">
                Hi! Ich helfe dir, die besten Tools zu finden. Was suchst du? 
                (z.B. "SEO", "Hosting" oder "Laptop")
              </div>
            </div>

            {/* INTERNE TREFFER */}
            {searchQuery.length >= 2 && filteredInternal.length > 0 && (
               <div className="flex flex-col gap-2 animate-message-in">
                 <div className="text-[10px] uppercase tracking-widest text-primary font-bold ml-11">Unsere Empfehlungen</div>
                 {filteredInternal.map(project => (
                   <a 
                     key={project.id} 
                     href={`/go/${project.slug}`}
                     className="ml-11 bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-primary/30 hover:shadow-md transition-all group flex items-start gap-3"
                   >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-lg flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                        {project.categories?.icon || "📊"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-primary text-sm group-hover:text-secondary truncate">{project.name}</div>
                        <div className="text-xs text-slate-400 truncate">Zum Vergleich</div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-300 mt-1" />
                   </a>
                 ))}
               </div>
            )}

            {/* AMAZON FALLBACK (Der Sales-Generator) */}
            {searchQuery.length >= 3 && (
               <div className="flex flex-col gap-2 animate-message-in delay-100">
                 <div className="text-[10px] uppercase tracking-widest text-[#FF4C29] font-bold ml-11 flex items-center gap-1">
                   <ShoppingCart className="w-3 h-3" /> Nicht dabei?
                 </div>
                 <div 
                   onClick={handleAmazonRedirect}
                   className="ml-11 bg-gradient-to-r from-[#FF9900]/10 to-[#FF9900]/5 border border-[#FF9900]/20 p-3 rounded-xl cursor-pointer hover:shadow-md transition-all group flex items-center gap-3"
                 >
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-lg shadow-sm">
                      📦
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 font-medium">Suche auf Amazon nach:</div>
                      <div className="text-sm font-bold text-slate-800 group-hover:text-[#FF9900] transition-colors">"{searchQuery}"</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#FF9900]" />
                 </div>
               </div>
            )}
            
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Suchbegriff eingeben..." 
                className="pl-9 pr-10 bg-slate-50 border-slate-200 focus-visible:ring-secondary focus-visible:border-secondary rounded-xl text-sm h-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <Button 
                size="icon" 
                onClick={handleAmazonRedirect}
                className="absolute right-1 top-1 h-9 w-9 bg-primary text-white hover:bg-primary/90 rounded-lg"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AVATAR BUTTON */}
      <div 
        className="relative group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsOpen(!isOpen)}
      >
        {!isOpen && <div className="absolute inset-0 bg-secondary rounded-full animate-ping opacity-20 duration-1000" />}
        <Button 
          className={`h-16 w-16 rounded-full border-4 shadow-2xl hover:scale-110 transition-all p-0 overflow-hidden relative z-10 ${isOpen ? 'bg-secondary border-secondary rotate-90' : 'bg-white border-white'}`}
        >
           {isOpen ? <X className="w-8 h-8 text-white" /> : <span className="text-4xl leading-none pt-1">🕵️‍♂️</span>}
        </Button>
      </div>
    </div>
  );
};