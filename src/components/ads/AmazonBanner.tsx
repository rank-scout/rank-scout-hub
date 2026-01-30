import { useState, useEffect } from "react";
import { useAdsEnabled, useAmazonConfig } from "@/hooks/useSettings";
import { ArrowRight, ShoppingCart } from "lucide-react";

export const AmazonBanner = ({ format = "horizontal" }: { format?: "horizontal" | "rectangle" | "vertical" }) => {
  const adsEnabled = useAdsEnabled();
  const { headline, text, buttonText, link } = useAmazonConfig();

  // Consent State
  const [marketingConsent, setMarketingConsent] = useState(false);

  useEffect(() => {
    const checkConsent = () => {
        const stored = localStorage.getItem("cookie-consent");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Amazon ist "marketing"
                setMarketingConsent(!!parsed.marketing);
            } catch(e) {}
        } else {
            setMarketingConsent(false);
        }
    };
    checkConsent();
    window.addEventListener("cookie-consent-update", checkConsent);
    return () => window.removeEventListener("cookie-consent-update", checkConsent);
  }, []);

  if (!adsEnabled) {
    return null;
  }
  
  // RECHTSKONFORMITÄT: Wenn User "Nein" zu Marketing sagt, blenden wir den Banner aus.
  if (!marketingConsent) return null;

  // Wenn keine Daten da sind (und man nicht im Admin-Mode ist), nichts anzeigen
  const hasContent = headline && link;

  return (
    <div className={`flex justify-center items-center my-8 animate-fade-in ${format === "horizontal" ? "w-full" : "w-auto"}`}>
      
      {/* NATIVE CONVERSION UNIT */}
      {hasContent ? (
        <a 
          href={link} 
          target="_blank" 
          rel="nofollow noopener noreferrer"
          className="group relative w-full max-w-5xl overflow-hidden rounded-2xl bg-[#0A0F1C] p-1 shadow-lg transition-all hover:shadow-2xl hover:scale-[1.005]"
        >
          {/* Glowing Border Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-shimmer" />
          
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 rounded-xl bg-[#0A0F1C] px-8 py-6 border border-white/10 group-hover:border-secondary/30 transition-colors">
            
            {/* Left: Content */}
            <div className="flex items-center gap-5 text-center md:text-left">
               <div className="hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                 <ShoppingCart className="h-6 w-6" />
               </div>
               
               <div className="space-y-1">
                 <div className="flex items-center justify-center md:justify-start gap-2">
                   <h3 className="font-display text-lg font-bold text-white group-hover:text-secondary transition-colors">
                     {headline}
                   </h3>
                   <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-400 border border-green-500/20">
                     Empfehlung
                   </span>
                 </div>
                 <p className="text-sm text-slate-400 max-w-xl">
                   {text}
                 </p>
               </div>
            </div>

            {/* Right: CTA */}
            <div className="flex-shrink-0">
              <span className="inline-flex h-10 items-center justify-center rounded-lg bg-secondary px-6 text-sm font-bold text-white shadow-lg shadow-secondary/20 transition-all group-hover:bg-orange-600 group-hover:shadow-orange-600/30">
                {buttonText || "Zum Angebot"}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>

          </div>
        </a>
      ) : (
        // Placeholder für Admin
        <div className="w-full max-w-5xl rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
           <div className="flex flex-col items-center gap-2 text-slate-400">
              <ShoppingCart className="h-8 w-8 opacity-50" />
              <p className="font-medium text-sm">Native Amazon Banner (Leer)</p>
              <p className="text-xs">Bitte Headline und Link im Admin-Bereich (Global &rarr; Monetarisierung) hinterlegen.</p>
           </div>
        </div>
      )}

    </div>
  );
};