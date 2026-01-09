import { useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";

/**
 * SEOProvider Component
 * 
 * Place this component at the root of your app (inside QueryClientProvider)
 * to automatically sync document.title and meta tags with database settings.
 * 
 * Works for external hosting - no environment variables required.
 */
export function SEOProvider({ children }: { children: React.ReactNode }) {
  const { data: settings, isLoading } = useSettings();

  useEffect(() => {
    if (isLoading || !settings) return;

    // Update document title from database
    const siteTitle = settings.site_title as string;
    if (siteTitle) {
      document.title = siteTitle;
    }

    // Update meta description from database
    const siteDescription = settings.site_description as string;
    if (siteDescription) {
      updateMetaTag("description", siteDescription);
    }

    // Update OG tags if present
    if (siteTitle) {
      updateMetaTag("og:title", siteTitle, "property");
    }
    if (siteDescription) {
      updateMetaTag("og:description", siteDescription, "property");
    }
  }, [settings, isLoading]);

  return <>{children}</>;
}

/**
 * Helper to update or create meta tags
 */
function updateMetaTag(name: string, content: string, attribute: "name" | "property" = "name") {
  let meta = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  
  meta.setAttribute("content", content);
}

export default SEOProvider;
