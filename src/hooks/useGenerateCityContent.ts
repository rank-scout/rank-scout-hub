import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface GeneratedContent {
  contentTop: string;
  contentBottom: string;
  faqs: { question: string; answer: string }[];
  city: string;
  keyword: string;
  wordCount: number;
}

export function useGenerateCityContent() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = async (
    city: string, 
    keyword: string = "Dating",
    wordCount: number = 1000
  ): Promise<GeneratedContent | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log(`Starte Generierung für ${city} mit Keyword ${keyword}...`);

      const { data, error: fnError } = await supabase.functions.invoke("generate-city-content", {
        body: { city, keyword, wordCount },
      });

      if (fnError) throw new Error(fnError.message);
      
      let contentTop = "";
      let contentBottom = "";
      let faqs: any[] = [];

      // Parsing Logik für JSON-Antwort
      if (typeof data === 'object' && data !== null && !data.error) {
          contentTop = data.contentTop || "";
          contentBottom = data.contentBottom || "";
          faqs = Array.isArray(data.faqs) ? data.faqs : [];
      } else if (typeof data === 'string') {
          try {
              // Notfall-Parsing falls es String ist
              const cleanData = data.replace(/```json/g, "").replace(/```/g, "").trim();
              const parsed = JSON.parse(cleanData);
              contentTop = parsed.contentTop || "";
              contentBottom = parsed.contentBottom || "";
              faqs = Array.isArray(parsed.faqs) ? parsed.faqs : [];
          } catch (e) {
              console.warn("Parsing Fallback", e);
              contentTop = data;
          }
      }

      // Cleanup HTML & Zentrierung
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
        faqs: faqs,
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