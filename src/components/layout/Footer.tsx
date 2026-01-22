import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Heart, CheckCircle2 } from "lucide-react";
import { useSiteLogo, useSiteTitle } from "@/hooks/useSettings";

const defaultLegalLinks = [
  { label: "Impressum", url: "/impressum" },
  { label: "Datenschutz", url: "/datenschutz" },
  { label: "AGB", url: "/agb" }
];

const defaultPopularLinks = [
  { label: "Software Vergleich", url: "/software" },
  { label: "Finanz-Tools", url: "/finanzen" },
  { label: "Agentur Finder", url: "/dienstleistungen" }
];

export const Footer = () => {
  const logo = useSiteLogo();
  const title = useSiteTitle();

  return (
    <footer className="bg-primary text-white pt-20 pb-10 relative overflow-hidden mt-20 border-t border-white/10">
      
      <div className="absolute inset-0 dots-white opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="group-hover:scale-105 transition-transform duration-300">
                 {logo ? (
                   // Footer ist immer dunkel -> Logo immer weiß machen
                   <img 
                    src={logo}
                    alt={title || "Rank-Scout"} 
                    className="h-9 w-auto object-contain brightness-0 invert" 
                   />
                 ) : (
                   <span className="font-display font-bold text-xl tracking-tight text-white">
                     {title}
                   </span>
                 )}
              </div>
            </Link>
            <p className="text-slate-300 text-sm leading-relaxed max-w-xs">
              Deutschlands führendes B2B-Vergleichsportal. Wir bringen Licht in den Dschungel digitaler Dienstleistungen.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-secondary hover:text-white transition-all text-slate-300 border border-white/5 hover:border-secondary"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-secondary hover:text-white transition-all text-slate-300 border border-white/5 hover:border-secondary"><Linkedin className="w-4 h-4" /></a>
              <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-secondary hover:text-white transition-all text-slate-300 border border-white/5 hover:border-secondary"><Instagram className="w-4 h-4" /></a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white mb-6">Vergleiche</h3>
            <ul className="space-y-4 text-sm text-slate-300">
              {defaultPopularLinks.map((link, i) => (
                <li key={i}>
                  <Link to={link.url} className="hover:text-secondary transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-secondary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"/> 
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-6">Rechtliches</h3>
            <ul className="space-y-4 text-sm text-slate-300">
              {defaultLegalLinks.map((link, i) => (
                <li key={i}>
                  <Link to={link.url} className="hover:text-secondary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-6">Geprüfte Qualität</h3>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 border border-green-500/30">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="font-bold text-white text-sm">Redaktionell geprüft</div>
                        <div className="text-xs text-slate-400">Aktualisiert: 2026</div>
                    </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed opacity-80">
                    Unsere Vergleiche basieren auf echten Daten, Nutzer-Feedback und Experten-Analysen.
                </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>© 2026 {title}. Alle Rechte vorbehalten.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> in Germany
          </p>
        </div>
        
        <p className="mt-8 text-[10px] text-slate-500 text-center max-w-2xl mx-auto leading-relaxed">
            *Werbehinweis: Wir finanzieren uns über sogenannte Affiliate-Links. Wenn Sie über einen Link auf dieser Seite einkaufen, erhalten wir möglicherweise eine Provision. Der Preis für Sie ändert sich dabei nicht. Unsere redaktionelle Unabhängigkeit bleibt davon unberührt.
        </p>
      </div>
    </footer>
  );
};