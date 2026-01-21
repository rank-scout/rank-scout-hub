import { Target, BarChart3, Rocket } from "lucide-react";

export const BigThreeSection = () => {
  const features = [
    {
      icon: Target,
      title: "Präzise Analysen",
      description: "Kein Bauchgefühl. Unsere Daten basieren auf Millionen von Crawls und echten Marktsignalen.",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: Rocket,
      title: "Maximale Performance",
      description: "Geschwindigkeit ist ein Ranking-Faktor. Wir zeigen dir, wie du deine Core Web Vitals optimierst.",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      icon: BarChart3,
      title: "Nachhaltiges Wachstum",
      description: "Vermeide Abstrafungen. Wir setzen auf langfristige Strategien statt kurzfristiger Hacks.",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <section className="bg-slate-50 py-24 border-t border-slate-100">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Warum Rank-Scout?
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Die Infrastruktur für deinen digitalen Erfolg.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200/50 transition-all hover:-translate-y-1 hover:shadow-md hover:ring-slate-200"
            >
              <div className={`mb-6 inline-flex rounded-xl ${feature.bg} p-3 ${feature.color}`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};