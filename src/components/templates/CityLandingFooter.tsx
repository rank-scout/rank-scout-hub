import { Link } from "react-router-dom";
import { 
  useFooterLinks, 
  useFooterSiteName, 
  useFooterDesignerName, 
  useFooterDesignerUrl 
} from "@/hooks/useSettings";
import { usePopularFooterLinks } from "@/hooks/usePopularFooterLinks";

// Accept a partial category with only the footer-relevant fields
interface FooterCategoryData {
  id?: string;
  site_name?: string | null;
  footer_site_name?: string | null;
  footer_copyright_text?: string | null;
  footer_designer_name?: string | null;
  footer_designer_url?: string | null;
}

interface CityLandingFooterProps {
  category?: FooterCategoryData | null;
}

export function CityLandingFooter({ category }: CityLandingFooterProps) {
  const footerLinks = useFooterLinks();
  // Pass category id if available, otherwise load global links (category_id is null)
  const { data: popularLinks = [] } = usePopularFooterLinks(category?.id || null);

  // Load global footer settings from settings table
  const globalSiteName = useFooterSiteName();
  const globalDesignerName = useFooterDesignerName();
  const globalDesignerUrl = useFooterDesignerUrl();

  // Get footer settings: category-specific -> global settings -> hardcoded defaults
  const siteName = category?.footer_site_name || category?.site_name || globalSiteName;
  const copyrightText = category?.footer_copyright_text || `© ${new Date().getFullYear()} ${siteName}. Alle Rechte vorbehalten.`;
  const designerName = category?.footer_designer_name || globalDesignerName;
  const designerUrl = category?.footer_designer_url || globalDesignerUrl;

  // Parse siteName to highlight parts (e.g., "DatingAppVergleichAT")
  const renderSiteName = () => {
    // Try to extract pattern like "DatingApp" + "Vergleich" + "AT"
    const match = siteName.match(/^(.+?)(Vergleich|Portal|Guide|Hub)(.+)$/i);
    
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
    return <span className="text-white">{siteName}</span>;
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

        {/* Popular Links Section - Always show if links exist */}
        {popularLinks.length > 0 && (
          <div className="text-center mb-10">
            <h4 className="text-amber-500 font-semibold text-xs uppercase tracking-[0.2em] mb-6">
              Beliebte Suche & Regionen
            </h4>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 max-w-3xl mx-auto">
              {popularLinks.map((link) => (
                <Link
                  key={link.id}
                  to={link.url}
                  className="text-gray-400 text-sm hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}

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
            {copyrightText}
            <span className="mx-2">·</span>
            <span className="text-gray-600">Designed by</span>{" "}
            <a 
              href={designerUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-dating hover:underline"
            >
              {designerName}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
