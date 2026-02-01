import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// 1. Setup: Umgebungsvariablen laden (.env Datei)
dotenv.config();

// Fix für Pfade in ES-Modulen
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase Verbindung herstellen
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const DOMAIN = 'https://rank-scout.com'; // DEINE DOMAIN

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ FEHLER: Supabase URL oder Key fehlen in der .env Datei.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateSitemap() {
  console.log('🔄 Starte Sitemap-Automatisierung...');
  
  // 2. Statische Seiten definieren (Die sind immer da)
  let urls = [
    '',
    '/impressum',
    '/datenschutz',
    '/agb',
    '/categories',
    '/forum'
  ];

  // 3. Dynamische Daten aus Supabase holen (Automatisierung)
  
  // A. Kategorien holen
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('slug')
    .eq('is_active', true);

  if (categories) {
    categories.forEach(cat => urls.push(`/category/${cat.slug}`));
    console.log(`✅ ${categories.length} Kategorien hinzugefügt.`);
  }

  // B. Forum Threads holen
  const { data: threads, error: threadError } = await supabase
    .from('forum_threads')
    .select('slug');

  if (threads) {
    threads.forEach(thread => urls.push(`/forum/${thread.slug}`));
    console.log(`✅ ${threads.length} Threads hinzugefügt.`);
  }

  // 4. XML zusammenbauen
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(url => `
  <url>
    <loc>${DOMAIN}${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${url === '' ? '1.0' : '0.8'}</priority>
  </url>
  `).join('')}
</urlset>`;

  // 5. Datei speichern (in den public Ordner, damit sie live geht)
  const publicPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(publicPath, sitemap);
  console.log(`🚀 Sitemap erfolgreich generiert: ${publicPath}`);
}

generateSitemap();