import { ArrowRight, Heart, Bot, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { useHomeContent } from "@/hooks/useSettings";

export const BigThreeSection = () => {
  const { content } = useHomeContent();
  
  if (!content) return null;

  const categories = [
    {
      id: "dating",
      title: "Dating Check",
      icon: <Heart className="w-8 h-8 text-rose-500" />,
      desc: "Finde deinen perfekten Match. Die besten Portale im knallharten Vergleich.",
      link: "/lifestyle/dating", 
      color: "bg-rose-50 text-rose-600",
      border: "hover:border-rose-200"
    },
    {
      id: "ai",
      title: "KI Revolution",
      icon: <Bot className="w-8 h-8 text-indigo-500" />,
      desc: "Die besten KI-Tools für Produktivität und Spaß. Boost your Life.",
      link: "/software/ki-tools",
      color: "bg-indigo-50 text-indigo-600",
      border: "hover:border-indigo-200"
    },
    {
      id: "apps",
      title: "App Charts",
      icon: <Smartphone className="w-8 h-8 text-emerald-500" />,
      desc: "Die nützlichsten Apps des Jahres. Getestet und bewertet von der Community.",
      link: "/software/apps",
      color: "bg-emerald-50 text-emerald-600",
      border: "hover:border-emerald-200"
    }
  ];

  return (
    // FLOW DESIGN: -mt-24 zieht die Sektion hoch, rounded-t-[3rem] rundet ab
    <section className="relative z-30 -mt-24 pt-16 pb-24 bg-slate-50 rounded-t-[3rem] shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1)]">
      <div className="container px-4 mx-auto">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary">
            Trending Categories
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Wo unsere Community gerade am meisten aktiv ist.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              to={cat.link}
              className={`tech-card group p-8 flex flex-col items-start gap-6 ${cat.border} bg-white shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl border border-transparent`}
            >
              <div className={`p-4 rounded-2xl ${cat.color} group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                {cat.icon}
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-primary group-hover:text-secondary transition-colors">
                  {cat.title}
                </h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  {cat.desc}
                </p>
              </div>

              <div className="mt-auto pt-6 flex items-center text-sm font-bold text-primary group-hover:translate-x-2 transition-transform">
                Jetzt entdecken <ArrowRight className="ml-2 w-4 h-4 text-secondary" />
              </div>
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-[4rem] pointer-events-none" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};