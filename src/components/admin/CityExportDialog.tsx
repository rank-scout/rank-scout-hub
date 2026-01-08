import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Category } from "@/hooks/useCategories";

interface CityExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
}

export default function CityExportDialog({ open, onOpenChange, category }: CityExportDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!category) return null;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const exportCode = `<!DOCTYPE html>
<html lang="de">
<head>
<link rel="canonical" href="" id="canonical-link" />
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Favicons / App Icons -->
    <link rel="icon" href="https://dating.rank-scout.com/top3-dating-apps/images/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="16x16" href="https://dating.rank-scout.com/top3-dating-apps/images/favicon-16x16.png">
    <link rel="icon" type="image/png" sizes="32x32" href="https://dating.rank-scout.com/top3-dating-apps/images/favicon-32x32.png">

    <!-- iOS -->
    <link rel="apple-touch-icon" sizes="180x180" href="https://dating.rank-scout.com/top3-dating-apps/images/apple-touch-icon.png">

    <!-- PWA / Android -->
    <link rel="manifest" href="https://dating.rank-scout.com/top3-dating-apps/images/site.webmanifest">
    <link rel="icon" type="image/png" sizes="192x192" href="https://dating.rank-scout.com/top3-dating-apps/images/android-chrome-192x192.png">
    <link rel="icon" type="image/png" sizes="512x512" href="https://dating.rank-scout.com/top3-dating-apps/images/android-chrome-512x512.png">
    
    <!-- SEO Meta Tags - Dynamisch -->
    <title>Lade...</title>
    <meta name="description" content="">
    <meta name="robots" content="index, follow">

    <!-- Analytics Placeholder -->
    <div id="analytics-container"></div>

    <!-- Fonts: Montserrat (Headings) & Open Sans (Body) -->
    <style type="text/css">
        @font-face {font-family:Montserrat;font-style:normal;font-weight:400;src:url(https://fonts.gstatic.com/s/montserrat/v25/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2) format('woff2');font-display:swap;}
        @font-face {font-family:Montserrat;font-style:normal;font-weight:700;src:url(https://fonts.gstatic.com/s/montserrat/v25/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2) format('woff2');font-display:swap;}
        @font-face {font-family:'Open Sans';font-style:normal;font-weight:400;src:url(https://fonts.gstatic.com/s/opensans/v35/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVQUwaEQbjA.woff2) format('woff2');font-display:swap;}
        @font-face {font-family:'Open Sans';font-style:normal;font-weight:600;src:url(https://fonts.gstatic.com/s/opensans/v35/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVQUwaEQbjA.woff2) format('woff2');font-display:swap;}
    </style>

    <!-- Tailwind CSS (via CDN) -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Font Awesome for Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        brand: {
                            black: '#0a0a0a',
                            dark: '#58000c',
                            primary: '#c41e3a',
                            light: '#ff4d6d',
                            platinum: '#e5e7eb',
                            gold: '#fbbf24',
                            luxury: '#d4af37',
                            rose: '#ffe4e6',
                            bg: '#fafafa',
                        }
                    },
                    fontFamily: {
                        sans: ['Open Sans', 'sans-serif'],
                        heading: ['Montserrat', 'sans-serif'],
                    },
                    animation: {
                        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }
                }
            }
        }
    </script>

    <style>
        body { scroll-behavior: smooth; }
        
        /* Background Gradient - Salzburg Style (Red/White/Dark) */
        .hero-gradient {
            background: linear-gradient(135deg, #0a0a0a 0%, #7f1d1d 45%, #c41e3a 100%);
        }
        
        /* Gold Premium Hover Effekt */
        .btn-gold-hover {
            transition: all 0.4s ease;
            position: relative;
            z-index: 1;
            overflow: hidden;
            border: 1px solid rgba(251, 191, 36, 0.3);
        }
        
        .btn-gold-hover:hover {
            background: linear-gradient(45deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
            background-size: 200% 200%;
            color: #111827;
            border-color: #aa771c;
            box-shadow: 0 0 20px rgba(212, 175, 55, 0.6);
            transform: translateY(-2px) scale(1.02);
            animation: goldShimmer 2s infinite linear;
        }

        @keyframes goldShimmer {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        /* Shimmer für den Default-Zustand */
        .btn-shimmer::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 50%;
            height: 100%;
            background: linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent);
            animation: shimmer 3s infinite;
            z-index: -1;
        }
        
        @keyframes shimmer {
            100% { left: 150%; }
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #1a1a1a; }
        ::-webkit-scrollbar-thumb { background: #c41e3a; border-radius: 4px; }

        /* Standard Ad Box */
        .ad-box {
            width: 300px;
            height: 250px;
            background-color: #f3f4f6;
            border: 1px solid #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            margin: 0 auto;
        }
        .ad-label {
            position: absolute;
            top: 0;
            right: 0;
            background: #e5e7eb;
            color: #6b7280;
            font-size: 10px;
            padding: 2px 5px;
            text-transform: uppercase;
        }
        
        /* Loading Spinner */
        .loading-spinner {
            border: 4px solid rgba(196, 30, 58, 0.2);
            border-top: 4px solid #c41e3a;
            border-radius: 50%;
            width: 48px;
            height: 48px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body class="bg-brand-bg text-gray-900 font-sans">

    <!-- Banner Container (für globale oder Seiten-spezifische Banner) -->
    <div id="banner-container"></div>

    <!-- Loading State -->
    <div id="loading-state" class="min-h-screen flex items-center justify-center bg-brand-black">
        <div class="text-center">
            <div class="loading-spinner mx-auto mb-4"></div>
            <p class="text-white/60">Lade Inhalte...</p>
        </div>
    </div>

    <!-- Main App Content (wird dynamisch gefüllt) -->
    <div id="app" style="display: none;"></div>

    <script>
    (async function() {
        // ========== KONFIGURATION ==========
        const SUPABASE_URL = '${supabaseUrl}';
        const SUPABASE_KEY = '${supabaseKey}';
        
        // Slug aus URL erkennen (letzter Pfad-Teil ohne Slash)
        const pathParts = window.location.pathname.split('/').filter(p => p && p !== 'index.html');
        const SLUG = pathParts[pathParts.length - 1] || '${category.slug}';
        
        // DOM Elemente
        const loadingState = document.getElementById('loading-state');
        const app = document.getElementById('app');
        const bannerContainer = document.getElementById('banner-container');
        const analyticsContainer = document.getElementById('analytics-container');
        
        // ========== HILFSFUNKTIONEN ==========
        function renderStars(rating) {
            const fullStars = Math.floor(rating / 2);
            const hasHalf = (rating / 2) % 1 >= 0.5;
            let stars = '';
            for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star text-yellow-400"></i>';
            if (hasHalf) stars += '<i class="fas fa-star-half-alt text-yellow-400"></i>';
            for (let i = fullStars + (hasHalf ? 1 : 0); i < 5; i++) stars += '<i class="far fa-star text-yellow-400/30"></i>';
            return stars;
        }
        
        function getFeatures(project) {
            if (project.features && Array.isArray(project.features) && project.features.length > 0) {
                return project.features;
            }
            if (project.short_description) {
                return project.short_description.split('•').map(s => s.trim()).filter(Boolean);
            }
            return ['Geprüfte Plattform', 'Aktive Nutzer', 'Sicher & seriös'];
        }
        
        function escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // ========== DATEN LADEN ==========
        try {
            // 1. Kategorie laden
            const catRes = await fetch(\`\${SUPABASE_URL}/rest/v1/categories?slug=eq.\${SLUG}&is_active=eq.true&select=*\`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
            });
            const categories = await catRes.json();
            
            if (!categories || categories.length === 0) {
                loadingState.innerHTML = '<div class="text-center"><h1 class="text-2xl font-bold text-red-500 mb-2">Seite nicht gefunden</h1><p class="text-white/60">Der Slug "' + escapeHtml(SLUG) + '" existiert nicht.</p></div>';
                return;
            }
            
            const category = categories[0];
            
            // 2. Meta-Tags aktualisieren
            document.title = category.meta_title || category.name;
            document.querySelector('meta[name="description"]').content = category.meta_description || '';
            document.getElementById('canonical-link').href = window.location.href.replace(/\\/$/, '') + '/';
            
            // 3. Analytics-Code einfügen (falls vorhanden)
            if (category.analytics_code) {
                analyticsContainer.innerHTML = category.analytics_code;
            }
            
            // 4. Banner laden (Seiten-spezifisch oder global)
            if (category.banner_override) {
                bannerContainer.innerHTML = category.banner_override;
            } else {
                try {
                    const settingsRes = await fetch(\`\${SUPABASE_URL}/rest/v1/settings?key=eq.global_banner&select=value\`, {
                        headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
                    });
                    const settings = await settingsRes.json();
                    if (settings.length && settings[0].value && settings[0].value.html && settings[0].value.enabled) {
                        bannerContainer.innerHTML = settings[0].value.html;
                    }
                } catch (e) { console.log('Kein globaler Banner'); }
            }
            
            // 5. Projekte laden
            const cpRes = await fetch(\`\${SUPABASE_URL}/rest/v1/category_projects?category_id=eq.\${category.id}&select=project_id,sort_order&order=sort_order.asc\`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
            });
            const categoryProjects = await cpRes.json();
            
            let projects = [];
            if (categoryProjects && categoryProjects.length > 0) {
                const projectIds = categoryProjects.map(cp => cp.project_id);
                const projRes = await fetch(\`\${SUPABASE_URL}/rest/v1/projects?id=in.(\${projectIds.join(',')})&is_active=eq.true&select=*\`, {
                    headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
                });
                projects = await projRes.json();
                
                // Nach sort_order sortieren
                const orderMap = {};
                categoryProjects.forEach(cp => orderMap[cp.project_id] = cp.sort_order);
                projects.sort((a, b) => (orderMap[a.id] || 0) - (orderMap[b.id] || 0));
            }
            
            // 6. Location-Name extrahieren
            const locationName = category.name.replace(/^Singles\\s*/i, '').trim() || category.name;
            
            // ========== HTML RENDERN ==========
            app.innerHTML = \`
    <!-- Sticky Header -->
    <header class="bg-brand-black/95 backdrop-blur-md text-white py-3 px-4 sticky top-0 z-50 border-b border-white/10">
        <div class="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <a href="#" class="font-heading font-bold text-lg hover:text-brand-primary transition-colors">
                Singles\${escapeHtml(locationName)}AT
            </a>
            <nav class="hidden md:flex items-center gap-4 text-sm text-gray-300">
                <a href="https://dating.rank-scout.com/singles-in-der-naehe/" class="hover:text-white transition-colors">Singles in der Nähe</a>
                <span class="text-gray-600">|</span>
                <a href="https://dating.rank-scout.com/singles-wien/" class="hover:text-white transition-colors">Singles Wien</a>
                <span class="text-gray-600">|</span>
                <a href="https://dating.rank-scout.com/top3-dating-apps/" class="hover:text-white transition-colors">Top3 Apps</a>
            </nav>
            <a href="https://dating.rank-scout.com/" class="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors">
                Zum Hauptportal
            </a>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="hero-gradient min-h-[65vh] flex items-center justify-center text-center px-4 py-16 relative overflow-hidden">
        <div class="absolute inset-0 opacity-10" style="background-image: url('data:image/svg+xml,<svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 100 100\\"><circle cx=\\"50\\" cy=\\"50\\" r=\\"1\\" fill=\\"white\\"/></svg>'); background-size: 50px 50px;"></div>
        <div class="relative z-10 max-w-4xl mx-auto">
            <p class="text-brand-gold font-semibold text-sm md:text-base tracking-wide uppercase mb-4">
                <i class="fas fa-crown mr-2"></i>\${escapeHtml(category.h1_title) || 'Die Top Online-Portale für Singles in ' + escapeHtml(locationName) + ' 2026'}
            </p>
            <h1 class="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Finde Singles in <br><span class="text-brand-light">\${escapeHtml(locationName)} & Umgebung</span>
            </h1>
            <p class="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                \${escapeHtml(category.description) || 'Wir haben geprüft, welche Dating-Apps in ' + escapeHtml(locationName) + ' wirklich funktionieren.'}
            </p>
            <a href="#vergleich" class="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-light text-white font-semibold px-8 py-4 rounded-full transition-all transform hover:scale-105 btn-gold-hover btn-shimmer">
                <i class="fas fa-heart"></i> \${escapeHtml(locationName)}er Singles finden
            </a>
            <p class="mt-6 text-sm text-gray-400">
                <i class="fas fa-check-circle text-green-500 mr-1"></i> Geprüft für Stadt & Land \${escapeHtml(locationName)}
            </p>
        </div>
    </section>

    <!-- Info Section -->
    <section class="bg-gradient-to-b from-gray-50 to-white py-16 px-4">
        <div class="max-w-6xl mx-auto">
            <div class="text-center mb-12">
                <h2 class="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">Dein Dating-Guide für \${escapeHtml(locationName)}</h2>
                <p class="text-gray-600 max-w-2xl mx-auto">Wir zeigen dir, welche Plattformen für dein Bedürfnis funktionieren.</p>
            </div>
            
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                    <div class="text-3xl mb-4">🔒</div>
                    <h3 class="font-heading font-bold text-lg mb-2">Diskrete Treffen</h3>
                    <p class="text-gray-600 text-sm">\${escapeHtml(locationName)} ist überschaubar – Anonymität ist wichtig. Unsere Empfehlungen garantieren Diskretion.</p>
                </div>
                <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                    <div class="text-3xl mb-4">📍</div>
                    <h3 class="font-heading font-bold text-lg mb-2">Regional filtern</h3>
                    <p class="text-gray-600 text-sm">Die besten Apps haben Filter, um gezielt Singles in deiner Nähe zu finden.</p>
                </div>
                <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                    <div class="text-3xl mb-4">💕</div>
                    <h3 class="font-heading font-bold text-lg mb-2">Ernsthafte Partnersuche</h3>
                    <p class="text-gray-600 text-sm">Hier findest du Menschen, die eine echte Beziehung suchen.</p>
                </div>
                <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                    <div class="text-3xl mb-4">🎯</div>
                    <h3 class="font-heading font-bold text-lg mb-2">Hohe Erfolgsquote</h3>
                    <p class="text-gray-600 text-sm">Wir haben geprüft, wo die Aktivität am höchsten ist.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- App Comparison Section -->
    <section id="vergleich" class="bg-brand-black py-16 px-4">
        <div class="max-w-4xl mx-auto">
            <div class="text-center mb-12">
                <h2 class="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
                    Top \${projects.length || 5} Apps für Singles in \${escapeHtml(locationName)}
                </h2>
                <p class="text-gray-400">Geprüft auf Mitgliederzahl, Diskretion und Erfolgsquote.</p>
            </div>
            
            <div class="space-y-6">
                \${projects.map((project, index) => {
                    const features = getFeatures(project);
                    const badgeText = index === 0 ? (project.badge_text || 'Testsieger ' + escapeHtml(locationName)) : (project.badge_text || 'Platz ' + (index + 1));
                    const badgeClass = index === 0 
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-black' 
                        : 'bg-white/10 text-white';
                    
                    return \`
                <div class="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl overflow-hidden border border-white/10 hover:border-brand-primary/50 transition-all">
                    <div class="p-1">
                        <span class="\${badgeClass} px-4 py-1.5 rounded-full text-sm font-bold inline-flex items-center gap-1">
                            \${index === 0 ? '<i class="fas fa-trophy"></i>' : ''} \${escapeHtml(badgeText)}
                        </span>
                    </div>
                    <div class="p-6 flex flex-col md:flex-row gap-6 items-start">
                        <!-- Logo -->
                        <div class="flex-shrink-0">
                            <div class="w-20 h-20 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
                                \${project.logo_url 
                                    ? '<img src="' + escapeHtml(project.logo_url) + '" alt="' + escapeHtml(project.name) + '" class="w-16 h-16 object-contain">'
                                    : '<span class="text-3xl font-bold text-brand-primary">' + escapeHtml(project.name.charAt(0)) + '</span>'
                                }
                            </div>
                        </div>
                        
                        <!-- Content -->
                        <div class="flex-grow">
                            <h3 class="font-heading text-2xl font-bold text-white mb-2">\${escapeHtml(project.name)}</h3>
                            <div class="flex items-center gap-3 mb-4">
                                <div class="flex">\${renderStars(project.rating || 9.0)}</div>
                                <span class="text-yellow-400 font-bold">\${(project.rating || 9.0).toFixed(1)} / 10</span>
                                \${index === 0 ? '<span class="text-xs text-brand-gold">Top in ' + escapeHtml(locationName) + '</span>' : ''}
                            </div>
                            <ul class="space-y-2 mb-4">
                                \${features.slice(0, 4).map(f => '<li class="flex items-start gap-2 text-gray-300"><i class="fas fa-check text-green-500 mt-1 flex-shrink-0"></i><span>' + escapeHtml(f) + '</span></li>').join('')}
                            </ul>
                        </div>
                        
                        <!-- CTA -->
                        <div class="flex-shrink-0 w-full md:w-auto">
                            <a href="\${escapeHtml(project.affiliate_link || project.url)}" target="_blank" rel="noopener sponsored" 
                               class="block w-full md:w-auto text-center bg-brand-primary hover:bg-brand-light text-white font-semibold px-8 py-4 rounded-xl transition-all btn-gold-hover btn-shimmer">
                                Kostenlos Registrieren
                            </a>
                        </div>
                    </div>
                </div>
                    \`;
                }).join('')}
            </div>
            
            <p class="text-center text-gray-500 text-sm mt-8">*Werbung / Affiliate Links</p>
        </div>
    </section>

    <!-- Long Content Top -->
    \${category.long_content_top ? \`
    <section class="bg-white py-16 px-4">
        <div class="max-w-4xl mx-auto prose prose-lg">
            \${category.long_content_top}
        </div>
    </section>
    \` : ''}

    <!-- Long Content Bottom -->
    \${category.long_content_bottom ? \`
    <section class="bg-gray-50 py-16 px-4">
        <div class="max-w-4xl mx-auto prose prose-lg">
            \${category.long_content_bottom}
        </div>
    </section>
    \` : ''}

    <!-- Footer -->
    <footer class="bg-brand-black text-gray-400 py-12 px-4 border-t border-white/10">
        <div class="max-w-6xl mx-auto text-center">
            <p class="mb-4">&copy; 2026 dating.rank-scout.com - Alle Rechte vorbehalten.</p>
            <div class="flex justify-center gap-6 text-sm">
                <a href="https://dating.rank-scout.com/impressum/" class="hover:text-white transition-colors">Impressum</a>
                <a href="https://dating.rank-scout.com/datenschutz/" class="hover:text-white transition-colors">Datenschutz</a>
            </div>
        </div>
    </footer>
            \`;
            
            // Loading fertig, Content anzeigen
            loadingState.style.display = 'none';
            app.style.display = 'block';
            
        } catch (error) {
            console.error('Fehler beim Laden:', error);
            loadingState.innerHTML = '<div class="text-center"><h1 class="text-2xl font-bold text-red-500 mb-2">Fehler</h1><p class="text-white/60">' + escapeHtml(error.message) + '</p></div>';
        }
    })();
    </script>
</body>
</html>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(exportCode);
    setCopied(true);
    toast({ title: "Code kopiert!", description: "Der HTML-Code wurde in die Zwischenablage kopiert." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([exportCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `index.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Download gestartet!", description: "Die Datei wird heruntergeladen." });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Universal Master-Template exportieren
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">✅ Eine Datei für alle Städte</h4>
            <p className="text-sm text-green-700">
              Dieses Template erkennt den Slug automatisch aus der URL. Lade es einmal hoch und es funktioniert für alle deine Landingpages!
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">📁 So funktioniert's:</h4>
            <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
              <li>Kopiere diese <code className="bg-blue-100 px-1 rounded">index.html</code> in jeden Ordner (z.B. <code className="bg-blue-100 px-1 rounded">/singles-salzburg/</code>)</li>
              <li>Das Script liest den Slug aus der URL</li>
              <li>Alle Daten (Titel, Projekte, Banner) kommen automatisch aus der Datenbank</li>
            </ol>
          </div>

          <Textarea
            value={exportCode}
            readOnly
            className="font-mono text-xs h-96"
          />

          <div className="flex gap-3">
            <Button onClick={handleCopy} className="flex-1" variant={copied ? "default" : "outline"}>
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Kopiert!" : "Code kopieren"}
            </Button>
            <Button onClick={handleDownload} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download index.html
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
