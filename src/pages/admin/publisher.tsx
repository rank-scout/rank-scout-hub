import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, UploadCloud, Globe } from "lucide-react";

// Typdefinition für unsere Ziele
type DeploymentTarget = {
  id: string;
  name: string;
  bridge_url: string;
  api_key: string;
};

export default function AdminPublisher() {
  const [targets, setTargets] = useState<DeploymentTarget[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string>("");
  const [pageTitle, setPageTitle] = useState("");
  const [pageContent, setPageContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 1. Ziele aus Supabase laden
  useEffect(() => {
    async function loadTargets() {
      const { data, error } = await supabase
        .from("deployment_targets")
        .select("*");
      
      if (error) {
        console.error(error);
        toast({ variant: "destructive", title: "Fehler beim Laden der Ziele" });
      } else if (data) {
        setTargets(data);
      }
    }
    loadTargets();
  }, []);

  // 2. HTML Generieren (Der Generator)
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
            <div class="mt-2 text-xs">Empfohlen von Rank-Scout</div>
        </footer>
    </div>
</body>
</html>`;
  };

  // 3. Veröffentlichen (Der Upload)
  async function handlePublish() {
    if (!selectedTargetId) {
      toast({ variant: "destructive", title: "Bitte wähle ein Ziel aus!" });
      return;
    }

    const target = targets.find(t => t.id === selectedTargetId);
    if (!target) return;

    setIsLoading(true);
    try {
      // A. HTML bauen
      const finalHtml = generateHtml(pageTitle, pageContent);

      // B. An die Bridge senden
      const response = await fetch(target.bridge_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": target.api_key
        },
        body: JSON.stringify({ html: finalHtml })
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        toast({ 
          title: "Erfolgreich veröffentlicht! 🚀", 
          description: `Die Seite ist jetzt auf ${target.name} live.`,
          className: "bg-green-600 text-white border-green-700"
        });
      } else {
        throw new Error(result.message || "Unbekannter Fehler");
      }
    } catch (error) {
      console.error(error);
      toast({ 
        title: "Fehler beim Deploy", 
        description: error instanceof Error ? error.message : "Verbindung fehlgeschlagen",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-primary/10 rounded-xl">
          <UploadCloud className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h2 className="text-4xl font-bold tracking-tight">Multi-Channel Publisher</h2>
          <p className="text-muted-foreground text-lg">Erstelle Landingpages und verteile sie auf deine Subdomains.</p>
        </div>
      </div>

      <Card className="shadow-lg border-primary/10">
        <CardHeader className="bg-slate-50/50 pb-8 border-b">
          <CardTitle className="text-xl">Inhalt erstellen</CardTitle>
          <CardDescription>Wähle das Ziel und schreibe den Inhalt.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-8">
          
          {/* Ziel-Auswahl */}
          <div className="space-y-3">
            <Label className="text-base">Ziel-Domain wählen</Label>
            <Select onValueChange={setSelectedTargetId} value={selectedTargetId}>
              <SelectTrigger className="h-12 text-lg">
                <SelectValue placeholder="Wähle eine Subdomain..." />
              </SelectTrigger>
              <SelectContent>
                {targets.map(t => (
                  <SelectItem key={t.id} value={t.id} className="text-base py-3">
                    {t.name} <span className="text-muted-foreground text-sm ml-2">({t.bridge_url})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6">
            <div className="space-y-3">
              <Label className="text-base">Seiten-Titel (Browser & H1)</Label>
              <Input 
                className="h-12 text-lg"
                placeholder="z.B. Die besten Dating-Portale 2026" 
                value={pageTitle}
                onChange={e => setPageTitle(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base">Inhalt</Label>
              <Textarea 
                className="min-h-[300px] text-lg leading-relaxed font-mono bg-slate-50"
                placeholder="Hier kommt dein Text rein..." 
                value={pageContent}
                onChange={e => setPageContent(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">Tipp: Du kannst hier einfachen Text schreiben oder HTML verwenden.</p>
            </div>
          </div>

          <div className="pt-6 border-t">
            <Button 
              size="lg" 
              className="w-full text-xl h-16 gap-3 font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all" 
              onClick={handlePublish}
              disabled={isLoading || !selectedTargetId}
            >
              {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : <Globe className="w-6 h-6" />}
              {isLoading ? "Wird übertragen..." : "Veröffentlichen (Live schalten)"}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}