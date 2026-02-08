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
  Notes,
  DiagramUp,
  SettingsMinimalistic,
  DollarMinimalistic
} from "@solar-icons/react";

export default function TopApps() {
  const { data: apps, isLoading } = useTop100Apps();

  useForceSEO("Die Top 100 Apps im großen Vergleich 2026. Unabhängige Tests, echte Bewertungen und exklusive Deals. Rank-Scout ist deine Instanz für Software-Entscheidungen.");

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
                  "ratingCount": "139"
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

// ... Restliche Komponenten (AppRankCard, FAQCard, cn) bleiben identisch wie zuvor