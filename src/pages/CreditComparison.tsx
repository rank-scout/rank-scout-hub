import { Helmet } from "react-helmet-async";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TarifCheckCreditWidget } from "@/components/external/TarifCheckCreditWidget";
import { CheckCircle2, Shield, Clock, Percent } from "lucide-react";

export default function CreditComparison() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Helmet>
        <title>Kreditvergleich 2026 | Top Zinsen sichern | Rank-Scout</title>
        <meta name="description" content="Vergleiche jetzt aktuelle Kredite und sichere dir die besten Zinsen. Kostenloser Kreditvergleich von über 20 Banken. Sofort-Zusage möglich." />
      </Helmet>
      <Header />
      <main className="pt-20">
        <section className="bg-gradient-to-b from-primary/10 to-background py-16 md:py-24 text-center">
          <div className="container mx-auto px-4">
            <h1 className="font-display font-bold text-4xl md:text-6xl text-foreground mb-6">
              Dein Kreditvergleich <span className="text-primary">2026</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Finanzielle Freiheit beginnt hier. Vergleiche Angebote von Top-Banken in Sekunden – unverbindlich & SCHUFA-neutral.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
              <span className="flex items-center gap-2"><Shield className="w-5 h-5 text-green-500" /> SCHUFA-Neutral</span>
              <span className="flex items-center gap-2"><Clock className="w-5 h-5 text-amber-500" /> Sofort-Ergebnis</span>
              <span className="flex items-center gap-2"><Percent className="w-5 h-5 text-blue-500" /> Top-Konditionen</span>
            </div>
          </div>
        </section>
        <section className="py-10 bg-background relative z-10 -mt-8">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden p-4 md:p-6">
               <TarifCheckCreditWidget />
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4">Kooperation mit Tarifcheck.de</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}