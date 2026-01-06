import { Heart, Dice1, Flame } from "lucide-react";

const portals = [
  {
    title: "Dating",
    description: "Die besten Dating Apps und Singlebörsen im direkten Vergleich. Finde deinen perfekten Match.",
    icon: Heart,
    url: "https://dating.rank-scout.com",
    gradient: "bg-dating-gradient",
    iconBg: "bg-dating/20",
    iconColor: "text-dating",
  },
  {
    title: "Casino",
    description: "Sichere und faire Online Casinos mit den besten Bonusangeboten für Deutschland, Österreich und die Schweiz.",
    icon: Dice1,
    url: "https://casino.rank-scout.com",
    gradient: "bg-casino-gradient",
    iconBg: "bg-casino/20",
    iconColor: "text-casino",
  },
  {
    title: "Adult",
    description: "Diskrete Plattformen für Erwachsene. Casual Dating und mehr für offene Begegnungen.",
    icon: Flame,
    url: "https://adult.rank-scout.com",
    gradient: "bg-adult-gradient",
    iconBg: "bg-adult/20",
    iconColor: "text-adult",
  },
];

export function BigThreeSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
            Unsere Vergleichsportale
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Spezialisierte Vergleiche für jeden Bereich. Finde den perfekten Anbieter für deine Bedürfnisse.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {portals.map((portal, index) => (
            <a
              key={portal.title}
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-card rounded-2xl p-8 border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${portal.gradient}`} />
              
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl ${portal.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <portal.icon className={`w-7 h-7 ${portal.iconColor}`} />
              </div>

              {/* Content */}
              <h3 className="font-display font-bold text-2xl text-foreground mb-3 group-hover:text-primary transition-colors">
                {portal.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {portal.description}
              </p>

              {/* Arrow indicator */}
              <div className="mt-6 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Zum Portal →
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
