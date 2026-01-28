import { Link } from "react-router-dom";
import { Heart, CheckCircle2 } from "lucide-react";
import { useSiteLogo, useFooterConfig } from "@/hooks/useSettings";

export const Footer = () => {
  const logo = useSiteLogo();
  const config = useFooterConfig();

  const legalLinks = config.legal_links || [];
  const popularLinks = config.popular_links || [];

  return (
    <footer className="bg-primary text-white pt-20 pb-10 relative overflow-hidden mt-20 border-t border-white/10">
      
      {/* Background Effects */}
      <div className="absolute inset-0 dots-white opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="block">
              {logo ? (
                // FIX: 'brightness-0 invert' entfernt -> Logo zeigt Originalfarben
                <img src={logo} alt="Logo" className="h-12 w-auto object-contain" />
              ) : (
                <span className="text-2xl font-display font-bold text-white">{config.title}</span>
              )}
            </Link>
            <p className="text-slate-300 leading-relaxed text-sm">
              {config.text_description}
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-secondary">Vergleiche</h4>
            <ul className="space-y-4">
              {popularLinks.map((link: any, i: number) => (
                <li key={i}>
                  <Link to={link.url} className="text-slate-300 hover:text-white hover:translate-x-1 transition-all inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-secondary">Rechtliches</h4>
            <ul className="space-y-4">
              {legalLinks.map((link: any, i: number) => (
                 <li key={i}>
                  <Link to={link.url} className="text-slate-300 hover:text-white hover:translate-x-1 transition-all inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quality Badge */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-secondary">Geprüfte Qualität</h4>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-500/20 rounded-full text-green-400 border border-green-500/30">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="font-bold text-white text-sm">{config.text_checked}</div>
                        <div className="text-xs text-slate-400">{config.text_update}</div>
                    </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed opacity-80">
                   {config.text_description}
                </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>{config.copyright_text}</p>
          <p className="flex items-center gap-1">
            {config.made_with_text} <Heart className="w-3 h-3 text-red-500 fill-red-500" /> {config.made_in_text}
          </p>
        </div>
        
        {/* DISCLAIMER */}
        <p className="mt-8 text-[10px] text-slate-500 text-center max-w-2xl mx-auto leading-relaxed">
            {config.disclaimer}
        </p>
      </div>
    </footer>
  );
};