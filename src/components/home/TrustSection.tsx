import { Zap, Radar, Fingerprint, Activity } from "lucide-react";
import { useHomeContent } from "@/hooks/useSettings";

export const TrustSection = () => {
  const { content } = useHomeContent();
  if (!content) return null;

  // Partner Logos für den Marquee-Effekt
  const logos = [
    { name: "TechDaily", opacity: "opacity-50" },
    { name: "FinanceInsider", opacity: "opacity-40" },
    { name: "SaaS-Weekly", opacity: "opacity-50" },
    { name: "DigitalFocus", opacity: "opacity-40" },
    { name: "GlobalTrust", opacity: "opacity-50" },
    { name: "MarketWatch", opacity: "opacity-40" },
    { name: "TheVerge", opacity: "opacity-50" },
  ];

  return (
    <section className="pt-24 pb-0 relative overflow-hidden bg-white border-b border-slate-100">
      
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />

      <div className="container px-4 mx-auto relative z-10 mb-24">
        <div className="max-w-4xl mx-auto">
          
          {/* Headline */}
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 tracking-tight text-primary">
              {content.trust.headline}
            </h2>
            <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
              {content.trust.subheadline}
            </p>
          </div>

          {/* Feature Grid - MODERNIZED (Glass & Gold) */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            
            {/* Card 1 */}
            <div className="group bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:border-primary/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Radar className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary">{content.trust.card1_title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{content.trust.card1_text}</p>
            </div>

            {/* Card 2 (Highlight) */}
            <div className="group bg-white p-8 rounded-3xl shadow-xl shadow-secondary/10 border border-secondary/20 hover:shadow-2xl hover:border-secondary/40 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />
              <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 text-secondary group-hover:bg-secondary group-hover:text-white transition-colors duration-300 relative z-10">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary relative z-10">{content.trust.card2_title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm relative z-10">{content.trust.card2_text}</p>
            </div>

            {/* Card 3 */}
            <div className="group bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:border-primary/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Fingerprint className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary">{content.trust.card3_title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{content.trust.card3_text}</p>
            </div>
          </div>

          {/* Dark Trust Box (Blaues Feld) */}
          <div className="bg-primary rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden ring-1 ring-white/10 group">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-secondary/30 transition-all duration-700" />
            
            <h4 className="text-2xl md:text-3xl font-display font-bold mb-4 text-white relative z-10 tracking-tight">
              {content.trust.box_title}
            </h4>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto leading-relaxed relative z-10 text-lg font-light">
              {content.trust.box_text}
            </p>
            
            {/* LIVE BADGE - Mit Fallback, falls DB leer ist */}
            <div className="relative z-10 inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-md hover:bg-white/20 transition-all cursor-default">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
              </span>
              <span className="text-sm font-bold text-white tracking-wide uppercase">
                {content.trust.live_badge || "LIVE SYSTEM"} 
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* --- THE INFINITE BANNER (Marquee) --- */}
      <div className="py-10 border-t border-slate-100 bg-slate-50/50 relative">
        {/* Fade Edges */}
        <div className="absolute inset-y-0 left-0 w-20 md:w-40 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-20 md:w-40 bg-gradient-to-l from-white to-transparent z-10" />

        <div className="flex w-full overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            {/* 4-fach rendern für perfekten Loop */}
            {[...logos, ...logos, ...logos, ...logos].map((logo, idx) => (
              <div key={idx} className="mx-8 md:mx-16 flex items-center justify-center">
                <span className={`text-2xl font-display font-bold text-primary ${logo.opacity} hover:opacity-100 transition-opacity cursor-default select-none`}>
                  {logo.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

    </section>
  );
};