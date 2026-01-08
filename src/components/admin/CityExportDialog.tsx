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
    <meta name="description" content="[META_DESCRIPTION]">
    <title>[META_TITLE]</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #e91e63;
            --primary-dark: #c2185b;
            --bg: #0f0f23;
            --bg-card: #1a1a2e;
            --text: #ffffff;
            --text-muted: #a0a0b0;
            --border: #2a2a3e;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        
        /* Hero */
        .hero { text-align: center; padding: 80px 20px; background: linear-gradient(135deg, var(--bg) 0%, #1a1a2e 100%); }
        .hero h1 { font-size: 3rem; font-weight: 700; margin-bottom: 1rem; }
        .hero p { font-size: 1.25rem; color: var(--text-muted); max-width: 600px; margin: 0 auto; }
        
        /* USP Cards */
        .usp-section { padding: 60px 20px; }
        .usp-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; }
        .usp-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; text-align: center; }
        .usp-icon { font-size: 2.5rem; margin-bottom: 16px; }
        .usp-card h3 { font-size: 1.25rem; margin-bottom: 8px; }
        .usp-card p { color: var(--text-muted); font-size: 0.9rem; }
        
        /* Apps Table */
        .apps-section { padding: 60px 20px; }
        .apps-section h2 { text-align: center; font-size: 2rem; margin-bottom: 40px; }
        .app-card { display: flex; align-items: center; gap: 20px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 16px; }
        .app-logo { width: 60px; height: 60px; border-radius: 12px; object-fit: cover; background: var(--border); }
        .app-info { flex: 1; }
        .app-name { font-size: 1.25rem; font-weight: 600; margin-bottom: 4px; }
        .app-desc { color: var(--text-muted); font-size: 0.9rem; }
        .app-rating { font-size: 1.5rem; font-weight: 700; color: var(--primary); }
        .app-cta { padding: 12px 24px; background: var(--primary); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; text-decoration: none; }
        .app-cta:hover { background: var(--primary-dark); }
        
        /* Content Section */
        .content-section { padding: 60px 20px; }
        .content-section h2 { font-size: 1.75rem; margin-bottom: 1rem; }
        .content-section p { color: var(--text-muted); margin-bottom: 1rem; }
        
        /* Loading */
        .loading { text-align: center; padding: 100px 20px; color: var(--text-muted); }
        .error { text-align: center; padding: 100px 20px; color: #ef4444; }
        
        @media (max-width: 768px) {
            .hero h1 { font-size: 2rem; }
            .app-card { flex-direction: column; text-align: center; }
        }
    </style>
</head>
<body>
    <div id="app">
        <div class="loading">Lade Daten...</div>
    </div>

    <script>
    (async function() {
        const SLUG = '${category.slug}';
        const SUPABASE_URL = '${supabaseUrl}';
        const SUPABASE_KEY = '${supabaseKey}';
        
        const app = document.getElementById('app');
        
        try {
            // Fetch category data
            const catRes = await fetch(\`\${SUPABASE_URL}/rest/v1/categories?slug=eq.\${SLUG}&is_active=eq.true&select=*\`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': \`Bearer \${SUPABASE_KEY}\` }
            });
            const categories = await catRes.json();
            
            if (!categories.length) {
                app.innerHTML = '<div class="error">Stadt nicht gefunden</div>';
                return;
            }
            
            const category = categories[0];
            
            // Update meta tags
            document.title = category.meta_title || category.name;
            document.querySelector('meta[name="description"]')?.setAttribute('content', category.meta_description || '');
            
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
                // Sort by category_projects order
                const orderMap = {};
                categoryProjects.forEach(cp => orderMap[cp.project_id] = cp.sort_order);
                projects.sort((a, b) => (orderMap[a.id] || 0) - (orderMap[b.id] || 0));
            }
            
            // Render page
            app.innerHTML = \`
                <section class="hero">
                    <div class="container">
                        <h1>\${category.h1_title || category.name}</h1>
                        <p>\${category.description || ''}</p>
                    </div>
                </section>
                
                \${category.long_content_top ? \`
                <section class="content-section">
                    <div class="container">\${category.long_content_top}</div>
                </section>
                \` : ''}
                
                <section class="apps-section">
                    <div class="container">
                        <h2>Top Dating Apps in \${category.name.replace('Singles ', '')}</h2>
                        \${projects.map((p, i) => \`
                            <div class="app-card">
                                <img src="\${p.logo_url || ''}" alt="\${p.name}" class="app-logo" onerror="this.style.display='none'">
                                <div class="app-info">
                                    <div class="app-name">\${i === 0 ? '🏆 ' : ''}\${p.name}</div>
                                    <div class="app-desc">\${p.short_description || ''}</div>
                                </div>
                                <div class="app-rating">\${p.rating || '9.8'}</div>
                                <a href="\${p.affiliate_link || p.url}" target="_blank" rel="noopener" class="app-cta">Jetzt testen</a>
                            </div>
                        \`).join('')}
                    </div>
                </section>
                
                \${category.long_content_bottom ? \`
                <section class="content-section">
                    <div class="container">\${category.long_content_bottom}</div>
                </section>
                \` : ''}
            \`;
        } catch (err) {
            console.error(err);
            app.innerHTML = '<div class="error">Fehler beim Laden: ' + err.message + '</div>';
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
    a.download = `${category.slug}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Download gestartet", description: `${category.slug}.html` });
  }

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
          <p className="text-sm text-muted-foreground mb-4">
            Kopiere diesen Code in eine <code className="bg-muted px-1 rounded">index.html</code> Datei 
            und lade sie in den Ordner <code className="bg-muted px-1 rounded">/{category.slug}/</code> auf deinem FTP-Server.
          </p>
          
          <Textarea
            value={exportCode}
            readOnly
            className="font-mono text-xs h-96 resize-none"
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
