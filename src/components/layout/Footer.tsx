import { Link } from "react-router-dom";
import { useFooterLinks } from "@/hooks/useSettings";
import { Search } from "lucide-react";

export function Footer() {
  const footerLinks = useFooterLinks();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-gradient rounded-lg flex items-center justify-center">
                <Search className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                Rank-Scout
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md">
              Dein vertrauenswürdiger Partner für ehrliche Vergleiche. 
              Wir helfen dir, die besten Anbieter in Dating, Casino und mehr zu finden.
            </p>
          </div>

          {/* Portale */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Portale</h4>
            <ul className="space-y-2">
              <li>
                <a href="https://dating.rank-scout.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Dating Vergleiche
                </a>
              </li>
              <li>
                <a href="https://casino.rank-scout.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Casino Vergleiche
                </a>
              </li>
              <li>
                <a href="https://adult.rank-scout.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Adult Vergleiche
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Rechtliches</h4>
            <ul className="space-y-2">
              {footerLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.url} 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Rank-Scout. Alle Rechte vorbehalten.
          </p>
          <p className="text-xs text-muted-foreground">
            18+ | Verantwortungsvolles Spielen | Werbung
          </p>
        </div>
      </div>
    </footer>
  );
}
