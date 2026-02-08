import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lädt die .env aus dem Hauptverzeichnis
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// KYRA FIX: Wir priorisieren den Service Role Key, falls vorhanden, um RLS zu umgehen
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const DOMAIN = 'https://rank-scout.com';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ FEHLER: Supabase Konfiguration unvollständig.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DYNAMIC_SOURCES = [
  { table: 'categories', prefix: '/kategorien' },
  { table: 'forum_threads', prefix: '/forum' },
  { table: 'top_lists', prefix: '/top-100' }
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
  console.log('🚀 Starte universelle Sitemap-Generierung...');
  let allUrls = [...STATIC_PAGES];

  try {
    for (const source of DYNAMIC_SOURCES) {
      console.log(`🔎 Scanne Tabelle: ${source.table}...`);
      
      const { data, error } = await supabase
        .from(source.table)
        .select('slug');

      if (error) {
        // KYRA FIX: Detailliertes Error-Logging
        console.error(`❌ Fehler in Tabelle "${source.table}":`, error.message);
        console.error(`Details: ${error.details || 'Keine weiteren Details'}`);
        continue;
      }

      if (data && data.length > 0) {
        const paths = data.map(item => `${source.prefix}/${item.slug}`);
        allUrls = [...allUrls, ...paths];
        console.log(`✅ ${data.length} Einträge aus "${source.table}" hinzugefügt.`);
      } else {
        console.warn(`⚠️ Hinweis: Tabelle "${source.table}" ist leer.`);
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

    console.log(`\n✨ FERTIG! Insgesamt ${allUrls.length} URLs in der Sitemap.`);
    console.log(`📍 Ort: ${outputPath}`);

  } catch (err) {
    console.error('❌ KRITISCHER SYSTEMFEHLER:', err.message);
  }
}

generateSitemap();