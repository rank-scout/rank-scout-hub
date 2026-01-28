import { ArrowRight, Trophy, Star, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useHomeContent } from "@/hooks/useSettings";

export const BigThreeSection = () => {
  const { content } = useHomeContent();
  if (!content) return null;

  // Icons bleiben hardcoded gemappt, aber Rest ist dynamisch
  const categories = [
    {
      id: "finance",
      title: content.big_three.finance_title,
      icon: <TrendingUp className="w-8 h-8 text-blue-500" />,
      desc: content.big_three.finance_desc,
      link: content.big_three.finance_link || "/finanzen", // Fallback
      btn: content.big_three.finance_button || "Vergleichen",
      color: "bg-blue-50 text-blue-600",
      border: "hover:border-blue-200"
    },
    {
      id: "software",
      title: content.big_three.software_title,
      icon: <Trophy className="w-8 h-8 text-secondary" />,
      desc: content.big_three.software_desc,
      link: content.big_three.software_link || "/software",
      btn: content.big_three.software_button || "Tools finden",
      color: "bg-orange-50 text-orange-600",
      border: "hover:border-orange-200"
    },
    {
      id: "services",
      title: content.big_three.services_title,
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      desc: content.big_three.services_desc,
      link: content.big_three.services_link || "/dienstleistungen",
      btn: content.big_three.services_button || "Suchen",
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
                {cat.btn} <ArrowRight className="ml-2 w-4 h-4 text-secondary" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};