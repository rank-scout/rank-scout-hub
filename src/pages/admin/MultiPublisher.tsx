import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { renderToStaticMarkup } from "react-dom/server";
import { ExportTemplate } from "@/components/templates/ExportTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Loader2, UploadCloud, FileText, LayoutList, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Typen
type DeploymentTarget = { id: string; name: string; bridge_url: string; api_key: string; };
type Project = { id: string; name: string; logo_url: string; rating: number; affiliate_link: string; features: unknown; badge_text: string; };

export default function AdminPublisher() {
  const [targets, setTargets] = useState<DeploymentTarget[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // State
  const [selectedTargetId, setSelectedTargetId] = useState<string>("");
  const [templateType, setTemplateType] = useState<"COMPARISON" | "ARTICLE">("COMPARISON");
  const [slug, setSlug] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [pageContent, setPageContent] = useState("<h2>Hier startet dein Content...</h2><p>Schreibe etwas geniales.</p>");
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        // Load Projects for Selection (always available)
        const { data: pData } = await supabase.from("projects").select("*").order('rating', { ascending: false });
        if (pData) setProjects(pData as Project[]);

        // Note: deployment_targets table may not exist - this is expected
        // The publisher feature requires manual setup of this table
        setLoadError("Deployment Targets Tabelle nicht konfiguriert. Bitte erstelle die Tabelle 'deployment_targets' mit den Feldern: id, name, bridge_url, api_key");
      } catch (error) {
        console.error("Load error:", error);
      }
    }
    loadData();
  }, []);

  const toggleProject = (id: string) => {
    setSelectedProjectIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  async function handlePublish() {
    if (!slug || slug.trim() === "" || slug === "/") {
        toast({ 
          variant: "destructive", 
          title: "STOPP! Hauptseite geschützt.", 
          description: "Du darfst die Startseite nicht überschreiben. Bitte gib einen Slug ein." 
        });
        return;
    }

    if (!selectedTargetId) {
      toast({ variant: "destructive", title: "Kein Ziel gewählt!" });
      return;
    }

    const target = targets.find(t => t.id === selectedTargetId);
    if (!target) return;

    setIsLoading(true);

    try {
      const selectedProjectsData = projects.filter(p => selectedProjectIds.includes(p.id));
      const sortedProjects = selectedProjectsData.sort((a, b) => (b.rating || 0) - (a.rating || 0));

      const htmlString = renderToStaticMarkup(
        <ExportTemplate
          title={pageTitle}
          description={metaDescription}
          content={pageContent}
          type={templateType}
          projects={sortedProjects}
          siteName={target.name}
          year={new Date().getFullYear()}
        />
      );

      const finalHtml = `<!DOCTYPE html>${htmlString}`;

      const response = await fetch(target.bridge_url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": target.api_key },
        body: JSON.stringify({ html: finalHtml, slug: slug })
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        toast({ 
          title: "Erfolgreich veröffentlicht! 🚀", 
          description: `URL: ${target.bridge_url.replace('bridge.php', '')}${result.url}`,
          className: "bg-green-600 text-white"
        });
      } else {
        throw new Error(result.message || "Unbekannter Fehler");
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Fehler beim Upload", description: error instanceof Error ? error.message : "Prüfe Konsole", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <div className="p-3 bg-secondary/10 rounded-xl">
            <UploadCloud className="w-8 h-8 text-secondary" />
        </div>
        <div>
          <h2 className="font-display font-bold text-3xl">Multi-Channel Publisher</h2>
          <p className="text-muted-foreground">Verteile Vergleiche & Artikel auf deine Satelliten-Seiten.</p>
        </div>
      </div>

      {/* Warning if no targets */}
      {loadError && (
        <Card className="border-amber-500/50 bg-amber-500/10">
          <CardContent className="flex items-start gap-4 pt-6">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-200">Setup erforderlich</p>
              <p className="text-sm text-amber-300/80 mt-1">{loadError}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Configuration */}
        <div className="lg:col-span-2 space-y-6">
            
            <Card>
                <CardHeader>
                    <CardTitle>1. Konfiguration</CardTitle>
                    <CardDescription>Wohin soll die Seite?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Ziel-Domain</Label>
                            <Select onValueChange={setSelectedTargetId} value={selectedTargetId} disabled={targets.length === 0}>
                                <SelectTrigger><SelectValue placeholder={targets.length === 0 ? "Keine Targets konfiguriert" : "Domain wählen..."} /></SelectTrigger>
                                <SelectContent>
                                    {targets.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>URL-Slug (Ordner)</Label>
                            <Input 
                                placeholder="z.B. beste-krypto-app (PFLICHT!)" 
                                value={slug} 
                                onChange={e => setSlug(e.target.value)} 
                                className="font-mono border-l-4 border-l-secondary"
                            />
                            <p className="text-[10px] text-red-500 font-bold">ACHTUNG: Darf nicht leer sein!</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>2. Inhalt & SEO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>H1 Titel (Browser Title)</Label>
                        <Input value={pageTitle} onChange={e => setPageTitle(e.target.value)} placeholder="Der große Krypto Vergleich 2026" />
                    </div>
                    <div className="space-y-2">
                        <Label>Meta Beschreibung</Label>
                        <Input value={metaDescription} onChange={e => setMetaDescription(e.target.value)} placeholder="Finde die besten Anbieter..." />
                    </div>
                    <div className="space-y-2">
                        <Label>Inhalt (HTML erlaubt)</Label>
                        <Textarea 
                            value={pageContent} 
                            onChange={e => setPageContent(e.target.value)} 
                            className="min-h-[200px] font-mono text-sm"
                            placeholder="<p>Dein Einleitungstext...</p>" 
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-4">
                <Button 
                    size="lg" 
                    className="w-full bg-secondary hover:bg-orange-600 text-white font-bold h-14 text-lg shadow-xl"
                    onClick={handlePublish}
                    disabled={isLoading || targets.length === 0}
                >
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <UploadCloud className="mr-2" />}
                    {isLoading ? "Wird veröffentlicht..." : "JETZT VERÖFFENTLICHEN"}
                </Button>
            </div>

        </div>

        {/* RIGHT COLUMN: Type & Projects */}
        <div className="space-y-6">
            
            <Card className="bg-slate-50 border-primary/20">
                <CardHeader>
                    <CardTitle>3. Seitentyp</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <div 
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-3 ${templateType === 'COMPARISON' ? 'border-secondary bg-white shadow-md' : 'border-transparent hover:bg-white'}`}
                            onClick={() => setTemplateType('COMPARISON')}
                        >
                            <LayoutList className={templateType === 'COMPARISON' ? 'text-secondary' : 'text-slate-400'} />
                            <div>
                                <div className="font-bold">Vergleichs-Tabelle</div>
                                <div className="text-xs text-muted-foreground">Für "Beste X" Keywords.</div>
                            </div>
                        </div>

                        <div 
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-3 ${templateType === 'ARTICLE' ? 'border-secondary bg-white shadow-md' : 'border-transparent hover:bg-white'}`}
                            onClick={() => setTemplateType('ARTICLE')}
                        >
                            <FileText className={templateType === 'ARTICLE' ? 'text-secondary' : 'text-slate-400'} />
                            <div>
                                <div className="font-bold">Ratgeber / Artikel</div>
                                <div className="text-xs text-muted-foreground">Nur Text & Bilder.</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {templateType === "COMPARISON" && (
                <Card className="border-secondary/20 h-[500px] flex flex-col">
                    <CardHeader className="bg-secondary/5 pb-3">
                        <CardTitle className="text-base">Projekte auswählen</CardTitle>
                        <CardDescription>Welche Anbieter sollen in die Tabelle?</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <ScrollArea className="h-full p-4">
                            <div className="space-y-2">
                                {projects.map(project => (
                                    <div key={project.id} className="flex items-center space-x-3 p-2 hover:bg-slate-100 rounded-lg">
                                        <Checkbox 
                                            id={`p-${project.id}`} 
                                            checked={selectedProjectIds.includes(project.id)}
                                            onCheckedChange={() => toggleProject(project.id)}
                                        />
                                        <div className="flex-1">
                                            <Label htmlFor={`p-${project.id}`} className="font-medium cursor-pointer block">
                                                {project.name}
                                            </Label>
                                            <span className="text-[10px] bg-slate-200 px-1.5 rounded text-slate-600">Rating: {project.rating}</span>
                                        </div>
                                        {project.logo_url && (
                                            <img src={project.logo_url} alt="" className="w-8 h-8 object-contain opacity-50" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}

        </div>
      </div>
    </div>
  );
}
