import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
// Fetch explizit importieren für ältere Node-Versionen
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env Datei laden
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// WICHTIG: Hier wird bevorzugt der SERVICE_ROLE_KEY genommen!
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const DOMAIN = 'https://rank-scout.com';

console.log('🔧 Konfiguration prüfen...');
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase URL oder Key fehlt! Prüfe deine .env Datei.');
  process.exit(1);
}

// Client initialisieren mit explizitem Fetch und Auth-Persistenz aus
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  global: { fetch: fetch }
});

// Hier sind die Tabellen definiert, die gescannt werden
const DYNAMIC_SOURCES = [
  { table: 'categories', prefix: '/category' },
  { table: 'forum_threads', prefix: '/forum' }
  // { table: 'top_lists', prefix: '/top-100' } <-- ENTFERNT, da Tabelle nicht existiert
];

const STATIC_PAGES = [
  '',
  '/impressum',
  '/datenschutz',
  '/agb',
  '/kategorien',
  '/forum'
];

async function generateSitemap() {
  console.log(`✅ URL erkannt: ${supabaseUrl}`);
  
  // Kleiner Sicherheitscheck, welcher Key verwendet wird (nur die ersten 5 Zeichen anzeigen)
  const keyType = supabaseKey.startsWith('ey') ? 'JWT (Anon/Service)' : 'Unknown';
  console.log(`🔑 Key-Typ: ${keyType} (${supabaseKey.substring(0, 5)}...)`);
  
  console.log('🚀 Starte Sitemap-Generierung...');
  
  let allUrls = [...STATIC_PAGES];

  try {
    for (const source of DYNAMIC_SOURCES) {
      console.log(`🔎 Scanne Tabelle: ${source.table}...`);
      
      const { data, error } = await supabase
        .from(source.table)
        .select('slug');

      if (error) {
        console.error(`❌ API-Fehler bei "${source.table}":`, error.message);
        continue;
      }

      if (data && data.length > 0) {
        const paths = data.map(item => `${source.prefix}/${item.slug}`);
        allUrls = [...allUrls, ...paths];
        console.log(`✅ ${data.length} Einträge gefunden.`);
      } else {
        console.warn(`⚠️ Tabelle "${source.table}" ist leer (oder Zugriff verweigert).`);
      }
    }

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${DOMAIN}${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${url === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${url === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

    const outputPath = path.resolve(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(outputPath, sitemapXml);

    console.log(`\n✨ FERTIG! ${allUrls.length} URLs in ${outputPath} gespeichert.`);

  } catch (err) {
    console.error('\n❌ SYSTEMFEHLER:', err.message);
  }
}

generateSitemap();