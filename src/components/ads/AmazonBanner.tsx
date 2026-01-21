export const AmazonBanner = ({ format = "horizontal" }: { format?: "horizontal" | "rectangle" | "vertical" }) => {
  // WICHTIG: Ersetze diesen Kommentar später mit deinem echten Amazon-HTML-Code aus dem PartnerNet.
  // Beispiel für horizontal: Ein 728x90 Banner
  // Beispiel für rectangle: Ein 300x250 Banner
  
  return (
    <div className={`flex justify-center items-center my-8 ${format === "horizontal" ? "w-full" : "w-auto"}`}>
      <div className="bg-white border border-slate-100 p-1 rounded-sm shadow-sm hover:shadow-md transition-shadow">
        {/* HIER DEINEN AMAZON CODE EINFÜGEN */}
        <div className="text-xs text-slate-300 text-center py-2 px-4 bg-slate-50 border border-dashed border-slate-200">
          <span className="block font-bold text-slate-400">Amazon Anzeige</span>
          <span className="text-[10px]">Hier PartnerNet Code einfügen</span>
        </div>
        
        {/* BEISPIEL (Auskommentiert lassen, bis du deinen hast):
        <iframe 
          src="//rcm-eu.amazon-adsystem.com/e/cm?o=3&p=48&l=ur1&category=business&banner=12345678&f=ifr" 
          width="728" 
          height="90" 
          scrolling="no" 
          border="0" 
          style={{ border: "none" }}
        ></iframe> 
        */}
      </div>
    </div>
  );
};