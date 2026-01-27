import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Gamepad2, BrainCircuit, Users, LayoutGrid } from "lucide-react";
import { useState } from "react";
import { useNavLinks, useSiteLogo } from "@/hooks/useSettings";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navLinks = useNavLinks();
  const logo = useSiteLogo();

  // Strategische Hub-Links (Hardcoded für Stabilität)
  const hubLinks = [
    { label: "Vergleichs-Hub", url: "/kategorien", icon: <LayoutGrid className="w-4 h-4" /> },
    { label: "Arcade", url: "/arcade", icon: <Gamepad2 className="w-4 h-4" /> },
    { label: "Brain-Boost", url: "/brain-boost", icon: <BrainCircuit className="w-4 h-4" /> },
    { label: "Community", url: "/forum", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b bg-primary border-white/10 py-3 shadow-lg backdrop-blur-md bg-primary/95 transition-all"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between">
          
          {/* BRANDING */}
          <Link to="/" className="flex items-center gap-4 group relative z-50">
            {logo && (
              <div className="transition-transform duration-300 group-hover:scale-105 flex items-center justify-center drop-shadow-md">
                <img 
                  src={logo}
                  alt="Rank-Scout" 
                  className="h-[3.5rem] md:h-[4.5rem] w-auto object-contain object-center"
                />
              </div>
            )}
            <span className="font-display font-bold text-xl md:text-2xl tracking-tight text-white transition-colors duration-300 hidden sm:block drop-shadow-sm">
              Rank-Scout<span className="text-secondary">.</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-6">
            {/* 1. Strategische Hubs */}
            {hubLinks.map((link) => (
              <Link
                key={link.label}
                to={link.url}
                className="flex items-center gap-2 text-sm font-medium transition-all hover:scale-105 uppercase tracking-wide text-slate-300 hover:text-white group relative"
              >
                <span className="text-secondary group-hover:text-white transition-colors duration-300 filter drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]">{link.icon}</span>
                {link.label}
                 {/* Hover Line */}
                 <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-secondary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}

            {/* Trenner */}
            <div className="h-4 w-[1px] bg-white/20 mx-2"></div>

            {/* 2. Dynamische CMS Links */}
            {navLinks.slice(0, 3).map((link) => (
              <Link
                key={link.label}
                to={link.url}
                className="text-sm font-medium transition-all hover:scale-105 uppercase tracking-wide text-slate-400 hover:text-white"
              >
                {link.label}
              </Link>
            ))}

            <Link to="/profil">
               <Button variant="ghost" className="text-white hover:text-secondary hover:bg-white/5 transition-all border border-transparent hover:border-white/10 rounded-full">
                 Login
               </Button>
            </Link>

            <Link to="/kategorien">
              <Button className="bg-secondary text-white hover:bg-secondary/90 hover:shadow-[0_0_15px_rgba(249,115,22,0.5)] font-bold transition-all shadow-lg px-6 rounded-full border-none transform hover:-translate-y-0.5">
                Start
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="xl:hidden p-2 transition-colors text-white hover:bg-white/10 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden absolute top-[100%] left-0 w-full bg-primary/95 backdrop-blur-xl border-t border-white/10 p-6 shadow-2xl animate-fade-in h-[calc(100vh-80px)] overflow-y-auto">
          <nav className="flex flex-col gap-4 text-center">
            {/* Hubs Mobile Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                {hubLinks.map((link) => (
                <Link
                    key={link.label}
                    to={link.url}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl border border-white/10 hover:border-secondary/50 transition-all group"
                >
                    <div className="mb-2 text-secondary group-hover:scale-110 transition-transform">{link.icon}</div>
                    <span className="text-sm font-bold text-white uppercase">{link.label}</span>
                </Link>
                ))}
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.url}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-medium text-slate-300 hover:text-white py-2"
              >
                {link.label}
              </Link>
            ))}
            
            <Link to="/kategorien" onClick={() => setIsMobileMenuOpen(false)} className="mt-4">
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