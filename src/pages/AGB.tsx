import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Scale, AlertTriangle, CheckCircle2, ShieldCheck, Mail, Info } from "lucide-react";

const AGB = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-900">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 pt-40 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-12 border-b border-slate-100 pb-8 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4 tracking-tight">
              Allgemeine Geschäftsbedingungen
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl">
              Nutzungsbedingungen für das Online-Angebot von Rank-Scout.
            </p>
            <p className="text-sm text-secondary font-medium mt-4 flex items-center justify-center md:justify-start gap-2">
              <Info className="w-4 h-4" /> Stand: 25.01.2026
            </p>
          </div>

          <div className="space-y-16">
            
            {/* Geltungsbereich Intro */}
            <section className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
              <h2 className="text-xl font-bold text-primary mb-4">Geltungsbereich</h2>
              <p className="text-slate-800 leading-relaxed">
                Diese Allgemeinen Geschäfts- und Nutzungsbedingungen gelten für die Nutzung des Online-Angebots 
                <strong> „Rank-Scout“</strong> inklusive aller Unterseiten, Subdomains und Verzeichnisse. 
                Der Anbieter dieser Website ist im Impressum genannt.
              </p>
            </section>

            {/* 1. Begriffsbestimmungen */}
            <section>
              <h2 className="text-2xl font-display font-bold text-primary mb-6 flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg text-secondary"><Scale className="w-6 h-6" /></div>
                1. Geltungsbereich und Begriffsbestimmungen
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm">
                  <p className="m-0 text-slate-900"><strong>Nutzer:</strong> Jede Person, die die Website aufruft oder Inhalte nutzt.</p>
                </div>
                <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm">
                  <p className="m-0 text-slate-900"><strong>Drittanbieter:</strong> Externe Unternehmen (Software-Hersteller, Banken, Shops), auf die verlinkt wird.</p>
                </div>
              </div>
            </section>

            {/* 2. Kein Beratungsvertrag (HELL mit Navy-2) */}
            <section className="bg-slate-50 text-slate-900 p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
              <h2 className="text-2xl font-display font-bold mb-6 relative z-10 flex items-center gap-4 text-primary">
                {/* Die weiße 2 im Navy-Kreis */}
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-lg shrink-0">2</div>
                Leistungsbeschreibung & Kein Beratungsvertrag
              </h2>
              <div className="prose prose-slate max-w-none text-slate-700 relative z-10">
                <p>Die Website stellt redaktionelle Inhalte (Vergleiche, Ratgeber, Bestenlisten) bereit. Wir agieren als Informationsmittler.</p>
                
                {/* WICHTIG BOX: Navy für harten Kontrast */}
                <div className="bg-primary text-white border-l-4 border-secondary p-8 mt-8 shadow-xl rounded-r-xl">
                  <h3 className="text-secondary font-bold uppercase tracking-wider text-sm mb-3 font-display">WICHTIG: Keine Finanz- oder Rechtsberatung</h3>
                  <p className="m-0 leading-relaxed font-medium text-slate-100">
                    Rank-Scout erbringt keine Anlageberatung, Rechtsberatung oder Steuerberatung. Unsere Vergleiche im Finanzbereich dienen ausschließlich 
                    der selbstständigen Information des Nutzers und ersetzen keine professionelle Beratung. Wir vermitteln keine 
                    Verträge selbst, sondern leiten lediglich technisch weiter.
                  </p>
                </div>
              </div>
            </section>

            {/* 3 & 4. Affiliate & Dritte */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-12 border-y border-slate-100 py-12">
              <div>
                <h3 className="text-xl font-display font-bold text-primary mb-4">3. Affiliate & Transparenz</h3>
                <p className="text-slate-800 text-sm leading-relaxed">
                  Teile der Website enthalten Affiliate-Links. Wenn Nutzer diese nutzen, kann der Anbieter eine Provision erhalten. 
                  Für Nutzer entstehen dadurch <strong>keine Mehrkosten</strong>.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-primary mb-4">4. Vertragsverhältnisse</h3>
                <p className="text-slate-800 text-sm leading-relaxed">
                  Verträge kommen ausschließlich zwischen Nutzer und Drittanbieter zustande. Der Drittanbieter ist allein verantwortlich 
                  für Preise, AGB und die Leistungserbringung.
                </p>
              </div>
            </section>

            {/* 5. Inhalte & Ranking */}
            <section>
              <h2 className="text-2xl font-display font-bold text-primary mb-6 flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg text-secondary"><CheckCircle2 className="w-6 h-6" /></div>
                5. Inhalte & Ranking-Methodik
              </h2>
              <p className="text-slate-800 leading-relaxed">
                Unsere Rankings basieren auf objektiven Kriterien, Nutzerfeedback und Expertenanalysen. Da sich Konditionen täglich ändern können, 
                übernehmen wir keine Gewähr für die ständige Aktualität der Preise und Zinsen. Maßgeblich ist immer die Angabe auf der Seite des Anbieters.
              </p>
            </section>

            {/* 11. Schlussbestimmungen (HELL) */}
            <section className="bg-slate-50 text-slate-900 p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-display font-bold mb-8 flex items-center gap-3 border-b border-slate-200 pb-4 text-primary">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-lg shrink-0">11</div>
                Schlussbestimmungen
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