// src/hooks/useGenerateCityContent.ts

// ... (Imports bleiben gleich)

export function useGenerateCityContent() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = async (
    city: string, // Wir lassen city im Funktionsaufruf, falls du es später brauchst
    keyword: string = "Dating",
    wordCount: number = 1000
  ): Promise<GeneratedContent | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log(`Starte Generierung für Keyword: ${keyword}...`);

      // HIER IST DIE KORREKTUR:
      // Wir senden jetzt explizit 'mode: "content"' mit.
      const { data, error: fnError } = await supabase.functions.invoke("generate-city-content", {
        body: { 
          keyword,      // Das Keyword (z.B. "Dating in Berlin")
          wordCount,    // Die Wortanzahl
          mode: 'content' // WICHTIG: Sagt dem Backend, dass es Text sein soll (keine FAQs)
        },
      });

      if (fnError) throw new Error(fnError.message);
      
      let contentTop = "";
      let contentBottom = "";
      
      // ... (Der Rest der Parsing-Logik bleibt exakt wie vorher) ...
      
      if (typeof data === 'object' && data !== null && !data.error) {
          contentTop = data.contentTop || "";
          contentBottom = data.contentBottom || "";
          // FAQs ignorieren wir hier, da wir im Content-Mode sind
      } else if (typeof data === 'string') {
          try {
              const cleanData = data.replace(/```json/g, "").replace(/```/g, "").trim();
              const parsed = JSON.parse(cleanData);
              contentTop = parsed.contentTop || "";
              contentBottom = parsed.contentBottom || "";
          } catch (e) {
              console.warn("Parsing Fallback", e);
              contentTop = data;
          }
      }

      // Cleanup HTML & Zentrierung Helper (bleibt gleich)
      const wrapCentered = (html: string) => {
        if (!html) return "";
        let clean = html.replace(/```html/g, "").replace(/```/g, "").trim();
        if (!clean.includes('text-center')) {
            return `<div class="text-center space-y-4 force-center">\n${clean}\n</div>`;
        }
        return clean;
      };

      const finalResult: GeneratedContent = {
        contentTop: wrapCentered(contentTop),
        contentBottom: wrapCentered(contentBottom),
        faqs: [], // Leeres Array, da nur Content
        city,
        keyword,
        wordCount
      };

      return finalResult;

    } catch (err) {
      console.error("Generierungsfehler:", err);
      toast({ title: "Fehler", description: "KI-Generierung fehlgeschlagen.", variant: "destructive" });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateContent, isGenerating, error };
}