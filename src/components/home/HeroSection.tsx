import { useHeroTitle, useHeroSubtitle, useTrendingLinks } from "@/hooks/useSettings";
import { SearchBar } from "./SearchBar";
import { TrendingUp } from "lucide-react";

export function HeroSection() {
  const heroTitle = useHeroTitle();
  const heroSubtitle = useHeroSubtitle();
  const trendingLinks = useTrendingLinks();

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center bg-hero-gradient pt-16">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Über 500+ Anbieter verglichen
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display font-bold text-4xl md:text-6xl lg:text-7xl text-foreground mb-6 animate-slide-up">
            {heroTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
            {heroSubtitle}
          </p>

          {/* Search Bar */}
          <div className="mb-10 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <SearchBar />
          </div>

          {/* Trending Pills */}
          {trendingLinks.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <span className="text-sm text-muted-foreground">Trending:</span>
              {trendingLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-muted/50 hover:bg-muted text-sm font-medium text-foreground transition-all hover:scale-105"
                >
                  {link.emoji && <span>{link.emoji}</span>}
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
