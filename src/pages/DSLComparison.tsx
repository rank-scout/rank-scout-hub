import { Helmet } from "react-helmet-async";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Check24DSLWidget } from "@/components/external/Check24DSLWidget";
import { Wifi, Zap, PiggyBank } from "lucide-react";
// KYRA FIX: Import für Tracking
import { useTrackView } from "@/hooks/useTrackView";

export default function DSLComparison() {
  // KYRA FIX: Tracking für DSL-Vergleich aktivieren
  useTrackView("dsl-vergleich", "comparison");

  return (
    <div className="min-h-screen bg-background font-sans">
      <Helmet>
        <title>DSL & Internet Vergleich 2026 | Bis zu 650€ Cashback | Rank-Scout</title>
        <meta name="description" content="Finde den schnellsten und günstigsten Internetanbieter. DSL, Kabel & Glasfaser im Vergleich. Bis zu 650€ Cashback sichern!" />
      </Helmet>
      <Header />
      <main className="pt-20">
        <section className="bg-gradient-to-b from-blue-500/10 to-background py-16 md:py-24 text-center">
          <div className="container mx-auto px-4">
            <h1 className="font-display font-bold text-4xl md:text-6xl text-foreground mb-6">
              Highspeed Internet <span className="text-blue-500">zum Bestpreis</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Surfe schneller und spare dabei. Vergleiche DSL, Kabel und Glasfaser Anbieter in deiner Region.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
              <span className="flex items-center gap-2"><Wifi className="w-5 h-5 text-blue-500" /> Verfügbarkeit prüfen</span>
              <span className="flex items-center gap-2"><PiggyBank className="w-5 h-5 text-green-500" /> Hohes Cashback</span>
              <span className="flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-500" /> Einfacher Wechsel</span>
            </div>
          </div>
        </section>
        <section className="py-10 bg-background relative z-10 -mt-8">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden p-4 md:p-6">
               <Check24DSLWidget />
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4">Kooperation mit Check24</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}