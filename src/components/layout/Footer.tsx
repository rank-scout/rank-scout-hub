import { Link } from "react-router-dom";
import { useFooterLinks, useFooterSiteName, useFooterCopyright, useFooterDesignerName, useFooterDesignerUrl } from "@/hooks/useSettings";

export const Footer = () => {
  const footerLinks = useFooterLinks();
  const siteName = useFooterSiteName();
  const copyright = useFooterCopyright();
  const designerName = useFooterDesignerName();
  const designerUrl = useFooterDesignerUrl();

  return (
    <footer className="bg-[#020817] text-white border-t border-white/5 relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="inline-block mb-6 group">
              <span className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-secondary/20">
                  R
                </span>
                <span>
                  {siteName}
                  <span className="text-secondary text-3xl leading-none">.</span>
                </span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Das führende B2B-Vergleichsportal für Entscheider. Validierte Daten, echte Transparenz.
            </p>
            <div className="flex gap-3">
               {/* Socials */}
               <div className="w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center hover:bg-secondary hover:border-secondary transition-all cursor-pointer text-white/60 hover:text-white">
                 <span className="text-xs font-bold">in</span>
               </div>
               <div className="w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center hover:bg-secondary hover:border-secondary transition-all cursor-pointer text-white/60 hover:text-white">
                 <span className="text-xs font-bold">x</span>
               </div>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="font-bold text-white mb-6">Plattform</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link to="/kategorien" className="hover:text-secondary transition-colors">Alle Vergleiche</Link></li>
              <li><Link to="/kategorien/software" className="hover:text-secondary transition-colors">Software & SaaS</Link></li>
              <li><Link to="/kategorien/agenturen" className="hover:text-secondary transition-colors">Agenturen</Link></li>
              <li><Link to="/kategorien/ki-tools" className="hover:text-secondary transition-colors">KI-Radar</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="font-bold text-white mb-6">Unternehmen</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link to="/about" className="hover:text-secondary transition-colors">Über Rank-Scout</Link></li>
              <li><Link to="/partner" className="hover:text-secondary transition-colors">Partner werden</Link></li>
              <li><Link to="/karriere" className="hover:text-secondary transition-colors">Karriere</Link></li>
              <li><Link to="/kontakt" className="hover:text-secondary transition-colors">Kontakt</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="font-bold text-white mb-6">Rechtliches</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.url} className="hover:text-secondary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li><Link to="/impressum" className="hover:text-secondary transition-colors">Impressum</Link></li>
              <li><Link to="/datenschutz" className="hover:text-secondary transition-colors">Datenschutz</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div>
            {copyright}
          </div>
          <div className="flex items-center gap-2">
            <span>Powered by</span>
            <a 
              href={designerUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-400 hover:text-secondary transition-colors"
            >
              {designerName}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};