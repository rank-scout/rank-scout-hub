import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

// --- Typen & Interfaces ---
interface Project {
  id: string;
  name: string;
  url: string;
  affiliate_link: string;
  logo_url: string;
  rating: number;
  badge_text?: string;
  features: string[] | Record<string, any>; // Flexible Typisierung
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

  // Helper für Listen (Features/Pros/Cons) sicher parsen
  const getList = (list: any): string[] => {
    if (Array.isArray(list)) return list.map(String);
    if (typeof list === 'object' && list !== null) return Object.values(list).map(String);
    return [];
  };

  const pros = topProject?.pros_list ? getList(topProject.pros_list) : [];
  const cons = topProject?.cons_list ? getList(topProject.cons_list) : [];

  // Helper für Bewertungen
  const ratingOverall = topProject?.rating || 9.0;
  const ratingUsability = (ratingOverall - 0.2).toFixed(1);
  const ratingValue = (ratingOverall - 0.3).toFixed(1);
  const ratingQuality = (Math.min(ratingOverall + 0.1, 10)).toFixed(1);

  // KYRA UPDATE: Sicheres Schema Markup
  // Verhindert Fehler, wenn kein "topProject" existiert (vermeidet undefined Properties)
  const schemaData = topProject 
    ? {
        "@context": "https://schema.org",
        "@type": "Review",
        "name": category.h1_title || category.name,
        "description": category.meta_description,
        "author": { "@type": "Organization", "name": "Rank-Scout Redaktion" },
        "datePublished": new Date().toISOString().split('T')[0],
        "reviewRating": {
            "@type": "Rating",
            "ratingValue": ratingOverall,
            "bestRating": "10",
            "worstRating": "1"
        },
        "itemReviewed": {
            "@type": "Product",
            "name": topProject.name
        }
      }
    : {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": category.h1_title || category.name,
        "description": category.meta_description,
        "author": { "@type": "Organization", "name": "Rank-Scout Redaktion" }
      };

  return (
    <div className="font-sans antialiased text-gray-800 bg-[#fafafa] min-h-screen">
      <Helmet>
        <html lang="de" />
        <title>{(category.meta_title || `Erfahrungsbericht ${category.name}`).replace(/2026/g, year.toString())}</title>
        <meta name="description" content={(category.meta_description || '').replace(/2026/g, year.toString())} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://rank-scout.com/category/${category.slug}`} />
        
        {/* KYRA FIX: Valides Schema Markup JSON */}
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>

        {/* Fonts & External Styles */}
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Helmet>

      {/* Tailwind Config Injection für diesen Scope (Inline Styles für spezifische Review Farben) */}
      <style>{`
        .font-heading { font-family: 'Montserrat', sans-serif; }
        .bg-brand-black { background-color: #0a0a0a; }
        .text-brand-gold { color: #fbbf24; }
        .text-brand-primary { color: #c41e3a; }
        .bg-brand-primary { background-color: #c41e3a; }
        .winner-card { background: linear-gradient(135deg, #ffffff 0%, #fef3c7 100%); border: 2px solid #fbbf24; }
        .cta-button { background-color: #c41e3a; }
        .cta-button:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(196, 30, 58, 0.35); background-color: #a01830; }
        
        .article-content h2 { font-family: 'Montserrat', sans-serif; font-size: 1.75rem; font-weight: 700; color: #1a1a1a; margin: 2.5rem 0 1rem; border-bottom: 2px solid #f3f4f6; padding-bottom: 0.5rem; }
        .article-content h3 { font-family: 'Montserrat', sans-serif; font-size: 1.25rem; font-weight: 600; color: #374151; margin: 2rem 0 0.75rem; }
        .article-content p { font-size: 1.125rem; line-height: 1.85; color: #4b5563; margin-bottom: 1.25rem; }
        .article-content ul { margin: 1.25rem 0; padding-left: 1.5rem; list-style: disc; }
        .article-content li { font-size: 1.125rem; line-height: 1.7; color: #4b5563; margin-bottom: 0.5rem; }
        ${settings?.custom_css || ''}
      `}</style>
      
      {/* HEADER */}
      <header className="w-full bg-brand-black text-white py-4 px-6 shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
              <Link to="/" className="font-heading font-bold text-xl tracking-tight text-brand-gold hover:text-white transition-colors">
                  {category.site_name || 'Rank-Scout'}
              </Link>
              <nav className="hidden md:flex items-center space-x-6 text-sm">
                  <Link to="/kategorien" className="hover:text-brand-gold transition-colors">Kategorien</Link>
                  <Link to="/forum" className="hover:text-brand-gold transition-colors">Forum</Link>
              </nav>
              <Link to="/kategorien" className="text-sm bg-brand-primary text-white px-4 py-2 rounded-full transition-all duration-300 hover:bg-white hover:text-brand-primary font-bold">
                  Vergleich starten
              </Link>
          </div>
      </header>

      {/* BREADCRUMBS */}
      <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-4">
              <nav className="text-sm text-gray-500 flex flex-wrap items-center gap-2">
                  <Link to="/" className="hover:text-brand-primary transition-colors">Startseite</Link>
                  <i className="fas fa-chevron-right text-xs text-gray-300"></i>
                  <Link to="/kategorien" className="hover:text-brand-primary transition-colors">Kategorien</Link>
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
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-brand-primary rounded-full text-sm font-medium border border-red-100">
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
                          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
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
                  <div className="article-content bg-white p-8 rounded-2xl shadow-sm border border-gray-100" dangerouslySetInnerHTML={{ __html: category.description || category.long_content_top || '<p>Inhalt wird geladen...</p>' }} />
                  
                  {category.long_content_bottom && (
                      <div className="article-content mt-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100" dangerouslySetInnerHTML={{ __html: category.long_content_bottom }} />
                  )}
                  
                  {/* PROS & CONS */}
                  {topProject && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
                          <div className="bg-green-50 border-l-4 border-green-500 rounded-2xl p-6 shadow-sm">
                              <h3 className="font-heading font-bold text-lg text-green-800 flex items-center gap-2 mb-4">
                                  <i className="fas fa-check-circle"></i> Vorteile
                              </h3>
                              <ul className="space-y-2 text-green-900">
                                  {pros.length > 0 ? pros.map((pro, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                          <i className="fas fa-check text-green-600 mt-1 text-sm"></i><span>{pro}</span>
                                      </li>
                                  )) : (
                                    <li className="text-green-800/70 italic">Starke Performance</li>
                                  )}
                              </ul>
                          </div>
                          <div className="bg-red-50 border-l-4 border-red-500 rounded-2xl p-6 shadow-sm">
                              <h3 className="font-heading font-bold text-lg text-red-800 flex items-center gap-2 mb-4">
                                  <i className="fas fa-times-circle"></i> Nachteile
                              </h3>
                              <ul className="space-y-2 text-red-900">
                                  {cons.length > 0 ? cons.map((con, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                          <i className="fas fa-times text-red-600 mt-1 text-sm"></i><span>{con}</span>
                                      </li>
                                  )) : (
                                    <li className="text-red-800/70 italic">Kaum Schwächen</li>
                                  )}
                              </ul>
                          </div>
                      </div>
                  )}

                  {/* AUTHOR */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 mt-12 shadow-sm">
                      <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-rose-400 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                            RS
                          </div>
                          <div>
                              <p className="font-heading font-bold text-gray-900">Rank-Scout Redaktion</p>
                              <p className="text-sm text-gray-500">Unser Expertenteam testet und bewertet Anbieter objektiv und unabhängig.</p>
                          </div>
                      </div>
                  </div>
              </article>
              
              {/* SIDEBAR */}
              <aside className="lg:col-span-1">
                  <div className="sticky top-24 space-y-6">
                      
                      {/* WINNER CARD */}
                      {topProject && (
                          <div className="winner-card rounded-2xl shadow-xl p-6 bg-white relative overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                              <div className="flex items-center gap-2 mb-4 justify-center">
                                  <span className="bg-gradient-to-r from-brand-gold to-yellow-500 text-white font-bold px-4 py-1.5 rounded-full text-sm shadow-md">
                                      <i className="fas fa-trophy mr-1"></i> Testsieger
                                  </span>
                              </div>
                              <div className="text-center">
                                  {topProject.logo_url ? (
                                    <img src={sanitizeUrl(topProject.logo_url)} alt={topProject.name} className="h-20 w-auto mx-auto mb-4 object-contain mix-blend-multiply" />
                                  ) : (
                                    <div className="h-20 flex items-center justify-center text-xl font-bold text-gray-400">{topProject.name}</div>
                                  )}
                                  
                                  <h3 className="font-heading font-bold text-xl text-gray-900 mb-2">{topProject.name}</h3>
                                  <p className="text-4xl font-extrabold text-brand-primary mb-6">{ratingOverall.toFixed(1)}<span className="text-lg text-gray-400 font-normal">/10</span></p>
                                  
                                  <Link to={`/go/${topProject.id}`} target="_blank" rel="nofollow" className="cta-button block w-full text-white text-center font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-brand-primary/30">
                                      Zum Anbieter <i className="fas fa-external-link-alt ml-2"></i>
                                  </Link>
                                  <p className="text-xs text-gray-400 mt-3 text-center">Sicherer Link & verifiziert</p>
                              </div>
                          </div>
                      )}
                      
                      {/* NEWSLETTER */}
                      <div className="bg-[#1a1a1a] rounded-2xl shadow-lg p-6 text-white border border-gray-800">
                          <h3 className="font-heading font-bold text-lg mb-2 flex items-center"><i className="fas fa-envelope mr-2 text-brand-gold"></i>Newsletter</h3>
                          <p className="text-sm text-gray-400 mb-4">Neue Testberichte & exklusive Deals direkt in dein Postfach.</p>
                          <div className="space-y-3">
                              <input type="email" placeholder="deine@email.de" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all" />
                              <button className="w-full bg-brand-gold hover:bg-yellow-400 text-black font-bold py-3 px-4 rounded-xl transition-colors shadow-lg">Kostenlos anmelden</button>
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
                      {popularLinks.map((l, i) => <Link key={i} to={sanitizeUrl(l.url)} className="text-gray-400 hover:text-white text-sm transition-colors">{l.label}</Link>)}
                  </div>
              )}

              <div className="border-t border-white/10 my-8 mx-auto max-w-2xl"></div>

              <div className="flex flex-wrap justify-center gap-6 mb-6">
                  {legalLinks.map((l, i) => <Link key={i} to={sanitizeUrl(l.url)} className="text-amber-500 font-semibold text-sm uppercase hover:text-amber-400 transition-colors">{l.label}</Link>)}
              </div>

              <p className="text-gray-600 text-xs">{category.footer_copyright_text?.replace(/2026/g, year.toString()) || `© ${year} Rank-Scout. Alle Rechte vorbehalten.`}</p>
          </div>
      </footer>
    </div>
  );
};