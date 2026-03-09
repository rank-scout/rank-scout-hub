import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ShieldCheck, TrendingUp, Scale, Info, Clock } from 'lucide-react'; // <-- HIER FEHLTE CLOCK!

export default function HowWeCompare() {
  return (
    <div className="font-sans antialiased text-slate-800 bg-[#fafafa] min-h-screen flex flex-col">
      <Helmet>
        <html lang="de" />
        <title>Wie wir vergleichen – Transparenz bei Rank-Scout</title>
        <meta name="description" content="Erfahre, wie Rank-Scout Angebote vergleicht, wie wir uns finanzieren und nach welchen Kriterien unsere redaktionellen Übersichten entstehen." />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* HEADER SIMPLE */}
      <header className="w-full bg-[#0a0a0a] text-white py-4 px-6 shadow-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-display font-extrabold text-xl tracking-tight text-orange-500 hover:text-white transition-colors">
            Rank-Scout.
          </Link>
          <Link to="/" className="text-sm text-slate-300 hover:text-white transition-colors font-medium">
            Zurück zur Startseite
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20 w-full">
        
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest mb-4">
            <ShieldCheck className="w-4 h-4 text-orange-500" />
            Transparenz & Methodik
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-[#0A0F1C] mb-6 tracking-tight">
            Wie wir vergleichen
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Wir möchten komplexe Märkte für dich einfach und verständlich machen. Hier erfährst du, wie unser Portal funktioniert und wie wir uns finanzieren.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Box 1 */}
          <div className="bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/30 border border-slate-100">
            <TrendingUp className="w-10 h-10 text-orange-500 mb-5" />
            <h3 className="font-bold text-xl mb-3 text-[#0A0F1C]">Wie wir uns finanzieren</h3>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              Die Nutzung von Rank-Scout ist für dich zu 100 % kostenlos. Um unseren Service bereitzustellen, nutzen wir sogenannte Affiliate-Links (Partnerlinks). Wenn du über einen unserer Links oder Vergleichsrechner ein Produkt abschließt, erhalten wir in der Regel eine Vergütung vom jeweiligen Anbieter oder Partnernetzwerk. Der Preis des Produkts verändert sich dadurch für dich nicht.
            </p>
          </div>

          {/* Box 2 */}
          <div className="bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/30 border border-slate-100">
            <Scale className="w-10 h-10 text-orange-500 mb-5" />
            <h3 className="font-bold text-xl mb-3 text-[#0A0F1C]">Auswahl der Anbieter</h3>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              Unser Ziel ist es, dir einen strukturierten Marktüberblick zu geben. Wir weisen ausdrücklich darauf hin, dass wir nicht den gesamten Markt abbilden. Wir zeigen eine qualifizierte Auswahl an etablierten Anbietern, Tarifen und Produkten, mit denen wir oder unsere Technologiepartner zusammenarbeiten.
            </p>
          </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg shadow-slate-200/30 border border-slate-100">
          <h2 className="text-2xl font-extrabold text-[#0A0F1C] mb-8 border-b border-slate-100 pb-4">Weitere wichtige Hinweise</h2>
          
          <div className="space-y-8">
            <div>
                <h3 className="text-lg font-bold text-[#0A0F1C] flex items-center gap-2 mb-3">
                    <Info className="w-5 h-5 text-orange-500" />
                    Wie kommen die Sortierungen zustande?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                    Die Reihenfolge der dargestellten Produkte in unseren Listen und Rechnern hängt von verschiedenen Faktoren ab. Dazu zählen unter anderem der Preis, Leistungsmerkmale, Nutzerbeliebtheit, Verfügbarkeit sowie die Provisionshöhe der jeweiligen Partnerschaften. Wir führen keine eigenen Labor-Härtetests durch, sondern aggregieren und analysieren tagesaktuelle Marktdaten und Tarifinformationen unserer Partner.
                </p>
            </div>

            <div>
                <h3 className="text-lg font-bold text-[#0A0F1C] flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-5 h-5 text-orange-500" />
                    Keine individuelle Beratung
                </h3>
                <p className="text-slate-600 leading-relaxed">
                    Rank-Scout ist ein reines Informations- und Vergleichsportal. Die auf unserer Website bereitgestellten Inhalte dienen ausschließlich der allgemeinen Information. Sie stellen keine rechtliche, steuerliche oder finanzielle Anlage- und Versicherungsberatung dar. Vor dem Abschluss eines Vertrages (insbesondere bei Versicherungen und Krediten) solltest du stets die genauen Vertragsbedingungen des jeweiligen Anbieters prüfen.
                </p>
            </div>

            <div>
                <h3 className="text-lg font-bold text-[#0A0F1C] flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Aktualität der Daten
                </h3>
                <p className="text-slate-600 leading-relaxed">
                    Wir geben unser Bestes, alle Informationen, Konditionen und Preise stets aktuell zu halten. Da sich Tarife und Angebote auf dem Markt jedoch jederzeit ändern können, übernehmen wir keine Gewähr für die absolute Richtigkeit, Vollständigkeit und Aktualität der dargestellten Daten. Maßgeblich sind immer die Angaben auf der Seite des jeweiligen Anbieters zum Zeitpunkt des Vertragsabschlusses.
                </p>
            </div>
          </div>
        </div>

      </main>

      {/* FOOTER SIMPLE */}
      <footer className="bg-[#0a0a0a] text-center py-8 mt-auto border-t border-white/10">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} Rank-Scout. Alle Rechte vorbehalten.
        </p>
      </footer>
    </div>
  );
}