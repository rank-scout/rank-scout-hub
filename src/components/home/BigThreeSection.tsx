import { ChevronRight, Trophy, Star, TrendingUp, Zap, Globe, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useHomeContent } from "@/hooks/useSettings";

// Icon Helper
const getIcon = (type: string) => {
  switch (type) {
    case 'trending': return <TrendingUp className="w-6 h-6 text-white" />;
    case 'trophy': return <Trophy className="w-6 h-6 text-white" />;
    case 'star': return <Star className="w-6 h-6 text-white" />;
    case 'zap': return <Zap className="w-6 h-6 text-white" />;
    case 'globe': return <Globe className="w-6 h-6 text-white" />;
    case 'shield': return <Shield className="w-6 h-6 text-white" />;
    default: return <TrendingUp className="w-6 h-6 text-white" />;
  }
};

// Theme Helper
const getThemeClasses = (theme: string) => {
  switch (theme) {
    case 'gold':
      return {
        gradient: "from-amber-500 to-amber-700",
        border: "group-hover:border-amber-500/50"
      };
    case 'dark':
      return {
        gradient: "from-slate-700 to-slate-900",
        border: "group-hover:border-slate-500/50"
      };
    case 'blue':
    default:
      return {
        gradient: "from-blue-600 to-blue-800",
        border: "group-hover:border-blue-500/50"
      };
  }
};

// KYRA FIX: Helper-Funktion für Bild-Optimierung
// Erzwingt kleine Dateigrößen bei Unsplash-Bildern, egal was in der DB steht.
const getOptimizedImageUrl = (url: string | undefined, width = 800) => {
  if (!url) return "";
  if (url.includes("images.unsplash.com")) {
    // Falls schon Parameter da sind, hängen wir unsere hinten an (Imgix nimmt den letzten Wert)
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}w=${width}&q=80&auto=format&fit=crop`;
  }
  return url;
};

export const BigThreeSection = () => {
  const { content } = useHomeContent();
  if (!content) return null;

  // Fallback, falls Array leer ist (Backward Compatibility)
  let items = content.big_three.items || [];
  
  if (items.length === 0) {
    // Falls keine Items da sind, nutzen wir die alten Legacy-Daten als Fallback
    items = [
      {
        id: "finance",
        title: content.big_three.finance_title || "Finanzen",
        desc: content.big_three.finance_desc || "Vergleiche Kredite und Konten.",
        link: content.big_three.finance_link || "/finanzen",
        button_text: "Vergleichen",
        theme: "blue",
        image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
        icon: "trending"
      },
      {
        id: "software",
        title: content.big_three.software_title || "Software",
        desc: content.big_three.software_desc || "Finde die besten Tools.",
        link: content.big_three.software_link || "/software",
        button_text: "Tools finden",
        theme: "gold",
        image_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
        icon: "trophy"
      },
      {
        id: "services",
        title: content.big_three.services_title || "Dienstleister",
        desc: content.big_three.services_desc || "Agenturen & Services.",
        link: content.big_three.services_link || "/dienstleistungen",
        button_text: "Suchen",
        theme: "dark",
        image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c",
        icon: "star"
      }
    ];
  }

  return (
    <section className="py-32 relative overflow-hidden bg-white">
      {/* Divider Lines */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      
      <div className="container px-4 mx-auto relative z-10">
        
        {/* Headline Area */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-primary mb-6 tracking-tight">
            {content.big_three.headline}
          </h2>
          <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full" />
        </div>

        {/* The Dynamic Cinematic Cards */}
        <div className={`grid md:grid-cols-${Math.min(items.length, 3)} lg:grid-cols-${Math.min(items.length, 4)} gap-8`}>
          {items.map((item: any) => {
            const theme = getThemeClasses(item.theme);
            
            return (
              <Link 
                key={item.id} 
                to={item.link}
                className={`group relative h-[450px] flex flex-col justify-between bg-slate-900 rounded-3xl p-8 border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden ${theme.border}`}
              >
                {/* --- IMAGE BACKGROUND LAYER --- */}
                <div className="absolute inset-0 z-0">
                  <img 
                    // KYRA FIX: Force Image Optimization
                    src={getOptimizedImageUrl(item.image_url, 800)}
                    alt={item.title} 
                    // KYRA FIX: Lazy Loading & Dimensions gegen Layout Shift
                    loading="lazy"
                    width="800"
                    height="450"
                    className="w-full h-full object-cover opacity-40 group-hover:scale-110 group-hover:opacity-50 transition-transform duration-[3s]"
                  />
                  {/* Gradient Overlay for Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/30" />
                  
                  {/* Colored Tint */}
                  <div className={`absolute inset-0 opacity-20 mix-blend-overlay bg-gradient-to-br ${theme.gradient}`} />
                </div>

                {/* --- CONTENT LAYER --- */}
                
                {/* Icon Top */}
                <div className={`relative z-10 w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  {getIcon(item.icon)}
                </div>

                {/* Text Bottom */}
                <div className="relative z-10 space-y-4">
                  <h3 className="text-3xl font-display font-bold text-white group-hover:text-secondary transition-colors drop-shadow-md">
                    {item.title}
                  </h3>
                  <p className="text-slate-300 leading-relaxed font-medium drop-shadow-sm line-clamp-3">
                    {item.desc}
                  </p>
                  
                  {/* Button-Like Action */}
                  <div className="pt-4 flex items-center gap-3 text-sm font-bold text-white uppercase tracking-wider group-hover:gap-4 transition-all">
                    <span>{item.button_text}</span>
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};