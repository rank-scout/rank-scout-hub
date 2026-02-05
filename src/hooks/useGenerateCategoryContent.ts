import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const GEMINI_API_KEY = "AIzaSyA1BJE6mOrSA8tcIXydbtNoEqov6U1Z9W4"; 

export interface GeneratedCategoryContent {
  contentTop: string;
  contentBottom: string;
  wordCount: number;
}

export function useGenerateCategoryContent() {
  const [isGenerating, setIsGenerating] = useState(false);

  // Hilfsfunktion: Ermittelt automatisch ein verfügbares Modell
  const findWorkingModel = async (): Promise<string> => {
    try {
      console.log("[Gemini-Auto] Suche verfügbare Modelle...");
      const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
      
      const response = await fetch(listUrl);
      if (!response.ok) throw new Error("Konnte Modell-Liste nicht laden");
      
      const data = await response.json();
      const models = data.models || [];
      
      // Wir suchen Modelle, die 'generateContent' unterstützen
      const contentModels = models.filter((m: any) => 
        m.supportedGenerationMethods?.includes("generateContent")
      );

      if (contentModels.length === 0) throw new Error("Keine generativen Modelle gefunden.");

      // Priorisierung: Wir wollen Flash oder Pro
      const preferred = contentModels.find((m: any) => m.name.includes("flash")) ||
                        contentModels.find((m: any) => m.name.includes("pro")) ||
                        contentModels[0]; // Fallback: Nimm einfach das erste

      // Der Name kommt oft als "models/gemini-1.5-flash". Wir brauchen nur den hinteren Teil für manche Calls,
      // aber die API akzeptiert meistens den vollen Namen "models/..." nicht im URL Pfad, sondern wir müssen aufpassen.
      // Die API erwartet oft: /v1beta/models/MODEL_NAME:generateContent
      // Der 'name' im JSON ist z.B. "models/gemini-1.5-flash". 
      // Wir nehmen ihn so, wie er kommt, schneiden aber "models/" ab, falls wir es in der URL selbst bauen.
      
      const cleanName = preferred.name.replace("models/", "");
      console.log(`[Gemini-Auto] Bestes Modell gefunden: ${cleanName}`);
      return cleanName;

    } catch (e) {
      console.warn("[Gemini-Auto] Auto-Discovery fehlgeschlagen, nutze Fallback.", e);
      return "gemini-1.5-flash"; // Letzter Strohhalm
    }
  };

  const generateCategoryContent = async (
    categoryName: string,
    topic: string = "Bester Vergleich & Ratgeber",
    wordCount: number = 1500
  ): Promise<GeneratedCategoryContent | null> => {
    setIsGenerating(true);

    if (!GEMINI_API_KEY) {
        toast({ title: "Fehler", description: "Google API Key fehlt!", variant: "destructive" });
        setIsGenerating(false);
        return null;
    }

    try {
      console.log(`[Gemini-AI] Starte für: ${categoryName}...`);

      // SCHRITT 1: Modell automatisch finden
      const modelName = await findWorkingModel();

      const prompt = `
      Du bist ein professioneller SEO-Texter für ein Vergleichsportal (Rank-Scout).
      Thema: "${categoryName}". Fokus: "${topic}".
      
      Aufgabe:
      1. 'contentTop': Ein packendes Intro (ca. 150 Wörter). Warum vergleichen? Was bringt es?
      2. 'contentBottom': Ein ausführlicher Ratgeber (ca. ${wordCount} Wörter).
         - Nutze sinnvolle H2 und H3 Überschriften.
         - Nutze HTML Tags für Formatierung: <h2>, <h3>, <p>, <ul>, <li>, <strong>.
         - KEIN Markdown (keine Sternchen ** oder Rauten ##), nur reines HTML.
      
      WICHTIG: Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt:
      {
        "contentTop": "...",
        "contentBottom": "..."
      }
      `;

      // SCHRITT 2: Generieren mit dem gefundenen Modell
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Fehler (${response.status}) bei Modell ${modelName}: ${errText}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) throw new Error("Keine Antwort erhalten.");

      // Parsing
      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch (e) {
        console.error("JSON Parse Fehler:", e);
        throw new Error("KI-Antwort war kein gültiges JSON.");
      }

      return {
        contentTop: parsed.contentTop || "",
        contentBottom: parsed.contentBottom || "",
        wordCount
      };

    } catch (err: any) {
      console.error("[Gemini-AI] Finaler Fehler:", err);
      toast({
        title: "Fehler",
        description: err.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateCategoryContent, isGenerating };
}