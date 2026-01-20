import React from 'react';

// --- Typen & Interfaces ---
interface Project {
  id: string;
  name: string;
  url: string;
  affiliate_link: string;
  logo_url: string;
  rating: number;
  badge_text?: string;
  features: string[];
  pros_list?: string[];
  cons_list?: string[];
}

interface FooterLink {
  label: string;
  url: string;
}

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  
  // SEO & Meta
  meta_title?: string;
  meta_description?: string;
  h1_title?: string;
  
  // Design & Branding
  site_name?: string;
  footer_site_name?: string;
  footer_copyright_text?: string;
  footer_designer_name?: string;
  footer_designer_url?: string;
  
  // Content
  description?: string; // Wird oft als Haupttext genutzt
  long_content_top?: string;
  long_content_bottom?: string;
  
  // Features / Overrides
  analytics_code?: string;
  newsletter_active?: boolean;
}

interface TemplateProps {
  category: CategoryData;
  topProject: Project | null;
  settings: any;
  legalLinks: FooterLink[];
  popularLinks: FooterLink[];
}

export const ReviewTemplate: React.FC<TemplateProps> = ({ 
  category, 
  topProject, 
  settings, 
  legalLinks, 
  popularLinks 
}) => {
  const year = new Date().getFullYear();
  
  // Helper
  const sanitizeUrl = (url: string | undefined) => {
    if (!url) return '#';
    try {
      if (url.startsWith('/') || url.startsWith('#')) return url;
      const p = new URL(url);
      return ['http:', 'https:'].includes(p.protocol) ? url : '#';
    } catch { return '#'; }
  };

  const addSubId = (link: string | undefined) => {
    if (!link) return '#';
    if (link.startsWith('#')) return link;
    return link + (link.includes('?') ? '&' : '?') + 'subid=' + (category.slug || 'rank-scout');
  };

  // Helper für Bewertungen
  const ratingOverall = topProject?.rating || 9.0;
  const ratingUsability = (ratingOverall - 0.2).toFixed(1);
  const ratingValue = (ratingOverall - 0.3).toFixed(1);
  const ratingQuality = (Math.min(ratingOverall + 0.1, 10)).toFixed(1);

  return (
    <html lang="de">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href={`https://dating.rank-scout.com/${category.slug}/`} />

        {/* Favicons */}
        <link rel="icon" href="https://dating.rank-scout.com/top3-dating-apps/images/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="https://dating.rank-scout.com/top3-dating-apps/images/favicon-32x32.png" />
        
        {/* SEO */}
        <title>{(category.meta_title || `Erfahrungsbericht ${category.name}`).replace(/2026/g, year.toString())}</title>
        <meta name="description" content={(category.meta_description || '').replace(/2026/g, year.toString())} />
        <meta name="robots" content="index, follow" />

        {/* Fonts & Styles */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" />
        
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
                theme: {
                    extend: {
                        colors: {
                            brand: {
                                black: '#0a0a0a',
                                dark: '#58000c',
                                primary: '#c41e3a',
                                light: '#ff4d6d',
                                gold: '#fbbf24',
                                bg: '#fafafa',
                            }
                        },
                        fontFamily: {
                            sans: ['Open Sans', 'sans-serif'],
                            heading: ['Montserrat', 'sans-serif'],
                        }
                    }
                }
            }
          `
        }} />
        <style dangerouslySetInnerHTML={{
          __html: `
            html { scroll-behavior: smooth; }
            body { background: #fafafa; }
            .article-content h2 { font-family: 'Montserrat', sans-serif; font-size: 1.75rem; font-weight: 700; color: #1a1a1a; margin: 2.5rem 0 1rem; border-bottom: 2px solid #f3f4f6; padding-bottom: 0.5rem; }
            .article-content h3 { font-family: 'Montserrat', sans-serif; font-size: 1.25rem; font-weight: 600; color: #374151; margin: 2rem 0 0.75rem; }
            .article-content p { font-size: 1.125rem; line-height: 1.85; color: #4b5563; margin-bottom: 1.25rem; }
            .article-content ul { margin: 1.25rem 0; padding-left: 1.5rem; list-style: disc; }
            .article-content li { font-size: 1.125rem; line-height: 1.7; color: #4b5563; margin-bottom: 0.5rem; }
            .winner-card { background: linear-gradient(135deg, #ffffff 0%, #fef3c7 100%); border: 2px solid #fbbf24; }
            .cta-button:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(196, 30, 58, 0.35); }
            ${settings?.custom_css || ''}
          `
        }} />

        {/* Schema Markup */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Review",
            "name": category.h1_title || category.name,
            "description": category.meta_description,
            "author": { "@type": "Organization", "name": "Rank-Scout Redaktion" },
            "datePublished": new Date().toISOString().split('T')[0],
            "reviewRating": topProject ? {
                "@type": "Rating",
                "ratingValue": ratingOverall,
                "bestRating": "10",
                "worstRating": "1"
            } : undefined,
            "itemReviewed": topProject ? {
                "@type": "Product",
                "name": topProject.name
            } : undefined
          })
        }} />
      </head>
      
      <body className="font-sans antialiased text-gray-800">
        
        {/* HEADER */}
        <header className="w-full bg-brand-black text-white py-4 px-6 shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <a href="/" className="font-heading font-bold text-xl tracking-tight text-brand-gold hover:text-brand-light transition-colors">
                    {category.site_name || 'DatingRankScout'}
                </a>
                <nav className="hidden md:flex items-center space-x-6 text-sm">
                    <a href="/top3-dating-apps/" className="hover:text-brand-gold transition-colors">Top Dating Apps</a>
                    <a href="/testberichte/" className="hover:text-brand-gold transition-colors">Testberichte</a>
                </nav>
                <a href="/top3-dating-apps/" className="text-sm bg-brand-primary hover:bg-brand-light text-white px-4 py-2 rounded-full transition-all duration-300">
                    Apps vergleichen
                </a>
            </div>
        </header>

        {/* BREADCRUMBS */}
        <div className="bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <nav className="text-sm text-gray-500 flex flex-wrap items-center gap-2">
                    <a href="/" className="hover:text-brand-primary transition-colors">Startseite</a>
                    <i className="fas fa-chevron-right text-xs text-gray-300"></i>
                    <a href="/testberichte/" className="hover:text-brand-primary transition-colors">Testberichte</a>
                    <i className="fas fa-chevron-right text-xs text-gray-300"></i>
                    <span className="text-gray-900 font-medium">{category.name}</span>
                </nav>
            </div>
        </div>

        {/* MAIN CONTENT */}
        <main className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* ARTICLE */}
                <article className="lg:col-span-2">
                    <header className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-sm font-medium">
                                <i className="fas fa-file-alt"></i> Testbericht
                            </span>
                            <span className="text-gray-400 text-sm">
                                <i className="far fa-calendar mr-1"></i>
                                {new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                        <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                            {category.h1_title?.replace(/2026/g, year.toString()) || category.name}
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            {category.meta_description || 'Ausführlicher Erfahrungsbericht mit allen Vor- und Nachteilen.'}
                        </p>
                    </header>
                    
                    {/* RATING CARD */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-10 border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                                <i className="fas fa-clipboard-check text-brand-primary"></i>
                            </div>
                            <h2 className="font-heading font-bold text-lg text-gray-900">Kurzbewertung</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-gray-50 rounded-xl">
                                <p className="text-2xl font-bold text-brand-primary">{ratingOverall.toFixed(1)}</p>
                                <p className="text-xs text-gray-500 mt-1">Gesamt</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-xl">
                                <p className="text-2xl font-bold text-gray-900">{ratingUsability}</p>
                                <p className="text-xs text-gray-500 mt-1">Bedienung</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-xl">
                                <p className="text-2xl font-bold text-gray-900">{ratingValue}</p>
                                <p className="text-xs text-gray-500 mt-1">Preis</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-xl">
                                <p className="text-2xl font-bold text-gray-900">{ratingQuality}</p>
                                <p className="text-xs text-gray-500 mt-1">Qualität</p>
                            </div>
                        </div>
                    </div>

                    {/* CONTENT BODY */}
                    <div className="article-content" dangerouslySetInnerHTML={{ __html: category.description || category.long_content_top || '<p>Kein Inhalt verfügbar.</p>' }} />
                    {category.long_content_bottom && <div className="article-content mt-8" dangerouslySetInnerHTML={{ __html: category.long_content_bottom }} />}
                    
                    {/* PROS & CONS */}
                    {topProject && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
                            <div className="bg-green-50 border-l-4 border-green-500 rounded-2xl p-6">
                                <h3 className="font-heading font-bold text-lg text-green-800 flex items-center gap-2 mb-4">
                                    <i className="fas fa-check-circle"></i> Vorteile
                                </h3>
                                <ul className="space-y-2 text-green-900">
                                    {topProject.pros_list?.map((pro, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <i className="fas fa-check text-green-600 mt-1 text-sm"></i><span>{pro}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-red-50 border-l-4 border-red-500 rounded-2xl p-6">
                                <h3 className="font-heading font-bold text-lg text-red-800 flex items-center gap-2 mb-4">
                                    <i className="fas fa-times-circle"></i> Nachteile
                                </h3>
                                <ul className="space-y-2 text-red-900">
                                    {topProject.cons_list?.map((con, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <i className="fas fa-times text-red-600 mt-1 text-sm"></i><span>{con}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* AUTHOR */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 mt-12">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-light rounded-full flex items-center justify-center text-white text-xl font-bold">RS</div>
                            <div>
                                <p className="font-heading font-bold text-gray-900">Rank-Scout Redaktion</p>
                                <p className="text-sm text-gray-500">Unser Expertenteam testet und bewertet Dating-Plattformen unabhängig.</p>
                            </div>
                        </div>
                    </div>
                </article>
                
                {/* SIDEBAR */}
                <aside className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        
                        {/* WINNER CARD */}
                        {topProject && (
                            <div className="winner-card rounded-2xl shadow-lg p-6 bg-white relative overflow-hidden">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="bg-gradient-to-r from-brand-gold to-yellow-500 text-brand-black font-bold px-3 py-1 rounded-full text-sm">
                                        <i className="fas fa-trophy mr-1"></i> Testsieger
                                    </span>
                                </div>
                                <div className="text-center">
                                    <img src={sanitizeUrl(topProject.logo_url)} alt={topProject.name} className="h-16 w-auto mx-auto mb-4 object-contain" />
                                    <h3 className="font-heading font-bold text-xl text-gray-900 mb-2">{topProject.name}</h3>
                                    <p className="text-3xl font-bold text-brand-primary mb-4">{ratingOverall.toFixed(1)}/10</p>
                                    <a href={addSubId(topProject.affiliate_link)} target="_blank" rel="nofollow" className="cta-button block w-full text-white text-center font-bold py-4 px-6 rounded-xl transition-all">
                                        Zum Anbieter <i className="fas fa-external-link-alt ml-2"></i>
                                    </a>
                                </div>
                            </div>
                        )}
                        
                        {/* NEWSLETTER */}
                        <div className="bg-gray-900 rounded-2xl shadow-lg p-6 text-white">
                            <h3 className="font-heading font-bold text-lg mb-2"><i className="fas fa-envelope mr-2 text-brand-gold"></i>Newsletter</h3>
                            <p className="text-sm text-gray-300 mb-4">Neue Testberichte direkt in dein Postfach.</p>
                            <div className="space-y-3">
                                <input type="email" placeholder="deine@email.de" className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                                <button className="w-full bg-brand-gold hover:bg-yellow-400 text-brand-black font-bold py-3 px-4 rounded-xl transition-colors">Kostenlos anmelden</button>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </main>

        {/* FOOTER */}
        <footer className="bg-[#0a0a0a] border-t border-white/5 mt-20 py-12 text-center">
            <div className="max-w-6xl mx-auto px-4">
                <span className="font-heading font-bold text-2xl text-white mb-8 block">{category.footer_site_name || 'Rank-Scout'}</span>
                
                {popularLinks.length > 0 && (
                    <div className="mb-8 flex flex-wrap justify-center gap-4">
                        {popularLinks.map((l, i) => <a key={i} href={sanitizeUrl(l.url)} className="text-gray-400 hover:text-white text-sm">{l.label}</a>)}
                    </div>
                )}

                <div className="border-t border-white/10 my-8 mx-auto max-w-2xl"></div>

                <div className="flex flex-wrap justify-center gap-6 mb-6">
                    {legalLinks.map((l, i) => <a key={i} href={sanitizeUrl(l.url)} className="text-amber-500 font-semibold text-sm uppercase hover:text-amber-400">{l.label}</a>)}
                </div>

                <p className="text-gray-500 text-xs">{category.footer_copyright_text?.replace(/2026/g, year.toString()) || `© ${year} Rank-Scout. Alle Rechte vorbehalten.`}</p>
            </div>
        </footer>

        {category.analytics_code && <div dangerouslySetInnerHTML={{ __html: category.analytics_code }} />}
      </body>
    </html>
  );
};