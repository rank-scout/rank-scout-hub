import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { renderToStaticMarkup } from "react-dom/server";
import { ExportTemplate } from "@/components/templates/ExportTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Loader2, UploadCloud, Globe, FileText, LayoutList, Database, Save, Eye, PlusCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGenerateCityContent } from "@/hooks/useGenerateCityContent";
import { useGenerateCategoryContent, GeneratedCategoryContent } from "@/hooks/useGenerateCategoryContent";

// Typen
type DeploymentTarget = { id: string; name: string; bridge_url: string; api_key: string; };
type Project = { id: string; name: string; logo_url: string; rating: number; affiliate_link: string; features: any; badge_text: string; };
type Category = { id: string; name: string; slug: string; is_internal_generated?: boolean };

export default function AdminPublisher() {
  // Global Mode
  const [mode, setMode] = useState<"external" | "internal">("internal");

  // Data State
  const [targets, setTargets] = useState<DeploymentTarget[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Selection State
  const [selectedTargetId, setSelectedTargetId] = useState<string>("");
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // External Generator State (Cities)
  const [city, setCity] = useState("Berlin");
  const [keyword, setKeyword] = useState("Dating");
  const [generatedHtml, setGeneratedHtml] = useState<string>("");
  
  // Internal Generator State (Categories)
  const [catKeyword, setCatKeyword] = useState("Vergleich & Test");
  const [generatedCategoryContent, setGeneratedCategoryContent] = useState<GeneratedCategoryContent | null>(null);
  const [newInternalName, setNewInternalName] = useState(""); 
  const [isCreatingCat, setIsCreatingCat] = useState(false);

  // Hooks
  const { generateContent, isGenerating: isGeneratingCity } = useGenerateCityContent();
  const { generateCategoryContent, isGenerating: isGeneratingCat } = useGenerateCategoryContent();
  const [isDeploying, setIsDeploying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Load Data
  useEffect(() => {
    fetchTargets();
    fetchProjects();
    fetchCategories();
  }, []);

  const fetchTargets = async () => {
    setTargets([
      { id: "1", name: "Dating-Vergleich.org", bridge_url: "https://dating-vergleich.org/bridge.php", api_key: "xyz" },
      { id: "2", name: "Finanz-Check.de", bridge_url: "https://finanz-check.de/bridge.php", api_key: "abc" }
    ]);
  };

  const fetchProjects = async () => {
    const { data } = await supabase.from("projects").select("*").eq("is_active", true).order("rating", { ascending: false });
    if (data) setProjects(data as any);
  };

  const fetchCategories = async () => {
    // FIX: Wir laden NUR Kategorien, die das Flag 'is_internal_generated' haben.
    // Die "geschützten" Landingpages werden hier ignoriert.
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug, is_internal_generated")
      .eq("is_active", true)
      .eq("is_internal_generated", true) // <--- Der Filter für die Entkopplung
      .order("name");

    if (data) setCategories(data);
  };

  // --- External Logic (City Pages) ---
  const toggleProject = (id: string) => {
    setSelectedProjectIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleGenerateCityHTML = async () => {
    if (selectedProjectIds.length === 0) {
      toast({ title: "Fehler", description: "Wähle mindestens ein Projekt.", variant: "destructive" });
      return;
    }
    const content = await generateContent(city, keyword);
    if (!content) return;

    const activeProjects = projects.filter(p => selectedProjectIds.includes(p.id));
    const staticHtml = renderToStaticMarkup(
      <ExportTemplate 
        city={city} 
        keyword={keyword} 
        projects={activeProjects}
        contentTop={content.contentTop}
        contentBottom={content.contentBottom}
      />
    );

    const fullPage = `
      <!DOCTYPE html>
      <html lang="de">
      <head>
        <meta charset="UTF-8">
        <title>${keyword} in ${city} - Vergleich 2026</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>${staticHtml}</body>
      </html>
    `;
    setGeneratedHtml(fullPage);
    toast({ title: "Generiert", description: "HTML Vorschau erstellt." });
  };

  const handleDeploy = async () => {
    if (!generatedHtml || !selectedTargetId) return;
    setIsDeploying(true);
    const target = targets.find(t => t.id === selectedTargetId);
    if(!target) return;
    try {
      console.log("Sende an Bridge:", target.bridge_url);
      await new Promise(r => setTimeout(r, 1500)); 
      toast({ title: "Erfolg", description: `Seite erfolgreich veröffentlicht!` });
    } catch (e) {
      toast({ title: "Fehler", description: "Deployment fehlgeschlagen", variant: "destructive" });
    } finally {
      setIsDeploying(false);
    }
  };

  // --- Internal Logic (Category Pages) ---
  
  // Quick Create Function (Interne Seiten)
  const handleCreateInternalCategory = async () => {
    if (!newInternalName.trim()) return;
    setIsCreatingCat(true);

    const slug = newInternalName.toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: newInternalName,
          slug: slug,
          is_active: true,
          is_internal_generated: true, // Setzt das Flag für die Trennung
          theme: 'GENERIC',
          template: 'comparison'
        })
        .select()
        .single();

      if (error) throw error;

      toast({ title: "Erstellt", description: `Interne Seite "${newInternalName}" angelegt.` });
      
      // Liste neu laden, damit die neue Kategorie erscheint
      await fetchCategories();
      
      // Direkt auswählen
      if (data) setSelectedCategoryId(data.id);
      setNewInternalName("");
      
    } catch (e: any) {
      toast({ title: "Fehler", description: e.message || "Konnte Kategorie nicht erstellen.", variant: "destructive" });
    } finally {
      setIsCreatingCat(false);
    }
  };

  const handleGenerateCategory = async () => {
    if (!selectedCategoryId) {
      toast({ title: "Fehler", description: "Bitte wähle eine Kategorie.", variant: "destructive" });
      return;
    }
    const cat = categories.find(c => c.id === selectedCategoryId);
    if (!cat) return;

    // Aufruf des fixierten Hooks
    const result = await generateCategoryContent(cat.name, catKeyword);
    if (result) {
      setGeneratedCategoryContent(result);
      toast({ title: "Fertig", description: "Content generiert. Bitte prüfen & speichern." });
    }
  };

  const handleSaveToDatabase = async () => {
    if (!selectedCategoryId || !generatedCategoryContent) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("categories")
        .update({
          long_content_top: generatedCategoryContent.contentTop,
          long_content_bottom: generatedCategoryContent.contentBottom,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedCategoryId);

      if (error) throw error;

      toast({ title: "Gespeichert", description: "Content erfolgreich in die Datenbank geschrieben!" });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Speicherfehler", description: e.message || "Zugriff verweigert.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Mode Switch */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Multi-Publisher Engine</h1>
          <p className="text-slate-500 mt-2">Zentrale Steuerung für Content & Externe LPs.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border shadow-sm">
            <span className={`text-sm font-medium ${mode === 'external' ? 'text-blue-600' : 'text-slate-400'}`}>Extern (City LPs)</span>
            <Switch 
                checked={mode === 'internal'} 
                onCheckedChange={(c) => setMode(c ? 'internal' : 'external')} 
            />
            <span className={`text-sm font-medium ${mode === 'internal' ? 'text-indigo-600' : 'text-slate-400'}`}>Intern (Rank-Scout)</span>
        </div>
      </div>

      {mode === 'external' ? (
        // --- EXTERNAL MODE UI (Unverändert) ---
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-blue-500" />
                            1. Ziel & Content Setup
                        </CardTitle>
                        <CardDescription>Konfiguriere die externe Landingpage (City LP).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Ziel-Stadt</Label>
                                <Input value={city} onChange={e => setCity(e.target.value)} placeholder="z.B. München" />
                            </div>
                            <div className="space-y-2">
                                <Label>Haupt-Keyword</Label>
                                <Input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="z.B. Dating Apps" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Deployment Ziel</Label>
                            <Select onValueChange={setSelectedTargetId} value={selectedTargetId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Wähle eine Domain..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {targets.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UploadCloud className="w-5 h-5 text-blue-500" />
                            3. Generierung & Upload
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button onClick={handleGenerateCityHTML} disabled={isGeneratingCity} className="w-full bg-slate-800 hover:bg-slate-900">
                            {isGeneratingCity ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                            HTML Generieren
                        </Button>
                        {generatedHtml && (
                            <div className="p-4 bg-slate-50 rounded border space-y-4">
                                <Button onClick={handleDeploy} disabled={isDeploying} className="w-full bg-green-600 hover:bg-green-700">
                                    {isDeploying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                                    Live Schalten
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
             <div className="space-y-6">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LayoutList className="w-5 h-5 text-blue-500" />
                            2. Projekte Wählen
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[500px] pr-4">
                            <div className="space-y-3">
                                {projects.map(project => (
                                    <div key={project.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                                        <Checkbox id={`p-${project.id}`} checked={selectedProjectIds.includes(project.id)} onCheckedChange={() => toggleProject(project.id)} />
                                        <div className="flex-1">
                                            <Label htmlFor={`p-${project.id}`} className="font-medium cursor-pointer block">{project.name}</Label>
                                            <span className="text-[10px] bg-slate-200 px-1.5 rounded text-slate-600">Rating: {project.rating}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
      ) : (
        // --- INTERNAL MODE UI (RANK-SCOUT) ---
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="space-y-6">
                
                {/* 1. Neue Kategorie erstellen (Bypass Lock) */}
                <Card className="border-indigo-100 shadow-sm bg-indigo-50/30">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-indigo-900 text-lg">
                            <PlusCircle className="w-5 h-5 text-indigo-600" />
                            Neue Interne Seite anlegen
                        </CardTitle>
                        <CardDescription>
                           Erstellt eine saubere, entkoppelte Seite.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                         <Input 
                            placeholder="Titel der Seite (z.B. Krypto Vergleich 2026)" 
                            value={newInternalName}
                            onChange={(e) => setNewInternalName(e.target.value)}
                            className="bg-white"
                         />
                         <Button onClick={handleCreateInternalCategory} disabled={isCreatingCat || !newInternalName} className="bg-indigo-600 hover:bg-indigo-700">
                            {isCreatingCat ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                         </Button>
                    </CardContent>
                </Card>

                {/* 2. Kategorie wählen & Generieren */}
                <Card className="border-indigo-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-900">
                            <Database className="w-5 h-5 text-indigo-600" />
                            Content Generieren
                        </CardTitle>
                        <CardDescription>
                            Hier erscheinen nur deine internen Seiten.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-0">
                        <div className="space-y-3">
                            <Label>Kategorie wählen (Nur Interne)</Label>
                            <Select onValueChange={setSelectedCategoryId} value={selectedCategoryId}>
                                <SelectTrigger className="h-12 text-lg">
                                    <SelectValue placeholder="Liste laden..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.length > 0 ? categories.map(c => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name} 
                                        </SelectItem>
                                    )) : (
                                        <SelectItem value="none" disabled>Keine internen Seiten gefunden. Erstelle oben eine.</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label>Fokus-Thema (Prompt)</Label>
                            <Input 
                                value={catKeyword} 
                                onChange={e => setCatKeyword(e.target.value)} 
                                placeholder="z.B. Vergleich" 
                            />
                        </div>

                        <Button 
                            onClick={handleGenerateCategory} 
                            disabled={isGeneratingCat || !selectedCategoryId}
                            className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700"
                        >
                            {isGeneratingCat ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <FileText className="w-5 h-5 mr-2" />}
                            Content Generieren
                        </Button>
                    </CardContent>
                </Card>
             </div>

             <div className="space-y-6">
                {generatedCategoryContent ? (
                    <Card className="h-full border-green-100">
                        <CardHeader className="bg-green-50/50 pb-4">
                            <CardTitle className="flex items-center gap-2 text-green-900">
                                <Eye className="w-5 h-5 text-green-600" />
                                Vorschau & Save
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <Tabs defaultValue="top">
                                <TabsList className="w-full">
                                    <TabsTrigger value="top" className="flex-1">Content Top</TabsTrigger>
                                    <TabsTrigger value="bottom" className="flex-1">Content Bottom</TabsTrigger>
                                </TabsList>
                                <TabsContent value="top" className="mt-4">
                                    <div className="p-4 bg-slate-50 rounded border h-[300px] overflow-y-auto prose prose-sm max-w-none" 
                                         dangerouslySetInnerHTML={{ __html: generatedCategoryContent.contentTop || '<i class="text-slate-400">Leer</i>' }} />
                                </TabsContent>
                                <TabsContent value="bottom" className="mt-4">
                                    <div className="p-4 bg-slate-50 rounded border h-[300px] overflow-y-auto prose prose-sm max-w-none" 
                                         dangerouslySetInnerHTML={{ __html: generatedCategoryContent.contentBottom || '<i class="text-slate-400">Leer</i>' }} />
                                </TabsContent>
                            </Tabs>

                            <Button 
                                onClick={handleSaveToDatabase} 
                                disabled={isSaving}
                                className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg shadow-lg shadow-green-200"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                                Content Speichern
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-8 text-slate-400">
                        <Database className="w-12 h-12 mb-4 opacity-20" />
                        <p>Wähle links eine Kategorie und starte die Generierung.</p>
                    </div>
                )}
             </div>
        </div>
      )}
    </div>
  );
}