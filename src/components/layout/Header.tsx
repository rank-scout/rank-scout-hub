import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavLinks } from "@/hooks/useSettings";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navLinks = useNavLinks();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src="/rank-scout-logo.webp" 
              alt="Rank-Scout Logo" 
              className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.url}
                className="text-sm font-medium text-primary/80 hover:text-secondary transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link to="/kategorien">
              {/* Button Update: Navy Background, Feuer-Orange Text */}
              <Button className="bg-primary text-secondary font-bold hover:bg-primary/90 hover:text-orange-400 border border-transparent hover:border-secondary/20 transition-all shadow-lg shadow-primary/20">
                Vergleiche starten
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-primary hover:text-secondary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 p-4 shadow-lg animate-fade-in">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.url}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-medium text-primary hover:text-secondary"
              >
                {link.label}
              </Link>
            ))}
            <Link to="/kategorien" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full bg-primary text-secondary font-bold hover:bg-primary/90">
                Vergleiche starten
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};