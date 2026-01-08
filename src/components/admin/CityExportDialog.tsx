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
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Favicons / App Icons -->
    <link rel="icon" href="https://dating.rank-scout.com/top3-dating-apps/images/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="16x16" href="https://dating.rank-scout.com/top3-dating-apps/images/favicon-16x16.png">
    <link rel="icon" type="image/png" sizes="32x32" href="https://dating.rank-scout.com/top3-dating-apps/images/favicon-32x32.png">
    <link rel="apple-touch-icon" sizes="180x180" href="https://dating.rank-scout.com/top3-dating-apps/images/apple-touch-icon.png">
    <link rel="manifest" href="https://dating.rank-scout.com/top3-dating-apps/images/site.webmanifest">

    <!-- SEO Meta Tags - Will be replaced dynamically -->
    <title>Lade...</title>
    <meta name="description" content="">
    <meta name="robots" content="index, follow">

    <!-- Analytics Placeholder -->
    <script id="analytics-placeholder"></script>

    <!-- Fonts: Montserrat & Open Sans -->
    <style type="text/css">
        @font-face {font-family:Montserrat;font-style:normal;font-weight:400;src:url(https://fonts.gstatic.com/s/montserrat/v25/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2) format('woff2');font-display:swap;}
        @font-face {font-family:Montserrat;font-style:normal;font-weight:700;src:url(https://fonts.gstatic.com/s/montserrat/v25/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2) format('woff2');font-display:swap;}
        @font-face {font-family:'Open Sans';font-style:normal;font-weight:400;src:url(https://fonts.gstatic.com/s/opensans/v35/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVQUwaEQbjA.woff2) format('woff2');font-display:swap;}
        @font-face {font-family:'Open Sans';font-style:normal;font-weight:600;src:url(https://fonts.gstatic.com/s/opensans/v35/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVQUwaEQbjA.woff2) format('woff2');font-display:swap;}
    </style>

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <script>
        // Theme configurations
        const THEMES = {
            DATING: {
                black: '#0a0a0a',
                dark: '#58000c',
                primary: '#c41e3a',
                light: '#ff4d6d',
                platinum: '#e5e7eb',
                gold: '#fbbf24',
                luxury: '#d4af37',
                rose: '#ffe4e6',
                bg: '#fafafa',
                heroGradient: 'linear-gradient(135deg, #0a0a0a 0%, #7f1d1d 45%, #c41e3a 100%)'
            },
            ADULT: {
                black: '#0a0a0a',
                dark: '#1a0015',
                primary: '#db2777',
                light: '#f472b6',
                platinum: '#a855f7',
                gold: '#c026d3',
                luxury: '#a21caf',
                rose: '#2d1f3d',
                bg: '#0f0f1a',
                heroGradient: 'linear-gradient(135deg, #0a0a0a 0%, #4a1942 45%, #db2777 100%)'
            },
            CASINO: {
                black: '#0a0a0a',
                dark: '#1a1a0a',
                primary: '#d4af37',
                light: '#f59e0b',
                platinum: '#fbbf24',
                gold: '#d4af37',
                luxury: '#b8860b',
                rose: '#1c1c1c',
                bg: '#0a0a0a',
                heroGradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a0a 45%, #2d2d0a 100%)'
            },
            GENERIC: {
                black: '#0a0a0a',
                dark: '#1e293b',
                primary: '#3b82f6',
                light: '#60a5fa',
                platinum: '#e5e7eb',
                gold: '#fbbf24',
                luxury: '#d4af37',
                rose: '#f0f9ff',
                bg: '#fafafa',
                heroGradient: 'linear-gradient(135deg, #0a0a0a 0%, #1e3a5f 45%, #3b82f6 100%)'
            }
        };

        // Will be set after data loads
        let activeTheme = THEMES.DATING;

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
        
        /* Hero Gradient - Dynamic via JS */
        .hero-gradient {
            background: linear-gradient(135deg, #0a0a0a 0%, #7f1d1d 45%, #c41e3a 100%);
        }
        
        /* Gold Premium Hover Effect */
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
        
        /* Shimmer for default state */
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
        ::-webkit-scrollbar-thumb { background: var(--primary-color, #c41e3a); border-radius: 4px; }

        /* Ad Box */
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

        /* Loading & Error States */
        .loading-spinner {
            border: 3px solid rgba(255,255,255,0.1);
            border-top: 3px solid var(--primary-color, #c41e3a);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Theme-specific overrides applied via JS */
        .theme-dating { --primary-color: #c41e3a; --primary-dark: #58000c; }
        .theme-adult { --primary-color: #db2777; --primary-dark: #4a1942; }
        .theme-casino { --primary-color: #d4af37; --primary-dark: #1a1a0a; }
        .theme-generic { --primary-color: #3b82f6; --primary-dark: #1e3a5f; }

        /* App Card Premium Layout */
        .app-card {
            background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
            border: 1px solid rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
        }
        .app-card:hover {
            border-color: var(--primary-color, #c41e3a);
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }

        /* Casino Gold Effects */
        .casino-gold-text {
            background: linear-gradient(45deg, #bf953f, #fcf6ba, #b38728);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        /* Adult Neon Glow */
        .adult-glow {
            text-shadow: 0 0 10px rgba(219, 39, 119, 0.5), 0 0 20px rgba(219, 39, 119, 0.3);
        }

        /* Features List Styling */
        .feature-item {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            color: rgba(255,255,255,0.8);
            font-size: 0.95rem;
        }
        .feature-item::before {
            content: '✓';
            color: var(--primary-color, #c41e3a);
            font-weight: bold;
            flex-shrink: 0;
        }
    </style>
</head>
<body class="bg-brand-black text-white font-sans">
    <!-- Banner Container -->
    <div id="banner-container"></div>

    <!-- Main App Container -->
    <div id="app">
        <div class="min-h-screen flex items-center justify-center">
            <div class="text-center">
                <div class="loading-spinner mx-auto mb-4"></div>
                <p class="text-gray-400">Lade Daten...</p>
            </div>
        </div>
    </div>

    <script>
    (async function() {
        // Auto-detect slug from URL path
        const pathParts = window.location.pathname.split('/').filter(p => p);
        const SLUG = pathParts[pathParts.length - 1] || pathParts[0] || '${category.slug}';
        
        const SUPABASE_URL = '${supabaseUrl}';
        const SUPABASE_KEY = '${supabaseKey}';
        
        const app = document.getElementById('app');
        const bannerContainer = document.getElementById('banner-container');
        
        function applyTheme(theme) {
            document.body.classList.remove('theme-dating', 'theme-adult', 'theme-casino', 'theme-generic');
            document.body.classList.add('theme-' + theme.toLowerCase());
            
            const heroSection = document.querySelector('.hero-gradient');
            if (heroSection && THEMES[theme]) {
                heroSection.style.background = THEMES[theme].heroGradient;
            }
        }

        function renderStars(rating) {
            const fullStars = Math.floor(rating / 2);
            const hasHalf = (rating / 2) % 1 >= 0.5;
            let stars = '';
            for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star text-yellow-400"></i>';
            if (hasHalf) stars += '<i class="fas fa-star-half-alt text-yellow-400"></i>';
            return stars;
        }

        function getFeatures(project) {
            if (project.features && Array.isArray(project.features)) {
                return project.features;
            }
            if (project.short_description) {
                return project.short_description.split('•').map(s => s.trim()).filter(Boolean);
            }
            return ['Geprüfte Plattform', 'Aktive Nutzer', 'Sicher & seriös'];
        }

        function getBadgeHTML(index, theme) {
            if (index === 0) {
                if (theme === 'CASINO') return '<span class="bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-bold px-4 py-1.5 rounded-full text-sm shadow-lg">🏆 Testsieger</span>';
                if (theme === 'ADULT') return '<span class="bg-gradient-to-r from-pink-600 to-pink-400 text-white font-bold px-4 py-1.5 rounded-full text-sm shadow-lg">🔥 Testsieger</span>';
                return '<span class="bg-gradient-to-r from-red-600 to-red-500 text-white font-bold px-4 py-1.5 rounded-full text-sm shadow-lg">🏆 Testsieger</span>';
            }
            return '<span class="bg-white/10 text-white font-semibold px-3 py-1 rounded-full text-sm">Platz ' + (index + 1) + '</span>';
        }

        try {
            // Fetch category data
            const catRes = await fetch(\`\${SUPABASE_URL}/rest/v1/categories?slug=eq.\${SLUG}&is_active=eq.true&select=*\`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': \`Bearer \${SUPABASE_KEY}\` }
            });
            const categories = await catRes.json();
            
            if (!categories.length) {
                app.innerHTML = '<div class="min-h-screen flex items-center justify-center"><div class="text-center"><h1 class="text-4xl font-bold text-red-500 mb-4">Seite nicht gefunden</h1><p class="text-gray-400">Die angeforderte Seite existiert nicht.</p></div></div>';
                return;
            }
            
            const category = categories[0];
            const theme = category.theme || 'DATING';
            
            // Apply theme
            applyTheme(theme);
            
            // Update meta tags
            document.title = category.meta_title || category.name;
            document.querySelector('meta[name="description"]')?.setAttribute('content', category.meta_description || '');
            
            // Add canonical
            const canonicalUrl = window.location.href.replace(/\\/$/, '') + '/';
            let canonicalLink = document.querySelector('link[rel="canonical"]');
            if (!canonicalLink) {
                canonicalLink = document.createElement('link');
                canonicalLink.rel = 'canonical';
                document.head.appendChild(canonicalLink);
            }
            canonicalLink.href = canonicalUrl;
            
            // Inject analytics code if present
            if (category.analytics_code) {
                const analyticsContainer = document.getElementById('analytics-placeholder');
                if (analyticsContainer) {
                    analyticsContainer.insertAdjacentHTML('afterend', category.analytics_code);
                }
            }
            
            // Handle banner (page-specific or global)
            if (category.banner_override) {
                bannerContainer.innerHTML = category.banner_override;
            } else {
                try {
                    const settingsRes = await fetch(\`\${SUPABASE_URL}/rest/v1/settings?key=eq.global_banner&select=value\`, {
                        headers: { 'apikey': SUPABASE_KEY, 'Authorization': \`Bearer \${SUPABASE_KEY}\` }
                    });
                    const settings = await settingsRes.json();
                    if (settings.length && settings[0].value?.html && settings[0].value?.enabled) {
                        bannerContainer.innerHTML = settings[0].value.html;
                    }
                } catch (e) {
                    console.log('No global banner configured');
                }
            }
            
            // Fetch assigned projects
            const cpRes = await fetch(\`\${SUPABASE_URL}/rest/v1/category_projects?category_id=eq.\${category.id}&select=project_id,sort_order\`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': \`Bearer \${SUPABASE_KEY}\` }
            });
            const categoryProjects = await cpRes.json();
            
            let projects = [];
            if (categoryProjects.length) {
                const projectIds = categoryProjects.map(cp => cp.project_id);
                const projRes = await fetch(\`\${SUPABASE_URL}/rest/v1/projects?id=in.(\${projectIds.join(',')})&is_active=eq.true&select=*\`, {
                    headers: { 'apikey': SUPABASE_KEY, 'Authorization': \`Bearer \${SUPABASE_KEY}\` }
                });
                projects = await projRes.json();
                const orderMap = {};
                categoryProjects.forEach(cp => orderMap[cp.project_id] = cp.sort_order);
                projects.sort((a, b) => (orderMap[a.id] || 0) - (orderMap[b.id] || 0));
            }

            // Get location name for display
            const locationName = category.name.includes('Singles') 
                ? category.name.replace('Singles ', '') 
                : category.name;
            
            // Render page
            app.innerHTML = \`
                <!-- Hero Section -->
                <section class="hero-gradient min-h-[60vh] flex items-center justify-center relative overflow-hidden">
                    <div class="absolute inset-0 bg-black/20"></div>
                    <div class="container mx-auto px-6 py-16 relative z-10 text-center">
                        <p class="text-white/80 mb-4 text-lg font-semibold tracking-wide uppercase">
                            <i class="fas fa-crown text-yellow-400 mr-2"></i>
                            Die Top Online-Portale für Singles in \${locationName} 2026
                        </p>
                        <h1 class="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight \${theme === 'CASINO' ? 'casino-gold-text' : ''} \${theme === 'ADULT' ? 'adult-glow' : ''}">
                            \${category.h1_title || category.name}
                        </h1>
                        <p class="text-white/80 text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
                            \${category.description || 'Wir haben geprüft, welche Plattformen wirklich funktionieren und wo du echte Treffer landest.'}
                        </p>
                        <a href="#vergleich" class="btn-gold-hover btn-shimmer inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg text-lg shadow-lg">
                            <i class="fas fa-heart"></i>
                            \${locationName} Singles finden
                        </a>
                        <p class="mt-6 text-white/60 text-sm flex items-center justify-center gap-2">
                            <i class="fas fa-shield-alt text-green-400"></i>
                            Geprüft für \${locationName} & Umgebung
                        </p>
                    </div>
                </section>

                <!-- USP Section / Content Top -->
                \${category.long_content_top ? \`
                <section class="py-16 bg-gradient-to-b from-brand-black to-gray-900">
                    <div class="container mx-auto px-6">
                        \${category.long_content_top}
                    </div>
                </section>
                \` : ''}

                <!-- Apps Comparison Section -->
                <section id="vergleich" class="py-16 bg-gray-900">
                    <div class="container mx-auto px-6">
                        <div class="text-center mb-12">
                            <h2 class="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
                                Top \${projects.length || 5} Apps für Singles in \${locationName}
                            </h2>
                            <p class="text-gray-400 text-lg">
                                Geprüft auf Mitgliederzahl im Raum \${locationName}, Diskretion und Erfolgsquote.
                            </p>
                        </div>

                        <div class="space-y-6 max-w-5xl mx-auto">
                            \${projects.map((p, i) => {
                                const features = getFeatures(p);
                                return \`
                                <div class="app-card rounded-2xl p-6 md:p-8 transition-all duration-300 \${i === 0 ? 'ring-2 ring-yellow-400/50' : ''}">
                                    <div class="flex flex-col lg:flex-row lg:items-center gap-6">
                                        <!-- Badge & Logo -->
                                        <div class="flex items-start gap-4 lg:w-1/4">
                                            <div class="text-center">
                                                \${getBadgeHTML(i, theme)}
                                                <img 
                                                    src="\${p.logo_url || 'https://via.placeholder.com/80'}" 
                                                    alt="\${p.name}" 
                                                    class="w-20 h-20 rounded-xl object-cover mt-3 mx-auto border border-white/10"
                                                    onerror="this.src='https://via.placeholder.com/80?text=\${encodeURIComponent(p.name.charAt(0))}'"
                                                >
                                            </div>
                                        </div>

                                        <!-- Info -->
                                        <div class="flex-1">
                                            <div class="flex items-center gap-3 mb-2">
                                                <h3 class="font-heading text-2xl font-bold text-white">\${p.name}</h3>
                                                <div class="flex items-center gap-1">
                                                    \${renderStars(p.rating || 9.8)}
                                                </div>
                                                <span class="text-yellow-400 font-bold">\${p.rating || 9.8} / 10</span>
                                                \${i === 0 ? '<span class="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">Top in ' + locationName + '</span>' : ''}
                                            </div>
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                                                \${features.slice(0, 4).map(f => \`<div class="feature-item">\${f}</div>\`).join('')}
                                            </div>
                                        </div>

                                        <!-- CTA -->
                                        <div class="lg:w-1/4 flex flex-col items-center gap-3">
                                            <a 
                                                href="\${p.affiliate_link || p.url}" 
                                                target="_blank" 
                                                rel="noopener sponsored"
                                                class="btn-gold-hover btn-shimmer w-full text-center px-6 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg text-lg shadow-lg hover:shadow-xl transition-all"
                                            >
                                                Kostenlos Registrieren
                                            </a>
                                            \${p.badge_text ? \`<span class="text-xs text-gray-400">\${p.badge_text}</span>\` : ''}
                                        </div>
                                    </div>
                                </div>
                            \`;
                            }).join('')}
                        </div>

                        <p class="text-center text-gray-500 text-sm mt-8">
                            *Werbung / Affiliate Links
                        </p>
                    </div>
                </section>

                <!-- Content Bottom / SEO Text -->
                \${category.long_content_bottom ? \`
                <section class="py-16 bg-brand-black">
                    <div class="container mx-auto px-6 max-w-4xl prose prose-invert prose-lg">
                        \${category.long_content_bottom}
                    </div>
                </section>
                \` : ''}

                <!-- Footer -->
                <footer class="bg-gray-900 border-t border-white/10 py-8">
                    <div class="container mx-auto px-6 text-center">
                        <p class="text-gray-500 text-sm">
                            © 2026 Rank-Scout. Alle Rechte vorbehalten. 
                            <a href="/impressum" class="text-gray-400 hover:text-white ml-2">Impressum</a>
                            <a href="/datenschutz" class="text-gray-400 hover:text-white ml-2">Datenschutz</a>
                        </p>
                    </div>
                </footer>
            \`;
        } catch (err) {
            console.error(err);
            app.innerHTML = '<div class="min-h-screen flex items-center justify-center"><div class="text-center"><h1 class="text-4xl font-bold text-red-500 mb-4">Fehler</h1><p class="text-gray-400">' + err.message + '</p></div></div>';
        }
    })();
    </script>
</body>
</html>`;

  async function handleCopy() {
    await navigator.clipboard.writeText(exportCode);
    setCopied(true);
    toast({ title: "Code kopiert!", description: "Du kannst ihn jetzt auf deinem FTP-Server einfügen." });
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([exportCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `index.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Download gestartet", description: `${category.slug}/index.html` });
  }

  const themeLabel = {
    DATING: "🔴 Dating (Rot/Weiß)",
    ADULT: "💜 Adult (Dark/Pink)",
    CASINO: "🎰 Casino (Black/Gold)",
    GENERIC: "🔵 Generisch (Blau)"
  }[category.theme] || category.theme;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Download className="w-5 h-5" />
            FTP-Export: {category.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          <div className="bg-muted/50 p-4 rounded-lg mb-4 space-y-2">
            <p className="text-sm font-medium">So gehts:</p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Erstelle einen Ordner <code className="bg-muted px-1 rounded">/{category.slug}/</code> auf deinem FTP</li>
              <li>Kopiere den Code unten und speichere ihn als <code className="bg-muted px-1 rounded">index.html</code></li>
              <li>Lade die Datei in den Ordner hoch – <strong>FERTIG!</strong></li>
            </ol>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Theme: {themeLabel}</span>
              {category.analytics_code && (
                <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">✓ Analytics aktiv</span>
              )}
              {category.banner_override && (
                <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-1 rounded">✓ Custom Banner</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <strong>Slug-Erkennung:</strong> Die Seite erkennt automatisch ihren Slug aus der URL. 
              Du kannst dieselbe index.html in beliebige Ordner kopieren!
            </p>
          </div>
          
          <Textarea
            value={exportCode}
            readOnly
            className="font-mono text-xs h-80 resize-none"
          />
        </div>
        
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handleCopy} className="flex-1 gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Kopiert!" : "Code kopieren"}
          </Button>
          <Button onClick={handleDownload} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Als Datei
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
