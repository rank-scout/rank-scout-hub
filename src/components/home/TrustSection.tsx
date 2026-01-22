import { Zap, Radar, Fingerprint, CheckCircle2 } from "lucide-react";
import { useHomeContent } from "@/hooks/useSettings";

export const TrustSection = () => {
  const { content } = useHomeContent();
  if (!content) return null;

  return (
    <section className="py-24 relative overflow-hidden bg-background">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white via-white to-transparent pointer-events-none" />
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="mb-20 text-center">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 tracking-tight text-primary">
              {content.trust.headline}
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {content.trust.subheadline}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                <Radar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary">{content.trust.card1_title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {content.trust.card1_text}
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-6 text-secondary relative z-10">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary relative z-10">{content.trust.card2_title}</h3>
              <p className="text-muted-foreground leading-relaxed relative z-10">
                {content.trust.card2_text}
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-6 text-green-600">
                <Fingerprint className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary">{content.trust.card3_title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {content.trust.card3_text}
              </p>
            </div>
          </div>

          {/* Feature Box / Unfair Advantage */}
          <div className="bg-[#030E3E] rounded-2xl p-10 text-center shadow-2xl relative overflow-hidden ring-1 ring-white/10 group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-secondary/20 transition-all duration-700" />
            
            <h4 className="text-2xl font-display font-bold mb-4 text-white relative z-10">
              {content.trust.box_title}
            </h4>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed relative z-10 text-lg">
              {content.trust.box_text}
            </p>
            <div className="relative z-10 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md group-hover:border-secondary/50 transition-all cursor-pointer hover:bg-white/10">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_15px_theme(colors.secondary.DEFAULT)]" />
              <span className="text-sm font-medium text-white">Live-System aktiv</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};