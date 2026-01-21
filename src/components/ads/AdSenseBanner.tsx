import { Info } from "lucide-react";

export const AdSenseBanner = ({ slotId }: { slotId?: string }) => {
  return (
    <div className="w-full my-12 flex flex-col items-center justify-center animate-fade-in">
      <div className="text-[10px] text-slate-300 uppercase tracking-widest mb-1 flex items-center gap-1">
        <Info className="w-3 h-3" />
        Anzeige
      </div>
      
      {/* Container für den Ad-Code */}
      <div className="w-full max-w-5xl bg-slate-50 border border-slate-100 rounded-lg overflow-hidden min-h-[120px] flex items-center justify-center relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-30 bg-[url('/grid-pattern.svg')]">
           <span className="text-slate-300 font-bold">Google AdSpace</span>
        </div>
        
        {/* Echter Code */}
        {/* <ins className="adsbygoogle"
             style={{ display: "block" }}
             data-ad-client="ca-pub-DEINE_ID"
             data-ad-slot={slotId}
             data-ad-format="auto"
             data-full-width-responsive="true"></ins> */}
      </div>
    </div>
  );
};