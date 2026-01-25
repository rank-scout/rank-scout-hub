import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavLinks, useSiteLogo } from "@/hooks/useSettings";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navLinks = useNavLinks();
  const logo = useSiteLogo();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b bg-primary border-white/10 py-3 shadow-lg"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          
          {/* BRANDING: Logo + Text nebeneinander */}
          <Link to="/" className="flex items-center gap-4 group relative z-50">
            
            {/* 1. Logo Bild (Größe H18 = h-[4.5rem]) */}
            {logo && (
              <div className="transition-transform duration-300 group-hover:scale-105 flex items-center justify-center">
                <img 
                  src={logo}
                  alt="Rank-Scout" 
                  className="h-[4.5rem] w-auto object-contain object-center"
                />
              </div>
            )}

            {/* 2. Text (Rank-Scout + Oranger Punkt) */}
            <span className="font-display font-bold text-2xl tracking-tight text-white transition-colors duration-300">
              Rank-Scout<span className="text-secondary">.</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.url}
                className="text-sm font-medium transition-all hover:scale-105 uppercase tracking-wide text-slate-300 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <Link to="/kategorien">
              {/* BUTTON IN RANK-SCOUT ORANGE (secondary) */}
              <Button className="bg-secondary text-white hover:bg-secondary/90 font-bold transition-all shadow-lg px-6 rounded-full border-none">
                Vergleiche starten
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 transition-colors text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[100%] left-0 w-full bg-primary border-t border-white/10 p-6 shadow-2xl animate-fade-in">
          <nav className="flex flex-col gap-6 text-center">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.url}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xl font-medium text-white hover:text-secondary border-b border-white/5 pb-4"
              >
                {link.label}
              </Link>
            ))}
            <Link to="/kategorien" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full bg-secondary text-white font-bold h-12 text-lg rounded-xl shadow-xl">
                Jetzt vergleichen
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};