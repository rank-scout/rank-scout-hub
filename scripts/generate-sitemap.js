import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// --- PFAD-LOGIK FÜR ES-MODULE ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lädt die .env explizit aus dem Hauptverzeichnis
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// KYRA FIX: Nutzt jetzt exakt deine Bezeichnungen aus der .env
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY; // Geändert von ANON_KEY auf PUBLISHABLE_KEY
const DOMAIN = 'https://rank-scout.com';

// --- VALIDIERUNG ---
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ FEHLER: Supabase URL oder Key fehlen in der .env Datei.');
  console.log('Gefundene URL:', supabaseUrl ? '✅ Vorhanden' : '❌ FEHLT');
  console.log('Gefundener Key (VITE_SUPABASE_PUBLISHABLE_KEY):', supabaseKey ? '✅ Vorhanden' : '❌ FEHLT');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateSitemap() {
  console.log('🔄 Starte Sitemap-Automatisierung für Rank-Scout...');

  try {
    // 1. Statische Seiten definieren
    const staticPages = [
      '',
      '/impressum',
      '/datenschutz',
      '/agb',
      '/kategorien',
      '/forum'
    ];

    // 2. Dynamische Kategorien aus Supabase laden
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('slug');

    if (catError) {
      console.warn('⚠️ Hinweis: Konnte Kategorien nicht laden (evtl. Tabelle noch leer).');
    }

    // 3. Forum-Threads aus Supabase laden
    const { data: threads, error: threadError } = await supabase
      .from('forum_threads')
      .select('slug');

    if (threadError) {
      console.warn('⚠️ Hinweis: Konnte Forum-Threads nicht laden.');
    }

    // 4. Alle Pfade kombinieren
    const categoryPages = categories?.map(c => `/kategorien/${c.slug}`) || [];
    const forumPages = threads?.map(t => `/forum/${t.slug}`) || [];
    
    const allPages = [...staticPages, ...categoryPages, ...forumPages];

    // 5. XML generieren
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${DOMAIN}${page}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${page === '' ? '1.0' : page.includes('/kategorien/') ? '0.9' : '0.7'}</priority>
  </url>`).join('\n')}
</urlset>`;

    // 6. Datei im public-Ordner speichern
    const outputPath = path.resolve(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(outputPath, sitemapXml);

    console.log(`✅ ERFOLG: ${allPages.length} URLs wurden in die Sitemap geschrieben.`);
    console.log(`📍 Speicherort: ${outputPath}`);

  } catch (err) {
    console.error('❌ KRITISCHER FEHLER beim Generieren der Sitemap:', err.message);
    process.exit(1);
  }
}

generateSitemap();