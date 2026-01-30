import { useHomeContent } from "@/hooks/useSettings";

export const TrustSection = () => {
  const { content } = useHomeContent();
  
  if (!content) return null;

  const headline = content.trust?.headline || "Das Portal, dem die Profis vertrauen.";
  const description = content.trust?.subheadline || "Unsere Analysen und Vergleiche werden von Experten weltweit geschätzt und zitiert.";

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
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      
      <div className="container mx-auto px-4 mb-16">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
            </span>
            Trusted by Industry Leaders
          </div>
          
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary tracking-tight">
            {headline}
          </h2>
          
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            {description}
          </p>
        </div>
      </div>

      <div className="py-10 border-t border-slate-100 bg-slate-50/50 relative">
        <div className="absolute inset-y-0 left-0 w-20 md:w-40 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-20 md:w-40 bg-gradient-to-l from-white to-transparent z-10" />

        <div className="flex w-full overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
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
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};