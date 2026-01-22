import { useEffect } from "react";
import { Info } from "lucide-react";
import { useAdsEnabled, useAdSenseConfig } from "@/hooks/useSettings";

export const AdSenseBanner = ({ slotId }: { slotId?: string }) => {
  const adsEnabled = useAdsEnabled();
  const { clientId, defaultSlotId } = useAdSenseConfig();
  
  // Verwende die übergebene SlotId oder den Default aus den Settings
  const finalSlotId = slotId || defaultSlotId;

  useEffect(() => {
    if (adsEnabled && clientId && finalSlotId) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error("AdSense Error:", err);
      }
    }
  }, [adsEnabled, clientId, finalSlotId]);

  if (!adsEnabled) return null;

  // Prüfen ob Konfiguration vorhanden ist
  const isConfigured = clientId && finalSlotId;

  return (
    <div className="w-full my-12 flex flex-col items-center justify-center animate-fade-in">
      <div className="text-[10px] text-slate-300 uppercase tracking-widest mb-1 flex items-center gap-1">
        <Info className="w-3 h-3" />
        Anzeige
      </div>
      
      {/* Container für den Ad-Code */}
      <div className="w-full max-w-5xl bg-slate-50 border border-slate-100 rounded-lg overflow-hidden min-h-[120px] flex items-center justify-center relative">
        
        {!isConfigured ? (
          // PLACEHOLDER (Wenn keine Daten im Admin eingetragen sind)
          <div className="absolute inset-0 flex items-center justify-center opacity-30 bg-[url('/grid-pattern.svg')]">
             <span className="text-slate-300 font-bold">Google AdSpace (Konfiguration fehlt)</span>
          </div>
        ) : (
          // ECHTER AD CODE
          <ins className="adsbygoogle"
               style={{ display: "block", width: "100%", height: "100%" }}
               data-ad-client={clientId}
               data-ad-slot={finalSlotId}
               data-ad-format="auto"
               data-full-width-responsive="true" 
          />
        )}
      </div>
    </div>
  );
};