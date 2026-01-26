import { useState, useEffect, useRef, forwardRef } from "react";
import { X, Search, ExternalLink, Send, Binoculars, ArrowRight, ChevronLeft, ChevronRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/hooks/useProjects";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import confetti from "canvas-confetti";

// Typendefinition für Chat-Nachrichten
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  type?: 'text' | 'link' | 'lead-magnet';
  timestamp: number;
}

export const MascotWidget = forwardRef<HTMLDivElement>((_, ref) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // CHAT STATE (Historie)
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // FEATURES STATES
  const [hasUnread, setHasUnread] = useState(true);
  const [clickCount, setClickCount] = useState(0); 
  const [liveUsers, setLiveUsers] = useState(0); 
  const [adminHighTicketUrl, setAdminHighTicketUrl] = useState(""); 
  const [emailInput, setEmailInput] = useState(""); 
  const [emailSent, setEmailSent] = useState(false);
  
  // TRIGGER STATES
  const [exitIntentTriggered, setExitIntentTriggered] = useState(false);
  const [hasStartedChatting, setHasStartedChatting] = useState(false);
  const [idleMessageTriggered, setIdleMessageTriggered] = useState(false);

  const { data: projects = [] } = useProjects();
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  
  // AMAZON KONFIGURATION
  const AMAZON_TAG = "rank1scout-21"; 
  const SCOUTY_IMAGE = "https://rank-scout.com/Scouty-Rank-Scout-Maskotchen-Ki-Asistent-Chatbot.webp";

  // 1. HELPER: Nachricht hinzufügen
  const addMessage = (text: string, sender: 'user' | 'bot', type: 'text' | 'link' | 'lead-magnet' = 'text') => {
    setMessages(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      text,
      sender,
      type,
      timestamp: Date.now()
    }]);
    setHasUnread(sender === 'bot' && !isOpen); // Badge nur wenn zu
  };

  // 2. LOGIC: Kontext-Nachricht ermitteln
  const getContextMessage = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes("dating")) return "Suchst du die große Liebe? ❤️ Ich helfe dir!";
    if (path.includes("casino") || path.includes("slots")) return "Dein Glückstag? 🎰 Hier sind die besten Boni!";
    if (path.includes("finanz") || path.includes("kredit")) return "Sparfüchse aufgepasst! 💸 Die besten Raten hier.";
    if (path.includes("vpn") || path.includes("sicherheit")) return "Sicher surfen? 🔒 Ich zeig dir wie!";
    if (path.includes("adult")) return "Diskret & sicher. 🔞 Die Top-Anbieter im Check.";
    return "Hi, ich bin Scouty! Ich finde die besten Produkt-Deals für dich! 🔭";
  };

  // 3. INIT: Lade Config & Startnachricht
  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase.from("settings").select("value").eq("key", "scouty_config").single();
      // @ts-ignore
      if (data?.value) setAdminHighTicketUrl(data.value.high_ticket_url || "https://www.amazon.de");
    };
    loadSettings();

    // Fake Live Users
    setLiveUsers(Math.floor(Math.random() * (140 - 50 + 1)) + 50);

    // Initial Message (nur einmal)
    if (!hasInitialized.current) {
      addMessage(getContextMessage(), 'bot');
      hasInitialized.current = true;
    }
  }, []);

  // 4. LIVE USER SIMULATION
  useEffect(() => {
    const simulateLiveActivity = () => {
       const change = Math.floor(Math.random() * 5) - 2; 
       setLiveUsers(prev => {
         const newValue = prev + change;
         return newValue < 45 ? 50 : (newValue > 160 ? 140 : newValue);
       });
       setTimeout(simulateLiveActivity, Math.floor(Math.random() * 4000) + 3000);
    };
    const timer = setTimeout(simulateLiveActivity, 4000);
    return () => clearTimeout(timer);
  }, []);

  // 5. SEND LOGIC (Das Herzstück)
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const text = inputValue.trim();
    setInputValue(""); // Sofort leeren
    setHasStartedChatting(true);
    addMessage(text, 'user'); // User Nachricht anzeigen

    setIsTyping(true);

    // KÜNSTLICHE VERZÖGERUNG (Simuliere Nachdenken)
    setTimeout(() => {
      setIsTyping(false);
      
      // A) IST ES EINE BEGRÜSSUNG? (Chat Mode)
      const lowerText = text.toLowerCase();
      const greetings = ["hallo", "hi", "hey", "moin", "servus", "guten", "wer bist du", "was kannst du", "hilfe"];
      const isGreeting = greetings.some(g => lowerText.includes(g));

      if (isGreeting && text.length < 15) {
         addMessage("Hallo! 👋 Ich bin Scouty, deine KI-Suchmaschine. Sag mir einfach, was du suchst (z.B. 'iPhone 15' oder 'Laufschuhe'), und ich finde den besten Preis!", 'bot');
         return;
      }

      // B) PRODUKT SUCHE (Default Mode)
      addMessage(`Alles klar, ich scanne Amazon nach "${text}" für dich... einen Moment! 🔎`, 'bot');
      
      // Redirect nach kurzer Lesepause
      setTimeout(() => {
         const url = `https://www.amazon.de/s?k=${encodeURIComponent(text)}&tag=${AMAZON_TAG}&linkCode=ll2&linkId=scouty_search`;
         window.open(url, '_blank');
      }, 1500);

    }, 1000); // 1s Typing Delay
  };

  // 6. TRIGGER LOGIC

  // Scroll Trigger
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPercent > 0.30) setIsVisible(true);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll(); 
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Exit Intent (Nur Desktop)
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && isVisible && !isOpen && !isMinimized && !exitIntentTriggered && !hasStartedChatting) {
         setExitIntentTriggered(true);
         // Statt alles zu resetten, hängen wir eine Nachricht an
         addMessage("Warte! 🛑 Bevor du gehst: Ich habe gerade einen neuen Testsieger gefunden. Willst du ihn sehen?", 'bot');
         setIsOpen(true);
      }
    };
    if (window.matchMedia("(min-width: 768px)").matches) {
       document.addEventListener("mouseleave", handleMouseLeave);
    }
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [isVisible, isOpen, isMinimized, exitIntentTriggered, hasStartedChatting]);

  // Idle Trigger (30s)
  useEffect(() => {
     let idleTimer: NodeJS.Timeout;
     const resetIdle = () => {
        if (!isVisible || idleMessageTriggered || hasStartedChatting) return; 
        clearTimeout(idleTimer);
        
        idleTimer = setTimeout(() => {
           if (!isOpen && !isMinimized) {
             setIdleMessageTriggered(true);
             addMessage("Brauchst du Entscheidungshilfe? Ich kann dir die Bestseller zeigen! 🤔", 'bot');
             setIsOpen(true);
           }
        }, 30000); 
     };
     
     window.addEventListener("mousemove", resetIdle);
     window.addEventListener("keydown", resetIdle);
     window.addEventListener("scroll", resetIdle);
     window.addEventListener("click", resetIdle);
     resetIdle();
     
     return () => {
        clearTimeout(idleTimer);
        window.removeEventListener("mousemove", resetIdle);
        window.removeEventListener("keydown", resetIdle);
        window.removeEventListener("scroll", resetIdle);
        window.removeEventListener("click", resetIdle);
     };
  }, [isVisible, isOpen, isMinimized, idleMessageTriggered, hasStartedChatting]);


  // Lead Magnet Submit
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.includes("@")) {
      toast.error("Bitte gültige E-Mail eingeben");
      return;
    }
    const { error } = await supabase.from("subscribers").insert({
      email: emailInput,
      source_page: "scouty_widget",
      is_active: true
    });
    if (error) {
      toast.error("Fehler beim Senden.");
    } else {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
      toast.success("Gesendet!");
      setEmailSent(true);
      setEmailInput("");
      addMessage("Danke! Der Geheimtipp ist unterwegs in dein Postfach. 📬", 'bot');
      setTimeout(() => {
        if (adminHighTicketUrl) window.open(adminHighTicketUrl, '_blank');
      }, 2000);
    }
  };

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isOpen, messages, isTyping]);

  if (!isVisible) return null;

  return (
    <div 
      ref={ref}
      className={`fixed bottom-20 sm:bottom-24 z-[999] flex flex-col items-end gap-4 transition-all duration-500 ease-in-out font-sans ${
        isMinimized ? "right-[-30px] sm:right-[-35px]" : "right-4 sm:right-6"
      }`}
    >
      
      {/* CHAT FENSTER */}
      {isOpen && (
        <div className="bg-white border border-primary/10 shadow-2xl rounded-2xl w-[92vw] sm:w-[380px] overflow-hidden flex flex-col animate-fade-in origin-bottom-right mb-2 ring-1 ring-black/5 max-h-[80vh]">
          
          {/* Header (Navy Blue) */}
          <div className="bg-[#030E3E] p-4 flex items-center justify-between text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-12 h-12 rounded-full border-2 border-secondary overflow-hidden bg-white shadow-lg flex items-center justify-center ring-2 ring-secondary/20">
                <img src={SCOUTY_IMAGE} alt="Scouty" className="w-full h-full object-cover scale-110" />
              </div>
              <div>
                <h4 className="font-bold text-base leading-none mb-1 text-white">Scouty</h4>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <p className="text-[10px] text-blue-200 font-medium">
                    {liveUsers} Nutzer online
                  </p>
                </div>
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
          <div className="bg-[#F8F9FC] p-4 h-[380px] overflow-y-auto custom-scrollbar flex flex-col gap-4" ref={scrollRef}>
            
            {/* Messages Loop */}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 animate-message-in ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full border-2 border-secondary overflow-hidden bg-white flex-shrink-0 shadow-sm mt-1">
                    <img src={SCOUTY_IMAGE} alt="Scouty" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className={`p-3 rounded-2xl shadow-sm text-sm leading-relaxed max-w-[85%] ${
                  msg.sender === 'user' 
                    ? 'bg-secondary text-white rounded-tr-none' 
                    : 'bg-white border border-slate-200 text-slate-600 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
               <div className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full border-2 border-secondary/50 overflow-hidden bg-white flex-shrink-0">
                    <img src={SCOUTY_IMAGE} alt="Scouty" className="w-full h-full object-cover opacity-50" />
                  </div>
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
               </div>
            )}

            {/* Lead Magnet (Only if not sent) */}
            {!emailSent && messages.length > 1 && (
              <div className="ml-11 bg-blue-50/50 border border-blue-100 p-3 rounded-xl animate-message-in">
                <p className="text-xs text-slate-500 mb-2 font-medium">Top 3 Deals per Mail?</p>
                <form onSubmit={handleEmailSubmit} className="flex gap-2">
                  <Input 
                    placeholder="Deine E-Mail..." 
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="h-8 text-xs bg-white"
                    type="email"
                  />
                  <Button type="submit" size="sm" className="h-8 w-8 p-0 bg-[#FF9900] hover:bg-[#FF9900]/90 text-white">
                    <Mail className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </div>
            )}

            <div className="h-2"></div>
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100 mt-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Frag Scouty... (z.B. iPhone)" 
                className="pl-9 pr-12 bg-slate-50 border-slate-200 focus-visible:ring-secondary focus-visible:border-secondary rounded-xl text-base sm:text-sm h-12 transition-all focus:bg-white"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              {/* ORANGE SEND BUTTON */}
              <Button 
                size="icon" 
                onClick={handleSendMessage}
                className="absolute right-1.5 top-1.5 h-9 w-9 bg-[#FF9900] hover:bg-[#FF9900]/90 text-white rounded-lg transition-all shadow-sm active:scale-95"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[9px] text-center text-slate-400 mt-2 uppercase tracking-tighter flex items-center justify-center gap-1">
               Powered By <span className="font-bold text-slate-500">Rank-Scout AI</span>
            </p>
          </div>
        </div>
      )}

      {/* AVATAR TRIGGER */}
      <div className="relative flex items-center group">
        
        {/* Minimize Button */}
        {!isOpen && isVisible && (
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
            className={`absolute ${isMinimized ? "-left-8" : "-left-10"} bg-[#030E3E] text-white p-1.5 rounded-full shadow-lg border border-white/20 z-20 hover:bg-secondary transition-all duration-300`}
          >
            {isMinimized ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}

        <div 
          className="relative cursor-pointer"
          onClick={() => {
             if (isMinimized) setIsMinimized(false);
             else {
               setIsOpen(!isOpen);
               if (!isOpen) setHasUnread(false);
             }
          }}
        >
          {/* Pulse Effect */}
          {!isOpen && !isMinimized && <div className="absolute inset-0 bg-secondary rounded-full animate-ping opacity-25 duration-1000" />}
          
          <Button 
            className={`h-14 w-14 sm:h-16 sm:w-16 rounded-full border-4 shadow-2xl hover:scale-110 transition-all p-0 overflow-hidden relative z-10 ${
              isOpen ? 'bg-secondary border-secondary rotate-90' : 'bg-white border-secondary'
            } ${isMinimized ? 'opacity-80 scale-90 translate-x-2' : ''}`}
          >
             {isOpen ? (
               <X className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
             ) : (
               <div className="h-full w-full bg-white flex items-center justify-center relative">
                  <img src={SCOUTY_IMAGE} alt="Scouty" className="w-full h-full object-cover scale-110" />
                  
                  {/* Notification Badge */}
                  {hasUnread && isVisible && (
                    <div className="absolute top-0 right-0 -mt-0.5 -mr-0.5 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold border-2 border-white z-20 animate-pulse shadow-md">
                      1
                    </div>
                  )}
               </div>
             )}
          </Button>
        </div>
      </div>
    </div>
  );
});

MascotWidget.displayName = "MascotWidget";
