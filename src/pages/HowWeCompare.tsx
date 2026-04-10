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
        <title>Wie Rank-Scout arbeitet – Transparenz & Vergleich</title>
        <meta
          name="description"
          content="So arbeitet Rank-Scout: Methodik, Finanzierung, Kennzeichnung von Partnerinhalten und redaktionelle Einordnung transparent erklärt."
        />
        <link rel="canonical" href="https://rank-scout.com/wie-wir-vergleichen" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <Header />

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
            Wir möchten komplexe Märkte verständlich einordnen. Hier erfährst du, wie Rank-Scout als redaktionelles Informationsportal arbeitet, wie wir uns finanzieren und wie unsere Vergleiche entstehen.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/30 border border-slate-100">
            <TrendingUp className="w-10 h-10 text-orange-500 mb-5" />
            <h3 className="font-bold text-xl mb-3 text-[#0A0F1C]">Wie wir uns finanzieren</h3>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              Die Nutzung von Rank-Scout ist für dich kostenlos. Zur Finanzierung unseres Angebots nutzen wir unter anderem Affiliate-Links, externe Vergleichsrechner, Formulare oder Partneranbindungen. Wenn du über entsprechend gekennzeichnete Links, Buttons oder Partnerstrecken einen Vertrag abschließt oder eine Anfrage stellst, können wir in der Regel eine Vergütung vom jeweiligen Anbieter oder Partnernetzwerk erhalten. Für dich entstehen dadurch üblicherweise keine zusätzlichen Kosten oder Preisnachteile.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/30 border border-slate-100">
            <Scale className="w-10 h-10 text-orange-500 mb-5" />
            <h3 className="font-bold text-xl mb-3 text-[#0A0F1C]">Auswahl der Anbieter</h3>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              Unser Ziel ist es, dir strukturierte Informationen und nachvollziehbare Vergleichsmöglichkeiten bereitzustellen. Wir bilden dabei nicht den gesamten Markt ab. Dargestellt werden je nach Bereich eine Auswahl von Anbietern, Tarifen, Rechnern oder Produkten, die direkt oder über unsere Technologiepartner eingebunden werden können.
            </p>
          </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg shadow-slate-200/30 border border-slate-100">
          <h2 className="text-2xl font-extrabold text-[#0A0F1C] mb-8 border-b border-slate-100 pb-4">
            Weitere wichtige Hinweise
          </h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-[#0A0F1C] flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-orange-500" />
                Wie kommen unsere Listen und Vergleiche zustande?
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Die Reihenfolge von Produkten, Tarifen oder Anbietern in Listen und Übersichten kann von mehreren Faktoren abhängen. Dazu zählen insbesondere Preis, Leistungsmerkmale, Verfügbarkeit, Nutzerinteresse sowie bestehende Partnerschaften und mögliche Vergütungen. Wir führen keine eigenen Labortests durch. Stattdessen verarbeiten wir Informationen, Tarifdaten und Inhalte unserer Partner, die sich laufend ändern können. Nicht jeder Marktteilnehmer ist automatisch Bestandteil unserer Übersichten.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#0A0F1C] flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-orange-500" />
                Keine individuelle Beratung
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Rank-Scout ist ein redaktionelles Informationsportal. Die auf unserer Website bereitgestellten Inhalte dienen ausschließlich der allgemeinen Information. Wir erbringen keine individuelle Fach-, Vertrags-, Rechts- oder Steuerberatung. Vor dem Abschluss eines Vertrages oder der Nutzung eines Angebots solltest du die konkreten Bedingungen des jeweiligen Anbieters oder Partners eigenständig prüfen.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#0A0F1C] flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Kennzeichnung von Partnerinhalten
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Affiliate-Links, externe Vergleichsrechner, Formulare oder Angebotsstrecken kennzeichnen wir transparent, soweit sie auf unseren Seiten eingesetzt werden. Dadurch soll für dich erkennbar sein, wann Inhalte oder Abschlüsse ganz oder teilweise über Partnerstrukturen erfolgen.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#0A0F1C] flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-orange-500" />
                Aktualität der Daten
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Wir bemühen uns, Informationen, Konditionen und Preise aktuell zu halten. Da sich Tarife, Verfügbarkeiten und Angebotsbedingungen jedoch jederzeit ändern können, übernehmen wir keine Gewähr für absolute Richtigkeit, Vollständigkeit oder Aktualität sämtlicher Angaben. Maßgeblich sind stets die Informationen und Vertragsbedingungen auf der Seite des jeweiligen Anbieters oder Partners zum Zeitpunkt des Abschlusses.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}