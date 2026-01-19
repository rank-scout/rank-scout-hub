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
// 🟢 VORLAGE 1: VERGLEICHSTABELLE (Original Design + Platzhalter)
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
        .btn-gold-hover:hover { background: linear-gradient(45deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c); transform: translateY(-2px) scale(1.02); }
        .top-bar { background: linear-gradient(90deg, #c41e3a, #ff4d6d); }
    </style>
</head>
<body class="font-sans antialiased text-gray-800 bg-brand-bg">
    <header id="main-header" class="w-full bg-brand-black text-white py-3 px-4 shadow-md sticky top-0 z-50">
        <div class="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <a id="header-site-name" href="/" class="font-heading font-bold text-xl tracking-tight text-brand-gold hover:text-brand-light transition-colors">Lade...</a>
            <nav class="hidden md:flex items-center space-x-2 text-sm">
                {{HEADER_NAV}}
            </nav>
            <a href="/" class="text-xs bg-brand-primary hover:bg-brand-light text-white px-3 py-1.5 rounded-full transition-all duration-300">Zum Hauptportal</a>
        </div>
    </header>
    <section class="hero-gradient py-16 md:py-24 relative overflow-hidden">
        <div class="max-w-4xl mx-auto px-4 text-center relative z-10">
            <p class="text-brand-gold text-sm md:text-base tracking-widest uppercase mb-4 font-heading"><i class="fas fa-heart mr-2"></i><span id="hero-subtitle">...</span></p>
            <h1 class="font-heading font-bold text-3xl md:text-5xl lg:text-6xl text-white leading-tight mb-6"><span id="hero-pretitle">Finde Singles</span> <br><span id="hero-title" class="text-brand-gold">...</span></h1>
            <p id="hero-description" class="text-gray-300 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">...</p>
        </div>
    </section>
    <section class="py-16 bg-white">
        <div class="max-w-6xl mx-auto px-4">
            <div id="long-content-top" class="prose prose-lg max-w-none mb-12 text-center"></div>
        </div>
    </section>
    <section id="vergleich" class="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div class="max-w-4xl mx-auto px-4">
            <div id="project-list-container" class="space-y-6"></div>
        </div>
    </section>
    
    <section class="py-16 bg-gray-50">
        <div class="max-w-4xl mx-auto px-4">
            <div id="long-content-bottom" class="prose prose-lg max-w-none article-content"></div>
        </div>
    </section>

    <div class="mt-12 max-w-4xl mx-auto px-4">
        <div class="bg-white rounded-2xl p-8 shadow-sm">
            <h3 class="font-heading font-bold text-xl mb-4">Schnellnavigation</h3>
            <div class="flex flex-wrap gap-3">
                {{QUICK_NAV_LINKS}}
            </div>
            {{18_PLUS_HINT}}
        </div>
    </div>

    <footer class="bg-[#0a0a0a] border-t border-white/5 mt-12 py-12 text-center">
        <span id="footer-site-name" class="font-heading font-bold text-xl text-white">Rank-Scout</span>
        <div id="footer-links" class="flex flex-wrap justify-center gap-6 my-6"></div>
        <p class="text-gray-500 text-xs"><span id="footer-copyright">&copy; 2026.</span></p>
    </footer>

    <script>
    (async function() {
        const SUPABASE_URL = 'https://oeshjjvhtmebjwbouayc.supabase.co';
        const SUPABASE_KEY = 'sb_publishable_3Wk4Tcg02ylmxwh5Om45UQ_j7GlZ7Ic';
        const SLUG = window.location.pathname.split('/').filter(Boolean)[0] || 'salzburg';
        const el = (id) => document.getElementById(id);
        const headers = { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY };
        try {
            const catRes = await fetch(SUPABASE_URL + '/rest/v1/categories?slug=eq.' + SLUG + '&select=*', { headers });
            const category = (await catRes.json())[0];
            if(!category) return;
            const year = new Date().getFullYear();
            el('page-title').textContent = (category.meta_title || '').replace(/2026/g, year);
            el('header-site-name').textContent = category.site_name || 'Rank-Scout';
            el('hero-title').textContent = category.hero_headline || category.name;
            el('long-content-top').innerHTML = category.long_content_top || '';
            el('long-content-bottom').innerHTML = category.long_content_bottom || '';
            
            // Projekte laden
            const cpRes = await fetch(SUPABASE_URL + '/rest/v1/category_projects?category_id=eq.' + category.id + '&select=*,projects(*)&order=sort_order.asc', { headers });
            const projects = await cpRes.json();
            el('project-list-container').innerHTML = projects.map((p,i) => \`
                <div class="bg-white p-6 rounded-xl shadow-sm border mb-4 flex flex-col md:flex-row items-center gap-6">
                    <img src="\${p.projects.logo_url}" class="w-20 h-20 object-contain">
                    <div class="flex-1">
                        <h3 class="font-bold text-xl">\${p.projects.name}</h3>
                        <p class="text-sm text-gray-500">⭐ \${p.projects.rating}/10</p>
                    </div>
                    <a href="\${p.projects.affiliate_link}" target="_blank" class="bg-brand-primary text-white px-8 py-3 rounded-full font-bold">Zum Anbieter</a>
                </div>
            \`).join('');
        } catch(e) { console.error(e); }
    })();
    </script>
</body>
</html>`;

// (REVIEW_TEMPLATE IDENTISCH MIT PLATZHALTERN)
const REVIEW_TEMPLATE = COMPARISON_TEMPLATE.replace('Vergleich', 'Testbericht');

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

  // --- DYNAMISCHE NAVIGATION LOGIC ---
  function generateQuickNavHtml(settings: any) {
    if (!settings) return "";
    const links = [];
    const btnClass = "bg-white px-4 py-2 rounded-full text-sm border hover:shadow-md transition-all";
    if (settings.show_top3_dating_apps) links.push(`<a href="/top3-dating-apps/" class="${btnClass}">⭐ Top3 Apps</a>`);
    if (settings.show_singles_in_der_naehe) links.push(`<a href="/singles-in-der-naehe/" class="${btnClass}">📍 Singles in der Nähe</a>`);
    if (settings.show_chat_mit_einer_frau) links.push(`<a href="/chat-mit-einer-frau/" class="${btnClass}">💬 Chat mit Frau</a>`);
    if (settings.show_online_dating_cafe) links.push(`<a href="/online-dating-cafe/" class="${btnClass}">☕ Dating Cafe</a>`);
    if (settings.show_bildkontakte_login) links.push(`<a href="/bildkontakte-login/" class="${btnClass}">🖼️ Login</a>`);
    return links.join('\n');
  }

  // --- DEPLOYMENT ---
  async function handleDeploy(category: Category) {
    setIsDeploying(category.id);
    const BRIDGE_URL = "https://dating.rank-scout.com/bridge.php"; 
    const API_KEY = "CHANGE_ME_123"; // <--- PASSWORT HIER!

    try {
      let htmlContent = category.custom_html_override || (category.template === 'review' ? REVIEW_TEMPLATE : COMPARISON_TEMPLATE);
      
      // Platzhalter ersetzen
      const navHtml = generateQuickNavHtml(category.navigation_settings);
      const hintHtml = category.navigation_settings?.show_18plus_hint_box ? '<div class="p-4 bg-red-50 text-red-700 mt-4 rounded">🔞 18+ Bereich</div>' : '';
      
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
                
                {/* Weitere Tabs hier... */}
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
                <TableCell>{cat.template}</TableCell>
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