import React from 'react';
import { Spin } from "@/components/Spin";

// --- Interfaces ---
interface Project {
  id: string;
  name: string;
  url: string;
  affiliate_link: string;
  logo_url: string;
  rating: number;
  rating_count?: string;
  badge_text?: string;
  features?: string[];
  description?: string;
}

interface FooterLink {
  label: string;
  url: string;
}

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  meta_title?: string;
  meta_description?: string;
  h1_title?: string;
  hero_pretitle?: string;
  hero_headline?: string;
  description?: string;
  hero_cta_text?: string;
  hero_badge_text?: string;
  intro_title?: string;
  long_content_top?: string;
  long_content_bottom?: string;
  site_name?: string;
  footer_site_name?: string;
  footer_copyright_text?: string;
  banner_override?: string;
  analytics_code?: string;
}

interface TemplateProps {
  category: CategoryData;
  projects: Project[];
  settings: any;
  legalLinks: FooterLink[];
  popularLinks: FooterLink[];
}

export const NewComparisonTemplate: React.FC<TemplateProps> = ({
  category,
  projects,
  settings,
  legalLinks,
  popularLinks
}) => {
  const year = new Date().getFullYear();
  
  // --- INTELLIGENTE KEYWORD LOGIK ---
  const topicOrCity = category.name.replace(/^Singles\s(in\s)?/i, '').trim();
  const isCityPage = /Wien|Graz|Linz|Salzburg|Innsbruck|Klagenfurt|Villach|Wels|St\. Pölten|Dornbirn/i.test(topicOrCity);

  // Helper: SEO URLs
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

  // --- SCHEMA GENERATOR ---
  const faqSchema = [];
  if (category.long_content_bottom && category.long_content_bottom.includes('<details')) {
     const regex = /<summary[^>]*>(.*?)<\/summary>[\s\S]*?<div[^>]*>(.*?)<\/div>/g;
     let match;
     while ((match = regex.exec(category.long_content_bottom)) !== null) {
         faqSchema.push({
             "@type": "Question",
             "name": match[1].replace(/<[^>]*>?/gm, '').trim(),
             "acceptedAnswer": { "@type": "Answer", "text": match[2].trim() }
         });
     }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Startseite", "item": "https://dating.rank-scout.com/" },
          { "@type": "ListItem", "position": 2, "name": category.name, "item": `https://dating.rank-scout.com/${category.slug}/` }
        ]
      },
      {
        "@type": "CollectionPage",
        "name": category.meta_title || `Vergleich: ${category.name}`,
        "description": category.meta_description,
        "url": `https://dating.rank-scout.com/${category.slug}/`,
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": projects.map((p, i) => ({
                "@type": "ListItem",
                "position": i + 1,
                "url": addSubId(p.affiliate_link),
                "name": p.name
            }))
        }
      },
      ...(faqSchema.length > 0 ? [{ "@type": "FAQPage", "mainEntity": faqSchema }] : [])
    ]
  };

  return (
    <html lang="de" className="scroll-smooth">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href={`https://dating.rank-scout.com/${category.slug}/`} />

        <link rel="icon" href="https://dating.rank-scout.com/top3-dating-apps/images/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="16x16" href="https://dating.rank-scout.com/top3-dating-apps/images/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="https://dating.rank-scout.com/top3-dating-apps/images/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="https://dating.rank-scout.com/top3-dating-apps/images/apple-touch-icon.png" />

        <title>{(category.meta_title || `${category.name} im Test ${year} | Die Top Anbieter`).replace(/2026/g, year.toString())}</title>
        <meta name="description" content={(category.meta_description || `Der große Vergleich für ${category.name}. Wir haben die besten Anbieter getestet. Unabhängig, aktuell und seriös.`).replace(/2026/g, year.toString())} />
        <meta name="robots" content="index, follow" />

        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" />

        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
                theme: {
                    extend: {
                        colors: {
                            brand: {
                                black: '#1f2937', primary: '#ef4444', gold: '#fbbf24', platinum: '#f3f4f6', bg: '#ffffff'
                            }
                        },
                        fontFamily: { sans: ['Open Sans', 'sans-serif'], heading: ['Montserrat', 'sans-serif'] },
                        animation: { 'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' }
                    }
                }
            }
          `
        }} />

        <style dangerouslySetInnerHTML={{
          __html: `
            .hero-gradient { background: linear-gradient(135deg, #1f2937 0%, #991b1b 50%, #ef4444 100%); }
            .btn-modern { transition: all 0.3s ease; position: relative; z-index: 1; overflow: hidden; }
            .btn-modern:hover { transform: translateY(-2px); box-shadow: 0 10px 20px -10px rgba(0,0,0,0.2); }
            .ad-box { width: 300px; height: 250px; background-color: #f3f4f6; border: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: center; position: relative; margin: 0 auto; }
            .ad-label { position: absolute; top: 0; right: 0; background: #e5e7eb; color: #6b7280; font-size: 10px; padding: 2px 5px; text-transform: uppercase; }
            
            /* --- FORCE CENTER ALIGNMENT --- */
            .prose { width: 100%; max-width: none; text-align: center !important; }
            .prose > * { margin-left: auto; margin-right: auto; text-align: center !important; }
            .prose p, .prose h1, .prose h2, .prose h3, .prose h4, .prose strong, .prose li { text-align: center !important; }
            .prose ul, .prose ol { display: inline-block; text-align: left; }
            
            /* --- FAQ FIXES (Pfeil weg, Text mittig) --- */
            details { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.5rem; margin-bottom: 1rem; overflow: hidden; text-align: center; }
            
            summary { 
                padding: 1rem; cursor: pointer; font-weight: 600; 
                display: flex; justify-content: center; align-items: center; gap: 10px; 
                position: relative; outline: none; list-style: none; /* WICHTIG */
            }
            
            /* Entfernt den Standard-Pfeil in Webkit (Chrome/Safari) */
            summary::-webkit-details-marker { display: none; }
            /* Entfernt Marker generell */
            summary::marker { display: none; content: ""; }
            
            /* Unser Custom Plus-Zeichen */
            summary:after { content: '+'; font-size: 1.5rem; color: #ef4444; font-weight: bold; line-height: 1; }
            details[open] summary:after { content: '-'; }
            
            /* Antwort-Text */
            details > div { padding: 1.5rem; border-top: 1px solid #e5e7eb; color: #4b5563; line-height: 1.6; text-align: center !important; }
            
            ${settings?.custom_css || ''}
          `
        }} />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      
      <body className="font-sans text-gray-800 bg-brand-bg antialiased">
        
        {/* NAV */}
        <nav className="fixed w-full z-50 bg-white/95 backdrop-blur shadow-sm transition-all duration-300 border-b border-gray-100">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <a href="/" className="font-heading font-bold text-2xl text-brand-black tracking-tighter hover:opacity-90 transition-opacity">
                    {category.site_name || <>{isCityPage ? 'DatingApps' : 'Vergleich'}<span className="text-brand-primary">AT</span></>}
                </a>
                <a href="/" className="hidden md:block btn-modern bg-brand-primary text-white px-6 py-2 rounded-full font-semibold text-sm shadow-md hover:bg-red-600">
                    Zum Hauptportal
                </a>
            </div>
        </nav>

        {/* HERO */}
        <header className="relative hero-gradient min-h-[60vh] flex items-center justify-center text-white pt-28 pb-12 overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
            
            <div className="container mx-auto px-4 relative z-30 text-center max-w-4xl">
                <span className="inline-flex items-center py-1.5 px-5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-sm font-semibold tracking-wide uppercase mb-6 shadow-sm">
                    <i className="fas fa-trophy mr-2 text-brand-gold animate-pulse"></i> 
                    {category.hero_badge_text || <><Spin options={['Top Empfehlungen', 'Der große Vergleich', 'Aktuell & Geprüft', 'Marktanalyse']} /> {year}</>}
                </span>
                
                <h1 className="font-heading text-4xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-lg text-white">
                    {category.hero_pretitle || <Spin options={['Finde', 'Entdecke', 'Wähle', 'Vergleiche']} />} 
                    {' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-red-500 to-brand-gold">
                        {category.hero_headline || <Spin options={['die besten Angebote', 'Top Plattformen', 'Testsieger']} />}
                    </span> 
                    {' '}
                    {!category.hero_headline && <>für {category.name}</>}
                </h1>
                
                <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed font-normal">
                    {category.description || (
                        <>
                            <Spin options={['Wir haben den Markt analysiert:', 'Endlich Klarheit:', 'Unsere Redaktion hat getestet:', 'Der große Report:']} />
                            {' '}
                            Finde jetzt heraus, welche Anbieter für <strong>{category.name}</strong> wirklich funktionieren. 
                            {' '}
                            <Spin options={['Vermeide Fakes.', 'Spare Zeit.', 'Finde echte Kontakte.', 'Erhöhe deine Chancen.']} />
                        </>
                    )}
                </p>
                
                <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                    <a href="#vergleich" className="btn-modern bg-white text-brand-primary px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-gray-100">
                        {category.hero_cta_text || <Spin options={['Ergebnisse ansehen', 'Zum Vergleich', 'Jetzt starten', 'Top 5 anzeigen']} />}
                    </a>
                </div>
                
                <p className="text-xs text-white/80 mt-6 font-semibold tracking-wider uppercase flex justify-center items-center gap-2">
                    <i className="fas fa-check-circle text-brand-gold"></i> 
                    <Spin options={['Unabhängig & Objektiv', 'Redaktionell geprüft', '100% Seriös', 'Datenstand 2026']} />
                </p>
            </div>
        </header>

        {/* VERGLEICH */}
        <section id="vergleich" className="py-20 bg-white relative">
            <div className="container mx-auto px-4 relative z-10">
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
                    {category.intro_title || <><Spin options={['Unsere Empfehlungen', 'Die Top-Liste', 'Das Ranking']} /> für {topicOrCity}</>}
                </h2>
                <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
                    Sortiert nach Relevanz, Erfolgsaussichten und Seriosität im Jahr {year}.
                </p>

                <div className="flex flex-col gap-8 max-w-4xl mx-auto">
                    {projects.length > 0 ? projects.map((p, idx) => {
                        const isFirst = idx === 0;
                        return (
                            <div key={p.id} className={`relative bg-white rounded-2xl shadow-sm border p-6 md:p-8 transition-all ${isFirst ? 'border-brand-primary/20 shadow-xl transform md:scale-105 z-10' : 'border-gray-100 hover:border-brand-primary/50 hover:shadow-md'}`}>
                                {isFirst && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-brand-primary to-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-xl uppercase tracking-wider shadow-md">
                                        <i className="fas fa-crown text-brand-gold mr-1"></i> <Spin options={['Testsieger', 'Empfehlung', 'Top Wahl']} />
                                    </div>
                                )}
                                {!isFirst && (
                                    <div className="absolute top-0 right-0 bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-bl-lg">
                                        Platz {idx + 1}
                                    </div>
                                )}

                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center p-2 border border-gray-100 overflow-hidden shadow-sm">
                                        <a href={addSubId(p.affiliate_link)} target="_blank" rel="nofollow sponsored noopener">
                                            <img src={sanitizeUrl(p.logo_url)} alt={p.name} className="w-full h-full object-contain" />
                                        </a>
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="font-heading text-2xl font-bold text-gray-900">{p.name}</h3>
                                        <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 my-3">
                                            <div className="flex text-brand-gold text-sm">
                                                {[...Array(5)].map((_, i) => (
                                                    <i key={i} className={`fas fa-star${i < Math.floor(p.rating) ? '' : '-half-alt'}`}></i>
                                                ))}
                                            </div>
                                            <span className="text-gray-900 font-bold text-sm">{p.rating} / 10</span>
                                            {p.badge_text && (
                                                <span className="text-xs text-brand-primary bg-red-50 px-2 py-0.5 rounded font-semibold border border-red-100">
                                                    {p.badge_text}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">{p.description || <Spin options={['Starke Community.', 'Hohe Erfolgsquote.', 'Viele aktive Mitglieder.', 'Sehr beliebt aktuell.']} />}</p>
                                        {p.features && p.features.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                                                {p.features.slice(0, 2).map((f, i) => (
                                                    <span key={i} className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100"><i className="fas fa-check text-green-500 mr-1"></i>{f}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-full md:w-auto">
                                        <a href={addSubId(p.affiliate_link)} target="_blank" rel="nofollow sponsored noopener" className={`w-full inline-block text-center btn-modern font-bold py-3 px-8 rounded-lg shadow-md ${isFirst ? 'bg-brand-primary text-white hover:bg-red-600' : 'bg-gray-800 text-white hover:bg-gray-700'}`}>
                                            Jetzt Testen
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : <p className="text-center text-gray-500">Keine Projekte gefunden.</p>}
                </div>
                <p className="text-center text-[10px] text-gray-400 mt-6 uppercase tracking-widest">
                    *Werbung / Affiliate Links
                </p>
            </div>
        </section>

        {/* CONTENT & FAQ SECTION */}
        <section id="faq" className="py-16 bg-gray-50 border-t border-gray-200">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-12 items-start max-w-6xl mx-auto">
                    
                    {/* Main Content: Zentriert */}
                    <div className="w-full lg:w-2/3 prose prose-red max-w-none mx-auto text-center flex flex-col items-center">
                        <div className="w-full text-center" dangerouslySetInnerHTML={{ __html: category.long_content_top || '' }} />
                        
                        {!category.long_content_top && (
                            <div className="bg-white p-6 rounded-xl border border-gray-200 mb-8 w-full text-center">
                                <h3 className="font-bold text-xl mb-2">Schnell-Check: {category.name}</h3>
                                <p>Hier findest du bald ausführliche Informationen, Statistiken und Insider-Tipps zum Thema {category.name}.</p>
                            </div>
                        )}

                        <div className="mt-8 w-full text-center" dangerouslySetInnerHTML={{ __html: category.long_content_bottom || '' }} />
                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-1/3 flex justify-center lg:justify-end">
                        <div className="flex flex-col w-full max-w-[320px] sticky top-24 gap-6">
                            
                            {/* BANNER OVERRIDE */}
                            <div className="ad-box shadow-sm rounded-lg overflow-hidden relative bg-white" dangerouslySetInnerHTML={{ 
                                __html: category.banner_override || `
                                    <span class="ad-label">Tipp</span>
                                    <div class="text-center p-8 text-gray-400 text-sm flex flex-col items-center justify-center h-full">
                                        <i class="fas fa-heart text-4xl text-gray-200 mb-2"></i>
                                        <span>Platz für Banner</span>
                                    </div>
                                ` 
                            }} />
                            
                            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                                <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider text-center">Inhalt</h4>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li><a href="#vergleich" className="hover:text-brand-primary flex items-center justify-center"><i className="fas fa-angle-right mr-2 text-gray-300"></i> Top Ranking</a></li>
                                    <li><a href="#faq" className="hover:text-brand-primary flex items-center justify-center"><i className="fas fa-angle-right mr-2 text-gray-300"></i> Häufige Fragen</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-white pt-16 pb-8 border-t border-gray-200 text-gray-600 text-center">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 text-center">
                    <div className="col-span-1 flex flex-col items-center">
                        <span className="font-heading font-extrabold text-2xl text-gray-900 block mb-4">
                            {category.footer_site_name || 'Rank-Scout'}
                        </span>
                        <p className="text-xs text-gray-500 leading-relaxed mb-6">
                            Dein unabhängiger Vergleich für {category.name}. Wir prüfen Anbieter auf Herz und Nieren.
                        </p>
                    </div>
                    
                    <div className="col-span-1 flex flex-col items-center">
                        <h4 className="text-gray-900 text-xs font-bold uppercase tracking-widest mb-4">Beliebte Kategorien</h4>
                        <ul className="space-y-2 text-xs">
                            {popularLinks.map((l, i) => (
                                <li key={i}><a href={sanitizeUrl(l.url)} className="hover:text-brand-primary transition-colors">{l.label}</a></li>
                            ))}
                        </ul>
                    </div>

                    <div className="col-span-1 flex flex-col items-center">
                        <h4 className="text-gray-900 text-xs font-bold uppercase tracking-widest mb-4">Rechtliches</h4>
                        <ul className="space-y-2 text-xs">
                            {legalLinks.map((l, i) => (
                                <li key={i}><a href={sanitizeUrl(l.url)} className="hover:text-brand-primary transition-colors">{l.label}</a></li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 text-center">
                    <p className="text-[10px] text-gray-500">
                        {category.footer_copyright_text?.replace(/2026/g, year.toString()) || `© ${year} Rank-Scout. Alle Rechte vorbehalten.`}
                    </p>
                </div>
            </div>
        </footer>

        {category.analytics_code && <div dangerouslySetInnerHTML={{ __html: category.analytics_code }} />}
      </body>
    </html>
  );
};