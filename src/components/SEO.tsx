import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article';
}

export function SEO({ 
  title, 
  description, 
  canonical, 
  image, 
  type = 'website',
}: SEOProps) {
  
  // URL-Logik: Standardisiert auf die aktuelle Seite
  const currentUrl = canonical || window.location.href;

  return (
    <Helmet>
      {/* 1. Title & Description (Überschreibt globalen Provider) */}
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}

      {/* 2. Canonical Tag (Pflicht für Google Indexierung) */}
      <link rel="canonical" href={currentUrl} />

      {/* 3. Open Graph (Facebook/Social) - Spiegelt die SEO Daten */}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      {image && <meta property="og:image" content={image} />}
      
      {/* 4. Twitter Cards (Standard) */}
      <meta name="twitter:card" content="summary_large_image" />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
}