import React from 'react';

interface ExportTemplateProps {
  title: string;
  description: string;
  content: string; // HTML Content
  type: "COMPARISON" | "ARTICLE";
  projects?: any[]; // Für Vergleiche
  siteName: string;
  year: number;
}

export const ExportTemplate: React.FC<ExportTemplateProps> = ({
  title,
  description,
  content,
  type,
  projects = [],
  siteName,
  year
}) => {
  return (
    <html lang="de">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow" />
        
        {/* Tailwind CDN - Damit das Design überall gleich aussieht */}
        <script src="https://cdn.tailwindcss.com"></script>
        
        {/* Fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet" />
        
        {/* FontAwesome */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  fontFamily: {
                    sans: ['Inter', 'sans-serif'],
                    display: ['Outfit', 'sans-serif'],
                  },
                  colors: {
                    primary: '#030E3E', // Navy
                    secondary: '#FF4C29', // Orange
                    accent: '#FBBF24', // Gold
                  }
                }
              }
            }
          `
        }} />
      </head>
      <body className="bg-slate-50 text-slate-900 font-sans antialiased">
        
        {/* HEADER */}
        <header className="bg-primary text-white py-4 shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <a href="/" className="font-display font-bold text-2xl tracking-tight text-white hover:text-secondary transition-colors">
              {siteName}
            </a>
            <a href="#vergleich" className="bg-secondary hover:bg-orange-600 text-white px-5 py-2 rounded-full font-medium transition-all text-sm shadow-lg shadow-orange-500/20">
              Zum Vergleich
            </a>
          </div>
        </header>

        {/* HERO */}
        <section className="bg-primary pt-16 pb-24 relative overflow-hidden">
            {/* Grid Pattern Background Overlay */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
            
            <div className="container mx-auto px-4 relative z-10 text-center">
                <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-secondary text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
                    Offizieller Vergleich {year}
                </span>
                <h1 className="font-display font-bold text-4xl md:text-6xl text-white mb-6 leading-tight max-w-4xl mx-auto">
                    {title}
                </h1>
                <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                    {description}
                </p>
            </div>
        </section>

        {/* MAIN CONTENT CONTAINER */}
        <main className="container mx-auto px-4 -mt-12 relative z-20 pb-20">
            
            {/* COMPARISON TABLE (Nur wenn TYPE === COMPARISON) */}
            {type === "COMPARISON" && projects.length > 0 && (
                <div id="vergleich" className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden mb-16">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-4">
                        <h2 className="font-display font-bold text-xl text-primary">
                            <i className="fas fa-trophy text-accent mr-2"></i> Top Empfehlungen
                        </h2>
                        <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                            <i className="fas fa-check-circle text-green-500 mr-1"></i> Geprüft
                        </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {projects.map((project, index) => (
                            <div key={index} className={`p-6 transition-colors hover:bg-slate-50 ${index === 0 ? 'bg-yellow-50/30' : ''}`}>
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    
                                    {/* Rank Badge */}
                                    <div className="flex-shrink-0">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-lg shadow-inner ${index === 0 ? 'bg-accent text-primary ring-4 ring-yellow-100' : 'bg-slate-200 text-slate-500'}`}>
                                            #{index + 1}
                                        </div>
                                    </div>

                                    {/* Logo */}
                                    <div className="flex-shrink-0 w-32 h-16 flex items-center justify-center bg-white border border-slate-200 rounded-lg p-2">
                                        {project.logo_url ? (
                                            <img src={project.logo_url} alt={project.name} className="max-h-full object-contain" />
                                        ) : (
                                            <span className="font-bold text-slate-300">{project.name}</span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 text-center md:text-left">
                                        <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                                            <h3 className="font-bold text-lg text-primary">{project.name}</h3>
                                            {index === 0 && <span className="text-[10px] font-bold bg-accent text-primary px-2 py-0.5 rounded uppercase">Testsieger</span>}
                                        </div>
                                        
                                        {/* Rating Stars */}
                                        <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <i key={i} className={`fas fa-star text-xs ${i < Math.round((project.rating || 0) / 2) ? 'text-accent' : 'text-slate-200'}`}></i>
                                            ))}
                                            <span className="text-xs font-bold text-slate-500 ml-1">{project.rating}/10</span>
                                        </div>

                                        {project.features && (
                                            <div className="hidden md:flex flex-wrap gap-2 mt-2">
                                                {Array.isArray(project.features) && project.features.slice(0, 3).map((f: string, i: number) => (
                                                    <span key={i} className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                                        <i className="fas fa-check text-green-500 mr-1"></i> {f}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* CTA */}
                                    <div className="flex-shrink-0 w-full md:w-auto">
                                        <a 
                                            href={project.affiliate_link || '#'} 
                                            target="_blank" 
                                            rel="nofollow noreferrer"
                                            className={`block w-full md:w-auto px-6 py-3 rounded-lg font-bold text-center transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 ${index === 0 ? 'bg-secondary text-white hover:bg-orange-600' : 'bg-primary text-white hover:bg-blue-900'}`}
                                        >
                                            Zum Anbieter <i className="fas fa-external-link-alt ml-2 text-xs opacity-70"></i>
                                        </a>
                                        {project.badge_text && (
                                            <p className="text-[10px] text-center text-slate-400 mt-2">{project.badge_text}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* CONTENT AREA */}
            <article className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12 prose prose-slate max-w-none prose-headings:font-display prose-headings:text-primary prose-a:text-secondary">
                <div dangerouslySetInnerHTML={{ __html: content }} />
            </article>

        </main>

        {/* FOOTER */}
        <footer className="bg-slate-900 text-slate-400 py-12 text-center text-sm border-t border-slate-800">
            <div className="container mx-auto px-4">
                <div className="flex flex-wrap justify-center gap-6 mb-8">
                    <a href="/impressum/" className="hover:text-white transition-colors">Impressum</a>
                    <a href="/datenschutz/" className="hover:text-white transition-colors">Datenschutz</a>
                </div>
                <p>&copy; {year} {siteName}. Alle Rechte vorbehalten.</p>
                <p className="mt-4 text-xs text-slate-600 max-w-lg mx-auto">
                    *Wir finanzieren uns über Affiliate-Links. Wenn Sie über Links auf dieser Seite einkaufen, erhalten wir möglicherweise eine Provision. Für Sie entstehen keine Mehrkosten.
                </p>
            </div>
        </footer>

      </body>
    </html>
  );
};