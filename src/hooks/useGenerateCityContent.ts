import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedContent {
  contentTop: string;
  contentBottom: string;
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
      const { data, error: fnError } = await supabase.functions.invoke("generate-city-content", {
        body: { city, keyword, wordCount },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data as GeneratedContent;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateContent,
    isGenerating,
    error,
  };
}
