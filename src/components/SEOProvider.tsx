import { HelmetProvider, Helmet } from 'react-helmet-async';
import { useSettings } from '@/hooks/useSettings';
import React from 'react';

/**
 * SEOProvider Component (FINAL)
 * Automatisiert:
 * 1. Titel & Beschreibung (aus DB)
 * 2. Open Graph (für Social Media)
 * 3. Canonical URL (Schutz vor Duplicate Content) - NEU!
 */
export function SEOProvider({ children }: { children: React.ReactNode }) {
  const { data: settings, isLoading } = useSettings();

  // Globale Fallback-Werte aus der Datenbank
  const siteTitle = settings?.site_title as string || 'Rank-Scout';
  const siteDescription = settings?.site_description as string || '';
  
  // Die aktuelle URL für den Canonical Tag
  const currentUrl = window.location.href;

  return (
    <HelmetProvider>
      {!isLoading && (
        <Helmet>
          {/* 1. Basis-Tags */}
          <title defaultTitle={siteTitle} titleTemplate={`%s | ${siteTitle}`}>
            {siteTitle}
          </title>

          {siteDescription && <meta name="description" content={siteDescription} />}

          {/* 2. Canonical Tag - WICHTIG: Setzt automatisch die aktuelle URL als "Original" */}
          <link rel="canonical" href={currentUrl} />

          {/* 3. Globale Open Graph Tags */}
          <meta property="og:title" content={siteTitle} />
          {siteDescription && <meta property="og:description" content={siteDescription} />}
          <meta property="og:type" content="website" />
          <meta property="og:url" content={currentUrl} />
        </Helmet>
      )}
      
      {children}
    </HelmetProvider>
  );
}