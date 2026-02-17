import { Helmet } from "react-helmet-async";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Check24PowerWidget } from "@/components/external/Check24PowerWidget";
import { Zap, Euro, ShieldCheck } from "lucide-react";

export default function PowerComparison() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Helmet>
        <title>Stromvergleich 2026 | Bis zu 800€ sparen | Rank-Scout</title>
        <meta name="description" content="Senke deine Stromkosten sofort. Vergleiche über 1.000 Stromanbieter und wechsle in 5 Minuten. Garantiert günstiger." />
      </Helmet>
      <Header />
      <main className="pt-20">
        <section className="bg-gradient-to-b from-yellow-500/10 to-background py-16 md:py-24 text-center">
          <div className="container mx-auto px-4">
            <h1 className="font-display font-bold text-4xl md:text-6xl text-foreground mb-6">
              Stromkosten <span className="text-yellow-500">senken</span> leicht gemacht
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Zahle nicht zu viel für Energie. Finde den günstigsten Stromtarif für deinen Haushalt.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
              <span className="flex items-center gap-2"><Euro className="w-5 h-5 text-green-500" /> Bis 800€ Ersparnis</span>
              <span className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-blue-500" /> Preisgarantie</span>
              <span className="flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-500" /> Ökostrom Optionen</span>
            </div>
          </div>
        </section>
        <section className="py-10 bg-background relative z-10 -mt-8">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden p-4 md:p-6">
               <Check24PowerWidget />
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4">Ein Service von CHECK24</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}