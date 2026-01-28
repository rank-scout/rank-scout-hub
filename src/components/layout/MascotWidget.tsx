import { useState, useEffect, forwardRef } from "react";
import { X, Send, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/hooks/useProjects";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { useScoutyConfig } from "@/hooks/useSettings";

const SCOUTY_IMAGE = "/rank-scout-logo.webp"; 

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  type?: 'text' | 'link' | 'lead-magnet';
  timestamp: number;
}

export const MascotWidget = forwardRef<HTMLDivElement>((_, ref) => {
  const location = useLocation();
  const config = useScoutyConfig();

  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [leadStep, setLeadStep] = useState<'intro' | 'email' | 'success'>('intro');
  const [email, setEmail] = useState("");
  
  // WICHTIG: Verhindert, dass der Exit-Intent mehrmals feuert
  const [hasShownExitIntent, setHasShownExitIntent] = useState(false);

  const { data: projects } = useProjects();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Exit Intent Logic (Optimiert)
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Nur feuern, wenn noch NICHT gezeigt
      if (e.clientY <= 0 && isVisible && !isOpen && !hasShownExitIntent) {
        
        setHasShownExitIntent(true); // Sofort sperren

        toast(config.bubble_exit, {
          id: 'scouty-exit-intent', // Feste ID verhindert Stapeln von Nachrichten
          description: "Klicke auf mich für exklusive Deals! 👇",
          duration: Infinity, // Bleibt sichtbar bis zur Interaktion
          action: {
            label: "Chat öffnen",
            onClick: () => toggleChat()
          },
          cancel: {
            label: "Schließen",
            onClick: () => toast.dismiss('scouty-exit-intent')
          }
        });
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [isVisible, isOpen, config.bubble_exit, hasShownExitIntent]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setHasUnread(false);
    
    // Wenn Chat geöffnet wird, Toast entfernen
    if (!isOpen) {
        toast.dismiss('scouty-exit-intent');
        
        if (messages.length === 0) {
          setIsTyping(true);
          setTimeout(() => {
            setMessages([{
              id: 'init',
              text: config.bubble_intro,
              sender: 'bot',
              timestamp: Date.now()
            }]);
            setIsTyping(false);
          }, 1000);
        }
    }
  };

  const handleLeadMagnet = () => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: "Super! Ich stelle dir die Top 3 Software-Deals zusammen.",
      sender: 'bot',
      type: 'text',
      timestamp: Date.now()
    }]);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "Wohin darf ich den Report senden?",
        sender: 'bot',
        type: 'lead-magnet',
        timestamp: Date.now()
      }]);
      setLeadStep('email');
    }, 1000);
  };

  const validateEmail = (email: string) => {
    return String(email).toLowerCase().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleEmailSubmit = async () => {
    if (!validateEmail(email)) {
      toast.error("Bitte gib eine gültige E-Mail ein.");
      return;
    }
    try {
      const { error } = await supabase.from('subscribers').insert({ email: email, source_page: 'scouty_widget' });
      if (error) throw error;
      setLeadStep('success');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "Perfekt! Der Report ist unterwegs. 🚀",
        sender: 'bot',
        timestamp: Date.now()
      }]);
    } catch (error) {
      toast.error("Fehler beim Senden.");
    }
  };

  const sendMessage = () => {
    if (!inputValue.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), text: inputValue, sender: 'user', timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const projectMatch = projects?.find(p => p.name.toLowerCase().includes(inputValue.toLowerCase()));
      if (projectMatch) {
         setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: `Ah, du suchst nach ${projectMatch.name}! Hier ist der Link:`,
          sender: 'bot',
          type: 'link',
          timestamp: Date.now()
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: "Ich lerne noch! Schau dich in unseren Kategorien um.",
          sender: 'bot',
          timestamp: Date.now()
        }]);
      }
    }, 1500);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4" ref={ref}>
      {!isOpen && hasUnread && (
        <div className="bg-white px-4 py-3 rounded-2xl rounded-tr-sm shadow-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4 max-w-[200px] cursor-pointer hover:scale-105 transition-transform" onClick={toggleChat}>
          <p className="text-sm font-medium text-slate-700 leading-relaxed">{config.bubble_newsletter}</p>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border border-slate-100 rotate-45"></div>
        </div>
      )}

      {isOpen && (
        <div className="bg-white w-[350px] h-[550px] rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 origin-bottom-right font-sans">
          <div className="bg-primary p-4 flex justify-between items-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="flex items-center gap-3 relative z-10">
               <div className="w-10 h-10 bg-white rounded-full p-1 shadow-lg"><img src={SCOUTY_IMAGE} className="w-full h-full object-contain" /></div>
               <div>
                  <h3 className="font-bold leading-none">Scouty AI</h3>
                  <div className="flex items-center gap-1 text-[10px] opacity-80 mt-1"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"/> Online</div>
               </div>
            </div>
            <div className="flex items-center gap-1 relative z-10">
              <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)} className="text-white hover:bg-white/10 h-8 w-8"><ChevronRight className={`w-4 h-4 transition-transform ${isMinimized ? 'rotate-90' : ''}`}/></Button>
              <Button variant="ghost" size="icon" onClick={toggleChat} className="text-white hover:bg-white/10 h-8 w-8"><X className="w-5 h-5"/></Button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
             {messages.map((msg) => (
                 <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                     <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${msg.sender === 'user' ? 'bg-secondary text-white rounded-tr-sm' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm'}`}>
                        {msg.text}
                        {msg.type === 'lead-magnet' && leadStep === 'email' && (
                          <div className="mt-3 space-y-2">
                             <Input placeholder="E-Mail Adresse" className="bg-slate-50 text-slate-800" value={email} onChange={(e) => setEmail(e.target.value)} />
                             <Button size="sm" className="w-full bg-secondary text-white" onClick={handleEmailSubmit}>Kostenlos anfordern</Button>
                          </div>
                        )}
                     </div>
                 </div>
             ))}
             {isTyping && <div className="flex justify-start animate-in fade-in"><div className="bg-white border p-3 rounded-2xl flex gap-1"><span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"/><span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-75"/><span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-150"/></div></div>}
          </div>

          {messages.length < 3 && (
             <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                <Button variant="outline" size="sm" className="whitespace-nowrap rounded-full border-secondary/20 text-secondary bg-secondary/5 hover:bg-secondary/10" onClick={handleLeadMagnet}>🎁 Top 3 Deals</Button>
                <Button variant="outline" size="sm" className="whitespace-nowrap rounded-full border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => setInputValue("Software Vergleich")}>💻 Software</Button>
             </div>
          )}

          <div className="p-3 bg-white border-t border-slate-100 flex gap-2 shadow-sm">
             <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Frag mich etwas..." onKeyDown={(e) => e.key === 'Enter' && sendMessage()} className="border-slate-200 focus-visible:ring-secondary bg-slate-50" />
             <Button size="icon" className="bg-secondary" onClick={sendMessage}><Send className="w-4 h-4" /></Button>
          </div>
          
          <div className="bg-slate-50 py-1.5 text-center text-[10px] text-slate-400 font-medium border-t border-slate-100">{config.powered_by}</div>
        </div>
      )}

      <Button onClick={toggleChat} className={`h-14 w-14 sm:h-16 sm:w-16 rounded-full border-4 shadow-2xl hover:scale-110 transition-all p-0 overflow-hidden relative z-10 ${isOpen ? 'bg-secondary border-secondary rotate-90' : 'bg-white border-white hover:border-secondary'}`}>
        {isOpen ? <X className="w-6 h-6 sm:w-8 sm:h-8 text-white" /> : <img src={SCOUTY_IMAGE} className="w-full h-full object-cover scale-110" />}
        {!isOpen && hasUnread && <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
      </Button>
    </div>
  );
});
MascotWidget.displayName = "MascotWidget";