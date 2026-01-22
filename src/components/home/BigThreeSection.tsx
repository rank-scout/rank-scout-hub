import { ArrowRight, Trophy, Star, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useHomeContent } from "@/hooks/useSettings";

export const BigThreeSection = () => {
  const { content } = useHomeContent();
  if (!content) return null;

  // Wir bauen das Array dynamisch basierend auf den Settings auf
  const categories = [
    {
      id: "finance",
      title: content.big_three.finance_title,
      icon: <TrendingUp className="w-8 h-8 text-blue-500" />,
      desc: content.big_three.finance_desc,
      link: "/finanzen",
      color: "bg-blue-50 text-blue-600",
      border: "hover:border-blue-200"
    },
    {
      id: "software",
      title: content.big_three.software_title,
      icon: <Trophy className="w-8 h-8 text-secondary" />,
      desc: content.big_three.software_desc,
      link: "/software",
      color: "bg-orange-50 text-orange-600",
      border: "hover:border-orange-200"
    },
    {
      id: "services",
      title: content.big_three.services_title,
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      desc: content.big_three.services_desc,
      link: "/dienstleistungen",
      color: "bg-yellow-50 text-yellow-600",
      border: "hover:border-yellow-200"
    }
  ];

  return (
    <section className="py-24 bg-slate-50/50">
      <div className="container px-4 mx-auto">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary">
            {content.big_three.headline}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              to={cat.link}
              className={`tech-card group p-8 flex flex-col items-start gap-6 ${cat.border}`}
            >
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
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full pointer-events-none" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};