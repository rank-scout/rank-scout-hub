import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Scale, AlertTriangle, CheckCircle2, ShieldCheck, Mail, Info } from "lucide-react";
import { Helmet } from "react-helmet-async"; // KYRA FIX

const AGB = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-900">
      {/* KYRA FIX: Unique Title für AGB */}
      <Helmet>
        <title>Allgemeine Geschäftsbedingungen (AGB) | Rank-Scout</title>
        <meta name="description" content="Unsere allgemeinen Geschäftsbedingungen für die Nutzung von Rank-Scout." />
        <link rel="canonical" href="https://rank-scout.com/agb" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <Header />
      
      {/* --- HEADER BEREICH (ZENTRIERT) --- */}
      <div className="bg-primary pt-32 pb-20 md:pt-40 md:pb-24 relative overflow-hidden">
         <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:30px_30px]" />
         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/90" />

         <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight">
              Allgemeine Geschäftsbedingungen
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Nutzungsbedingungen für das Online-Angebot von Rank-Scout.
            </p>
            <p className="text-sm text-secondary font-medium mt-4 flex items-center justify-center gap-2">
              <Info className="w-4 h-4" /> Stand: 25.01.2026
            </p>
         </div>
      </div>
      
      <main className="flex-grow container mx-auto px-4 -mt-12 relative z-20 pb-20">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100">

          <div className="space-y-16">
            
            {/* 1. Geltungsbereich */}
            <section>
              <h2 className="text-2xl font-display font-bold text-primary mb-6 flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg text-secondary"><Scale className="w-6 h-6" /></div>
                1. Geltungsbereich
              </h2>
              <div className="prose prose-slate max-w-none text-slate-700">
                <p>
                  Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Geschäftsbeziehungen zwischen der <strong>Media-Bro</strong> (nachfolgend „Anbieter“) und den Nutzern der Plattform Rank-Scout.
                </p>
                <p>
                  Maßgeblich ist die zum Zeitpunkt des Vertragsschlusses gültige Fassung. Abweichende Bedingungen des Nutzers werden nicht anerkannt, es sei denn, der Anbieter stimmt ihrer Geltung ausdrücklich zu.
                </p>
              </div>
            </section>

            {/* 2. Leistungsgegenstand */}
            <section>
              <h2 className="text-2xl font-display font-bold text-primary mb-6 flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg text-secondary"><CheckCircle2 className="w-6 h-6" /></div>
                2. Leistungsgegenstand
              </h2>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-slate-700 space-y-3">
                <p>Rank-Scout stellt eine unabhängige Informations- und Vergleichsplattform für Software, digitale Dienstleistungen, Finanzprodukte und Versicherungen bereit.</p>
                <p><strong>Hinweis zur Vermittlung:</strong> Wir treten bei Finanz- und Versicherungsprodukten ausdrücklich nicht als Versicherungsvermittler oder Makler auf, sondern ausschließlich als Tippgeber. Die auf unserer Website eingebundenen Vergleichsrechner und -formulare werden von externen Technologiepartnern (z. B. TARIFCHECK24 GmbH, CHECK24) bereitgestellt. Die vertragliche Beziehung bezüglich des Produktes kommt ausschließlich zwischen dem Nutzer und dem jeweiligen Drittanbieter bzw. dem durchführenden Partner zustande.</p>
              </div>
            </section>

            {/* 3. Haftungsausschluss */}
            <section>
              <h2 className="text-2xl font-display font-bold text-primary mb-6 flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg text-secondary"><AlertTriangle className="w-6 h-6" /></div>
                3. Haftung & Gewährleistung
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl border border-red-100 bg-red-50/50">
                  <h3 className="font-bold text-red-900 mb-2">Inhaltliche Richtigkeit</h3>
                  <p className="text-sm text-red-800">Wir bemühen uns um Aktualität, übernehmen jedoch keine Gewähr für die Richtigkeit, Vollständigkeit und Aktualität der bereitgestellten Informationen Dritter.</p>
                </div>
                <div className="p-6 rounded-xl border border-slate-100 bg-slate-50">
                  <h3 className="font-bold text-primary mb-2">Technische Verfügbarkeit</h3>
                  <p className="text-sm text-slate-600">Wir gewährleisten keine unterbrechungsfreie Verfügbarkeit der Webseite. Wartungsarbeiten oder Störungen können den Zugriff vorübergehend einschränken.</p>
                </div>
              </div>
            </section>

            {/* 4. Schlussbestimmungen */}
            <section className="bg-primary/5 p-8 rounded-2xl border border-primary/10">
              <h2 className="text-xl font-display font-bold text-primary mb-6 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5" /> 4. Schlussbestimmungen
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                <div>
                  <p className="text-secondary font-bold uppercase tracking-widest text-xs mb-2 font-display">Anwendbares Recht</p>
                  <p className="text-slate-700">Es gilt das Recht der Republik Österreich, sofern dem keine zwingenden Verbraucherschutzvorschriften entgegenstehen.</p>
                </div>
                <div>
                  <p className="text-secondary font-bold uppercase tracking-widest text-xs mb-2 font-display">Gerichtsstand</p>
                  <p className="text-slate-700">Für B2B-Kunden ist der Gerichtsstand Linz. Bei Verbrauchern gelten die gesetzlichen Gerichtsstände.</p>
                </div>
              </div>
              <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
                <p className="text-slate-500 text-xs italic">Sollte eine Bestimmung unwirksam sein, bleibt der Rest gültig (Salvatorische Klausel).</p>
                <a href="mailto:hello@rank-scout.com" className="flex items-center gap-2 text-secondary hover:text-primary transition-colors font-bold">
                  <Mail className="w-4 h-4" /> hello@rank-scout.com
                </a>
              </div>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AGB;