import { Helmet } from "react-helmet-async";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useTop100Apps } from "@/hooks/usePromotedApps";
import { useForceSEO } from "@/hooks/useForceSEO";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  AltArrowRight, 
  ShieldCheck, 
  Bolt, 
  Widget,
  CheckRead,
  QuestionCircle,
  HashtagChat,
  DiagramUp,
  SettingsMinimalistic,
  DollarMinimalistic
} from "@solar-icons/react";
// KYRA FIX: Import für Tracking
import { useTrackView } from "@/hooks/useTrackView";

// Hilfsfunktion für Tailwind-Klassen
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default function TopApps() {
  const { data: apps, isLoading } = useTop100Apps();

  // KYRA FIX: Tracking für Top Apps Seite aktivieren
  useTrackView("top-apps", "page");

  useForceSEO("Die Top 100 Apps im großen Vergleich 2026. Strukturierte Übersichten, echte Bewertungen und klare Fakten. Rank-Scout ist deine Instanz für Software-Entscheidungen.");

  if (isLoading) return <LoadingScreen />;

  const canonicalUrl = `${window.location.origin}/top-apps`;
  const lastUpdated = new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-secondary/30">
      <Helmet>
        <title>Top 100 Apps 2026: Wer dominiert den Software-Markt?</title>
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Top 100 Apps 2026 Ranking",
            "description": "Die besten 100 Apps und Software-Lösungen im Vergleich.",
            "itemListElement": apps?.map((app, i) => ({
              "@type": "ListItem",
              "position": i + 1,
              "item": {
                "@type": "SoftwareApplication",
                "name": app.name,
                "applicationCategory": app.category || "BusinessApplication",
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": app.rating || 5,
                  "ratingCount": "100"
                }
              }
            }))
          })}
        </script>
      </Helmet>

      <Header />
      
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-4">
          
          {/* --- HERO SECTION --- */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-8">
               <Widget weight="Bold" className="w-4 h-4 text-primary" />
               <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Aktualisiert: {lastUpdated}</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-display font-bold text-primary mb-8 tracking-tight leading-[1.1]">
              Die Top 100 Apps <br />
              <span className="text-secondary">Benchmark 2026</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-light max-w-2xl mx-auto mb-10">
              Wir haben über 1.000 Anwendungen analysiert. Nur die besten 10% schaffen es in unser offizielles Ranking. Radikal ehrlich, technisch geprüft.
            </p>
          </div>

          {/* --- RATING METHODOLOGY (BEWERTUNGSSCHEMA) --- */}
          <section className="max-w-5xl mx-auto mb-24">
            <div className="bg-slate-50 rounded-[3rem] p-8 md:p-12 border border-slate-100">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                  <Badge className="bg-primary/10 text-primary border-none mb-4">Methodik</Badge>
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-primary">Das Rank-Scout Protokoll</h2>
                  <p className="text-slate-500 mt-2">So objektiv wie Software, so menschlich wie Erfahrung.</p>
                </div>
                <div className="hidden md:block text-right">
                  <span className="text-5xl font-display font-black text-primary/5">2026</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MethodologyCard 
                  icon={<Bolt className="w-6 h-6 text-yellow-500" />}
                  title="Performance"
                  desc="Ladezeiten, API-Stabilität und Ressourcen-Verbrauch im Live-Betrieb."
                />
                <MethodologyCard 
                  icon={<SettingsMinimalistic className="w-6 h-6 text-primary" />}
                  title="Usability"
                  desc="Intuitive Bedienung und Onboarding-Effizienz für Teams."
                />
                <MethodologyCard 
                  icon={<ShieldCheck className="w-6 h-6 text-green-500" />}
                  title="Security"
                  desc="DSGVO-Konformität, Verschlüsselung und Server-Standorte."
                />
                <MethodologyCard 
                  icon={<DollarMinimalistic className="w-6 h-6 text-secondary" />}
                  title="Value"
                  desc="Versteckte Kosten vs. Feature-Umfang im Branchenvergleich."
                />
              </div>
            </div>
          </section>

          {/* --- MAIN CONTENT: RANKING --- */}
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-12">
              <DiagramUp weight="Bold" className="w-8 h-8 text-secondary" />
              <h2 className="text-3xl font-display font-bold text-primary">Aktuelles Ranking</h2>
              <div className="h-px flex-grow bg-slate-100" />
            </div>

            <div className="space-y-6">
              {apps?.map((app, index) => (
                <AppRankCard key={app.id} app={app} index={index} />
              ))}
            </div>

            {/* --- FAQ SECTION --- */}
            <div className="mt-32">
                <div className="flex items-center gap-4 mb-12">
                    <h2 className="text-3xl font-display font-bold text-primary whitespace-nowrap">Häufige Fragen</h2>
                    <div className="h-px w-full bg-slate-100" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FAQCard 
                        question="Wie kommen die Bewertungen zustande?" 
                        answer="Unser Team bewertet Apps nach unserem 4-Säulen-Protokoll: Performance, Usability, Security und Preis-Leistung. Wir nutzen sowohl automatisierte Audits als auch Experten-Tests."
                    />
                    <FAQCard 
                        question="Werden die Rankings manipuliert?" 
                        answer="Nein. Rank-Scout finanziert sich über Affiliate-Einnahmen, aber die Platzierung im Ranking ist rein datenbasiert. Ein schlechtes Produkt kann sich keinen Spitzenplatz kaufen."
                    />
                </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

function MethodologyCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200/50 shadow-sm">
      <div className="mb-4">{icon}</div>
      <h4 className="font-bold text-primary mb-2">{title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function AppRankCard({ app, index }: { app: any, index: number }) {
  const isTopThree = index < 3;
  return (
    <Card className={cn(
        "group border transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white hover:border-secondary/40 hover:bg-secondary/[0.01]",
        isTopThree ? "border-primary/20 bg-primary/[0.01]" : "border-primary/5"
    )}>
      <CardContent className="p-6 md:p-10 flex flex-col lg:flex-row items-center gap-8">
        <div className="relative flex-shrink-0">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-[2rem] border border-primary/5 flex items-center justify-center p-5 group-hover:scale-105 transition-transform duration-500 shadow-sm">
                {app.logo_url ? <img src={app.logo_url} alt={app.name} className="w-full h-full object-contain" /> : <HashtagChat weight="Bold" className="w-12 h-12 text-slate-200" />}
            </div>
            <div className="absolute -top-3 -right-3">
                {index === 0 && <Badge className="bg-secondary text-primary font-black px-4 py-1.5 shadow-xl border-none">🥇 TESTSIEGER</Badge>}
                {index === 1 && <Badge className="bg-slate-200 text-slate-700 font-black px-3 py-1 border-none">🥈 TOP 2</Badge>}
                {index === 2 && <Badge className="bg-orange-100 text-orange-700 font-black px-3 py-1 border-none">🥉 TOP 3</Badge>}
            </div>
        </div>

        <div className="flex-1 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4 justify-center lg:justify-start">
             <h3 className="text-2xl md:text-3xl font-display font-bold text-primary group-hover:text-secondary transition-colors">{app.name}</h3>
             <div className="flex items-center justify-center gap-2">
                <span className="flex items-center gap-1 text-[10px] font-bold text-secondary bg-secondary/10 px-3 py-1 rounded-full uppercase">
                    <Star weight="Bold" className="w-3 h-3" /> {app.rating?.toFixed(1) || "5.0"}
                </span>
             </div>
          </div>
          
          <p className="text-slate-500 text-sm md:text-base mb-8 line-clamp-2 leading-relaxed font-light">
            {app.short_description || `Exklusive Markt-Analyse für ${app.name}. Geprüft auf Datensicherheit und Performance-Metriken 2026.`}
          </p>
          
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8">
            <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">Kategorie</span>
                <span className="text-xs font-bold text-primary/80 uppercase">{app.category || "General"}</span>
            </div>
            <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">Verifizierung</span>
                <div className="flex items-center gap-1 text-xs font-bold text-green-600 uppercase">
                    <ShieldCheck weight="Bold" className="w-3.5 h-3.5" /> Aktiv
                </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-auto">
          <Button 
            size="lg" 
            className="w-full lg:w-auto gap-3 font-bold h-16 px-10 rounded-2xl bg-primary hover:bg-secondary hover:text-primary transition-all duration-300 shadow-none border-none group/btn" 
            asChild
          >
            <a href={app.affiliate_link || "#"} target="_blank" rel="noopener noreferrer">
              Deal sichern 
              <AltArrowRight weight="Bold" className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FAQCard({ question, answer }: { question: string, answer: string }) {
    return (
        <div className="p-8 rounded-[2rem] border border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-3 mb-4">
                <QuestionCircle weight="Bold" className="w-6 h-6 text-secondary" />
                <h4 className="text-lg font-display font-bold text-primary">{question}</h4>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed font-light">{answer}</p>
        </div>
    );
}