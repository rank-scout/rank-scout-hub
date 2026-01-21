import { TrendingUp, ShieldCheck, Zap, BarChart4, Search, Award } from "lucide-react";

export const SEOContentSection = () => {
  return (
    <section className="bg-white py-24 border-t border-slate-100">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Intro Header */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-950 mb-6 sm:text-4xl">
            Rank-Scout: Die Instanz für digitale Markttransparenz
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Wir bringen Licht in den undurchsichtigen Markt digitaler Dienstleistungen und Technologien. 
            Unabhängig. Datengestützt. Kompromisslos ehrlich.
          </p>
        </div>

        {/* 2-Spalten Layout für Core Value Props */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
            <h3 className="text-xl font-bold text-blue-950 mb-4 flex items-center gap-2">
              <span className="h-8 w-8 bg-rose-100 text-rose-700 rounded-lg flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </span>
              Validierte Daten statt Bauchgefühl
            </h3>
            <p className="text-slate-600 mb-4 leading-relaxed">
              Die Wahl der falschen Business-Software oder Agentur verbrennt Kapital und Zeit. Rank-Scout eliminiert dieses Risiko. Unsere Redaktion prüft Anbieter nach standardisierten ISO-ähnlichen Kriterien: Performance-Historie, verifizierte Kundenstimmen und technologische Zukunftsfähigkeit.
            </p>
            <p className="text-slate-600 leading-relaxed font-medium">
              Kein "Pay-to-Win": Bei uns erkauft sich niemand einen Spitzenplatz. Rankings basieren rein auf messbarer Leistung.
            </p>
          </div>
          
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
            <h3 className="text-xl font-bold text-blue-950 mb-4 flex items-center gap-2">
              <span className="h-8 w-8 bg-blue-100 text-blue-900 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5" />
              </span>
              Geschwindigkeit im KI-Zeitalter
            </h3>
            <p className="text-slate-600 mb-4 leading-relaxed">
              Der Markt für Künstliche Intelligenz (KI) und SaaS-Lösungen entwickelt sich exponentiell. Was gestern State-of-the-Art war, ist heute Legacy. Rank-Scout ist Ihr Echtzeit-Radar.
            </p>
            <ul className="space-y-3 mt-4">
              {[
                "Tägliche Updates zu KI-Tools & Algorithmus-Changes",
                "Deep-Dives in neue Software-Kategorien",
                "Vergleich von Enterprise- vs. KMU-Lösungen"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-700">
                  <TrendingUp className="h-5 w-5 text-blue-900 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* SEO Text Block - Massive Content Expansion */}
        <div className="prose prose-slate max-w-none text-slate-600">
          <h3 className="text-2xl font-bold text-blue-950 mb-4">
            Der umfassende Marktplatz für Entscheider: Von SEO bis KI
          </h3>
          <p>
            Rank-Scout versteht sich nicht als einfaches Verzeichnis, sondern als strategischer Partner für den Mittelstand (KMU) und Großunternehmen. In einer Ära, in der digitale Exzellenz über den Unternehmenserfolg entscheidet, liefern wir die notwendigen Entscheidungsgrundlagen. Wir decken das gesamte Spektrum der digitalen Wertschöpfungskette ab und bieten Ihnen Zugriff auf die besten Ressourcen des Marktes.
          </p>

          <div className="grid md:grid-cols-3 gap-8 my-10 not-prose">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-rose-100 transition-colors">
              <div className="text-rose-700 mb-3"><Search className="h-6 w-6"/></div>
              <h4 className="font-bold text-blue-950 mb-2">SEO & Content Marketing</h4>
              <p className="text-sm leading-relaxed">
                Wir analysieren Agenturen, die nachweislich Sichtbarkeit generieren. Keine leeren Versprechen von "Platz 1 bei Google", sondern nachhaltige Strategien, technische Audits, Linkbuilding-Kampagnen und Content-Exzellenz. Wir bewerten nach Traffic-Wert, Domain Authority und Nachhaltigkeit der Methoden.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-100 transition-colors">
              <div className="text-blue-900 mb-3"><Award className="h-6 w-6"/></div>
              <h4 className="font-bold text-blue-950 mb-2">Software & SaaS Stacks</h4>
              <p className="text-sm leading-relaxed">
                Vom CRM über HR-Software bis hin zu spezialisierten ERP-Schnittstellen. Wir vergleichen Feature-Sets, API-Fähigkeiten, Datenschutz-Compliance (DSGVO) und Total Cost of Ownership (TCO). Unsere Matrix hilft Ihnen, Vendor-Lock-ins zu vermeiden und skalierbare Lösungen zu finden.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-100 transition-colors">
              <div className="text-indigo-900 mb-3"><BarChart4 className="h-6 w-6"/></div>
              <h4 className="font-bold text-blue-950 mb-2">E-Commerce & Shops</h4>
              <p className="text-sm leading-relaxed">
                Shopify, Magento, Shopware oder Headless-Lösungen? Welche Agentur baut die schnellsten Shops? Welche Payment-Provider lohnen sich? Unsere Vergleiche geben die Antwort. Wir testen Checkout-Prozesse, Mobile-Performance und Conversion-Optimierungspotenziale.
              </p>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-blue-950 mt-12 mb-4">
            Unabhängige Erfahrungsberichte als Korrektiv im B2B-Markt
          </h3>
          <p>
            Marketingbroschüren sind geduldig. Die Realität im Projektalltag sieht oft anders aus. Deshalb kuratiert Rank-Scout Erfahrungsberichte von verifizierten Nutzern. Wir filtern Spam und Fake-Bewertungen durch proprietäre Algorithmen und manuelle Prüfung. So stellen wir sicher, dass Sie ein unverfälschtes Bild der Anbieterqualität erhalten. Transparenz bedeutet für uns auch, kritische Stimmen zuzulassen, solange sie konstruktiv und belegbar sind.
          </p>
          <p>
            Ein weiterer Fokus liegt auf der <strong>Sicherheit von Investitionen</strong>. Durch unsere detaillierten Finanz-Checks und Bonitätsprüfungen bei Premium-Anbietern minimieren Sie das Ausfallrisiko. Gerade bei langfristigen SEO-Verträgen oder komplexen Software-Implementierungen ist die Stabilität des Partners entscheidend.
          </p>

          <h3 className="text-2xl font-bold text-blue-950 mt-8 mb-4">
            Zukunftssicherheit durch Technologie-Scouting
          </h3>
          <p>
            Unsere Scouts scannen den globalen Markt permanent nach neuen Trends. Ob Generative AI, Blockchain im Supply Chain Management oder neue Tracking-Methoden in einer Post-Cookie-Ära – auf Rank-Scout erfahren Sie es zuerst. Wir übersetzen komplexe Technologie-Trends in handfeste Business-Cases für Ihr Unternehmen.
          </p>
          
          <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100 text-sm">
            <strong>Unser Versprechen:</strong> Rank-Scout bleibt zu 100% unabhängig. Wir finanzieren uns transparent und akzeptieren keine verdeckten Provisionen für bessere Rankings. Ihre Entscheidungssicherheit ist unser Produkt. Vertrauen Sie auf die Intelligenz der Crowd, gepaart mit der analytischen Schärfe unserer Branchen-Experten.
          </div>
        </div>

      </div>
    </section>
  );
};