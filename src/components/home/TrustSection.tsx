import { Zap, Radar, Fingerprint, CheckCircle2 } from "lucide-react";

export const TrustSection = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-background">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white via-white to-transparent pointer-events-none" />
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="mb-20 text-center">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 tracking-tight text-primary">
              Markt-Transparenz <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-orange-600">
                statt Dschungel.
              </span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Wir filtern das Signal aus dem Rauschen. Rank-Scout ist Ihre Intelligence-Plattform für validierte Dienstleister und Software.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {/* Card 1 */}
            <div className="group bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-2xl p-8 hover:border-secondary/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-primary/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Fingerprint className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-display text-primary group-hover:text-secondary transition-colors">Geprüfte Qualität</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Keine Massenabfertigung. Wir kuratieren Anbieter nach strengen Qualitätsstandards.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                  <span>Redaktioneller Check</span>
                </li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="group bg-white border border-secondary/20 shadow-xl shadow-secondary/5 rounded-2xl p-8 hover:shadow-secondary/10 transition-all duration-300 relative overflow-hidden hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-secondary/10 to-transparent rounded-bl-full" />
              <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:text-white transition-colors duration-300">
                <Radar className="w-7 h-7 text-secondary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-display text-primary group-hover:text-secondary transition-colors">Markt-Radar</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Wir scannen Innovationen in Echtzeit. Verpassen Sie keine relevanten Tech-Trends.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                  <span>Deep-Dive Analysen</span>
                </li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="group bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-2xl p-8 hover:border-secondary/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-primary/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Zap className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-display text-primary group-hover:text-secondary transition-colors">Performance</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Klare KPIs statt Buzzwords. Wir machen Leistung transparent und vergleichbar.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                  <span>Benchmark Daten</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Versprechen Box - Updated Text */}
          <div className="bg-[#030E3E] rounded-2xl p-10 text-center shadow-2xl relative overflow-hidden ring-1 ring-white/10 group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-secondary/20 transition-all duration-700" />
            
            <h4 className="text-2xl font-display font-bold mb-4 text-white relative z-10">
              Ihr unfairer Wettbewerbsvorteil
            </h4>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed relative z-10 text-lg">
              Während andere noch suchen, haben Sie bereits entschieden. Rank-Scout liefert Ihnen die Marktdaten, die Sie für technologische Führung brauchen – geprüft, validiert, sofort anwendbar.
            </p>
            <div className="relative z-10 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md group-hover:border-secondary/50 transition-all cursor-pointer hover:bg-white/10">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_15px_theme(colors.secondary.DEFAULT)]" />
              <span className="text-sm font-bold text-white uppercase tracking-widest group-hover:text-secondary transition-colors">
                Wettbewerbsvorteil: Gesichert
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};