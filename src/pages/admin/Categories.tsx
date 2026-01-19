import { useState, useEffect } from "react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useDuplicateCategory, type Category } from "@/hooks/useCategories";
import { useCategoryProjects, useUpdateCategoryProjects } from "@/hooks/useCategoryProjects";
import { useGenerateCityContent } from "@/hooks/useGenerateCityContent";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, type CategoryInput } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, ArrowUp, ArrowDown, Copy, Download, LayoutTemplate, Flag, FileCheck, Sparkles, Wand2, UploadCloud, Clock } from "lucide-react";
import ProjectCheckboxList from "@/components/admin/ProjectCheckboxList";
import CityExportDialog from "@/components/admin/CityExportDialog";
import { CategoryFooterLinksEditor } from "@/components/admin/CategoryFooterLinksEditor";
import { CategoryLegalLinksEditor } from "@/components/admin/CategoryLegalLinksEditor";

// Helper: Datum formatieren
const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

// ============================================================================
// 🟢 VORLAGE 1: VERGLEICHSTABELLE (Optimierte Fonts & Script)
// ============================================================================
const COMPARISON_TEMPLATE = `<!DOCTYPE html>
<html lang="de">
<head>
    <link rel="canonical" href="" id="canonical-link" />
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="https://dating.rank-scout.com/top3-dating-apps/images/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="16x16" href="https://dating.rank-scout.com/top3-dating-apps/images/favicon-16x16.png">
    <link rel="icon" type="image/png" sizes="32x32" href="https://dating.rank-scout.com/top3-dating-apps/images/favicon-32x32.png">
    <title id="page-title">Vergleich</title>
    <meta id="meta-description" name="description" content="">
    <meta name="robots" content="index, follow">
    <script type="application/ld+json" id="json-ld-schema">{}</script>
    <style id="custom-css"></style>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">

    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script>
        tailwind.config = { theme: { extend: { colors: { brand: { black: '#0a0a0a', dark: '#58000c', primary: '#c41e3a', light: '#ff4d6d', gold: '#fbbf24', bg: '#fafafa', } }, fontFamily: { sans: ['Open Sans', 'sans-serif'], heading: ['Montserrat', 'sans-serif'], } } } }
    </script>
    <style>
        *, *::before, *::after { box-sizing: border-box; } html, body { scroll-behavior: smooth; overflow-x: hidden; max-width: 100vw; }
        .hero-gradient { background: linear-gradient(135deg, #0a0a0a 0%, #7f1d1d 45%, #c41e3a 100%); }
        .btn-gold-hover { transition: all 0.4s ease; position: relative; z-index: 1; overflow: hidden; border: 1px solid rgba(251, 191, 36, 0.3); }
        .btn-gold-hover:hover { background: linear-gradient(45deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c); background-size: 200% 200%; color: #111827; border-color: #aa771c; box-shadow: 0 0 20px rgba(212, 175, 55, 0.6); transform: translateY(-2px) scale(1.02); }
        .top-bar { background: linear-gradient(90deg, #c41e3a, #ff4d6d); }
    </style>
</head>
<body class="font-sans antialiased text-gray-800 bg-brand-bg">
    <div id="top-bar" class="top-bar text-white text-center py-2 px-4 text-sm font-medium hidden fixed top-0 left-0 right-0 z-[60]">
        <a id="top-bar-link" href="#" class="hover:underline"><span id="top-bar-text">🔥 Jetzt kostenlos anmelden!</span></a>
        <button onclick="closeTopBar()" class="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"><i class="fas fa-times"></i></button>
    </div>
    <header id="main-header" class="w-full bg-brand-black text-white py-3 px-4 shadow-md sticky top-0 z-50">
        <div class="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <a id="header-site-name" href="/" class="font-heading font-bold text-xl tracking-tight text-brand-gold hover:text-brand-light transition-colors">Lade...</a>
            <nav class="hidden md:flex items-center space-x-2 text-sm">
                <a href="/singles-in-der-naehe/" class="hover:text-brand-gold transition-colors">Singles in der Nähe</a>
                <span class="text-gray-500">|</span>
                <a href="/top3-dating-apps/" class="hover:text-brand-gold transition-colors">Top3 Apps</a>
            </nav>
            <a href="/" class="text-xs bg-brand-primary hover:bg-brand-light text-white px-3 py-1.5 rounded-full transition-all duration-300">Zum Hauptportal</a>
        </div>
    </header>
    <div class="bg-gray-100 py-3">
        <div class="max-w-6xl mx-auto px-4">
            <nav id="breadcrumbs" class="breadcrumbs flex flex-wrap items-center gap-2">
                <a href="/" class="hover:text-brand-gold">Startseite</a>
                <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                <span id="breadcrumb-current" class="text-gray-900 font-medium">...</span>
            </nav>
        </div>
    </div>
    <section class="hero-gradient py-16 md:py-24 relative overflow-hidden">
        <div class="max-w-4xl mx-auto px-4 text-center relative z-10">
            <p class="text-brand-gold text-sm md:text-base tracking-widest uppercase mb-4 font-heading"><i class="fas fa-heart mr-2"></i><span id="hero-subtitle">...</span></p>
            <h1 class="font-heading font-bold text-3xl md:text-5xl lg:text-6xl text-white leading-tight mb-6"><span id="hero-pretitle">Finde Singles</span> <br><span id="hero-title" class="text-brand-gold">...</span></h1>
            <p id="hero-description" class="text-gray-300 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">...</p>
            <a href="#vergleich" class="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-luxury text-brand-black font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"><i class="fas fa-search"></i><span id="hero-cta">Singles finden</span></a>
            <p class="text-gray-400 text-xs mt-6"><i class="fas fa-check-circle text-green-400 mr-1"></i><span id="hero-badge">Geprüft</span></p>
        </div>
    </section>
    <section class="py-16 bg-white">
        <div class="max-w-6xl mx-auto px-4">
            <div class="text-center mb-12"><h2 id="intro-title" class="font-heading font-bold text-2xl md:text-3xl text-gray-900 mb-4">Dein Dating-Guide</h2></div>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100 shadow-sm"><i class="fas fa-user-secret text-brand-primary text-2xl mb-3"></i><h3 class="font-heading font-bold text-lg text-gray-900 mb-2">Diskret</h3><p class="text-gray-600 text-sm">Geprüfte Profile.</p></div>
                    <div class="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100 shadow-sm"><i class="fas fa-map-marker-alt text-brand-primary text-2xl mb-3"></i><h3 class="font-heading font-bold text-lg text-gray-900 mb-2">Regional</h3><p class="text-gray-600 text-sm">Direkt in deiner Umgebung.</p></div>
                </div>
                <div class="flex items-center justify-center"><div id="banner-container" class="w-full"><div class="ad-box rounded-xl"><span class="ad-label">Anzeige</span><div class="text-center"><p class="text-gray-500 text-sm">Werbefläche</p></div></div></div></div>
            </div>
            
            <div class="mt-12 bg-gray-50 rounded-2xl p-6 md:p-8">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div><h3 class="font-heading font-bold text-lg text-gray-900">Schnellnavigation</h3><p class="text-gray-600 text-sm">Beliebte Themen</p></div>
                    <a href="#vergleich" class="inline-flex items-center gap-2 text-brand-primary hover:text-brand-dark font-semibold"><i class="fas fa-arrow-down"></i> Zum Vergleich</a>
                </div>
                <div class="flex flex-wrap gap-3">
                    {{QUICK_NAV_LINKS}}
                </div>
                {{18_PLUS_HINT}}
            </div>
        </div>
    </section>
    <section id="vergleich" class="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div class="max-w-4xl mx-auto px-4">
            <div class="text-center mb-10"><h2 id="list-title" class="font-heading font-bold text-2xl md:text-3xl text-gray-900 mb-2">Top Apps</h2></div>
            <div id="project-list-container" class="space-y-6"><div class="text-center py-8 text-gray-400"><i class="fas fa-spinner fa-spin text-2xl mb-2"></i><p>Lade Projekte...</p></div></div>
            <p class="text-center text-gray-500 text-xs mt-8">*Werbung / Affiliate Links</p>
        </div>
    </section>
    <section class="py-16 bg-white"><div class="max-w-4xl mx-auto px-4"><div id="long-content-top" class="prose prose-lg max-w-none"></div></div></section>
    <section id="seo-content" class="py-16 bg-gray-50"><div class="max-w-4xl mx-auto px-4"><div id="long-content-bottom" class="prose prose-lg max-w-none"></div></div></section>
    <footer class="bg-[#0a0a0a] border-t border-white/5">
        <div class="max-w-6xl mx-auto px-4 py-12 text-center">
            <div class="mb-10"><a href="/"><span id="footer-site-name" class="font-heading font-bold text-2xl text-white">Rank-Scout</span></a></div>
            <div id="footer-links" class="flex flex-wrap justify-center gap-6 mb-6"></div>
            <p class="text-gray-500 text-xs"><span id="footer-copyright">&copy; 2026.</span></p>
        </div>
    </footer>
    <script>
    (async function() {
        const SUPABASE_URL = 'https://oeshjjvhtmebjwbouayc.supabase.co';
        const SUPABASE_KEY = 'sb_publishable_3Wk4Tcg02ylmxwh5Om45UQ_j7GlZ7Ic';
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        const SLUG = pathParts[0] || 'salzburg';
        const el = (id) => document.getElementById(id);
        function addSubId(link) { if(!link) return '#'; return link + (link.includes('?') ? '&' : '?') + 'subid=' + SLUG; }
        function sanitizeUrl(url) { if(!url) return '#'; try { const p = new URL(url); return ['http:','https:'].includes(p.protocol) ? url : '#'; } catch{ return '#'; } }
        function escapeHtml(str) { if(!str) return ''; const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
        window.closeTopBar = function() { el('top-bar').classList.add('hidden'); };
        try {
            const headers = { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY };
            
            // Settings Fetch
            const setRes = await fetch(SUPABASE_URL + '/rest/v1/settings?select=*', { headers });
            const settingsArr = setRes.ok ? await setRes.json() : [];
            const settings = {}; (settingsArr||[]).forEach(s => settings[s.key] = s.value);
            
            if(settings.custom_css && el('custom-css')) el('custom-css').textContent = settings.custom_css;
            if(settings.top_bar_active) { el('top-bar').classList.remove('hidden'); if(settings.top_bar_text) el('top-bar-text').textContent=settings.top_bar_text; if(settings.top_bar_link) el('top-bar-link').href=addSubId(settings.top_bar_link); }
            
            // Category Fetch
            const catRes = await fetch(SUPABASE_URL + '/rest/v1/categories?slug=eq.' + SLUG + '&select=*', { headers });
            const categories = catRes.ok ? await catRes.json() : [];
            
            if(!categories || categories.length === 0) { el('project-list-container').innerHTML = '<p class="text-center">Kategorie nicht gefunden.</p>'; return; }
            const category = categories[0];
            const year = new Date().getFullYear();
            
            // Meta & Content Fill
            if(category.meta_title) el('page-title').textContent = category.meta_title.replace(/2026/g, year);
            if(category.meta_description) el('meta-description').setAttribute('content', category.meta_description.replace(/2026/g, year));
            el('canonical-link').href = 'https://dating.rank-scout.com/' + SLUG + '/';
            
            if(category.hero_pretitle) el('hero-pretitle').textContent = category.hero_pretitle;
            if(category.hero_headline) el('hero-title').textContent = category.hero_headline;
            if(category.description) el('hero-description').textContent = category.description;
            if(category.hero_cta_text) el('hero-cta').textContent = category.hero_cta_text;
            if(category.hero_badge_text) el('hero-badge').textContent = category.hero_badge_text;
            if(category.site_name) el('header-site-name').textContent = category.site_name;
            el('breadcrumb-current').textContent = category.name;
            el('intro-title').textContent = 'Dein Dating-Guide für ' + category.name;
            if(category.long_content_top) el('long-content-top').innerHTML = category.long_content_top;
            if(category.long_content_bottom) el('long-content-bottom').innerHTML = category.long_content_bottom;
            if(category.banner_override) el('banner-container').innerHTML = category.banner_override;
            
            // Project Loading Logic (Fixing 400 Bad Request)
            let projects = [];
            const cpRes = await fetch(SUPABASE_URL + '/rest/v1/category_projects?category_id=eq.' + category.id + '&select=project_id,sort_order&order=sort_order.asc', { headers });
            const catProjs = cpRes.ok ? await cpRes.json() : [];
            
            if(catProjs.length > 0) {
                const pIds = catProjs.map(c => c.project_id).filter(Boolean); // Filter nulls
                if (pIds.length > 0) {
                    const pRes = await fetch(SUPABASE_URL + '/rest/v1/projects?id=in.(' + pIds.join(',') + ')&is_active=eq.true&select=*', { headers });
                    projects = pRes.ok ? await pRes.json() : [];
                    const oMap = {}; catProjs.forEach(c => oMap[c.project_id]=c.sort_order);
                    projects.sort((a,b) => (oMap[a.id]||0)-(oMap[b.id]||0));
                }
            } 
            
            // Fallback: Default Projects
            if (projects.length === 0) {
                const defRes = await fetch(SUPABASE_URL + '/rest/v1/projects?is_default=eq.true&is_active=eq.true&select=*&order=sort_order.asc&limit=5', { headers });
                projects = defRes.ok ? await defRes.json() : [];
            }

            // Rendering
            if(projects.length > 0) {
                const html = projects.map((p,i) => {
                    const isFirst = i===0;
                    const badge = isFirst ? '<span class="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-brand-gold to-yellow-500 text-brand-black"><i class="fas fa-trophy mr-1"></i>'+(p.badge_text||'Testsieger')+'</span>' : '<span class="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-gray-200 text-gray-700">Platz '+(i+1)+'</span>';
                    const border = isFirst ? 'border-2 border-brand-gold ring-2 ring-brand-gold/20' : 'border border-gray-100';
                    const link = addSubId(p.affiliate_link || p.url);
                    const features = (p.features||[]).map(f => '<p class="flex items-start gap-2 text-sm text-gray-700"><i class="fas fa-check text-green-500 mt-1"></i>'+escapeHtml(f)+'</p>').join('');
                    return '<div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden '+border+'"><div class="p-1">'+badge+'</div><div class="p-4 md:p-6 pt-2"><div class="flex flex-col md:flex-row gap-4 md:gap-6"><div class="flex-shrink-0 flex justify-center md:justify-start"><div class="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-gray-100 shadow-md flex items-center justify-center"><img src="'+sanitizeUrl(p.logo_url)+'" class="w-full h-full object-cover"></div></div><div class="flex-1 min-w-0"><h3 class="font-heading font-bold text-lg md:text-xl text-gray-900 mb-2 text-center md:text-left">'+escapeHtml(p.name)+'</h3><div class="flex items-center justify-center md:justify-start gap-2 mb-4"><div class="flex text-brand-gold"><i class="fas fa-star"></i></div><span class="font-bold text-gray-900">'+(p.rating||9.5)+'/10</span></div><div class="space-y-2 mb-4">'+features+'</div></div><div class="flex-shrink-0 flex items-center justify-center md:justify-end w-full md:w-auto"><a href="'+link+'" target="_blank" rel="nofollow" class="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-6 rounded-full transition-all duration-300 btn-gold-hover">Kostenlos Registrieren <i class="fas fa-arrow-right"></i></a></div></div></div></div>';
                }).join('');
                el('project-list-container').innerHTML = html;
            } else { el('project-list-container').innerHTML = '<p class="text-center text-gray-500">Keine Projekte verfügbar.</p>'; }
            
            // Footer
            el('footer-site-name').textContent = category.footer_site_name || category.site_name || 'Rank-Scout';
            el('footer-copyright').textContent = '© ' + year + ' ' + (category.site_name||'Rank-Scout');
            
            const legRes = await fetch(SUPABASE_URL + '/rest/v1/footer_links?category_id=eq.' + category.id + '&is_active=eq.true&order=sort_order.asc&select=*', { headers });
            let legalLinks = legRes.ok ? await legRes.json() : [];
            if(legalLinks.length===0) { 
                const gLeg = await fetch(SUPABASE_URL + '/rest/v1/footer_links?category_id=is.null&is_active=eq.true&order=sort_order.asc&select=*', { headers }); 
                legalLinks = gLeg.ok ? await gLeg.json() : []; 
            }
            if(legalLinks.length>0) el('footer-links').innerHTML = legalLinks.map(l => '<a href="'+sanitizeUrl(l.url)+'" class="text-gray-400 hover:text-white text-sm uppercase">'+escapeHtml(l.label)+'</a>').join('');
        } catch(e) { console.error('Render Error:', e); }
    })();
    </script>
</body>
</html>`;

// ============================================================================
// 🟢 VORLAGE 2: ERFAHRUNGSBERICHT (Optimierte Fonts & Script)
// ============================================================================
const REVIEW_TEMPLATE = `<!DOCTYPE html>
<html lang="de">
<head>
    <link rel="canonical" href="" id="canonical-link" />
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="https://dating.rank-scout.com/top3-dating-apps/images/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="16x16" href="https://dating.rank-scout.com/top3-dating-apps/images/favicon-16x16.png">
    <link rel="icon" type="image/png" sizes="32x32" href="https://dating.rank-scout.com/top3-dating-apps/images/favicon-32x32.png">
    <title id="page-title">Erfahrungsbericht</title>
    <meta id="meta-description" name="description" content="Ausführlicher Testbericht und Erfahrungen.">
    <meta name="robots" content="index, follow">
    <script type="application/ld+json" id="json-ld-schema">{}</script>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">

    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script>
        tailwind.config = { theme: { extend: { colors: { brand: { black: '#0a0a0a', dark: '#58000c', primary: '#c41e3a', light: '#ff4d6d', gold: '#fbbf24', bg: '#fafafa', } }, fontFamily: { sans: ['Open Sans', 'sans-serif'], heading: ['Montserrat', 'sans-serif'], } } } }
    </script>
    <style>
        *, *::before, *::after { box-sizing: border-box; } html { scroll-behavior: smooth; } body { background: #fafafa; }
        .article-content h2 { font-family: 'Montserrat', sans-serif; font-size: 1.75rem; font-weight: 700; color: #1a1a1a; margin: 2.5rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #f3f4f6; }
        .article-content h3 { font-family: 'Montserrat', sans-serif; font-size: 1.25rem; font-weight: 600; color: #374151; margin: 2rem 0 0.75rem; }
        .article-content p { font-size: 1.125rem; line-height: 1.85; color: #4b5563; margin-bottom: 1.25rem; }
        .article-content ul, .article-content ol { margin: 1.25rem 0; padding-left: 1.5rem; }
        .article-content li { font-size: 1.125rem; line-height: 1.7; color: #4b5563; margin-bottom: 0.5rem; }
        .article-content a { color: #c41e3a; text-decoration: underline; text-underline-offset: 2px; }
        .article-content a:hover { color: #ff4d6d; }
        .article-content blockquote { border-left: 4px solid #c41e3a; background: #fff; padding: 1.5rem; margin: 2rem 0; border-radius: 0 0.75rem 0.75rem 0; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .sidebar-sticky { position: sticky; top: 100px; }
        .winner-card { background: linear-gradient(135deg, #ffffff 0%, #fef3c7 100%); border: 2px solid #fbbf24; position: relative; overflow: hidden; }
        .rating-badge { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #1a1a1a; font-weight: 700; }
        .cta-button { background: linear-gradient(135deg, #c41e3a 0%, #ff4d6d 100%); transition: all 0.3s ease; }
        .cta-button:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(196, 30, 58, 0.35); }
        .pros-card { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-left: 4px solid #10b981; }
        .cons-card { background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%); border-left: 4px solid #ef4444; }
    </style>
</head>
<body class="font-sans antialiased text-gray-800">
    <header class="w-full bg-brand-black text-white py-4 px-6 shadow-lg sticky top-0 z-50">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <a id="header-site-name" href="/" class="font-heading font-bold text-xl tracking-tight text-brand-gold hover:text-brand-light transition-colors">DatingRankScout</a>
            <nav class="hidden md:flex items-center space-x-6 text-sm">
                <a href="/top3-dating-apps/" class="hover:text-brand-gold transition-colors">Top Dating Apps</a>
                <a href="/testberichte/" class="hover:text-brand-gold transition-colors">Testberichte</a>
            </nav>
            <a href="/top3-dating-apps/" class="text-sm bg-brand-primary hover:bg-brand-light text-white px-4 py-2 rounded-full transition-all duration-300">Apps vergleichen</a>
        </div>
    </header>
    <div class="bg-white border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-6 py-4">
            <nav id="breadcrumbs" class="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                <a href="/" class="hover:text-brand-primary transition-colors">Startseite</a>
                <i class="fas fa-chevron-right text-xs text-gray-300"></i>
                <a href="/testberichte/" class="hover:text-brand-primary transition-colors">Testberichte</a>
                <i class="fas fa-chevron-right text-xs text-gray-300"></i>
                <span id="breadcrumb-current" class="text-gray-900 font-medium">...</span>
            </nav>
        </div>
    </div>
    <main class="max-w-7xl mx-auto px-6 py-12">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <article class="lg:col-span-2">
                <header class="mb-10">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-sm font-medium"><i class="fas fa-file-alt"></i> Testbericht</span>
                        <span class="text-gray-400 text-sm"><i class="far fa-calendar mr-1"></i> <span id="article-date">Januar 2026</span></span>
                    </div>
                    <h1 id="article-title" class="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">...</h1>
                    <p id="article-excerpt" class="text-xl text-gray-600 leading-relaxed">...</p>
                </header>
                <div class="bg-white rounded-2xl shadow-lg p-6 mb-10 border border-gray-100">
                    <div class="flex items-center gap-3 mb-4"><div class="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center"><i class="fas fa-clipboard-check text-brand-primary"></i></div><h2 class="font-heading font-bold text-lg text-gray-900">Kurzbewertung</h2></div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="text-center p-3 bg-gray-50 rounded-xl"><p class="text-2xl font-bold text-brand-primary" id="rating-overall">--</p><p class="text-xs text-gray-500 mt-1">Gesamt</p></div>
                        <div class="text-center p-3 bg-gray-50 rounded-xl"><p class="text-2xl font-bold text-gray-900" id="rating-usability">--</p><p class="text-xs text-gray-500 mt-1">Bedienung</p></div>
                        <div class="text-center p-3 bg-gray-50 rounded-xl"><p class="text-2xl font-bold text-gray-900" id="rating-value">--</p><p class="text-xs text-gray-500 mt-1">Preis</p></div>
                        <div class="text-center p-3 bg-gray-50 rounded-xl"><p class="text-2xl font-bold text-gray-900" id="rating-quality">--</p><p class="text-xs text-gray-500 mt-1">Qualität</p></div>
                    </div>
                </div>
                <div id="article-content" class="article-content"><p>Lade Inhalt...</p></div>
                
                <div class="mt-12 bg-gray-50 rounded-2xl p-6 md:p-8">
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div><h3 class="font-heading font-bold text-lg text-gray-900">Schnellnavigation</h3><p class="text-gray-600 text-sm">Beliebte Themen</p></div>
                    </div>
                    <div class="flex flex-wrap gap-3">
                        {{QUICK_NAV_LINKS}}
                    </div>
                    {{18_PLUS_HINT}}
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
                    <div class="pros-card rounded-2xl p-6"><h3 class="font-heading font-bold text-lg text-green-800 flex items-center gap-2 mb-4"><i class="fas fa-check-circle"></i> Vorteile</h3><ul id="pros-list" class="space-y-2 text-green-900"></ul></div>
                    <div class="cons-card rounded-2xl p-6"><h3 class="font-heading font-bold text-lg text-red-800 flex items-center gap-2 mb-4"><i class="fas fa-times-circle"></i> Nachteile</h3><ul id="cons-list" class="space-y-2 text-red-900"></ul></div>
                </div>
            </article>
            <aside class="lg:col-span-1">
                <div class="sidebar-sticky space-y-6">
                    <div id="testsieger-card" class="winner-card rounded-2xl shadow-lg p-6">
                        <div class="flex items-center gap-2 mb-4"><span class="rating-badge px-3 py-1 rounded-full text-sm"><i class="fas fa-trophy mr-1"></i> Testsieger</span></div>
                        <div id="winner-content" class="text-center">
                            <img id="winner-logo" src="https://via.placeholder.com/120x60?text=Logo" alt="Logo" class="h-16 w-auto mx-auto mb-4 object-contain" />
                            <h3 id="winner-name" class="font-heading font-bold text-xl text-gray-900 mb-2">...</h3>
                            <p id="winner-rating" class="text-3xl font-bold text-brand-primary mb-4">--/10</p>
                            <a id="winner-link" href="#" target="_blank" class="cta-button block w-full text-white text-center font-bold py-4 px-6 rounded-xl">Zum Anbieter <i class="fas fa-external-link-alt ml-2"></i></a>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    </main>
    <footer class="bg-[#0a0a0a] border-t border-white/5 mt-20">
        <div class="max-w-6xl mx-auto px-4 py-12 text-center">
            <div class="mb-10"><a href="/" class="inline-block"><span id="footer-site-name" class="font-heading font-bold text-2xl text-white">Rank-Scout</span></a></div>
            <div id="footer-links" class="flex flex-wrap justify-center gap-6 mb-6"></div>
            <p class="text-gray-500 text-xs"><span id="footer-copyright">&copy; 2026.</span></p>
        </div>
    </footer>
    <script>
    (async function() {
        const SUPABASE_URL = 'https://oeshjjvhtmebjwbouayc.supabase.co';
        const SUPABASE_KEY = 'sb_publishable_3Wk4Tcg02ylmxwh5Om45UQ_j7GlZ7Ic';
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        const SLUG = pathParts[0] || 'salzburg';
        const el = (id) => document.getElementById(id);
        function addSubId(link) { if(!link) return '#'; return link + (link.includes('?') ? '&' : '?') + 'subid=' + SLUG; }
        function sanitizeUrl(url) { if(!url) return '#'; try { const p = new URL(url); return ['http:','https:'].includes(p.protocol) ? url : '#'; } catch{ return '#'; } }
        function escapeHtml(str) { if(!str) return ''; const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
        window.closeTopBar = function() { el('top-bar').classList.add('hidden'); };
        try {
            const headers = { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY };
            const catRes = await fetch(SUPABASE_URL + '/rest/v1/categories?slug=eq.' + SLUG + '&select=*', { headers });
            const categories = catRes.ok ? await catRes.json() : [];
            const category = categories[0];
            if (!category) { el('article-content').innerHTML = 'Nicht gefunden'; return; }
            const year = new Date().getFullYear();
            el('article-date').textContent = new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
            if(category.h1_title) el('article-title').textContent = category.h1_title.replace(/2026/g, year);
            if(category.meta_title) document.title = category.meta_title.replace(/2026/g, year);
            el('breadcrumb-current').textContent = category.name;
            if(category.site_name) el('header-site-name').textContent = category.site_name;
            if(category.description) el('article-content').innerHTML = category.description;
            else if(category.long_content_top) el('article-content').innerHTML = category.long_content_top;
            
            const projRes = await fetch(SUPABASE_URL + '/rest/v1/category_projects?category_id=eq.' + category.id + '&select=*,projects(*)&order=sort_order.asc&limit=1', { headers });
            const categoryProjects = projRes.ok ? await projRes.json() : [];
            const topProject = categoryProjects[0]?.projects;
            if (topProject) {
                el('winner-name').textContent = topProject.name;
                el('winner-rating').textContent = (topProject.rating || 9.0).toFixed(1) + '/10';
                if (topProject.logo_url) el('winner-logo').src = topProject.logo_url;
                el('winner-link').href = topProject.affiliate_link || '#';
                el('rating-overall').textContent = (topProject.rating || 9.0).toFixed(1);
                el('rating-usability').textContent = ((topProject.rating || 9.0) - 0.2).toFixed(1);
                el('rating-value').textContent = ((topProject.rating || 9.0) - 0.3).toFixed(1);
                el('rating-quality').textContent = (Math.min((topProject.rating || 9.0) + 0.1, 10)).toFixed(1);
                if (topProject.pros_list) el('pros-list').innerHTML = topProject.pros_list.map(p => '<li class="flex gap-2"><i class="fas fa-check text-green-600 mt-1"></i><span>'+escapeHtml(p)+'</span></li>').join('');
                if (topProject.cons_list) el('cons-list').innerHTML = topProject.cons_list.map(c => '<li class="flex gap-2"><i class="fas fa-times text-red-600 mt-1"></i><span>'+escapeHtml(c)+'</span></li>').join('');
            } else { el('testsieger-card').style.display = 'none'; }
            
            el('footer-copyright').textContent = '© ' + year + ' ' + (category.site_name||'Rank-Scout');
        } catch(e) { console.error('Render Error:', e); }
    })();
    </script>
</body>
</html>`;

// Helper to generate slug from page name
function generateSlug(name: string): string {
  return name.toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Helper to extract SEO data from HTML
function extractMetaFromHtml(html: string): { title: string | null; metaDescription: string | null; h1Title: string | null } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  return {
    title: doc.querySelector('title')?.textContent?.trim() || null,
    metaDescription: doc.querySelector('meta[name="description"]')?.getAttribute('content') || null,
    h1Title: doc.querySelector('h1')?.textContent?.trim() || null,
  };
}

// --- DYNAMIC CONTENT GENERATORS ---
function generateQuickNavHtml(settings: any) {
    if (!settings) return "";
    
    const links = [];
    
    // Style für die Buttons
    const btnClass = "inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm text-gray-700 hover:text-brand-primary hover:shadow-md transition-all border border-gray-200";

    if (settings.show_top3_dating_apps) {
        links.push(`<a href="/top3-dating-apps/" class="${btnClass}"><i class="fas fa-star text-brand-gold"></i> Top3 Dating Apps</a>`);
    }
    if (settings.show_singles_in_der_naehe) {
        links.push(`<a href="/singles-in-der-naehe/" class="${btnClass}"><i class="fas fa-location-dot text-brand-primary"></i> Singles in der Nähe</a>`);
    }
    if (settings.show_chat_mit_einer_frau) {
        links.push(`<a href="/chat-mit-einer-frau/" class="${btnClass}"><i class="fas fa-comments text-brand-primary"></i> Chat mit einer Frau</a>`);
    }
    if (settings.show_online_dating_cafe) {
        links.push(`<a href="/online-dating-cafe/" class="${btnClass}"><i class="fas fa-coffee text-brand-primary"></i> Online Dating Cafe</a>`);
    }
    if (settings.show_bildkontakte_login) {
        links.push(`<a href="/bildkontakte-login/" class="${btnClass}"><i class="fas fa-image text-brand-primary"></i> Bildkontakte Login</a>`);
    }

    return links.join('\n');
}

function generate18PlusHintHtml(settings: any) {
    if (settings?.show_18plus_hint_box) {
        return `
        <div class="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div class="flex items-start gap-3">
                <i class="fas fa-exclamation-triangle text-red-500 mt-1"></i>
                <div>
                    <h4 class="font-bold text-red-800 text-sm">Hinweis: 18+ Bereich</h4>
                    <p class="text-red-700 text-sm mt-1">Wenn du explizit Inhalte für Erwachsene suchst, nutze bitte ausschließlich den 18+ Bereich:</p>
                    <a href="https://adult.rank-scout.com" class="inline-flex items-center gap-2 text-red-600 hover:text-red-800 font-semibold mt-2 text-sm">
                        <i class="fas fa-external-link-alt"></i> adult.rank-scout.com (18+)
                    </a>
                </div>
            </div>
        </div>`;
    }
    return "";
}

export default function AdminCategories() {
  const { data: categories = [], isLoading } = useCategories(true);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const duplicateCategory = useDuplicateCategory();
  const updateCategoryProjects = useUpdateCategoryProjects();
  const { generateContent, isGenerating } = useGenerateCityContent();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  
  const [exportCategory, setExportCategory] = useState<Category | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState<string | null>(null);

  const { data: categoryProjects = [] } = useCategoryProjects(editingCategory?.id);

  useEffect(() => {
    if (categoryProjects.length > 0) {
      const sorted = [...categoryProjects].sort((a, b) => a.sort_order - b.sort_order);
      setSelectedProjectIds(sorted.map((cp) => cp.project_id));
    } else if (!editingCategory) {
      setSelectedProjectIds([]);
    }
  }, [categoryProjects, editingCategory]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      theme: "DATING",
      template: "comparison",
      is_active: true,
      sort_order: 0,
    },
  });

  const theme = watch("theme");
  const template = watch("template");
  const colorTheme = watch("color_theme");
  const isActive = watch("is_active");
  const nameValue = watch("name");
  const customHtmlOverride = watch("custom_html_override");

  // --- DEPLOYMENT LOGIC (FINAL MIT DYNAMIK) ---
  async function handleDeploy(category: Category) {
    setIsDeploying(category.id);
    
    // ⚠️ HIER DEIN ECHTES BRIDGE-PASSWORT REIN:
    const BRIDGE_URL = "https://dating.rank-scout.com/bridge.php"; 
    const API_KEY = "4382180593Rank-Scout"; 

    try {
      let htmlContent = "";

      // 1. Manuelles Override (hat immer Vorrang)
      if (category.custom_html_override && category.custom_html_override.trim() !== "") {
        htmlContent = category.custom_html_override;
      } 
      // 2. Seitentyp: Erfahrungsbericht (Review)
      else if (category.template === 'review') {
        htmlContent = REVIEW_TEMPLATE;
      }
      // 3. Seitentyp: Vergleichstabelle (Comparison) - Auch als Fallback
      else {
        htmlContent = COMPARISON_TEMPLATE;
      }

      // --- DYNAMISCHE INHALTE EINBAUEN ---
      const quickNavHtml = generateQuickNavHtml(category.navigation_settings);
      const hintHtml = generate18PlusHintHtml(category.navigation_settings);

      // Wir ersetzen die Platzhalter in den Templates
      htmlContent = htmlContent.replace("{{QUICK_NAV_LINKS}}", quickNavHtml);
      htmlContent = htmlContent.replace("{{18_PLUS_HINT}}", hintHtml);

      // Senden an die Bridge
      const response = await fetch(BRIDGE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": API_KEY },
        body: JSON.stringify({
          html: htmlContent,
          slug: category.slug
        })
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        toast({
          title: "🚀 Update erfolgreich!",
          description: `Online: ${result.url}`,
          className: "bg-green-600 text-white border-green-700"
        });
      } else {
        throw new Error(result.message || "Fehler");
      }

    } catch (error) {
      console.error(error);
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive"
      });
    } finally {
      setIsDeploying(null);
    }
  }

  // --- RESTLICHE FUNKTIONEN (unverändert) ---
  function handleExtractFromHtml() {
    const html = customHtmlOverride;
    if (!html || html.trim() === "") {
      toast({ title: "Kein HTML", description: "Füge HTML ein.", variant: "destructive" });
      return;
    }
    const extracted = extractMetaFromHtml(html);
    if (extracted.title) setValue("meta_title", extracted.title);
    if (extracted.metaDescription) setValue("meta_description", extracted.metaDescription);
    if (extracted.h1Title) setValue("h1_title", extracted.h1Title);
    toast({ title: "Extrahiert!" });
  }

  useEffect(() => {
    if (!editingCategory && nameValue) {
      setValue("slug", generateSlug(nameValue));
    }
  }, [nameValue, editingCategory, setValue]);

  function openCreateDialog() {
    setEditingCategory(null);
    setSelectedProjectIds([]);
    reset({
      slug: "",
      name: "",
      description: "",
      icon: "📍",
      theme: "DATING",
      template: "comparison",
      color_theme: "dark",
      site_name: "",
      hero_headline: "",
      hero_pretitle: "Finde Singles in",
      hero_cta_text: "",
      hero_badge_text: "",
      meta_title: "",
      meta_description: "",
      h1_title: "",
      long_content_top: "",
      long_content_bottom: "",
      analytics_code: "",
      banner_override: "",
      custom_html_override: "",
      footer_site_name: "",
      footer_copyright_text: "",
      footer_designer_name: "Digital-Perfect",
      footer_designer_url: "https://digital-perfect.at",
      navigation_settings: {
        show_top3_dating_apps: true,
        show_singles_in_der_naehe: true,
        show_chat_mit_einer_frau: true,
        show_online_dating_cafe: true,
        show_bildkontakte_login: true,
        show_18plus_hint_box: true,
      },
      is_active: true,
      sort_order: categories.length,
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category);
    const defaultNavSettings = {
      show_top3_dating_apps: true,
      show_singles_in_der_naehe: true,
      show_chat_mit_einer_frau: true,
      show_online_dating_cafe: true,
      show_bildkontakte_login: true,
      show_18plus_hint_box: true,
    };
    reset({
      slug: category.slug,
      name: category.name,
      description: category.description || "",
      icon: category.icon || "📍",
      theme: category.theme,
      template: category.template || "comparison",
      color_theme: category.color_theme || "dark",
      site_name: category.site_name || "",
      hero_headline: category.hero_headline || "",
      hero_pretitle: category.hero_pretitle || "Finde Singles in",
      hero_cta_text: category.hero_cta_text || "",
      hero_badge_text: category.hero_badge_text || "",
      meta_title: category.meta_title || "",
      meta_description: category.meta_description || "",
      h1_title: category.h1_title || "",
      long_content_top: category.long_content_top || "",
      long_content_bottom: category.long_content_bottom || "",
      analytics_code: category.analytics_code || "",
      banner_override: category.banner_override || "",
      custom_html_override: category.custom_html_override || "",
      footer_site_name: category.footer_site_name || "",
      footer_copyright_text: category.footer_copyright_text || "",
      footer_designer_name: category.footer_designer_name || "Digital-Perfect",
      footer_designer_url: category.footer_designer_url || "https://digital-perfect.at",
      navigation_settings: category.navigation_settings || defaultNavSettings,
      is_active: category.is_active,
      sort_order: category.sort_order,
    });
    setIsDialogOpen(true);
  }

  // 🔥🔥🔥 AUTOMATISCHES DEPLOYMENT + ZEITSTEMPEL FIX 🔥🔥🔥
  async function onSubmit(data: CategoryInput) {
    try {
      // 🟢 Datum JETZT setzen
      const now = new Date().toISOString();
      let categoryForDeploy: Category;

      // Wir fügen das Datum zu den Eingabedaten hinzu, falls die API es akzeptiert,
      // oder verlassen uns darauf, dass die DB es beim Update setzt.
      // ABER: Für die UI-Anzeige direkt danach und das Deployment brauchen wir es.
      
      if (editingCategory) {
        // 1. DB Update (mit explizitem Datum, falls schema es erlaubt, sonst macht es Supabase hoffentlich per Trigger)
        // Um sicherzugehen, dass die UI aktualisiert wird, invalidieren wir später die Query.
        await updateCategory.mutateAsync({ id: editingCategory.id, input: { ...data, updated_at: now } as any });
        
        categoryForDeploy = { ...editingCategory, ...data, updated_at: now } as Category;
        
        toast({ title: "Gespeichert... Starte Deployment 🚀" });
      } else {
        // 1. DB Create
        const result = await createCategory.mutateAsync(data);
        
        categoryForDeploy = { 
            id: result.id, 
            created_at: now, 
            updated_at: now,
            user_id: 'system', 
            ...data 
        } as Category;

        toast({ title: "Erstellt... Starte Deployment 🚀" });
      }

      // 3. Projekte speichern
      await updateCategoryProjects.mutateAsync({
        categoryId: categoryForDeploy.id,
        projectIds: selectedProjectIds,
      });

      // 4. AUTOMATISCHES DEPLOYMENT
      await handleDeploy(categoryForDeploy);

      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Fehler beim Speichern",
        description: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Löschen?")) return;
    try { await deleteCategory.mutateAsync(id); toast({ title: "Gelöscht" }); } catch (error) { toast({ title: "Fehler", variant: "destructive" }); }
  }

  async function handleDuplicate(category: Category) {
    try { await duplicateCategory.mutateAsync(category); toast({ title: "Dupliziert" }); } catch (error) { toast({ title: "Fehler", variant: "destructive" }); }
  }

  async function handleToggleActive(category: Category) {
    try { await updateCategory.mutateAsync({ id: category.id, input: { is_active: !category.is_active } }); } catch (error) { toast({ title: "Fehler", variant: "destructive" }); }
  }

  async function handleMoveOrder(category: Category, direction: "up" | "down") {
    const currentIndex = categories.findIndex((c) => c.id === category.id);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;
    const otherCategory = categories[newIndex];
    try {
      await Promise.all([
        updateCategory.mutateAsync({ id: category.id, input: { sort_order: otherCategory.sort_order } }),
        updateCategory.mutateAsync({ id: otherCategory.id, input: { sort_order: category.sort_order } }),
      ]);
    } catch (error) { toast({ title: "Fehler", variant: "destructive" }); }
  }

  function handleExport(category: Category) {
    setExportCategory(category);
    setIsExportOpen(true);
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2"><LayoutTemplate className="w-6 h-6 text-primary" />Landingpages</h2>
          <p className="text-muted-foreground">Verwalte deine Affiliate-Landingpages.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button onClick={openCreateDialog} className="gap-2"><Plus className="w-4 h-4" />Neue Landingpage</Button></DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display flex items-center gap-2"><LayoutTemplate className="w-5 h-5" />{editingCategory ? "Landingpage bearbeiten" : "Neue Landingpage anlegen"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-8">
                  <TabsTrigger value="basic">Grunddaten</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="navigation">Navigation</TabsTrigger>
                  <TabsTrigger value="footer">Footer</TabsTrigger>
                  <TabsTrigger value="projects">Apps</TabsTrigger>
                  <TabsTrigger value="tracking">Tracking</TabsTrigger>
                  <TabsTrigger value="override" className="flex items-center gap-1"><Wand2 className="w-3 h-3" />Override</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 pt-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1"><Label htmlFor="icon">Icon</Label><Input id="icon" {...register("icon")} className="text-center text-2xl" placeholder="📍" /></div>
                    <div className="col-span-3"><Label htmlFor="name">Seitenname (intern)</Label><Input id="name" {...register("name")} placeholder="z.B. Salzburg" /><p className="text-xs text-muted-foreground mt-1">Slug wird automatisch generiert.</p></div>
                  </div>
                  <div><Label htmlFor="slug">Slug (URL-Pfad)</Label><Input id="slug" {...register("slug")} placeholder="singles-salzburg" /></div>
                  <div><Label htmlFor="description">Kurzbeschreibung</Label><Textarea id="description" {...register("description")} placeholder="Beschreibung..." rows={2} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label htmlFor="theme">Branchen-Theme</Label><Select value={theme} onValueChange={(v) => setValue("theme", v as any)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="DATING">💕 Dating</SelectItem><SelectItem value="GENERIC">📊 Generisch</SelectItem><SelectItem value="CASINO">🎰 Casino</SelectItem><SelectItem value="ADULT">🔞 Adult</SelectItem></SelectContent></Select></div>
                    <div><Label htmlFor="template">Seitentyp</Label><Select value={template} onValueChange={(v) => setValue("template", v as any)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="comparison"><div className="flex items-center gap-2"><LayoutTemplate className="w-4 h-4" /><span>Vergleichstabelle</span></div></SelectItem><SelectItem value="review"><div className="flex items-center gap-2"><FileCheck className="w-4 h-4" /><span>Erfahrungsbericht</span></div></SelectItem></SelectContent></Select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label htmlFor="color_theme">Farbmodus</Label><Select value={colorTheme} onValueChange={(v) => setValue("color_theme", v as any)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dark">Dark Mode</SelectItem><SelectItem value="light">Light Mode</SelectItem><SelectItem value="neon">Neon Mode</SelectItem></SelectContent></Select></div>
                    <div className="flex items-center justify-between pt-6"><Label htmlFor="is_active">Aktiv</Label><Switch id="is_active" checked={isActive} onCheckedChange={(checked) => setValue("is_active", checked)} /></div>
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4 pt-4">
                  <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4">
                    <div className="flex flex-col gap-3">
                      <h4 className="font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4" />KI-Generator</h4>
                      <div className="flex gap-2">
                        <Input id="keyword-input" placeholder="Keyword (z.B. LGBTQ Dating)" className="flex-1" defaultValue={nameValue || ""} />
                        <Button type="button" variant="outline" onClick={() => { const kw = (document.getElementById('keyword-input') as HTMLInputElement).value; if(kw){ setValue("site_name", kw+"AT"); setValue("hero_pretitle","Finde Singles in"); setValue("hero_headline", `Lerne ${kw} Singles kennen`); setValue("meta_title", `Singles ${kw} 2026`); setValue("h1_title", `Singles ${kw}`); toast({title:"Generiert!"}); } }}>Alles generieren</Button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label htmlFor="site_name">Seitenname Header</Label><Input id="site_name" {...register("site_name")} /></div>
                    <div><Label htmlFor="hero_pretitle">Hero Pretitle</Label><Input id="hero_pretitle" {...register("hero_pretitle")} /></div>
                  </div>
                  <div><Label htmlFor="hero_headline">Hero Headline</Label><Input id="hero_headline" {...register("hero_headline")} /></div>
                  <div><Label htmlFor="description">Hero Beschreibung</Label><Textarea id="description" {...register("description")} rows={2} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label htmlFor="hero_cta_text">CTA Text</Label><Input id="hero_cta_text" {...register("hero_cta_text")} /></div>
                    <div><Label htmlFor="hero_badge_text">Badge Text</Label><Input id="hero_badge_text" {...register("hero_badge_text")} /></div>
                  </div>
                  <div><Label htmlFor="h1_title">H1 Titel</Label><Input id="h1_title" {...register("h1_title")} /></div>
                  <div><Label htmlFor="meta_title">Meta Title</Label><Input id="meta_title" {...register("meta_title")} /></div>
                  <div><Label htmlFor="meta_description">Meta Description</Label><Textarea id="meta_description" {...register("meta_description")} /></div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4 pt-4">
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex gap-4 items-end">
                    <div className="flex-1"><Label>Keyword</Label><Input id="ck" defaultValue={nameValue||"Dating"} /></div>
                    <div className="flex-1"><Label>Ort</Label><Input id="cl" defaultValue={nameValue||""} /></div>
                    <Button type="button" onClick={async()=>{ const k=(document.getElementById('ck')as any).value; const l=(document.getElementById('cl')as any).value; if(l){ toast({title:"Generiere..."}); const r=await generateContent(l,k,1000); if(r){setValue("long_content_top",r.contentTop); setValue("long_content_bottom",r.contentBottom); toast({title:"Fertig"});} } }}><Sparkles className="w-4 h-4 mr-2"/>Text</Button>
                  </div>
                  <div><Label>Content oben (HTML)</Label><Textarea {...register("long_content_top")} rows={8} className="font-mono text-sm" /></div>
                  <div><Label>Content unten (HTML)</Label><Textarea {...register("long_content_bottom")} rows={8} className="font-mono text-sm" /></div>
                  <div><Label>Banner Override</Label><Textarea {...register("banner_override")} rows={4} className="font-mono text-sm" /></div>
                </TabsContent>

                <TabsContent value="navigation" className="space-y-4 pt-4">
                  <div className="space-y-3 border rounded-lg p-4">
                    {["show_top3_dating_apps", "show_singles_in_der_naehe", "show_chat_mit_einer_frau", "show_online_dating_cafe", "show_bildkontakte_login", "show_18plus_hint_box"].map(k => (
                      <div key={k} className="flex items-center justify-between py-2 border-b"><Label>{k.replace(/_/g,' ')}</Label><Switch checked={watch(`navigation_settings.${k}` as any)??true} onCheckedChange={c=>setValue(`navigation_settings.${k}` as any,c)}/></div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="footer" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Footer Logo</Label><Input {...register("footer_site_name")} /></div>
                    <div><Label>Copyright</Label><Input {...register("footer_copyright_text")} /></div>
                  </div>
                  <CategoryFooterLinksEditor categoryId={editingCategory?.id || null} />
                  <CategoryLegalLinksEditor categoryId={editingCategory?.id || null} />
                </TabsContent>

                <TabsContent value="projects" className="space-y-4 pt-4">
                  <ProjectCheckboxList selectedIds={selectedProjectIds} onChange={setSelectedProjectIds} />
                </TabsContent>

                <TabsContent value="tracking" className="space-y-4 pt-4">
                  <Label>Analytics Code</Label><Textarea {...register("analytics_code")} rows={10} className="font-mono text-sm" />
                </TabsContent>

                <TabsContent value="override" className="space-y-4 pt-4">
                  <div className="flex justify-between mb-2"><Label>HTML Override</Label><Button type="button" size="sm" variant="outline" onClick={handleExtractFromHtml}>Extrahieren</Button></div>
                  <Textarea {...register("custom_html_override")} rows={20} className="font-mono text-sm" />
                </TabsContent>
              </Tabs>
              <Button type="submit" className="w-full" disabled={createCategory.isPending || updateCategory.isPending}>{editingCategory ? "Speichern" : "Erstellen"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Ord.</TableHead><TableHead>Seite</TableHead><TableHead>Typ</TableHead><TableHead>Slug</TableHead><TableHead>Zuletzt aktualisiert</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aktionen</TableHead></TableRow></TableHeader>
            <TableBody>
              {categories.map((cat, idx) => (
                <TableRow key={cat.id}>
                  <TableCell><div className="flex flex-col gap-1"><button onClick={()=>handleMoveOrder(cat,"up")} disabled={idx===0}><ArrowUp className="w-3 h-3"/></button><button onClick={()=>handleMoveOrder(cat,"down")} disabled={idx===categories.length-1}><ArrowDown className="w-3 h-3"/></button></div></TableCell>
                  <TableCell><div className="flex gap-3"><span className="text-xl">{cat.icon}</span><div><div className="font-medium">{cat.name}</div><div className="text-xs text-muted-foreground">{cat.theme}</div></div></div></TableCell>
                  <TableCell>{cat.template==='review'?<span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">Review</span>:<span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Vergleich</span>}</TableCell>
                  <TableCell><code className="text-xs bg-muted px-2 py-1 rounded">/{cat.slug}</code></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDate(cat.updated_at)}
                    </div>
                  </TableCell>
                  <TableCell><Switch checked={cat.is_active} onCheckedChange={()=>handleToggleActive(cat)} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" onClick={()=>handleDeploy(cat)} disabled={isDeploying===cat.id} className="bg-green-600 hover:bg-green-700 text-white gap-2 mr-2">{isDeploying===cat.id?<Loader2 className="w-4 h-4 animate-spin"/>:<UploadCloud className="w-4 h-4"/>}{isDeploying===cat.id?"...":"Live"}</Button>
                      <Button variant="ghost" size="icon" onClick={()=>handleExport(cat)}><Download className="w-4 h-4"/></Button>
                      <Button variant="ghost" size="icon" onClick={()=>handleDuplicate(cat)}><Copy className="w-4 h-4"/></Button>
                      <Button variant="ghost" size="icon" onClick={()=>openEditDialog(cat)}><Pencil className="w-4 h-4"/></Button>
                      <Button variant="ghost" size="icon" onClick={()=>handleDelete(cat.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4"/></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <CityExportDialog open={isExportOpen} onOpenChange={setIsExportOpen} category={exportCategory} />
    </div>
  );
}