import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavLinks } from "@/hooks/useSettings";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navLinks = useNavLinks();

  // URL zum Logo (Hardcoded für Stabilität)
  const LOGO_URL = "https://rank-scout.com/rank-scout-logo.webp";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
        isScrolled 
          ? "bg-white border-slate-200 shadow-md py-3" // Scroll: Weißer Balken
          : "bg-transparent border-transparent py-6" // Start: Transparent
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          
          {/* LOGO BEREICH */}
          <Link to="/" className="flex items-center gap-2 group relative z-50">
            <div className="transition-transform duration-300 group-hover:scale-105">
                <img 
                  src={LOGO_URL}
                  alt="Rank-Scout Logo" 
                  // LOGIK: 
                  // !isScrolled (Oben/Dunkel) -> Filter: brightness-0 invert (Macht es 100% WEISS)
                  // isScrolled (Scroll/Weiß) -> Kein Filter (Originalfarben)
                  className={`h-9 w-auto object-contain transition-all duration-300 ${
                    !isScrolled ? 'brightness-0 invert' : ''
                  }`}
                />
            </div>
            {/* Text-Logo daneben (optional, blendet Farbe je nach State) */}
            <span className={`font-display font-bold text-xl tracking-tight hidden md:block transition-colors duration-300 ${
                isScrolled ? 'text-primary' : 'text-white'
            }`}>
              Rank<span className="text-secondary">Scout</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.url}
                className={`text-sm font-medium transition-all hover:scale-105 uppercase tracking-wide ${
                    isScrolled ? 'text-slate-600 hover:text-primary' : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/kategorien">
              <Button className={`${
                  isScrolled 
                  ? 'bg-primary text-white hover:bg-primary/90' 
                  : 'bg-white text-primary hover:bg-secondary hover:text-white border-white/20' 
              } font-bold transition-all shadow-lg px-6 rounded-full`}>
                Vergleiche starten
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 transition-colors ${isScrolled ? 'text-primary' : 'text-white'}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[100%] left-0 w-full bg-white border-t border-slate-100 p-6 shadow-2xl animate-fade-in">
          <nav className="flex flex-col gap-6 text-center">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.url}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xl font-medium text-primary hover:text-secondary border-b border-slate-100 pb-4"
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