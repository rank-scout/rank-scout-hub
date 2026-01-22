import { ArrowRight, Trophy, Star, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

// Daten für die Karten
const categories = [
  {
    id: "finance",
    title: "Finanzen & Krypto",
    icon: <TrendingUp className="w-8 h-8 text-blue-500" />,
    desc: "Broker, Kredite & Geschäftskonten im Härtetest.",
    link: "/finanzen",
    color: "bg-blue-50 text-blue-600",
    border: "hover:border-blue-200"
  },
  {
    id: "software",
    title: "Software & SaaS",
    icon: <Trophy className="w-8 h-8 text-secondary" />,
    desc: "Die besten Tools für Marketing, HR und Vertrieb.",
    link: "/software",
    color: "bg-orange-50 text-orange-600",
    border: "hover:border-orange-200"
  },
  {
    id: "services",
    title: "Dienstleistungen",
    icon: <Star className="w-8 h-8 text-yellow-500" />,
    desc: "Agenturen, Berater und Services auf dem Prüfstand.",
    link: "/dienstleistungen",
    color: "bg-yellow-50 text-yellow-600",
    border: "hover:border-yellow-200"
  }
];

export const BigThreeSection = () => {
  return (
    <section className="py-24 relative z-10">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-16 space-y-4">
          <span className="text-secondary font-bold tracking-widest text-xs uppercase bg-secondary/5 px-3 py-1 rounded-full border border-secondary/10">
            Unsere Kernbereiche
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-primary">
            Wo suchst du <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Exzellenz?</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((cat, idx) => (
            <Link 
              key={cat.id} 
              to={cat.link}
              className={`tech-card group p-8 flex flex-col items-start gap-6 ${cat.border}`}
            >
              {/* Icon Box mit Glow */}
              <div className={`p-4 rounded-2xl ${cat.color} group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                {cat.icon}
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-primary group-hover:text-secondary transition-colors">
                  {cat.title}
                </h3>
                <p className="text-slate-500 leading-relaxed">
                  {cat.desc}
                </p>
              </div>

              <div className="mt-auto pt-6 flex items-center text-sm font-bold text-primary group-hover:translate-x-2 transition-transform">
                Jetzt vergleichen <ArrowRight className="ml-2 w-4 h-4 text-secondary" />
              </div>
              
              {/* Dekorativer Hintergrund-Effekt beim Hover */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full -z-10" />
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};