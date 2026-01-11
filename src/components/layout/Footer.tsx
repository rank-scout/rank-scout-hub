import { CityLandingFooter } from "@/components/templates/CityLandingFooter";

// Accept a partial category with only the footer-relevant fields
interface FooterCategory {
  id?: string;
  site_name?: string | null;
  footer_site_name?: string | null;
  footer_copyright_text?: string | null;
  footer_designer_name?: string | null;
  footer_designer_url?: string | null;
}

export function Footer({ category }: { category?: FooterCategory | null }) {
  // Cast to the expected type for CityLandingFooter
  return <CityLandingFooter category={category as any} />;
}

