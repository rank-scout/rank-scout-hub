import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, UploadCloud, Globe, Link as LinkIcon } from "lucide-react";

type DeploymentTarget = {
  id: string;
  name: string;
  bridge_url: string;
  api_key: string;
};

export default function AdminPublisher() {
  const [targets, setTargets] = useState<DeploymentTarget[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string>("");
  
  // Neue Felder
  const [slug, setSlug] = useState(""); // z.B. "test-bericht"
  const [pageTitle, setPageTitle] = useState("");
  const [pageContent, setPageContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadTargets() {
      const { data } = await supabase.from("deployment_targets").select("*");
      if (data) setTargets(data);
    }
    loadTargets();
  }, []);

  // Simples Template (wird später erweitert)
  const generateHtml = (title: string, content: string) => {
    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>body { font-family: sans-serif; }</style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen">
    <div class="max-w-4xl mx-auto py-12 px-6">
        <header class="text-center mb-16">
            <h1 class="text-5xl font-extrabold text-blue-700 mb-6 tracking-tight">${title}</h1>
            <div class="w-32 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
        </header>
        <main class="bg-white p-10 rounded-2xl shadow-xl border border-slate-100 prose prose-lg max-w-none">
            ${content.replace(/\n/g, '<br>')}
        </main>
        <footer class="text-center mt-16 text-slate-400 text-sm">
            <p>&copy; ${new Date().getFullYear()} Rank-Scout. Alle Rechte vorbehalten.</p>
        </footer>
    </div>
</body>
</html>`;
  };

  async function handlePublish() {
    if (!selectedTargetId) {
      toast({ variant: "destructive", title: "Kein Ziel gewählt!" });
      return;
    }

    // Slug Validierung (nur a-z, 0-9, -)
    if (slug && !/^[a-z0-9\-]+$/i.test(slug)) {
      toast({ variant: "destructive", title: "Ungültiger Pfad", description: "Nur Buchstaben, Zahlen und Bindestriche erlaubt." });
      return;
    }

    const target = targets.find(t => t.id === selectedTargetId);
    if (!target) return;

    setIsLoading(true);
    try {
      const finalHtml = generateHtml(pageTitle, pageContent);

      const response = await fetch(target.bridge_url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": target.api_key },
        // Wir senden jetzt auch den SLUG mit
        body: JSON.stringify({ html: finalHtml, slug: slug })
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        toast({ 
          title: "Online! 🚀", 
          description: `Seite liegt unter: ${result.url}`,
          className: "bg-green-600 text-white"
        });
        // Optional: Reset Felder
        // setSlug(""); 
      } else {
        throw new Error(result.message || "Fehler");
      }
    } catch (error) {
      toast({ title: "Fehler", description: error instanceof Error ? error.message : "Unbekannt", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-primary/10 rounded-xl"><UploadCloud className="w-10 h-10 text-primary" /></div>
        <div>
          <h2 className="text-4xl font-bold">Multi-Channel Publisher</h2>
          <p className="text-muted-foreground">Erstelle Landingpages in beliebigen Unterordnern.</p>
        </div>
      </div>

      <Card className="shadow-lg border-primary/10">
        <CardHeader className="bg-slate-50/50 pb-8 border-b">
          <CardTitle>Neue Seite anlegen</CardTitle>
          <CardDescription>Wähle Domain und Pfad.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-8">
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Ziel-Domain</Label>
              <Select onValueChange={setSelectedTargetId} value={selectedTargetId}>
                <SelectTrigger className="h-12 text-lg"><SelectValue placeholder="Wählen..." /></SelectTrigger>
                <SelectContent>
                  {targets.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Pfad (Slug)</Label>
              <div className="flex items-center gap-2">
                 <span className="text-muted-foreground text-lg">/</span>
                 <Input 
                  className="h-12 text-lg font-mono" 
                  placeholder="meine-neue-seite (Leer = Startseite)" 
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, ''))} // Auto-Formatierung
                 />
              </div>
              <p className="text-xs text-muted-foreground">Erstellt automatisch einen Ordner, z.B. <code>/single-test/</code>. Leer lassen für Hauptseite.</p>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Browser Titel</Label>
            <Input className="h-12 text-lg" placeholder="Der große Vergleich 2026" value={pageTitle} onChange={e => setPageTitle(e.target.value)} />
          </div>

          <div className="space-y-3">
            <Label>Inhalt</Label>
            <Textarea className="min-h-[300px] text-lg font-mono bg-slate-50" placeholder="HTML oder Text..." value={pageContent} onChange={e => setPageContent(e.target.value)} />
          </div>

          <div className="pt-6 border-t">
            <Button size="lg" className="w-full text-xl h-16 font-bold shadow-xl hover:shadow-primary/40 transition-all" onClick={handlePublish} disabled={isLoading || !selectedTargetId}>
              {isLoading ? <Loader2 className="animate-spin" /> : <Globe className="mr-2" />}
              {isLoading ? "Erstelle Ordner & Lade hoch..." : "Seite Veröffentlichen"}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}