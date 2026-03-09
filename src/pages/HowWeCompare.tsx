import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck, TrendingUp, Scale, Info, Clock } from 'lucide-react';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function HowWeCompare() {
  return (
    <div className="font-sans antialiased text-slate-800 bg-[#fafafa] min-h-screen flex flex-col">
      <Helmet>
        <html lang="de" />
        <title>Wie wir arbeiten – Transparenz bei Rank-Scout</title>
        <meta name="description" content="Erfahre transparent, wie Rank-Scout Informationen aufbereitet, wie wir uns finanzieren und nach welchen Kriterien unsere redaktionellen Ratgeber entstehen." />
        <link rel="canonical" href="https://rank-scout.com/wie-wir-vergleichen" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <Header />

      {/* MAIN CONTENT - pt-28 verhindert, dass der fixierte Header den Text überdeckt */}
      <main className="flex-grow max-w-4xl mx-auto px-4 md:px-8 pt-28 pb-12 md:pb-20 w-full">
        
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest mb-4">
            <ShieldCheck className="w-4 h-4 text-orange-500" />
            Transparenz & Methodik
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-[#0A0F1C] mb-6 tracking-tight">
            Wie wir arbeiten
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Wir möchten komplexe Märkte für dich einfach und verständlich machen. Hier erfährst du, wie unser reines Informationsportal funktioniert und wie wir uns finanzieren.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Box 1 */}
          <div className="bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/30 border border-slate-100">
            <TrendingUp className="w-10 h-10 text-orange-500 mb-5" />
            <h3 className="font-bold text-xl mb-3 text-[#0A0F1C]">Wie wir uns finanzieren</h3>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              Die Nutzung von Rank-Scout ist für dich zu 100 % kostenlos. Um unseren Service bereitzustellen, nutzen wir sogenannte Affiliate-Links (Partnerlinks). Wenn du über einen unserer Links oder Informationsrechner ein Produkt abschließt, erhalten wir in der Regel eine Vergütung vom jeweiligen Anbieter oder Partnernetzwerk. Der Preis des Produkts verändert sich dadurch für dich nicht.
            </p>
          </div>

          {/* Box 2 */}
          <div className="bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/30 border border-slate-100">
            <Scale className="w-10 h-10 text-orange-500 mb-5" />
            <h3 className="font-bold text-xl mb-3 text-[#0A0F1C]">Auswahl der Anbieter</h3>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              Unser Ziel ist es, dir strukturierte Informationen zur Verfügung zu stellen. Wir weisen ausdrücklich darauf hin, dass wir nicht den gesamten Markt abbilden. Wir zeigen eine qualifizierte Auswahl an etablierten Anbietern, Tarifen und Produkten, mit denen wir oder unsere Technologiepartner zusammenarbeiten.
            </p>
          </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg shadow-slate-200/30 border border-slate-100">
          <h2 className="text-2xl font-extrabold text-[#0A0F1C] mb-8 border-b border-slate-100 pb-4">Weitere wichtige Hinweise</h2>
          
          <div className="space-y-8">
            <div>
                <h3 className="text-lg font-bold text-[#0A0F1C] flex items-center gap-2 mb-3">
                    <Info className="w-5 h-5 text-orange-500" />
                    Wie kommen unsere Listen zustande?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                    Die Reihenfolge der dargestellten Produkte in unseren Listen und Übersichten hängt von verschiedenen Faktoren ab. Dazu zählen unter anderem der Preis, Leistungsmerkmale, Nutzerbeliebtheit, Verfügbarkeit sowie die Provisionshöhe der jeweiligen Partnerschaften. Wir führen keine eigenen Labor-Härtetests durch, sondern aggregieren und analysieren tagesaktuelle Marktdaten und Tarifinformationen unserer Partner.
                </p>
            </div>

            <div>
                <h3 className="text-lg font-bold text-[#0A0F1C] flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-5 h-5 text-orange-500" />
                    Keine individuelle Beratung
                </h3>
                <p className="text-slate-600 leading-relaxed">
                    Rank-Scout ist ausschließlich ein <strong>reines Informationsportal</strong>. Die auf unserer Website bereitgestellten Inhalte dienen nur der allgemeinen Information. Sie stellen keine rechtliche, steuerliche oder finanzielle Anlage- und Versicherungsberatung dar. Vor dem Abschluss eines Vertrages (insbesondere bei Versicherungen und Krediten) solltest du stets die genauen Vertragsbedingungen des jeweiligen Anbieters prüfen.
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

      <Footer />
    </div>
  );
}