import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Gamepad2, BrainCircuit, Users, LayoutGrid } from "lucide-react";
import { useState } from "react";
import { useHeaderConfig, useSiteLogo } from "@/hooks/useSettings";

const iconMap: Record<string, any> = {
  LayoutGrid, Gamepad2, BrainCircuit, Users
};

// Export muss EXAKT so heißen: Header
export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const logo = useSiteLogo();
  const config = useHeaderConfig();

  const navLinks = config.nav_links || [];
  const hubLinks = config.hub_links || [];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-primary border-white/10 py-3 shadow-lg backdrop-blur-md bg-primary/95 transition-all">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between">
          
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsMobileMenuOpen(false)}>
            {logo ? (
              <img src={logo} alt="Rank-Scout" className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
            ) : (
              <span className="text-2xl font-display font-bold text-white tracking-tight">
                Rank<span className="text-secondary">-Scout</span>
              </span>
            )}
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link: any) => (
              <Link
                key={link.label}
                to={link.url}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all group-hover:w-full" />
              </Link>
            ))}
            <Link to={config.button_url}>
              <Button className="bg-secondary hover:bg-secondary/90 text-white font-bold shadow-lg shadow-secondary/20 transition-all hover:-translate-y-0.5">
                {config.button_text}
              </Button>
            </Link>
          </nav>

          <button className="md:hidden text-white p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[65px] bg-primary z-40 md:hidden overflow-y-auto pb-20 animate-in slide-in-from-top-5">
          <nav className="container mx-auto px-4 py-6 flex flex-col gap-6">
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                {hubLinks.map((link: any) => {
                  const Icon = iconMap[link.icon] || LayoutGrid;
                  return (
                    <Link
                        key={link.label}
                        to={link.url}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl border border-white/10 hover:border-secondary/50 transition-all group"
                    >
                        <div className="mb-2 text-secondary group-hover:scale-110 transition-transform">
                           <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-white uppercase">{link.label}</span>
                    </Link>
                  );
                })}
            </div>

            {navLinks.map((link: any) => (
              <Link
                key={link.label}
                to={link.url}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-medium text-slate-300 hover:text-white py-2"
              >
                {link.label}
              </Link>
            ))}
            
            <Link to={config.button_url} onClick={() => setIsMobileMenuOpen(false)} className="mt-4">
              <Button className="w-full bg-secondary text-white font-bold h-12 text-lg rounded-xl shadow-xl">
                {config.button_text}
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};