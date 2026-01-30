import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Gamepad2, BrainCircuit, Users, LayoutGrid } from "lucide-react";
import { useState, useEffect } from "react";
import { useHeaderConfig } from "@/hooks/useSettings";

const iconMap: Record<string, any> = {
  LayoutGrid, Gamepad2, BrainCircuit, Users
};

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const config = useHeaderConfig();

  const navLinks = config.nav_links || [];
  const hubLinks = config.hub_links || [];

  // Scroll-Erkennung
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    // Initiale Prüfung
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // LOGIK ÄNDERUNG:
  // Wir machen den Header jetzt IMMER transparent oben, egal auf welcher Seite.
  // Damit das gut aussieht, müssen alle Seiten oben einen dunklen Bereich haben (wie ForumThread jetzt).
  const isSolid = isScrolled; 

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 py-3 transition-all duration-300 ${
        isSolid 
          ? "bg-white/90 backdrop-blur-xl border-b border-primary/10 shadow-sm" 
          : "bg-transparent border-b border-white/5"
      }`}
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between">
          
          {/* --- LOGO --- */}
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsMobileMenuOpen(false)}>
            <span className={`text-2xl md:text-3xl font-display font-extrabold tracking-tight transition-colors ${
                isSolid ? "text-primary" : "text-white"
            }`}>
              Rank<span className="text-secondary">Scout</span>
              <span className="text-secondary">.</span>
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link: any) => (
              <Link
                key={link.label}
                to={link.url}
                className={`text-sm font-medium transition-colors relative group py-2 ${
                    isSolid 
                        ? "text-slate-600 hover:text-primary font-medium" 
                        : "text-slate-200 hover:text-white"
                }`}
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
            
            <Link to={config.button_url}>
              <Button className="bg-secondary hover:bg-secondary/90 text-white font-bold shadow-lg shadow-secondary/20 transition-all hover:-translate-y-0.5 hover:shadow-secondary/40">
                {config.button_text}
              </Button>
            </Link>
          </nav>

          {/* MOBILE TOGGLE */}
          <button 
            className={`md:hidden p-2 rounded-lg transition-colors ${
                isSolid 
                    ? "text-primary hover:bg-slate-100" 
                    : "text-white hover:bg-white/10"
            }`} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[65px] bg-white/98 backdrop-blur-xl z-40 md:hidden overflow-y-auto pb-20 animate-in slide-in-from-top-5 border-t border-slate-100">
          <nav className="container mx-auto px-4 py-6 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
                {hubLinks.map((link: any) => {
                  const Icon = iconMap[link.icon] || LayoutGrid;
                  return (
                    <Link
                        key={link.label}
                        to={link.url}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-secondary/50 hover:bg-white transition-all group shadow-sm"
                    >
                        <div className="mb-2 text-secondary group-hover:scale-110 transition-transform">
                           <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">{link.label}</span>
                    </Link>
                  );
                })}
            </div>
            {navLinks.map((link: any) => (
              <Link
                key={link.label}
                to={link.url}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-medium text-slate-600 hover:text-primary py-3 border-b border-slate-100 transition-all"
              >
                {link.label}
              </Link>
            ))}
            <Link to={config.button_url} onClick={() => setIsMobileMenuOpen(false)} className="mt-4">
              <Button className="w-full bg-secondary text-white font-bold h-12 text-lg rounded-xl shadow-xl shadow-secondary/20">
                {config.button_text}
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};