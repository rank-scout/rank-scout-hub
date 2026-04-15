import { ChevronRight, Trophy, Star, TrendingUp, Zap, Globe, Shield, Heart, Gamepad2, Bot, Briefcase, ShoppingCart, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { useHomeContent } from "@/hooks/useSettings";
import { getCategoriesRoute, normalizeNavigableHref } from "@/lib/routes";

// Icon Mapping für Admin-Typen
const getIcon = (type: string) => {
  switch (type) {
    case 'trending': return <TrendingUp className="w-6 h-6 text-white" />;
    case 'trophy': return <Trophy className="w-6 h-6 text-white" />;
    case 'star': return <Star className="w-6 h-6 text-white" />;
    case 'zap': return <Zap className="w-6 h-6 text-white" />;
    case 'globe': return <Globe className="w-6 h-6 text-white" />;
    case 'shield': return <Shield className="w-6 h-6 text-white" />;
    case 'heart': return <Heart className="w-6 h-6 text-white" />;
    case 'game': return <Gamepad2 className="w-6 h-6 text-white" />;
    case 'bot': return <Bot className="w-6 h-6 text-white" />;
    case 'briefcase': return <Briefcase className="w-6 h-6 text-white" />;
    case 'cart': return <ShoppingCart className="w-6 h-6 text-white" />;
    case 'edu': return <GraduationCap className="w-6 h-6 text-white" />;
    default: return <TrendingUp className="w-6 h-6 text-white" />;
  }
};

// --- KYRA PREMIUM IMAGES (Elite-Fallback falls Admin-Feld leer ist) ---
const CATEGORY_IMAGES: Record<string, string> = {
  "Finanzen & Krypto": "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200&auto=format&fit=crop",
  "Love & Dating": "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1200&auto=format&fit=crop",
  "Apps & Gaming": "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
  "KI & Software": "https://images.unsplash.com/photo-1620712943543-bcc4628c9759?q=80&w=1200&auto=format&fit=crop",
  "Dienstleistungen": "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200&auto=format&fit=crop",
  "Produkttests": "https://images.unsplash.com/photo-1526170315873-3a56162820cf?q=80&w=1200&auto=format&fit=crop",
  "Haus & Energie": "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=1200&auto=format&fit=crop",
  "Wissen & Karriere": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1200&auto=format&fit=crop"
};

const getThemeClasses = (theme: string) => {
  switch (theme) {
    case 'gold': return { gradient: "from-amber-500 to-amber-700", border: "group-hover:border-amber-500/50" };
    case 'dark': return { gradient: "from-slate-700 to-slate-900", border: "group-hover:border-slate-500/50" };
    case 'blue':
    default: return { gradient: "from-blue-600 to-blue-800", border: "group-hover:border-blue-500/50" };
  }
};

const getOptimizedImageUrl = (url: string | undefined, title: string, width = 720, quality = 75) => {
  const finalUrl = url && url.trim() !== "" ? url : (CATEGORY_IMAGES[title] || "");
  if (!finalUrl) return "";

  try {
    const parsed = new URL(finalUrl);

    if (parsed.hostname.includes("images.unsplash.com")) {
      parsed.searchParams.set("w", String(width));
      parsed.searchParams.set("q", String(quality));
      parsed.searchParams.set("auto", "format");
      parsed.searchParams.set("fit", "crop");
      return parsed.toString();
    }

    if (parsed.pathname.includes("/storage/v1/object/public/")) {
      parsed.pathname = parsed.pathname.replace("/object/public/", "/render/image/public/");
      parsed.searchParams.set("width", String(width));
      parsed.searchParams.set("quality", String(quality));
      return parsed.toString();
    }

    if (parsed.pathname.includes("/storage/v1/render/image/public/")) {
      parsed.searchParams.set("width", String(width));
      parsed.searchParams.set("quality", String(quality));
      return parsed.toString();
    }
  } catch {
    return finalUrl;
  }

  return finalUrl;
};

const getResponsiveImageSet = (url: string | undefined, title: string) => ({
  src: getOptimizedImageUrl(url, title, 720),
  srcSet: [480, 720, 960].map((width) => `${getOptimizedImageUrl(url, title, width)} ${width}w`).join(", "),
  sizes: "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 100vw",
});

export const BigThreeSection = () => {
  const { content } = useHomeContent();
  if (!content) return null;

  let items = content.big_three.items || [];
  if (items.length === 0) {
    items = [
      { id: "v1", title: "Versicherungen", desc: "Tarife, Leistungen und Policen im Überblick.", link: getCategoriesRoute(), button_text: "Vergleichen", theme: "blue", image_url: "", icon: "shield" },
      { id: "f1", title: "Finanzen & Krypto", desc: "Broker, Kredite und Finanzthemen im Überblick.", link: getCategoriesRoute(), button_text: "Vergleichen", theme: "gold", image_url: "", icon: "trending" },
      { id: "s1", title: "KI & Software", desc: "Tools und Softwarelösungen im Überblick.", link: getCategoriesRoute(), button_text: "Tools finden", theme: "dark", image_url: "", icon: "bot" }
    ];
  }

  return (
    <section id="bereiche" className="py-32 relative overflow-hidden bg-white">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-primary mb-6 tracking-tight">
            {content.big_three.headline}
          </h2>
          <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full" />
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8`}>
          {items.map((item: any) => {
            const theme = getThemeClasses(item.theme);
            return (
              <Link 
                key={item.id} 
                to={normalizeNavigableHref(item.link)}
                className={`group relative h-[450px] flex flex-col justify-between bg-slate-900 rounded-3xl p-8 border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden ${theme.border}`}
              >
                <div className="absolute inset-0 z-0">
                  <img
                    {...getResponsiveImageSet(item.image_url, item.title)}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=70&w=720&auto=format&fit=crop";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-slate-900/10" />
                  <div className={`absolute inset-0 opacity-10 mix-blend-overlay bg-gradient-to-br ${theme.gradient}`} />
                </div>

                <div className={`relative z-10 w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  {getIcon(item.icon)}
                </div>

                <div className="relative z-10 space-y-4">
                  <h3 className="text-2xl font-display font-bold text-white group-hover:text-secondary transition-colors drop-shadow-md">
                    {item.title}
                  </h3>
                  <p className="text-white text-sm leading-relaxed font-semibold drop-shadow-md line-clamp-3">
                    {item.desc}
                  </p>
                  
                  <div className="pt-4 flex items-center gap-3 text-sm font-bold text-white uppercase tracking-wider group-hover:gap-4 transition-all">
                    <span>{item.button_text}</span>
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-secondary transition-colors border border-white/20">
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