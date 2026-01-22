import { useState, useEffect, useRef } from "react";
import { X, Search, ExternalLink, Send, ShoppingCart, MessageCircle, ChevronLeft, ChevronRight, Binoculars } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/hooks/useProjects";

export const MascotWidget = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: projects = [] } = useProjects();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // AMAZON KONFIGURATION
  const AMAZON_TAG = "rank1scout-21"; 
  const SCOUTY_IMAGE = "https://rank-scout.com/Scouty-Rank-Scout-Maskotchen-Ki-Asistent-Chatbot.webp";

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isOpen, searchQuery]);

  const filteredInternal = searchQuery.length >= 2
    ? projects.filter((project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 3)
    : [];

  const handleAmazonRedirect = () => {
    if (!searchQuery) return;
    const url = `https://www.amazon.de/s?k=${encodeURIComponent(searchQuery)}&tag=${AMAZON_TAG}&linkCode=ll2&linkId=scouty_search`;
    window.open(url, '_blank');
  };

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed bottom-20 sm:bottom-24 z-[999] flex flex-col items-end gap-4 transition-all duration-500 ease-in-out font-sans ${
        isMinimized ? "right-[-30px] sm:right-[-35px]" : "right-4 sm:right-6"
      }`}
    >
      
      {/* CHAT FENSTER */}
      {isOpen && (
        <div className="bg-white border border-primary/10 shadow-2xl rounded-2xl w-[92vw] sm:w-[380px] overflow-hidden flex flex-col animate-fade-in origin-bottom-right mb-2 ring-1 ring-black/5 max-h-[80vh]">
          
          {/* Header */}
          <div className="bg-[#030E3E] p-4 flex items-center justify-between text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden bg-white shadow-inner flex items-center justify-center">
                <img src={SCOUTY_IMAGE} alt="Scouty" className="w-full h-full object-cover scale-110" />
              </div>
              <div>
                <h4 className="font-bold text-base leading-none mb-1 text-white">Scouty</h4>
                <p className="text-[11px] text-blue-200 font-medium flex items-center gap-1">
                  <Binoculars className="w-2.5 h-2.5" /> Preis-Experte aktiv
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 relative z-10 rounded-full transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Chat Body */}
          <div className="bg-[#F8F9FC] p-4 h-[350px] overflow-y-auto custom-scrollbar flex flex-col gap-4" ref={scrollRef}>
            
            {/* Intro Nachricht */}
            <div className="flex gap-3 animate-message-in">
              <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden bg-white flex-shrink-0 shadow-sm">
                <img src={SCOUTY_IMAGE} alt="Scouty" className="w-full h-full object-cover" />
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-600 leading-relaxed">
                Hi, ich bin Scouty! Ich finde die besten Produkt-Deals für dich! 🔭
                <br /><span className="text-[11px] text-slate-400 mt-2 block">Was suchst du gerade?</span>
              </div>
            </div>

            {/* Interne Treffer */}
            {searchQuery.length >= 2 && filteredInternal.length > 0 && (
               <div className="flex flex-col gap-2 animate-message-in">
                 <div className="text-[10px] uppercase tracking-widest text-primary font-bold ml-11 opacity-70">Top Portale</div>
                 {filteredInternal.map(project => (
                   <a 
                     key={project.id} 
                     href={`/go/${project.slug}`}
                     className="ml-11 bg-white border border-slate-200 p-2.5 rounded-xl shadow-sm hover:border-primary/30 hover:shadow-md transition-all group flex items-center gap-3"
                   >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-lg flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                        {project.categories?.icon || "📊"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-primary text-sm group-hover:text-secondary truncate">{project.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">Vergleich öffnen</div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-300 mt-1" />
                   </a>
                 ))}
               </div>
            )}

            {/* Amazon Empfehlung */}
            {searchQuery.length >= 3 && (
               <div className="flex flex-col gap-2 animate-message-in delay-100">
                 <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden bg-white flex-shrink-0 shadow-sm">
                      <img src={SCOUTY_IMAGE} alt="Scouty" className="w-full h-full object-cover" />
                    </div>
                    <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-600 leading-relaxed">
                       Ich scanne mit meinem Spezial-Gucker die günstigsten Amazon-Preise aus tausenden Angeboten für dich: 🔭
                    </div>
                 </div>

                 <div 
                   onClick={handleAmazonRedirect}
                   className="ml-11 bg-gradient-to-r from-[#FF9900]/15 to-[#FF9900]/5 border border-[#FF9900]/30 p-4 rounded-xl cursor-pointer hover:shadow-lg transition-all group flex items-center gap-3 relative overflow-hidden ring-1 ring-[#FF9900]/10"
                 >
                    <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl shadow-sm border border-[#FF9900]/20 relative z-10">
                      📦
                    </div>
                    <div className="flex-1 relative z-10">
                      <div className="text-[10px] text-[#FF9900] font-bold uppercase tracking-wider mb-0.5">Amazon Bestpreis Check</div>
                      <div className="text-sm font-extrabold text-slate-900 group-hover:text-[#FF9900] transition-colors truncate">"{searchQuery}" ansehen</div>
                    </div>
                    <div className="bg-secondary p-1.5 rounded-full text-white shadow-sm group-hover:scale-110 transition-transform">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                 </div>
               </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100 mt-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Frag Scouty..." 
                className="pl-9 pr-12 bg-slate-50 border-slate-200 focus-visible:ring-secondary focus-visible:border-secondary rounded-xl text-sm h-12 transition-all focus:bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAmazonRedirect()}
                autoFocus
              />
              <Button 
                size="icon" 
                onClick={handleAmazonRedirect}
                className="absolute right-1.5 top-1.5 h-9 w-9 bg-primary text-white hover:bg-secondary rounded-lg transition-all shadow-sm active:scale-95"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            {/* KYRA UPDATE: Powered By Link zu Digital-Perfect */}
            <p className="text-[9px] text-center text-slate-400 mt-2 uppercase tracking-tighter">
              Scouty AI Powered By <a href="https://digital-perfect.com" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors font-bold">Digital-Perfect</a>
            </p>
          </div>
        </div>
      )}

      {/* AVATAR TRIGGER & MINIMIZE CONTROL */}
      <div className="relative flex items-center group">
        
        {!isOpen && isVisible && (
          <button 
            onClick={toggleMinimize}
            className={`absolute ${isMinimized ? "-left-8" : "-left-10"} bg-[#030E3E] text-white p-1.5 rounded-full shadow-lg border border-white/20 z-20 hover:bg-secondary transition-all duration-300`}
          >
            {isMinimized ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}

        <div 
          className="relative cursor-pointer"
          onClick={() => isMinimized ? setIsMinimized(false) : setIsOpen(!isOpen)}
        >
          {!isOpen && !isMinimized && <div className="absolute inset-0 bg-secondary rounded-full animate-ping opacity-25 duration-1000" />}
          <Button 
            className={`h-14 w-14 sm:h-16 sm:w-16 rounded-full border-4 shadow-2xl hover:scale-110 transition-all p-0 overflow-hidden relative z-10 ${
              isOpen ? 'bg-secondary border-secondary rotate-90' : 'bg-white border-white'
            } ${isMinimized ? 'opacity-80 scale-90 translate-x-2' : ''}`}
          >
             {isOpen ? (
               <X className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
             ) : (
               <div className="h-full w-full bg-white flex items-center justify-center">
                  <img src={SCOUTY_IMAGE} alt="Scouty" className="w-full h-full object-cover scale-110" />
               </div>
             )}
          </Button>
          
          {!isOpen && !isMinimized && isVisible && (
            <div className="absolute bottom-full right-0 mb-3 whitespace-nowrap bg-[#030E3E] text-white text-[11px] font-bold px-3 py-2 rounded-xl shadow-xl animate-bounce origin-bottom-right">
              Hi, ich bin Scouty! Ich finde die besten Produkt-Deals für dich! 🔭
              <div className="absolute bottom-0 right-5 translate-y-1/2 rotate-45 w-2.5 h-2.5 bg-[#030E3E]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};