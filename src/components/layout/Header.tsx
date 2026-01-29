import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Gamepad2, BrainCircuit, Users, LayoutGrid } from "lucide-react";
import { useState, useEffect } from "react";
import { useHeaderConfig, useSiteLogo } from "@/hooks/useSettings";

const iconMap: Record<string, any> = {
  LayoutGrid, Gamepad2, BrainCircuit, Users
};

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Wir ignorieren hier bewusst das Bild-Logo für den Clean-Look
  // const logo = useSiteLogo(); 
  const config = useHeaderConfig();

  const navLinks = config.nav_links || [];
  const hubLinks = config.hub_links || [];

  // Scroll-Erkennung
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 py-3 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/90 backdrop-blur-xl border-b border-primary/10 shadow-sm" 
          : "bg-transparent border-b border-white/5"
      }`}
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between">
          
          {/* --- LOGO BEREICH (CLEAN TYPO UPDATE) --- */}
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsMobileMenuOpen(false)}>
            {/* Wir nutzen hier NUR Text für den High-End Look */}
            <span className={`text-2xl md:text-3xl font-display font-extrabold tracking-tight transition-colors ${
                isScrolled ? "text-primary" : "text-white"
            }`}>
              Rank<span className="text-secondary">Scout</span>
              {/* Optional: Ein kleiner Punkt für Tech-Vibe */}
              <span className="text-secondary">.</span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link: any) => (
              <Link
                key={link.label}
                to={link.url}
                className={`text-sm font-medium transition-colors relative group py-2 ${
                    isScrolled 
                        ? "text-primary hover:text-secondary font-bold" 
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

          {/* MOBILE TOGGLE BUTTON */}
          <button 
            className={`md:hidden p-2 rounded-lg transition-colors ${
                isScrolled 
                    ? "text-primary hover:bg-slate-100" 
                    : "text-white hover:bg-white/10"
            }`} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[65px] bg-primary/98 backdrop-blur-xl z-40 md:hidden overflow-y-auto pb-20 animate-in slide-in-from-top-5 border-t border-white/10">
          <nav className="container mx-auto px-4 py-6 flex flex-col gap-6">
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                {hubLinks.map((link: any) => {
                  const Icon = iconMap[link.icon] || LayoutGrid;
                  return (
                    <Link
                        key={link.label}
                        to={link.url}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl border border-white/10 hover:border-secondary/50 hover:bg-white/10 transition-all group"
                    >
                        <div className="mb-2 text-secondary group-hover:scale-110 transition-transform">
                           <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-white uppercase tracking-wide">{link.label}</span>
                    </Link>
                  );
                })}
            </div>

            {navLinks.map((link: any) => (
              <Link
                key={link.label}
                to={link.url}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-medium text-slate-300 hover:text-white py-3 border-b border-white/5 hover:border-white/20 transition-all"
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