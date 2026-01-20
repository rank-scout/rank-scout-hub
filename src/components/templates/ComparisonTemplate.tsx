import React from 'react';

// --- Typen definieren (für Sicherheit & Autocomplete) ---
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
}

interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  city_reference?: string;
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
  
  // Hero Section
  hero_pretitle?: string;
  hero_headline?: string;
  description?: string;
  hero_cta_text?: string;
  hero_badge_text?: string;
  
  // Content
  intro_title?: string; // Optional, Fallback auf generierten Titel
  long_content_top?: string;
  long_content_bottom?: string;
  
  // Design & Branding
  site_name?: string;
  footer_site_name?: string;
  footer_copyright_text?: string;
  footer_designer_name?: string;
  footer_designer_url?: string;
  
  // Features / Overrides
  banner_override?: string;
  analytics_code?: string;
  sticky_cta_text?: string;
  sticky_cta_link?: string;
  
  // Popup
  popup_headline?: string;
  popup_text?: string;
  popup_link?: string;
}

interface TemplateProps {
  category: CategoryData;
  projects: Project[];
  testimonials: Testimonial[];
  settings: any; // Globale Settings
  legalLinks: FooterLink[];
  popularLinks: FooterLink[];
}

export const ComparisonTemplate: React.FC<TemplateProps> = ({ 
  category, 
  projects, 
  testimonials, 
  settings, 
  legalLinks, 
  popularLinks 
}) => {
  const year = new Date().getFullYear();
  const locationName = category.name.replace(/^Singles\s*/i, '').trim();

  // Helper: Sichere URLs
  const sanitizeUrl = (url: string | undefined) => {
    if (!url) return '#';
    try {
      // Erlaube relative Links oder http/https
      if (url.startsWith('/') || url.startsWith('#')) return url;
      const p = new URL(url);
      return ['http:', 'https:'].includes(p.protocol) ? url : '#';
    } catch { return '#'; }
  };

  // Helper: SubID anhängen (für Affiliate Links)
  const addSubId = (link: string | undefined) => {
    if (!link) return '#';
    if (link.startsWith('#')) return link; // Anker-Links nicht ändern
    return link + (link.includes('?') ? '&' : '?') + 'subid=' + (category.slug || 'rank-scout');
  };

  return (
    <html lang="de">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href={`https://dating.rank-scout.com/${category.slug}/`} />

        {/* Favicons (Global) */}
        <link rel="icon" href="https://dating.rank-scout.com/top3-dating-apps/images/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="https://dating.rank-scout.com/top3-dating-apps/images/favicon-32x32.png" />
        
        {/* SEO */}
        <title>{(category.meta_title || `Singles ${locationName} | Beste Dating Apps 2026`).replace(/2026/g, year.toString())}</title>
        <meta name="description" content={(category.meta_description || '').replace(/2026/g, year.toString())} />
        <meta name="robots" content="index, follow" />

        {/* Fonts & Styles */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" />
        
        {/* Tailwind & FontAwesome */}
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

        {/* Tailwind Config & Custom Styles */}
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
            .hero-gradient { background: linear-gradient(135deg, #0a0a0a 0%, #7f1d1d 45%, #c41e3a 100%); }
            .btn-gold-hover:hover { background: linear-gradient(45deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c); transform: translateY(-2px); box-shadow: 0 0 20px rgba(212, 175, 55, 0.6); }
            .top-bar { background: linear-gradient(90deg, #c41e3a, #ff4d6d); }
            .testimonial-card:hover { transform: translateY(-4px); }
            ${settings?.custom_css || ''}
          `
        }} />

        {/* JSON-LD Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": category.meta_title || `Singles ${locationName}`,
            "url": `https://dating.rank-scout.com/${category.slug}/`,
            "numberOfItems": projects.length,
            "itemListElement": projects.map((p, i) => ({
              "@type": "ListItem",
              "position": i + 1,
              "name": p.name,
              "url": addSubId(p.affiliate_link || p.url)
            }))
          })
        }} />
      </head>
      
      <body className="font-sans antialiased text-gray-800 bg-brand-bg">
        
        {/* TOP BAR */}
        {settings?.top_bar_active && (
          <div id="top-bar" className="top-bar text-white text-center py-2 px-4 text-sm font-medium hidden fixed top-0 left-0 right-0 z-[60]" style={{display: 'block'}}> {/* Serverseitig direkt sichtbar */}
            <a href={addSubId(settings.top_bar_link)} className="hover:underline">
              <span>{settings.top_bar_text || '🔥 Jetzt kostenlos anmelden!'}</span>
            </a>
            <button onclick="closeTopBar()" className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white">
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {/* HEADER */}
        <header id="main-header" className="w-full bg-brand-black text-white py-3 px-4 shadow-md sticky top-0 z-50" style={{ top: settings?.top_bar_active ? '36px' : '0' }}>
          <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <a href="/" className="font-heading font-bold text-xl tracking-tight text-brand-gold hover:text-brand-light transition-colors">
              {category.site_name || `Singles${locationName}AT`}
            </a>
            <nav className="hidden md:flex items-center space-x-2 text-sm">
                <a href="/singles-in-der-naehe/" className="hover:text-brand-gold transition-colors">Singles in der Nähe</a>
                <span className="text-gray-500">|</span>
                <a href="/top3-dating-apps/" className="hover:text-brand-gold transition-colors">Top3 Apps</a>
            </nav>
            <a href="/" className="text-xs bg-brand-primary hover:bg-brand-light text-white px-3 py-1.5 rounded-full transition-all duration-300">
              Zum Hauptportal
            </a>
          </div>
        </header>

        {/* BREADCRUMBS */}
        <div className="bg-gray-100 py-3">
            <div className="max-w-6xl mx-auto px-4">
                <nav className="text-sm text-gray-500 flex flex-wrap items-center gap-2">
                    <a href="/" className="hover:text-brand-gold">Startseite</a>
                    <i className="fas fa-chevron-right text-xs text-gray-400"></i>
                    <span className="text-gray-900 font-medium">{category.name}</span>
                </nav>
            </div>
        </div>

        {/* HERO SECTION */}
        <section className="hero-gradient py-16 md:py-24 relative overflow-hidden text-center">
            <div className="max-w-4xl mx-auto px-4 relative z-10">
                <p className="text-brand-gold text-sm md:text-base tracking-widest uppercase mb-4 font-heading">
                    <i className="fas fa-heart mr-2"></i>{category.h1_title?.replace(/2026/g, year.toString()) || `Singles in ${locationName} ${year}`}
                </p>
                <h1 className="font-heading font-bold text-3xl md:text-5xl lg:text-6xl text-white leading-tight mb-6">
                    {category.hero_pretitle || 'Finde Singles in'} <br/>
                    <span className="text-brand-gold">{category.hero_headline || `${locationName} & Umgebung`}</span>
                </h1>
                <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                    {category.description || 'Finde jetzt die besten Dating-Seiten für deine Region.'}
                </p>
                <a href="#vergleich" className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-luxury text-brand-black font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                    <i className="fas fa-search"></i>
                    <span>{category.hero_cta_text || 'Singles finden'}</span>
                </a>
                <p className="text-gray-400 text-xs mt-6">
                    <i className="fas fa-check-circle text-green-400 mr-1"></i>
                    <span>{category.hero_badge_text || `Geprüft für ${locationName}`}</span>
                </p>
            </div>
        </section>

        {/* INTRO & QUICK NAV */}
        <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 mb-4">
                        {category.intro_title || `Dein Dating-Guide für ${locationName}`}
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Static Feature Cards (könnten auch dynamisch sein, aber wir behalten das Layout bei) */}
                        <div className="p-6 rounded-xl border border-gray-100 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                            <i className="fas fa-user-secret text-brand-primary text-2xl mb-3"></i>
                            <h3 className="font-bold text-lg mb-2">Diskret & Sicher</h3>
                            <p className="text-sm text-gray-600">Geprüfte Portale mit hohem Datenschutz.</p>
                        </div>
                        <div className="p-6 rounded-xl border border-gray-100 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                            <i className="fas fa-map-marker-alt text-brand-primary text-2xl mb-3"></i>
                            <h3 className="font-bold text-lg mb-2">Regional</h3>
                            <p className="text-sm text-gray-600">Singles direkt aus {locationName} und Umgebung.</p>
                        </div>
                    </div>
                    {/* Banner Slot */}
                    <div className="flex items-center justify-center">
                        <div className="w-full" dangerouslySetInnerHTML={{ __html: category.banner_override || '<div class="ad-box rounded-xl bg-gray-100 p-8 text-center text-gray-500 border">Werbefläche</div>' }} />
                    </div>
                </div>

                {/* Quick Navigation Box */}
                <div className="mt-12 bg-gray-50 rounded-2xl p-6 md:p-8">
                    <h3 className="font-heading font-bold text-lg text-gray-900 mb-4">Beliebte Themen</h3>
                    <div className="flex flex-wrap gap-3">
                        {/* Statische Links wie im Original-Template */}
                        <a href="/top3-dating-apps/" className="bg-white px-4 py-2 rounded-full text-sm hover:shadow-md border"><i className="fas fa-star text-brand-gold mr-2"></i>Top 3 Apps</a>
                        <a href="/singles-in-der-naehe/" className="bg-white px-4 py-2 rounded-full text-sm hover:shadow-md border"><i className="fas fa-location-dot text-brand-primary mr-2"></i>In der Nähe</a>
                    </div>
                </div>
            </div>
        </section>

        {/* COMPARISON LIST */}
        <section id="vergleich" className="py-16 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-10">
                    <h2 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 mb-2">
                        Top Apps für Singles in {locationName}
                    </h2>
                </div>

                <div className="space-y-6">
                    {projects.length > 0 ? projects.map((p, idx) => {
                        const isFirst = idx === 0;
                        return (
                            <div key={p.id} className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden ${isFirst ? 'border-2 border-brand-gold ring-2 ring-brand-gold/20' : 'border border-gray-100'}`}>
                                {isFirst && (
                                    <div className="p-1">
                                        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-brand-gold to-yellow-500 text-brand-black">
                                            <i className="fas fa-trophy mr-1"></i>{p.badge_text || 'Testsieger'}
                                        </span>
                                    </div>
                                )}
                                <div className="p-4 md:p-6 pt-2">
                                    <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center">
                                        <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shadow-md">
                                            <img src={sanitizeUrl(p.logo_url)} alt={p.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <h3 className="font-heading font-bold text-xl text-gray-900">{p.name}</h3>
                                            <div className="flex items-center justify-center md:justify-start gap-2 my-2">
                                                <div className="flex text-brand-gold"><i className="fas fa-star"></i></div>
                                                <span className="font-bold">{p.rating}/10</span>
                                            </div>
                                            <div className="text-sm text-gray-600 space-y-1">
                                                {p.features?.map((f, i) => (
                                                    <p key={i} className="flex items-center justify-center md:justify-start gap-2">
                                                        <i className="fas fa-check text-green-500"></i> {f}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="w-full md:w-auto">
                                            <a href={addSubId(p.affiliate_link || p.url)} target="_blank" rel="nofollow" className="block w-full md:w-auto bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-6 rounded-full text-center transition-all btn-gold-hover">
                                                Kostenlos Testen <i className="fas fa-arrow-right ml-1"></i>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <p className="text-center text-gray-500">Aktuell keine Projekte gelistet.</p>
                    )}
                </div>
                <p className="text-center text-gray-500 text-xs mt-8">*Werbung / Affiliate Links</p>
            </div>
        </section>

        {/* TESTIMONIALS (Server Side Rendered) */}
        {testimonials.length > 0 && (
            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="font-heading font-bold text-2xl text-center mb-10">Das sagen Nutzer aus {locationName}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map(t => (
                            <div key={t.id} className="testimonial-card bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <div className="text-brand-gold text-sm mb-3">
                                    {[...Array(Math.round(t.rating || 5))].map((_, i) => <i key={i} className="fas fa-star"></i>)}
                                </div>
                                <p className="text-gray-700 italic text-sm mb-4">"{t.text}"</p>
                                <div className="font-bold text-sm text-gray-900">- {t.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )}

        {/* LONG CONTENT */}
        <section className="py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4">
                <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: category.long_content_top || '' }} />
                <div className="prose prose-lg max-w-none mt-8" dangerouslySetInnerHTML={{ __html: category.long_content_bottom || '' }} />
            </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-[#0a0a0a] border-t border-white/5 py-12 text-center">
            <div className="max-w-6xl mx-auto px-4">
                <span className="font-heading font-bold text-2xl text-white mb-8 block">
                    {category.footer_site_name || 'Rank-Scout'}
                </span>
                
                {/* Popular Links */}
                {popularLinks.length > 0 && (
                    <div className="mb-8 flex flex-wrap justify-center gap-4">
                        {popularLinks.map((l, i) => (
                            <a key={i} href={sanitizeUrl(l.url)} className="text-gray-400 hover:text-white text-sm">{l.label}</a>
                        ))}
                    </div>
                )}

                <div className="border-t border-white/10 my-8 mx-auto max-w-2xl"></div>

                {/* Legal Links */}
                <div className="flex flex-wrap justify-center gap-6 mb-6">
                    {legalLinks.map((l, i) => (
                        <a key={i} href={sanitizeUrl(l.url)} className="text-amber-500 font-semibold text-sm uppercase hover:text-amber-400">
                            {l.label}
                        </a>
                    ))}
                </div>

                <p className="text-gray-500 text-xs">
                    {category.footer_copyright_text?.replace(/2026/g, year.toString()) || `© ${year} Rank-Scout. Alle Rechte vorbehalten.`}
                </p>
            </div>
        </footer>

        {/* ANALYTICS & SCRIPTS */}
        {category.analytics_code && (
            <div dangerouslySetInnerHTML={{ __html: category.analytics_code }} />
        )}

        {/* CLIENT SIDE INTERACTIVITY SCRIPTS */}
        <script dangerouslySetInnerHTML={{
          __html: `
            function closeTopBar() {
                document.getElementById('top-bar').style.display = 'none';
                document.getElementById('main-header').style.top = '0';
                sessionStorage.setItem('top_bar_closed', 'true');
            }
            if(sessionStorage.getItem('top_bar_closed')) closeTopBar();
          `
        }} />
      </body>
    </html>
  );
};