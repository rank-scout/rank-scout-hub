import { Link } from "react-router-dom";
import { Heart, ShieldCheck } from "lucide-react";
import { useSiteLogo, useFooterConfig } from "@/hooks/useSettings";

export const Footer = () => {
  const logo = useSiteLogo();
  const config = useFooterConfig();

  const legalLinks = config.legal_links || [];
  const popularLinks = config.popular_links || [];

  return (
    <footer className="relative bg-primary pt-20 pb-12 overflow-hidden border-t border-white/10 mt-0">
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
      
      <div 
        className="absolute inset-0 z-0 opacity-[0.15]" 
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          maskImage: 'linear-gradient(to top, black 40%, transparent 100%)', 
          WebkitMaskImage: 'linear-gradient(to top, black 40%, transparent 100%)'
        }}
      />

      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-16">
          
          {/* 1. BRANDING (CONSISTENT) */}
          <div className="space-y-6 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="block w-fit group">
               {/* Hier das exakt gleiche Logo-Styling wie im Header */}
               <span className="text-3xl font-display font-extrabold tracking-tight text-white">
                  Rank-
                  <span className="text-secondary">Scout</span>
                  <span className="text-secondary">.</span>
               </span>
            </Link>
            <p className="text-slate-300 text-sm leading-relaxed max-w-xs">
              {config.text_description || "Der ultimative Vergleichs-Hub für Software, Finanzen und Lifestyle. Unabhängig und datenbasiert."}
            </p>
          </div>

          {/* 2. Links: Vergleiche */}
          <div>
            <h4 className="font-bold text-base text-secondary mb-6 uppercase tracking-wider">Vergleiche</h4>
            <ul className="space-y-3">
              {popularLinks.map((link: any, i: number) => (
                <li key={i}>
                  <Link 
                    to={link.url} 
                    className="text-slate-300 hover:text-white text-sm transition-all duration-200 flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 transition-all duration-200 overflow-hidden h-[1px] bg-secondary mr-0 group-hover:mr-2"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Links: Rechtliches */}
          <div>
            <h4 className="font-bold text-base text-secondary mb-6 uppercase tracking-wider">Rechtliches</h4>
            <ul className="space-y-3">
              {legalLinks.map((link: any, i: number) => (
                 <li key={i}>
                  <Link 
                    to={link.url} 
                    className="text-slate-300 hover:text-white text-sm transition-all duration-200 flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 transition-all duration-200 overflow-hidden h-[1px] bg-secondary mr-0 group-hover:mr-2"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Quality Badge */}
          <div className="flex flex-col justify-start">
            <h4 className="font-bold text-base text-secondary mb-6 uppercase tracking-wider">Sicherheit</h4>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default group">
                <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-green-500/10 rounded-full text-green-400 border border-green-500/20 group-hover:scale-110 transition-transform duration-300 shrink-0">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="font-bold text-white text-sm mb-1">{config.text_checked || "Redaktionell geprüft"}</div>
                        <div className="text-xs text-slate-400 leading-snug">
                            {config.text_update || "Täglich aktualisierte Daten und unabhängige Bewertungen."}
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-300">
          <p>{config.copyright_text || `© ${new Date().getFullYear()} Rank-Scout. Alle Rechte vorbehalten.`}</p>
          
          <div className="flex items-center gap-6">
             <p className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                {config.made_with_text} <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" /> {config.made_in_text}
             </p>
          </div>
        </div>
        
        {/* Disclaimer */}
        {config.disclaimer && (
            <div className="mt-8 pt-6 border-t border-white/5">
                <p className="text-xs text-slate-400 text-center max-w-4xl mx-auto leading-relaxed">
                    {config.disclaimer}
                </p>
            </div>
        )}
      </div>
    </footer>
  );
};