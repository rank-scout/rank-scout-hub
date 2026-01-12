import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDomains } from "@/hooks/useDomains";
import { useCreateCategory } from "@/hooks/useCategories";
import { Loader2, Upload, CheckCircle, XCircle, Globe, FileStack } from "lucide-react";

interface ImportResult {
  url: string;
  slug: string;
  status: "pending" | "importing" | "success" | "error";
  message?: string;
}

function extractMetaFromHtml(html: string): { title: string | null; metaDescription: string | null; h1Title: string | null } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  return {
    title: doc.querySelector('title')?.textContent?.trim() || null,
    metaDescription: doc.querySelector('meta[name="description"]')?.getAttribute('content') || null,
    h1Title: doc.querySelector('h1')?.textContent?.trim() || null,
  };
}

export default function BulkImportDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [urls, setUrls] = useState("");
  const [targetDomain, setTargetDomain] = useState("dating.rank-scout.com");
  const [isImporting, setIsImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [progress, setProgress] = useState(0);

  const { data: domains = [] } = useDomains();
  const createCategory = useCreateCategory();

  const parseUrls = (text: string): string[] => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('http'));
  };

  const handleImport = async () => {
    const urlList = parseUrls(urls);
    
    if (urlList.length === 0) {
      toast({
        title: "Keine URLs gefunden",
        description: "Bitte gib mindestens eine URL ein (eine pro Zeile).",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setProgress(0);

    // Initialize results
    const initialResults: ImportResult[] = urlList.map(url => {
      const urlObj = new URL(url);
      const slug = urlObj.pathname.replace(/^\/|\/$/g, '') || 'homepage';
      return { url, slug, status: "pending" };
    });
    setResults(initialResults);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < urlList.length; i++) {
      const url = urlList[i];
      
      // Update status to importing
      setResults(prev => prev.map((r, idx) => 
        idx === i ? { ...r, status: "importing" } : r
      ));

      try {
        // Fetch HTML from URL
        const { data, error } = await supabase.functions.invoke('fetch-html', {
          body: { url }
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        const { html, slug } = data;
        
        // Extract SEO data
        const extracted = extractMetaFromHtml(html);
        
        // Convert slug to name
        const name = slug
          .split('-')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        // Create the category
        await createCategory.mutateAsync({
          name,
          slug,
          description: extracted.metaDescription || "",
          meta_title: extracted.title || name,
          meta_description: extracted.metaDescription || "",
          h1_title: extracted.h1Title || name,
          custom_html_override: html,
          target_domain: targetDomain,
          is_active: true,
          theme: "DATING",
          template: "comparison",
          color_theme: "dark",
          icon: "📍",
          sort_order: i,
        });

        successCount++;
        setResults(prev => prev.map((r, idx) => 
          idx === i ? { ...r, status: "success", message: `${html.length} Zeichen importiert` } : r
        ));
      } catch (error) {
        errorCount++;
        setResults(prev => prev.map((r, idx) => 
          idx === i ? { 
            ...r, 
            status: "error", 
            message: error instanceof Error ? error.message : "Unbekannter Fehler" 
          } : r
        ));
      }

      setProgress(((i + 1) / urlList.length) * 100);
      
      // Small delay to avoid rate limiting
      if (i < urlList.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setIsImporting(false);
    toast({
      title: "Import abgeschlossen",
      description: `${successCount} erfolgreich, ${errorCount} fehlgeschlagen`,
    });
  };

  const urlCount = parseUrls(urls).length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileStack className="w-4 h-4" />
          Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Mehrere Landingpages importieren
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isImporting && results.length === 0 && (
            <>
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4" />
                  Ziel-Domain
                </Label>
                <Select value={targetDomain} onValueChange={setTargetDomain}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {domains.map((domain) => (
                      <SelectItem key={domain.id} value={domain.domain}>
                        {domain.display_name} ({domain.domain})
                      </SelectItem>
                    ))}
                    <SelectItem value="dating.rank-scout.com">
                      dating.rank-scout.com (Standard)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2 block">
                  URLs (eine pro Zeile)
                  {urlCount > 0 && (
                    <span className="ml-2 text-muted-foreground text-sm">
                      ({urlCount} URLs erkannt)
                    </span>
                  )}
                </Label>
                <Textarea
                  value={urls}
                  onChange={(e) => setUrls(e.target.value)}
                  placeholder={`https://dating.rank-scout.com/singles-salzburg/
https://dating.rank-scout.com/singles-wien/
https://dating.rank-scout.com/top3-dating-apps/
https://dating.rank-scout.com/speed-dating-wien/
...`}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>

              <Button 
                onClick={handleImport} 
                disabled={urlCount === 0}
                className="w-full gap-2"
              >
                <Upload className="w-4 h-4" />
                {urlCount} Seiten importieren
              </Button>
            </>
          )}

          {(isImporting || results.length > 0) && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Fortschritt</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
                {results.map((result, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-3 p-3 text-sm"
                  >
                    <div className="shrink-0">
                      {result.status === "pending" && (
                        <div className="w-5 h-5 rounded-full border-2 border-muted" />
                      )}
                      {result.status === "importing" && (
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      )}
                      {result.status === "success" && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {result.status === "error" && (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{result.slug}</div>
                      <div className="text-muted-foreground text-xs truncate">{result.url}</div>
                      {result.message && (
                        <div className={`text-xs mt-1 ${result.status === "error" ? "text-red-400" : "text-green-400"}`}>
                          {result.message}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {!isImporting && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setResults([]);
                      setProgress(0);
                      setUrls("");
                    }}
                    className="flex-1"
                  >
                    Neuer Import
                  </Button>
                  <Button 
                    onClick={() => setIsOpen(false)}
                    className="flex-1"
                  >
                    Fertig
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
