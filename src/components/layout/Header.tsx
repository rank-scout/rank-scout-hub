import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Gamepad2, BrainCircuit, Users, LayoutGrid } from "lucide-react";
import { useState, useEffect } from "react";
import { useHeaderConfig } from "@/hooks/useSettings";

const iconMap: Record<string, any> = {
  LayoutGrid, Gamepad2, BrainCircuit, Users
};

interface HeaderProps {
  transparent?: boolean;
}

export const Header = ({ transparent = false }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const config = useHeaderConfig();

  const navLinks = config.nav_links || [];
  const hubLinks = config.hub_links || [];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const getHeaderStyle = () => {
    if (isMobileMenuOpen) {
      return {
        wrapper: "bg-primary border-b border-white/10 shadow-md",
        rankText: "text-white",        
        scoutText: "text-secondary",   
        toggleBtn: "text-white hover:bg-white/10",
        navLink: "text-slate-200"
      };
    }

    if (isScrolled) {
      return {
        wrapper: "bg-white/95 backdrop-blur-xl border-b border-primary/10 shadow-sm",
        rankText: "text-primary",      
        scoutText: "text-secondary",   
        toggleBtn: "text-primary hover:bg-slate-100",
        navLink: "text-slate-600 hover:text-primary"
      };
    }

    const isTransparentPage = location.pathname === "/" || transparent;

    if (isTransparentPage) {
      return {
        wrapper: "bg-transparent border-b border-white/5",
        rankText: "text-white",        
        scoutText: "text-secondary",   
        toggleBtn: "text-white hover:bg-white/10",
        navLink: "text-slate-200 hover:text-white"
      };
    }

    return {
      wrapper: "bg-white border-b border-slate-100",
      rankText: "text-primary",      
      scoutText: "text-secondary",   
      toggleBtn: "text-slate-900 hover:bg-slate-100",
      navLink: "text-slate-600 hover:text-primary"
    };
  };

  const style = getHeaderStyle();

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 py-3 transition-all duration-300 h-[65px] flex items-center overflow-hidden ${style.wrapper}`}
    >
      {isMobileMenuOpen && (
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-20"
          style={{
              backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
              backgroundSize: '16px 16px'
          }}
        />
      )}

      <div className="container mx-auto px-4 relative z-10 w-full">
        <div className="flex items-center justify-between">
          
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsMobileMenuOpen(false)}>
            <span className={`text-2xl md:text-3xl font-display font-extrabold tracking-tight transition-colors ${style.rankText}`}>
              Rank
              <span className={style.scoutText}>Scout</span>
              <span className={style.scoutText}>.</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link: any) => (
              <Link
                key={link.label}
                to={link.url}
                className={`text-sm font-medium transition-colors relative group py-2 ${style.navLink}`}
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

          {/* FIX: Aria-Label hinzugefügt für Accessibility Score */}
          <button 
            className={`md:hidden p-2 rounded-lg transition-colors ${style.toggleBtn}`} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Menü schließen" : "Menü öffnen"}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div 
            className="fixed left-0 right-0 bottom-0 top-[65px] bg-white z-40 md:hidden overflow-y-auto border-t border-slate-100 animate-in slide-in-from-right-10 fade-in duration-300"
            style={{ height: 'calc(100dvh - 65px)' }}
        >
          <nav className="container mx-auto px-4 py-6 flex flex-col gap-6 pb-24">
            
            <div className="grid grid-cols-2 gap-4 mb-2">
                {hubLinks.map((link: any) => {
                  const Icon = iconMap[link.icon] || LayoutGrid;
                  return (
                    <Link
                        key={link.label}
                        to={link.url}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-secondary/50 hover:bg-white transition-all group shadow-sm active:scale-95 duration-200"
                    >
                        <div className="mb-2 text-secondary group-hover:scale-110 transition-transform">
                           <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide text-center">{link.label}</span>
                    </Link>
                  );
                })}
            </div>

            <div className="flex flex-col space-y-2">
                {navLinks.map((link: any) => (
                  <Link
                    key={link.label}
                    to={link.url}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-bold text-slate-800 hover:text-primary py-4 border-b border-slate-100 flex justify-between items-center group"
                  >
                    {link.label}
                    <span className="text-slate-300 group-hover:text-secondary group-hover:translate-x-1 transition-all">→</span>
                  </Link>
                ))}
            </div>

            <Link to={config.button_url} onClick={() => setIsMobileMenuOpen(false)} className="mt-4">
              <Button className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold h-14 text-lg rounded-xl shadow-xl shadow-secondary/20">
                {config.button_text}
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};