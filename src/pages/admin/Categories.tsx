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
import { Plus, Pencil, Trash2, Loader2, ArrowUp, ArrowDown, Copy, FileText, Download, LayoutTemplate, Code, Flag, FileCheck, Sparkles, Palette, Wand2, AlertTriangle, UploadCloud, Globe, Clock } from "lucide-react";
import ProjectCheckboxList from "@/components/admin/ProjectCheckboxList";
import CityExportDialog from "@/components/admin/CityExportDialog";
import { CategoryFooterLinksEditor } from "@/components/admin/CategoryFooterLinksEditor";
import { CategoryLegalLinksEditor } from "@/components/admin/CategoryLegalLinksEditor";
import { supabase } from "@/integrations/supabase/client";

// Helper: Datum formatieren
const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

// ============================================================================
// 🟢 VORLAGE 1: VERGLEICHSTABELLE (Original Design + Platzhalter für Navi)
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
    <link rel="apple-touch-icon" sizes="180x180" href="https://dating.rank-scout.com/top3-dating-apps/images/apple-touch-icon.png">
    <link rel="manifest" href="https://dating.rank-scout.com/top3-dating-apps/images/site.webmanifest">
    <link rel="icon" type="image/png" sizes="192x192" href="https://dating.rank-scout.com/top3-dating-apps/images/android-chrome-192x192.png">
    <link rel="icon" type="image/png" sizes="512x512" href="https://dating.rank-scout.com/top3-dating-apps/images/android-chrome-512x512.png">
    <title id="page-title">Vergleich</title>
    <meta id="meta-description" name="description" content="">
    <meta name="robots" content="index, follow">
    <script type="application/ld+json" id="json-ld-schema">{}</script>
    <style id="custom-css"></style>
    <style type="text/css">
        @font-face {font-family:Montserrat;font-style:normal;font-weight:400;src:url(https://fonts.gstatic.com/s/montserrat/v25/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2) format('woff2');font-display:swap;}
        @font-face {font-family:Montserrat;font-style:normal;font-weight:700;src:url(https://fonts.gstatic.com/s/montserrat/v25/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2) format('woff2');font-display:swap;}
        @font-face {font-family:'Open Sans';font-style:normal;font-weight:400;src:url(https://fonts.gstatic.com/s/opensans/v35/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVQUwaEQbjA.woff2) format('woff2');font-display:swap;}
        @font-face {font-family:'Open Sans';font-style:normal;font-weight:600;src:url(https://fonts.gstatic.com/s/opensans/v35/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVQUwaEQbjA.woff2) format('woff2');font-display:swap;}
    </style>
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
                {{HEADER_NAV}}
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
            const setRes = await fetch(SUPABASE_URL + '/rest/v1/settings?select=*', { headers });
            const settingsArr = await setRes.json();
            const settings = {}; (settingsArr||[]).forEach(s => settings[s.key] = s.value);
            if(settings.custom_css) el('custom-css').textContent = settings.custom_css;
            if(settings.top_bar_active) { el('top-bar').classList.remove('hidden'); if(settings.top_bar_text) el('top-bar-text').textContent=settings.top_bar_text; if(settings.top_bar_link) el('top-bar-link').href=addSubId(settings.top_bar_link); }
            const catRes = await fetch(SUPABASE_URL + '/rest/v1/categories?slug=eq.' + SLUG + '&select=*', { headers });
            const categories = await catRes.json();
            if(!categories || categories.length === 0) { el('project-list-container').innerHTML = '<p class="text-center">Kategorie nicht gefunden.</p>'; return; }
            const category = categories[0];
            const year = new Date().getFullYear();
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
            let projects = [];
            const cpRes = await fetch(SUPABASE_URL + '/rest/v1/category_projects?category_id=eq.' + category.id + '&select=project_id,sort_order&order=sort_order.asc', { headers });
            const catProjs = await cpRes.json();
            if(catProjs.length > 0) {
                const pIds = catProjs.map(c => c.project_id);
                const pRes = await fetch(SUPABASE_URL + '/rest/v1/projects?id=in.(' + pIds.join(',') + ')&is_active=eq.true&select=*', { headers });
                projects = await pRes.json();
                const oMap = {}; catProjs.forEach(c => oMap[c.project_id]=c.sort_order);
                projects.sort((a,b) => (oMap[a.id]||0)-(oMap[b.id]||0));
            } else {
                const defRes = await fetch(SUPABASE_URL + '/rest/v1/projects?is_default=eq.true&is_active=eq.true&select=*&order=sort_order.asc&limit=5', { headers });
                projects = await defRes.json();
            }
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
            } else { el('project-list-container').innerHTML = '<p class="text-center text-gray-500">Keine Projekte.</p>'; }
            el('footer-site-name').textContent = category.footer_site_name || category.site_name || 'Rank-Scout';
            el('footer-copyright').textContent = '© ' + year + ' ' + (category.site_name||'Rank-Scout');
            const legRes = await fetch(SUPABASE_URL + '/rest/v1/footer_links?category_id=eq.' + category.id + '&is_active=eq.true&order=sort_order.asc&select=*', { headers });
            let legalLinks = await legRes.json();
            if(legalLinks.length===0) { const gLeg = await fetch(SUPABASE_URL + '/rest/v1/footer_links?category_id=is.null&is_active=eq.true&order=sort_order.asc&select=*', { headers }); legalLinks = await gLeg.json(); }
            if(legalLinks.length>0) el('footer-links').innerHTML = legalLinks.map(l => '<a href="'+sanitizeUrl(l.url)+'" class="text-gray-400 hover:text-white text-sm uppercase">'+escapeHtml(l.label)+'</a>').join('');
        } catch(e) { console.error(e); }
    })();
    </script>
</body>
</html>`;

// ============================================================================
// 🟢 VORLAGE 2: ERFAHRUNGSBERICHT (Original + Platzhalter)
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
    <link rel="apple-touch-icon" sizes="180x180" href="https://dating.rank-scout.com/top3-dating-apps/images/apple-touch-icon.png">
    <title id="page-title">Erfahrungsbericht</title>
    <meta id="meta-description" name="description" content="Ausführlicher Testbericht und Erfahrungen.">
    <meta name="robots" content="index, follow">
    <script type="application/ld+json" id="json-ld-schema">{}</script>
    <style type="text/css">
        @font-face {font-family:Montserrat;font-style:normal;font-weight:400;src:url(https://fonts.gstatic.com/s/montserrat/v25/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2) format('woff2');font-display:swap;}
        @font-face {font-family:Montserrat;font-style:normal;font-weight:700;src:url(https://fonts.gstatic.com/s/montserrat/v25/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2) format('woff2');font-display:swap;}
        @font-face {font-family:'Open Sans';font-style:normal;font-weight:400;src:url(https://fonts.gstatic.com/s/opensans/v35/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVQUwaEQbjA.woff2) format('woff2');font-display:swap;}
        @font-face {font-family:'Open Sans';font-style:normal;font-weight:600;src:url(https://fonts.gstatic.com/s/opensans/v35/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVQUwaEQbjA.woff2) format('woff2');font-display:swap;}
    </style>
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
                {{HEADER_NAV}}
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
            const catRes = await fetch(SUPABASE_URL + '/rest/v1/categories?slug=eq.' + SLUG + '&select=*', { headers });
            const categories = await catRes.json();
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
            const categoryProjects = await projRes.json();
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
        } catch(e) { console.error(e); }
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
  const { data: categories = [], isLoading, refetch } = useCategories(true);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const duplicateCategory = useDuplicateCategory();
  const updateCategoryProjects = useUpdateCategoryProjects();
  const { generateContent, isGenerating } = useGenerateCityContent();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState<string | null>(null);
  const [exportCategory, setExportCategory] = useState<Category | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const { data: categoryProjects = [] } = useCategoryProjects(editingCategory?.id);

  useEffect(() => {
    if (categoryProjects.length > 0) {
      const sorted = [...categoryProjects].sort((a, b) => a.sort_order - b.sort_order);
      setSelectedProjectIds(sorted.map((cp) => cp.project_id));
    } else if (!editingCategory) {
      setSelectedProjectIds([]);
    }
  }, [categoryProjects, editingCategory]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { theme: "DATING", template: "comparison", is_active: true, sort_order: 0 },
  });

  const nameValue = watch("name");
  const customHtmlOverride = watch("custom_html_override");

  // --- 5.000 WÖRTER GENERATOR ---
  async function handleMegaContentGeneration() {
      const keyword = (document.getElementById('ck') as HTMLInputElement)?.value || nameValue;
      const city = (document.getElementById('cl') as HTMLInputElement)?.value || nameValue;
      if(!city) { toast({title: "Fehler", description: "Ort/Keyword fehlt", variant: "destructive"}); return; }
      
      toast({title: "SEO-Turbo startet...", description: "Generiere 5.000 Wörter Content. Bitte warten (ca. 30-60 Sek.)"});
      
      // Wir rufen die Edge Function auf. Diese muss so konfiguriert sein, dass sie bei Wortanzahl 5000 massiv liefert.
      const res = await generateContent(city, keyword, 5000);
      
      if(res) {
          setValue("long_content_top", res.contentTop);
          setValue("long_content_bottom", res.contentBottom);
          toast({title: "5.000 Wörter generiert! 🚀", description: "Design wurde beibehalten, Content eingefügt."});
      }
  }

  // --- DEPLOYMENT ---
  async function handleDeploy(category: Category) {
    setIsDeploying(category.id);
    const BRIDGE_URL = "https://dating.rank-scout.com/bridge.php"; 
    const API_KEY = "4382180593Rank-Scout"; // <--- PASSWORT HIER!

    try {
      let htmlContent = "";

      if (category.custom_html_override && category.custom_html_override.trim() !== "") {
        htmlContent = category.custom_html_override;
      } 
      else if (category.template === 'review') {
        htmlContent = REVIEW_TEMPLATE;
      }
      else {
        htmlContent = COMPARISON_TEMPLATE;
      }
      
      // Platzhalter ersetzen
      const navHtml = generateQuickNavHtml(category.navigation_settings);
      const hintHtml = generate18PlusHintHtml(category.navigation_settings);
      
      htmlContent = htmlContent.replace("{{QUICK_NAV_LINKS}}", navHtml)
                               .replace("{{18_PLUS_HINT}}", hintHtml);

      const response = await fetch(BRIDGE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": API_KEY },
        body: JSON.stringify({ html: htmlContent, slug: category.slug })
      });

      if (response.ok) {
          toast({ title: "🚀 Live!", description: "Seite erfolgreich aktualisiert." });
          refetch(); // Tabelle neu laden um Zeitstempel zu sehen
      }
    } catch (e) { toast({ title: "Fehler", variant: "destructive" }); }
    finally { setIsDeploying(null); }
  }

  // --- SPEICHERN & AUTOMATISCH LIVE ---
  async function onSubmit(data: CategoryInput) {
    try {
      const now = new Date().toISOString();
      let categoryForDeploy: Category;

      if (editingCategory) {
        // Explizit updated_at mitsenden für die Spalte
        await updateCategory.mutateAsync({ id: editingCategory.id, input: { ...data, updated_at: now } as any });
        categoryForDeploy = { ...editingCategory, ...data, updated_at: now } as Category;
      } else {
        const result = await createCategory.mutateAsync(data);
        categoryForDeploy = { id: result.id, ...data, updated_at: now } as Category;
      }

      await updateCategoryProjects.mutateAsync({ categoryId: categoryForDeploy.id, projectIds: selectedProjectIds });
      
      // Toast bevor Upload
      toast({ title: "Gespeichert... lade hoch 🚀" });
      
      await handleDeploy(categoryForDeploy);
      setIsDialogOpen(false);
    } catch (error) { toast({ title: "Fehler", variant: "destructive" }); }
  }

  // Restliche Render-Logik... (Wird übernommen wie vorher)
  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2"><LayoutTemplate /> Landingpages</h2>
        <Button onClick={openCreateDialog}><Plus className="mr-2 h-4 w-4" /> Neue Landingpage</Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Tabs defaultValue="basic">
                <TabsList className="grid grid-cols-8 w-full">
                  <TabsTrigger value="basic">Basis</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="navigation">Navi</TabsTrigger>
                  <TabsTrigger value="footer">Footer</TabsTrigger>
                  <TabsTrigger value="projects">Apps</TabsTrigger>
                  <TabsTrigger value="tracking">Track</TabsTrigger>
                  <TabsTrigger value="override">Code</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="pt-4 space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                        <Input {...register("icon")} placeholder="📍" className="text-center" />
                        <Input {...register("name")} placeholder="Stadtname" className="col-span-3" />
                    </div>
                    <Input {...register("slug")} placeholder="URL-Pfad" />
                    <Select value={watch("template")} onValueChange={(v) => setValue("template", v as any)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="comparison">Vergleichstabelle</SelectItem>
                            <SelectItem value="review">Erfahrungsbericht</SelectItem>
                        </SelectContent>
                    </Select>
                </TabsContent>

                <TabsContent value="content" className="pt-4 space-y-4">
                    <div className="bg-primary/10 p-4 rounded-xl flex gap-4 items-end">
                        <div className="flex-1"><Label>Keyword</Label><Input id="ck" defaultValue={nameValue} /></div>
                        <div className="flex-1"><Label>Ort</Label><Input id="cl" defaultValue={nameValue} /></div>
                        <Button type="button" onClick={handleMegaContentGeneration} disabled={isGenerating}>
                            {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                            5.000 Wörter SEO-Power
                        </Button>
                    </div>
                    <Label>Inhalt oben (Kurz)</Label>
                    <Textarea {...register("long_content_top")} rows={5} />
                    <Label>Inhalt unten (SEO Massiv)</Label>
                    <Textarea {...register("long_content_bottom")} rows={15} />
                </TabsContent>

                <TabsContent value="navigation" className="pt-4 space-y-2">
                    {["show_top3_dating_apps", "show_singles_in_der_naehe", "show_chat_mit_einer_frau", "show_online_dating_cafe", "show_bildkontakte_login", "show_18plus_hint_box"].map(k => (
                      <div key={k} className="flex items-center justify-between border-b py-2">
                        <Label>{k.replace(/_/g, ' ')}</Label>
                        <Switch checked={watch(`navigation_settings.${k}` as any) ?? true} onCheckedChange={c => setValue(`navigation_settings.${k}` as any, c)} />
                      </div>
                    ))}
                </TabsContent>
                
                {/* Weitere Tabs hier (Footer, Projects, etc. wie vorher) */}
                <TabsContent value="footer" className="pt-4"><div className="grid grid-cols-2 gap-4"><div><Label>Footer Logo</Label><Input {...register("footer_site_name")} /></div><div><Label>Copyright</Label><Input {...register("footer_copyright_text")} /></div></div><CategoryFooterLinksEditor categoryId={editingCategory?.id || null} /><CategoryLegalLinksEditor categoryId={editingCategory?.id || null} /></TabsContent>
                <TabsContent value="projects" className="pt-4"><ProjectCheckboxList selectedIds={selectedProjectIds} onChange={setSelectedProjectIds} /></TabsContent>
                <TabsContent value="tracking" className="pt-4"><Label>Analytics Code</Label><Textarea {...register("analytics_code")} rows={10} /></TabsContent>
                <TabsContent value="override" className="pt-4"><div className="flex justify-between mb-2"><Label>HTML Override</Label><Button type="button" size="sm" variant="outline" onClick={handleExtractFromHtml}>Extrahieren</Button></div><Textarea {...register("custom_html_override")} rows={20} /></TabsContent>

              </Tabs>
              <Button type="submit" className="w-full" disabled={createCategory.isPending}>Speichern & Live schalten 🚀</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Seite</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Zuletzt aktualisiert</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium">{cat.icon} {cat.name}</TableCell>
                <TableCell>{cat.template === 'review' ? 'Review' : 'Vergleich'}</TableCell>
                <TableCell className="text-muted-foreground"><Clock className="inline w-3 h-3 mr-1" />{formatDate(cat.updated_at)}</TableCell>
                <TableCell><Switch checked={cat.is_active} onCheckedChange={() => updateCategory.mutate({id: cat.id, input: {is_active: !cat.is_active}})} /></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button size="sm" onClick={() => handleDeploy(cat)} disabled={isDeploying === cat.id} className="bg-green-600">Live</Button>
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(cat)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}