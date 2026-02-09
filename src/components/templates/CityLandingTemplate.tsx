import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { CityLandingFooter } from "@/components/templates/CityLandingFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, 
  ExternalLink, 
  Star, 
  Shield, 
  CheckCircle2,
  Clock,
  Award,
  AlertTriangle
} from "lucide-react";
import DOMPurify from "dompurify";
import type { Category } from "@/hooks/useCategories";
import type { ProjectWithCategory } from "@/hooks/useProjects";
import { Helmet } from "react-helmet-async"; // KYRA FIX: Import added

interface CityLandingTemplateProps {
  category: Category;
  projects: ProjectWithCategory[];
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

  const siteName = category.site_name;
  const isDev = import.meta.env.DEV;

  // --- FIX START: Robuste Settings-Logik ---
  const defaultSettings = {
    show_top3_dating_apps: true,
    show_singles_in_der_naehe: true,
    show_chat_mit_einer_frau: true,
    show_online_dating_cafe: true,
    show_bildkontakte_login: true,
    show_18plus_hint_box: true,
  };

  const navSettings = {
    ...defaultSettings,
    ...(category.navigation_settings || {})
  };

  console.log(`Settings für ${category.name}:`, navSettings);

  const hasQuickNavLinks = navSettings.show_top3_dating_apps || 
    navSettings.show_singles_in_der_naehe || 
    navSettings.show_chat_mit_einer_frau || 
    navSettings.show_online_dating_cafe || 
    navSettings.show_bildkontakte_login ||
    navSettings.show_18plus_hint_box;

  // KYRA FIX: Schema.org für City Pages (CollectionPage)
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category.hero_headline || category.name,
    "description": category.description,
    "url": `https://rank-scout.com/category/${category.slug}`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": projects.map((project, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": project.name,
        "url": project.url || `https://rank-scout.com/go/${project.slug}`
      }))
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* KYRA FIX: Helmet Block für Schema Injection */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      <Header />
      <main className="pt-16">
        {/* ... (Rest des Codes bleibt identisch wie von dir gesendet) ... */}
        <section className="relative bg-gradient-to-br from-[#3d1515] via-[#5c1a1a] to-[#2d1010] py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <Link to="/" className="hover:text-foreground transition-colors">Startseite</Link>
              <ChevronRight className="w-4 h-4" />
              <Link to="/kategorien" className="hover:text-foreground transition-colors">Regionen</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground">{category.name}</span>
            </nav>

            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className={`text-2xl ${theme.text}`}>❤️</span>
                <span className={`font-display font-semibold uppercase tracking-wider ${theme.text}`}>
                  {category.name} SINGLES
                </span>
              </div>
              
              <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-6 leading-tight">
                {category.hero_headline || `Finde Singles in ${category.name} & Umgebung`}
              </h1>
              
              {category.description && (
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                  {category.description}
                </p>
              )}

              <Button size="lg" className="bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2 px-8 py-6 text-lg shadow-lg shadow-amber-500/25">
                🔍 {category.name} Singles finden
              </Button>

              <p className="mt-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Geprüft für Stadt & Land {category.name}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-muted/80 via-muted/60 to-muted/80 border-y border-border py-5">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-sm">
              <div className="flex items-center gap-2.5 text-foreground">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-500" />
                </div>
                <span className="font-medium">Geprüfte Profile</span>
              </div>
              <div className="flex items-center gap-2.5 text-foreground">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                </div>
                <span className="font-medium">100% Kostenlose Anmeldung</span>
              </div>
              <div className="flex items-center gap-2.5 text-foreground">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <span className="font-medium">Täglich aktualisiert</span>
              </div>
            </div>
          </div>
        </section>

        {(category.banner_override || isDev) && (
          <section className="py-6 bg-muted/30">
            <div className="container mx-auto px-4">
              {category.banner_override ? (
                <div 
                  className="banner-container flex justify-center items-center"
                  dangerouslySetInnerHTML={sanitizeHtml(category.banner_override)}
                />
              ) : isDev ? (
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center bg-muted/20">
                  <p className="text-muted-foreground text-sm">
                    📢 Banner-Bereich (nur im Dev-Modus sichtbar)
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Füge HTML im Backend unter "Banner Override" ein
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        )}

        {hasQuickNavLinks && (
          <section className="py-8 bg-background">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-display font-semibold text-xl text-foreground">
                      Schnellnavigation: Dating-Themen & Regionen
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Praktische interne Links, passend zu „{category.name}" – ohne Umwege.
                    </p>
                  </div>
                  <a href="#vergleich" className={`text-sm ${theme.text} hover:underline flex items-center gap-1`}>
                    ↓ Zum Vergleich
                  </a>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {navSettings.show_top3_dating_apps && (
                    <Link to="/top3-dating-apps" className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-border bg-card hover:bg-muted transition-colors text-sm">
                      ⭐ Top3 Dating Apps
                    </Link>
                  )}
                  {navSettings.show_singles_in_der_naehe && (
                    <Link to="/singles-in-der-naehe" className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-border bg-card hover:bg-muted transition-colors text-sm">
                      📍 Singles in der Nähe
                    </Link>
                  )}
                  {navSettings.show_chat_mit_einer_frau && (
                    <Link to="/chat-mit-einer-frau" className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-border bg-card hover:bg-muted transition-colors text-sm">
                      👩 Chat mit einer Frau
                    </Link>
                  )}
                  {navSettings.show_online_dating_cafe && (
                    <Link to="/online-dating-cafe" className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-border bg-card hover:bg-muted transition-colors text-sm">
                      💻 Online Dating Cafe
                    </Link>
                  )}
                  {navSettings.show_bildkontakte_login && (
                    <Link to="/bildkontakte-login" className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-border bg-card hover:bg-muted transition-colors text-sm">
                      🖼️ Bildkontakte Login
                    </Link>
                  )}
                </div>

                {navSettings.show_18plus_hint_box && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-400 text-sm">Hinweis: 18+ Bereich</p>
                      <p className="text-sm text-muted-foreground">
                        Wenn du explizit Inhalte für Erwachsene suchst, nutze bitte ausschließlich den 18+ Bereich:
                      </p>
                      <a 
                        href="https://adult.rank-scout.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-red-400 hover:underline mt-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        adult.rank-scout.com (18+)
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {category.long_content_top && (
          <section className="py-12 md:py-16 bg-gradient-to-b from-background to-muted/20">
            <div className="container mx-auto px-4">
              <div 
                className="prose prose-invert max-w-none font-sans [&_.usp-card]:shadow-md [&_.usp-card]:border-gray-700/50 [&_.usp-card]:hover:shadow-xl [&_.usp-card]:hover:border-primary/30"
                dangerouslySetInnerHTML={sanitizeHtml(category.long_content_top)}
              />
            </div>
          </section>
        )}

        <section id="vergleich" className="py-12 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Award className="w-4 h-4" />
                Experten-Auswahl {new Date().getFullYear()}
              </div>
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
                  className={`group relative bg-card border rounded-2xl p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 shadow-md ${
                    index === 0 ? 'border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/10' : 'border-border/80'
                  }`}
                >
                  <div className={`absolute -left-3 -top-3 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-black' : 'bg-muted text-muted-foreground'
                  }`}>
                    #{index + 1}
                  </div>

                  {index === 0 && (
                    <div className="absolute -right-2 -top-2">
                      <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0 shadow-lg shadow-amber-500/25">
                        🏆 Testsieger
                      </Badge>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="flex-shrink-0">
                      {project.logo_url ? (
                        <img 
                          src={project.logo_url} 
                          alt={project.name}
                          className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-xl bg-white p-2 shadow-sm"
                        />
                      ) : (
                        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-xl ${theme.bg} flex items-center justify-center shadow-inner`}>
                          <span className="text-2xl md:text-3xl">💕</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-display font-semibold text-xl text-foreground group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                        {project.rating && (
                          <div className="flex items-center gap-1 flex-shrink-0 bg-yellow-500/10 px-2 py-1 rounded-lg">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-yellow-400">{project.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {project.short_description && (
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {project.short_description}
                        </p>
                      )}

                      {project.pros_list && project.pros_list.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {project.pros_list.slice(0, 3).map((pro, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2.5 py-1.5 rounded-full border border-green-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              {pro}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0 w-full md:w-auto">
                      <Link to={`/go/${project.slug}`}>
                        <Button className={`w-full md:w-auto gap-2 shadow-lg ${index === 0 ? theme.button + ' text-white shadow-primary/25' : ''}`}>
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

        {category.long_content_bottom && (
          <section className="py-12 md:py-20 bg-gradient-to-b from-muted/30 via-background to-muted/20">
            <div className="container mx-auto px-4">
              <div 
                className="prose prose-invert max-w-4xl mx-auto font-sans [&_h2]:font-display [&_h3]:font-display [&_summary]:font-display [&_details]:shadow-md [&_details]:border-gray-700/50"
                dangerouslySetInnerHTML={sanitizeHtml(category.long_content_bottom)}
              />
            </div>
          </section>
        )}

        <section className="py-12 bg-muted/20">
          <div className="container mx-auto px-4 text-center">
            <Link to="/kategorien" className={`inline-flex items-center gap-2 ${theme.text} hover:underline font-medium`}>
              ← Alle Kategorien anzeigen
            </Link>
          </div>
        </section>
      </main>
      <CityLandingFooter category={category} />
    </div>
  );
}