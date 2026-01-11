import { Link } from "react-router-dom";
import { useFooterLinks } from "@/hooks/useSettings";

interface CityLandingFooterProps {
  siteName?: string | null;
  popularLinks?: { label: string; url: string }[];
}

const defaultPopularLinks = [
  { label: "ONS Österreich", url: "/ons-oesterreich" },
  { label: "Seitensprung Österreich", url: "/seitensprung-oesterreich" },
  { label: "Sexdate Salzburg", url: "/sexdate-salzburg" },
  { label: "Sexdate Wien", url: "/sexdate-wien" },
  { label: "Sexkontakte Berlin", url: "/sexkontakte-berlin" },
  { label: "Sexkontakte Nürnberg", url: "/sexkontakte-nuernberg" },
  { label: "Online Speed Dating München", url: "/speed-dating-muenchen" },
];

export function CityLandingFooter({ siteName, popularLinks = defaultPopularLinks }: CityLandingFooterProps) {
  const footerLinks = useFooterLinks();

  // Parse siteName to highlight parts (e.g., "DatingAppVergleichAT")
  const renderSiteName = () => {
    const name = siteName || "DatingAppVergleichAT";
    
    // Try to extract pattern like "DatingApp" + "Vergleich" + "AT"
    const match = name.match(/^(.+?)(Vergleich|Portal|Guide|Hub)(.+)$/i);
    
    if (match) {
      return (
        <>
          <span className="text-white">{match[1]}</span>
          <span className="text-dating">{match[2]}</span>
          <span className="text-dating">{match[3]}</span>
        </>
      );
    }
    
    // Fallback: just show the name in white
    return <span className="text-white">{name}</span>;
  };

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5">
      <div className="container mx-auto px-4 py-12">
        {/* Logo - Centered */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block">
            <span className="font-display font-bold text-2xl md:text-3xl tracking-tight">
              {renderSiteName()}
            </span>
          </Link>
        </div>

        {/* Popular Links Section */}
        <div className="text-center mb-10">
          <h4 className="text-amber-500 font-semibold text-xs uppercase tracking-[0.2em] mb-6">
            Beliebte Suche & Regionen
          </h4>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 max-w-3xl mx-auto">
            {popularLinks.map((link, index) => (
              <Link
                key={index}
                to={link.url}
                className="text-gray-400 text-sm hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 max-w-2xl mx-auto mb-8" />

        {/* Legal Links */}
        <div className="text-center mb-6">
          <div className="flex flex-wrap justify-center gap-6">
            {footerLinks.map((link, index) => (
              <Link
                key={index}
                to={link.url}
                className="text-amber-500 font-semibold text-sm uppercase tracking-wide hover:text-amber-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} {siteName || "DatingVergleichAT"}. Alle Rechte vorbehalten.
            <span className="mx-2">·</span>
            <span className="text-gray-600">Designed by</span>{" "}
            <a href="https://digital-perfect.at" target="_blank" rel="noopener noreferrer" className="text-dating hover:underline">
              Digital-Perfect
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
