import { Magnifer, ChartSquare, CheckCircle } from '@solar-icons/react';

const steps = [
  {
    icon: Magnifer,
    title: "Suchen",
    description: "Wähle deine Kategorie oder suche direkt nach deinem Bedarf.",
    bgClass: "bg-primary/10",
    textClass: "text-primary",
  },
  {
    icon: ChartSquare,
    title: "Vergleichen",
    description: "Unsere KI-gestützten Daten zeigen dir Stärken, Schwächen und Preise auf einen Blick.",
    bgClass: "bg-primary/10",
    textClass: "text-primary",
  },
  {
    icon: CheckCircle,
    title: "Entscheiden",
    description: "Vergleiche passende Angebote und prüfe verfügbare Vorteile.",
    bgClass: "bg-green-100",
    textClass: "text-green-600",
  }
];

export const HowItWorksSection = () => {
  return (
    <section className="bg-white py-16 md:py-24 border-b border-slate-100">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight">
            So funktioniert Rank-Scout
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            In drei einfachen Schritten zur besten Entscheidung.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
          <div 
            aria-hidden="true" 
            className="hidden md:block absolute top-[2.5rem] left-[16%] right-[16%] h-px"
            style={{ 
              background: 'repeating-linear-gradient(90deg, hsl(var(--border)), hsl(var(--border)) 6px, transparent 6px, transparent 12px)'
            }}
          />

          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center text-center p-4">
              <div className={`relative flex items-center justify-center w-20 h-20 rounded-full ${step.bgClass} mb-6 z-10 border-4 border-white shadow-sm`}>
                <step.icon weight="Bold" className={`w-10 h-10 ${step.textClass}`} />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};