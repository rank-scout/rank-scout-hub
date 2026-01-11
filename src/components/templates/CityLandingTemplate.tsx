import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, 
  ExternalLink, 
  Star, 
  Shield, 
  Users, 
  CheckCircle2,
  Sparkles
} from "lucide-react";
import DOMPurify from "dompurify";
import type { Tables } from "@/integrations/supabase/types";

type Category = Tables<"categories">;
type Project = Tables<"projects">;

interface CityLandingTemplateProps {
  category: Category;
  projects: Project[];
}

export default function CityLandingTemplate({ category, projects }: CityLandingTemplateProps) {
  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case "DATING":
        return { 
          bg: "bg-dating/10", 
          text: "text-dating", 
          border: "border-dating/30",
          gradient: "from-dating/20 to-transparent",
          button: "bg-dating hover:bg-dating/90"
        };
      case "CASINO":
        return { 
          bg: "bg-casino/10", 
          text: "text-casino", 
          border: "border-casino/30",
          gradient: "from-casino/20 to-transparent",
          button: "bg-casino hover:bg-casino/90"
        };
      case "ADULT":
        return { 
          bg: "bg-adult/10", 
          text: "text-adult", 
          border: "border-adult/30",
          gradient: "from-adult/20 to-transparent",
          button: "bg-adult hover:bg-adult/90"
        };
      default:
        return { 
          bg: "bg-primary/10", 
          text: "text-primary", 
          border: "border-primary/30",
          gradient: "from-primary/20 to-transparent",
          button: "bg-primary hover:bg-primary/90"
        };
    }
  };

  const theme = getThemeClasses(category.theme);

  const sanitizeHtml = (html: string) => {
    return { __html: DOMPurify.sanitize(html) };
  };

  // Get custom site name for header
  const siteName = category.site_name;

  return (
    <div className="min-h-screen bg-background">
      <Header siteName={siteName} />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#3d1515] via-[#5c1a1a] to-[#2d1010] py-16 md:py-24 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <Link to="/" className="hover:text-foreground transition-colors">Startseite</Link>
              <ChevronRight className="w-4 h-4" />
              <Link to="/kategorien" className="hover:text-foreground transition-colors">Regionen</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground">{category.name}</span>
            </nav>

            <div className="max-w-4xl mx-auto text-center">
              {/* Badge above headline */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className={`text-2xl ${theme.text}`}>❤️</span>
                <span className={`font-display font-semibold uppercase tracking-wider ${theme.text}`}>
                  {category.name} SINGLES
                </span>
              </div>
              
              {/* Hero Headline - customizable */}
              <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-6 leading-tight">
                {category.hero_headline || `Finde Singles in ${category.name} & Umgebung`}
              </h1>
              
              {category.description && (
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                  {category.description}
                </p>
              )}

              <Button size="lg" className="bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2 px-8 py-6 text-lg">
                🔍 {category.name} Singles finden
              </Button>

              {/* Trust text below button */}
              <p className="mt-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Geprüft für Stadt & Land {category.name}
              </p>
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="bg-muted/50 border-y border-border py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="w-5 h-5 text-green-500" />
                <span>Geprüfte Profile</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-5 h-5 text-blue-500" />
                <span>Täglich aktualisiert</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Kostenlose Anmeldung</span>
              </div>
            </div>
          </div>
        </section>

        {/* Content Top - USPs */}
        {category.long_content_top && (
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
              <div 
                className="prose prose-invert max-w-none font-sans"
                dangerouslySetInnerHTML={sanitizeHtml(category.long_content_top)}
              />
            </div>
          </section>
        )}

        {/* App Comparison List */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
                Top {projects.length} Anbieter für dich
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Unsere Redaktion hat die besten Anbieter für {category.name} getestet und bewertet.
              </p>
            </div>

            <div className="space-y-4 max-w-4xl mx-auto">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className={`group relative bg-card border rounded-2xl p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 ${
                    index === 0 ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  }`}
                >
                  {/* Rank Badge */}
                  <div className={`absolute -left-3 -top-3 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    #{index + 1}
                  </div>

                  {/* Winner Badge */}
                  {index === 0 && (
                    <div className="absolute -right-2 -top-2">
                      <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0">
                        🏆 Testsieger
                      </Badge>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                      {project.logo_url ? (
                        <img 
                          src={project.logo_url} 
                          alt={project.name}
                          className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-xl bg-white p-2"
                        />
                      ) : (
                        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-xl ${theme.bg} flex items-center justify-center`}>
                          <span className="text-2xl md:text-3xl">💕</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-display font-semibold text-xl text-foreground group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                        {project.rating && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-foreground">{project.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {project.short_description && (
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {project.short_description}
                        </p>
                      )}

                      {/* Pros */}
                      {project.pros_list && project.pros_list.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {project.pros_list.slice(0, 3).map((pro, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              {pro}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="flex-shrink-0 w-full md:w-auto">
                      <Link to={`/go/${project.slug}`}>
                        <Button className={`w-full md:w-auto gap-2 ${index === 0 ? theme.button + ' text-white' : ''}`}>
                          Jetzt testen
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                      {project.badge_text && (
                        <p className="text-xs text-center text-muted-foreground mt-2">
                          {project.badge_text}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SEO Deep Dive Content */}
        {category.long_content_bottom && (
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
              <div 
                className="prose prose-invert max-w-4xl mx-auto font-sans [&_h2]:font-display [&_h3]:font-display [&_summary]:font-display"
                dangerouslySetInnerHTML={sanitizeHtml(category.long_content_bottom)}
              />
            </div>
          </section>
        )}

        {/* Back Link */}
        <section className="pb-16">
          <div className="container mx-auto px-4 text-center">
            <Link to="/kategorien" className={`inline-flex items-center gap-2 ${theme.text} hover:underline`}>
              ← Alle Kategorien anzeigen
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
