import React from 'react';
import { Spin } from "@/components/Spin";

// --- Interfaces ---
interface Project { id: string; name: string; url: string; affiliate_link: string; logo_url: string; rating: number; rating_count?: string; badge_text?: string; features?: string[]; description?: string; }
interface FooterLink { label: string; url: string; }
interface CategoryData { 
    id: string; name: string; slug: string; meta_title?: string; meta_description?: string; h1_title?: string; hero_pretitle?: string; hero_headline?: string; description?: string; hero_cta_text?: string; hero_badge_text?: string; intro_title?: string; long_content_top?: string; long_content_bottom?: string; site_name?: string; footer_site_name?: string; footer_copyright_text?: string; banner_override?: string; analytics_code?: string;
    faq_data?: { question: string; answer: string }[]; // DAS IST NEU
}
interface TemplateProps { category: CategoryData; projects: Project[]; settings: any; legalLinks: FooterLink[]; popularLinks: FooterLink[]; }

export const NewComparisonTemplate: React.FC<TemplateProps> = ({ category, projects, settings, legalLinks, popularLinks }) => {
  const year = new Date().getFullYear();
  const topicOrCity = category.name.replace(/^Singles\s(in\s)?/i, '').trim();
  const isCityPage = /Wien|Graz|Linz|Salzburg|Innsbruck|Klagenfurt|Villach|Wels|St\. Pölten|Dornbirn/i.test(topicOrCity);
  const sanitizeUrl = (url: string | undefined) => { if (!url) return '#'; try { if (url.startsWith('/') || url.startsWith('#')) return url; const p = new URL(url); return ['http:', 'https:'].includes(p.protocol) ? url : '#'; } catch { return '#'; } };
  const addSubId = (link: string | undefined) => { if (!link) return '#'; if (link.startsWith('#')) return link; return link + (link.includes('?') ? '&' : '?') + 'subid=' + (category.slug || 'rank-scout'); };

  const staticLegalLinks = [
    { label: "Impressum", url: "https://dating.rank-scout.com/impressum.html" },
    { label: "Datenschutz", url: "https://dating.rank-scout.com/datenschutz.html" },
    { label: "AGB", url: "https://dating.rank-scout.com/agb.html" },
    { label: "Kontakt", url: "https://dating.rank-scout.com/kontakt.html" }
  ];

  // FAQ Schema Generator (nutzt jetzt das saubere JSON Array)
  const faqSchema = [];
  if (category.faq_data && Array.isArray(category.faq_data)) {
     category.faq_data.forEach(faq => {
         faqSchema.push({
             "@type": "Question",
             "name": faq.question,
             "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
         });
     });
  }

  const jsonLd = {
    "@context": "https://schema.org", "@graph": [
      { "@type": "BreadcrumbList", "itemListElement": [ { "@type": "ListItem", "position": 1, "name": "Startseite", "item": "https://dating.rank-scout.com/" }, { "@type": "ListItem", "position": 2, "name": category.name, "item": `https://dating.rank-scout.com/${category.slug}/` } ] },
      { "@type": "CollectionPage", "name": category.meta_title || `Vergleich: ${category.name}`, "description": category.meta_description, "url": `https://dating.rank-scout.com/${category.slug}/`, "mainEntity": { "@type": "ItemList", "itemListElement": projects.map((p, i) => ({ "@type": "ListItem", "position": i + 1, "url": addSubId(p.affiliate_link), "name": p.name })) } },
      ...(faqSchema.length > 0 ? [{ "@type": "FAQPage", "mainEntity": faqSchema }] : [])
    ]
  };

  return (
    <html lang="de" className="scroll-smooth">
      <head>
        <meta charSet="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href={`https://dating.rank-scout.com/${category.slug}/`} />
        <link rel="icon" href="https://dating.rank-scout.com/top3-dating-apps/images/favicon.ico" sizes="any" /><link rel="icon" type="image/png" sizes="16x16" href="https://dating.rank-scout.com/top3-dating-apps/images/favicon-16x16.png" />
        <title>{(category.meta_title || `${category.name} im Test ${year} | Die Top Anbieter`).replace(/2026/g, year.toString())}</title>
        <meta name="description" content={(category.meta_description || `Der große Vergleich für ${category.name}.`).replace(/2026/g, year.toString())} />
        <script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `tailwind.config = { theme: { extend: { colors: { brand: { black: '#1f2937', primary: '#ef4444', gold: '#fbbf24', platinum: '#f3f4f6', bg: '#ffffff' } }, fontFamily: { sans: ['Open Sans', 'sans-serif'], heading: ['Montserrat', 'sans-serif'] } } } }` }} />
        
        <style dangerouslySetInnerHTML={{ __html: `
            .hero-gradient { background: linear-gradient(135deg, #1f2937 0%, #991b1b 50%, #ef4444 100%); }
            .btn-modern { transition: all 0.3s ease; position: relative; z-index: 1; overflow: hidden; }
            .btn-modern:hover { transform: translateY(-2px); box-shadow: 0 10px 20px -10px rgba(0,0,0,0.2); }
            
            /* ZENTRIERUNG */
            .prose { width: 100% !important; max-width: 800px !important; margin: 0 auto !important; text-align: center !important; }
            .prose * { text-align: center !important; margin-left: auto !important; margin-right: auto !important; }
            .prose ul, .prose ol { display: inline-block; text-align: left !important; list-style-position: inside; }
            
            /* FAQ STYLING */
            details { background: #fff; border: 1px solid #e2e8f0; border-radius: 0.75rem; margin-bottom: 1rem; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
            summary { padding: 1.2rem; cursor: pointer; font-weight: 600; display: flex; justify-content: center; align-items: center; gap: 10px; list-style: none !important; color: #1e293b; appearance: none !important; }
            summary::-webkit-details-marker { display: none !important; }
            summary::marker { display: none !important; content: ""; }
            summary:after { content: '+'; font-size: 1.5rem; color: #ef4444; font-weight: 800; }
            details[open] summary:after { content: '-'; }
            details > div { padding: 1.5rem; border-top: 1px solid #f1f5f9; color: #475569; line-height: 1.7; }
            
            ${settings?.custom_css || ''}
        ` }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="font-sans text-gray-800 bg-gray-50 antialiased flex flex-col min-h-screen">
        
        {/* NAV */}
        <nav className="fixed w-full z-50 bg-white/95 backdrop-blur shadow-sm border-b border-gray-100">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <a href="/" className="font-heading font-bold text-2xl text-brand-black tracking-tighter hover:opacity-90 transition-opacity">{category.site_name || <>{isCityPage ? 'DatingApps' : 'Vergleich'}<span className="text-brand-primary">AT</span></>}</a>
                <a href="/" className="hidden md:block btn-modern bg-brand-primary text-white px-6 py-2 rounded-full font-semibold text-sm shadow-md hover:bg-red-600">Zum Hauptportal</a>
            </div>
        </nav>

        {/* HERO */}
        <header className="relative hero-gradient min-h-[55vh] flex items-center justify-center text-white pt-28 pb-16 overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
            <div className="container mx-auto px-4 relative z-30 text-center max-w-4xl">
                <span className="inline-flex items-center py-1.5 px-5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-sm font-semibold tracking-wide uppercase mb-6 shadow-sm"><i className="fas fa-trophy mr-2 text-brand-gold animate-pulse"></i> {category.hero_badge_text || <><Spin options={['Top Empfehlungen', 'Der große Vergleich', 'Aktuell & Geprüft', 'Marktanalyse']} /> {year}</>}</span>
                <h1 className="font-heading text-4xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-lg text-white">{category.hero_pretitle || <Spin options={['Finde', 'Entdecke', 'Wähle', 'Vergleiche']} />} <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-red-500 to-brand-gold">{category.hero_headline || <Spin options={['die besten Angebote', 'Top Plattformen', 'Testsieger']} />}</span> {!category.hero_headline && <>für {category.name}</>}</h1>
                <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed font-normal">{category.description || (<><Spin options={['Wir haben den Markt analysiert:', 'Endlich Klarheit:', 'Unsere Redaktion hat getestet:', 'Der große Report:']} /> Finde jetzt heraus, welche Anbieter für <strong>{category.name}</strong> wirklich funktionieren.</>)}</p>
                <div className="flex justify-center"><a href="#vergleich" className="btn-modern bg-white text-brand-primary px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-gray-100">{category.hero_cta_text || <Spin options={['Ergebnisse ansehen', 'Zum Vergleich', 'Jetzt starten']} />}</a></div>
            </div>
        </header>

        {/* VERGLEICH LISTE */}
        <section id="vergleich" className="py-20 bg-white relative -mt-8 rounded-t-[2.5rem] z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <div className="container mx-auto px-4 relative z-10">
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">{category.intro_title || <><Spin options={['Unsere Empfehlungen', 'Die Top-Liste', 'Das Ranking']} /> für {topicOrCity}</>}</h2>
                <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">Sortiert nach Relevanz, Erfolgsaussichten und Seriosität im Jahr {year}.</p>
                <div className="flex flex-col gap-8 max-w-4xl mx-auto">
                    {projects.length > 0 ? projects.map((p, idx) => {
                        const isFirst = idx === 0;
                        return (
                            <div key={p.id} className={`relative bg-white rounded-2xl shadow-sm border p-6 md:p-8 transition-all ${isFirst ? 'border-brand-primary/20 shadow-xl transform md:scale-105 z-10' : 'border-gray-100 hover:border-brand-primary/50 hover:shadow-md'}`}>
                                {isFirst && <div className="absolute top-0 right-0 bg-gradient-to-r from-brand-primary to-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-xl uppercase tracking-wider shadow-md"><i className="fas fa-crown text-brand-gold mr-1"></i> <Spin options={['Testsieger', 'Empfehlung', 'Top Wahl']} /></div>}
                                {!isFirst && <div className="absolute top-0 right-0 bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-bl-lg">Platz {idx + 1}</div>}
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center p-2 border border-gray-100 overflow-hidden shadow-sm"><a href={addSubId(p.affiliate_link)} target="_blank" rel="nofollow sponsored noopener"><img src={sanitizeUrl(p.logo_url)} alt={p.name} className="w-full h-full object-contain" /></a></div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="font-heading text-2xl font-bold text-gray-900">{p.name}</h3>
                                        <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 my-3">
                                            <div className="flex text-brand-gold text-sm">{[...Array(5)].map((_, i) => <i key={i} className={`fas fa-star${i < Math.floor(p.rating) ? '' : '-half-alt'}`}></i>)}</div>
                                            <span className="text-gray-900 font-bold text-sm">{p.rating} / 10</span>
                                            {p.badge_text && <span className="text-xs text-brand-primary bg-red-50 px-2 py-0.5 rounded font-semibold border border-red-100">{p.badge_text}</span>}
                                        </div>
                                        <p className="text-sm text-gray-600">{p.description || <Spin options={['Starke Community.', 'Hohe Erfolgsquote.']} />}</p>
                                        {p.features && p.features.length > 0 && <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">{p.features.slice(0, 2).map((f, i) => <span key={i} className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100"><i className="fas fa-check text-green-500 mr-1"></i>{f}</span>)}</div>}
                                    </div>
                                    <div className="w-full md:w-auto"><a href={addSubId(p.affiliate_link)} target="_blank" rel="nofollow sponsored noopener" className={`w-full inline-block text-center btn-modern font-bold py-3 px-8 rounded-lg shadow-md ${isFirst ? 'bg-brand-primary text-white hover:bg-red-600' : 'bg-gray-800 text-white hover:bg-gray-700'}`}>Jetzt Testen</a></div>
                                </div>
                            </div>
                        );
                    }) : <p className="text-center text-gray-500">Keine Projekte gefunden.</p>}
                </div>
                <p className="text-center text-[10px] text-gray-400 mt-6 uppercase tracking-widest">*Werbung / Affiliate Links</p>
            </div>
        </section>

        {/* WIDGETS */}
        <section className="py-12 bg-gray-50 border-t border-gray-200">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center h-full min-h-[200px]" dangerouslySetInnerHTML={{ 
                        __html: category.banner_override || `
                            <div class="text-center text-gray-400">
                                <i class="fas fa-bullhorn text-3xl mb-2 text-brand-primary/50"></i>
                                <p class="text-sm font-bold">Empfehlung der Redaktion</p>
                                <span class="text-xs">Hier könnte dein Banner stehen</span>
                            </div>
                        ` 
                    }} />
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h4 className="font-heading font-bold text-lg text-gray-900 mb-4 text-center border-b border-gray-100 pb-2">Inhaltsübersicht</h4>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li><a href="#vergleich" className="flex items-center justify-center hover:text-brand-primary transition-colors bg-gray-50 py-2 rounded-lg hover:bg-gray-100"><i className="fas fa-list-ol mr-2 text-brand-primary"></i> Zum Vergleich</a></li>
                            <li><a href="#content" className="flex items-center justify-center hover:text-brand-primary transition-colors bg-gray-50 py-2 rounded-lg hover:bg-gray-100"><i className="fas fa-book-open mr-2 text-brand-primary"></i> Ratgeber lesen</a></li>
                            <li><a href="#faq" className="flex items-center justify-center hover:text-brand-primary transition-colors bg-gray-50 py-2 rounded-lg hover:bg-gray-100"><i className="fas fa-question-circle mr-2 text-brand-primary"></i> Häufige Fragen</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        {/* CONTENT & FAQ SECTION */}
        <section id="content" className="py-16 bg-white">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="prose prose-red prose-lg mx-auto text-center">
                    <div className="mb-12" dangerouslySetInnerHTML={{ __html: category.long_content_top || '' }} />
                    {!category.long_content_top && <div className="bg-gray-50 p-8 rounded-2xl border border-dashed border-gray-300 text-center mb-12"><h3 className="font-bold text-xl mb-2 text-gray-400">Content wird geladen...</h3></div>}
                    <div dangerouslySetInnerHTML={{ __html: category.long_content_bottom || '' }} />
                    
                    {/* AUTOMATISCHER FAQ RENDERER (AUS JSON) */}
                    {category.faq_data && category.faq_data.length > 0 && (
                        <div id="faq" className="mt-16 w-full">
                            <h3 className="font-heading font-bold text-2xl text-center mb-8">Häufige Fragen</h3>
                            <div className="space-y-4">
                                {category.faq_data.map((faq, idx) => (
                                    <details key={idx} className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                        <summary className="flex items-center justify-between p-4 cursor-pointer">
                                            <span className="font-bold text-gray-800 flex-1 text-center pr-4">{faq.question}</span>
                                        </summary>
                                        <div className="p-4 pt-0 text-gray-600 text-center border-t border-gray-50 bg-gray-50/50 leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 mt-auto">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center mb-16">
                    <div className="flex flex-col items-center"><span className="font-heading font-extrabold text-3xl text-white tracking-tighter mb-4">{category.footer_site_name || 'Rank-Scout'}</span><p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">Dein unabhängiges Vergleichsportal. Wir schaffen Transparenz im Dating-Dschungel. Seriös, geprüft & aktuell.</p></div>
                    <div className="flex flex-col items-center"><h4 className="text-white font-bold uppercase tracking-widest text-sm mb-6 border-b border-slate-700 pb-2 inline-block">Beliebte Themen</h4><ul className="space-y-3 text-sm">{popularLinks.length > 0 ? popularLinks.map((l, i) => (<li key={i}><a href={sanitizeUrl(l.url)} className="hover:text-brand-primary transition-colors duration-300 flex items-center justify-center gap-2"><i className="fas fa-chevron-right text-[10px] text-brand-primary"></i> {l.label}</a></li>)) : (<li className="text-slate-500 italic">Lade Links...</li>)}</ul></div>
                    <div className="flex flex-col items-center"><h4 className="text-white font-bold uppercase tracking-widest text-sm mb-6 border-b border-slate-700 pb-2 inline-block">Rechtliches</h4><ul className="space-y-3 text-sm">{staticLegalLinks.map((l, i) => (<li key={i}><a href={l.url} className="hover:text-brand-primary transition-colors duration-300 flex items-center justify-center gap-2">{l.label}</a></li>))}</ul></div>
                </div>
                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4"><p>{category.footer_copyright_text?.replace(/2026/g, year.toString()) || `© ${year} Rank-Scout. Alle Rechte vorbehalten.`}</p><div className="flex gap-4"><a href="https://www.facebook.com/Rank.Scout" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook hover:text-white cursor-pointer transition-colors text-lg"></i></a><a href="https://www.instagram.com/rank.scout/" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram hover:text-white cursor-pointer transition-colors text-lg"></i></a></div></div>
            </div>
        </footer>
        {category.analytics_code && <div dangerouslySetInnerHTML={{ __html: category.analytics_code }} />}
      </body>
    </html>
  );
};