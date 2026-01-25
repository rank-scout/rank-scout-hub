import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Mail, MapPin, ShieldCheck } from "lucide-react";

const Impressum = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-900">
      <Header />
      <main className="flex-grow container mx-auto px-4 pt-40 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4 tracking-tight">Impressum</h1>
          <p className="text-lg text-slate-500 mb-12 border-b border-slate-100 pb-4">Offenlegung gemäß § 25 Mediengesetz & E-Commerce-Gesetz.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="p-8 rounded-2xl border border-slate-100 bg-slate-50 shadow-sm">
              <h2 className="text-xl font-bold text-secondary mb-6 flex items-center gap-3">
                <MapPin className="w-5 h-5" /> Betreiberdaten
              </h2>
              <div className="space-y-4 text-slate-700 leading-relaxed">
                <p><strong className="text-primary block mb-1">Medieninhaber & Herausgeber:</strong> Media-Bro</p>
                <p>Leonfeldnerstraße<br />4040 Linz, Österreich</p>
                <p className="flex items-center gap-2 mt-6 text-secondary font-bold">
                  <Mail className="w-4 h-4" /> hello@rank-scout.com
                </p>
              </div>
            </div>

            <div className="p-8 rounded-2xl border border-slate-100 bg-slate-50 shadow-sm">
              <h2 className="text-xl font-bold text-secondary mb-6 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5" /> Rechtliches
              </h2>
              <div className="space-y-4 text-slate-700 leading-relaxed">
                <p><strong className="text-primary block mb-1">Unternehmensgegenstand:</strong> Betrieb eines unabhängigen Vergleichsportals für digitale Dienstleistungen.</p>
                <p><strong className="text-primary block mb-1">Kammerzugehörigkeit:</strong> Wirtschaftskammer Oberösterreich (WKO).</p>
                <p><strong className="text-primary block mb-1">Redaktion:</strong> Digital-Perfect</p>
              </div>
            </div>
          </div>

          <div className="prose prose-lg max-w-none text-slate-700 space-y-12">
            <section>
              <h3 className="text-primary font-display font-bold text-2xl mb-4 underline decoration-secondary decoration-4 underline-offset-8">Haftungsausschluss & Hinweise</h3>
              <p><strong>Transparenzhinweis (Affiliate):</strong> Rank-Scout finanziert sich teilweise über Affiliate-Links. Bei qualifizierten Käufen über unsere Partnerlinks erhalten wir eine Vergütung. Dies hat keinen Einfluss auf unsere Bewertungen oder den Preis für Sie.</p>
              <p><strong>Haftung für Inhalte & Links:</strong> Trotz sorgfältiger Prüfung übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.</p>
            </section>

            <section className="bg-primary text-white p-8 rounded-2xl shadow-xl">
              <h3 className="font-display font-bold text-xl mb-4">Streitbeilegung</h3>
              <p className="text-slate-300">Verbraucher haben die Möglichkeit, Beschwerden an die Online-Streitbeilegungsplattform der EU zu richten: <a href="http://ec.europa.eu/odr" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline font-bold">http://ec.europa.eu/odr</a>.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Impressum;