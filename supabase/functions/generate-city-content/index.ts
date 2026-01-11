import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city, keyword = "Dating", wordCount = 1000 } = await req.json();
    
    if (!city) {
      return new Response(
        JSON.stringify({ error: "Stadtname ist erforderlich" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating content for city: ${city}, keyword: ${keyword}, wordCount: ${wordCount}`);

    const topWords = Math.floor(wordCount * 0.3);
    const bottomWords = Math.floor(wordCount * 0.7);
    const faqCount = wordCount >= 3000 ? 5 : wordCount >= 2000 ? 4 : 3;

    const systemPrompt = `Du bist ein erfahrener Frontend-Entwickler und SEO-Texter.
Du erstellst HTML-Content der sich nahtlos in eine moderne Tailwind CSS Website einfügt.

KRITISCHE REGELN:
1. Antworte NUR mit einem JSON-Objekt: { "contentTop": "...", "contentBottom": "..." }
2. Kein Markdown, kein Text davor oder danach - NUR das JSON
3. NIEMALS inline styles für Fonts verwenden (kein font-family: Arial oder ähnliches)
4. Nutze IMMER Tailwind-Klassen: font-sans für Fließtext, font-display für Überschriften
5. Die Schriftart wird vom Theme der Website übernommen (Google Fonts: Plus Jakarta Sans)
6. Schreibe auf Deutsch in der Du-Form`;

    const userPrompt = `Erstelle SEO-optimierten HTML-Content zum Thema "${keyword}" für "${city}".

WORTANZAHL: Ca. ${wordCount} Wörter gesamt (${topWords} für contentTop, ${bottomWords} für contentBottom)

═══════════════════════════════════════════════════════
TEIL 1: contentTop (USP-Cards, ~${topWords} Wörter)
═══════════════════════════════════════════════════════

Erstelle 3 USP-Cards mit diesem exakten HTML-Schema:

<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
  <div class="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
    <div class="text-4xl mb-4">[PASSENDES EMOJI]</div>
    <h3 class="text-xl font-bold font-display text-gray-900 dark:text-white mb-3">[ÜBERSCHRIFT]</h3>
    <p class="text-gray-600 dark:text-gray-300 font-sans leading-relaxed">[BESCHREIBUNG 25-35 Wörter]</p>
  </div>
  <!-- 2 weitere Cards nach gleichem Schema -->
</div>

═══════════════════════════════════════════════════════
TEIL 2: contentBottom (SEO-Text + FAQ, ~${bottomWords} Wörter)
═══════════════════════════════════════════════════════

HTML-KLASSEN-REFERENZ (nutze exakt diese):

ÜBERSCHRIFTEN (H2):
<h2 class="text-2xl md:text-3xl font-bold font-display text-gray-900 dark:text-white mt-12 mb-6">[Überschrift]</h2>

FLIESSTEXT (P):
<p class="text-base md:text-lg text-gray-600 dark:text-gray-300 font-sans leading-relaxed mb-6">[Text]</p>

LISTEN:
<ul class="list-none space-y-3 mb-8 ml-1">
  <li class="flex items-start text-gray-600 dark:text-gray-300 font-sans">
    <span class="mr-3 text-primary flex-shrink-0">✓</span>
    <span>[Listenpunkt]</span>
  </li>
</ul>

FAQ-AKKORDEON (PFLICHT - nutze exakt dieses HTML):
<div class="space-y-4 mt-8">
  <details class="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-all hover:shadow-md">
    <summary class="flex items-center justify-between p-5 cursor-pointer list-none font-semibold text-gray-900 dark:text-white font-display">
      <span>[FRAGE?]</span>
      <span class="transition-transform duration-300 group-open:rotate-180 text-primary">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
      </span>
    </summary>
    <div class="px-5 pb-5 pt-0 text-gray-600 dark:text-gray-300 font-sans leading-relaxed">
      [ANTWORT]
    </div>
  </details>
</div>

═══════════════════════════════════════════════════════
STRUKTUR FÜR contentBottom:
═══════════════════════════════════════════════════════

1. SEO-Haupttext (4 Absätze mit H2-Überschriften):
   - H2: "${keyword} in ${city}" + 2 Absätze (~150 Wörter)
   - H2: "Vorteile von ${keyword}" + 1-2 Absätze + Bulletpoints (~150 Wörter)
   
2. FAQ-Sektion:
   - H2: "Häufige Fragen zu ${keyword}"
   - ${faqCount} FAQ-Items (je ~60 Wörter pro Antwort)

═══════════════════════════════════════════════════════
VERBOTEN:
═══════════════════════════════════════════════════════
- Inline font-family Styles
- Arial, Times New Roman, oder andere System-Fonts
- <style> Tags
- CSS-Klassen die nicht oben definiert sind
- Markdown-Formatierung

Antworte NUR mit dem JSON-Objekt:
{
  "contentTop": "<div class=\\"grid...\\">...</div>",
  "contentBottom": "<h2 class=\\"text-2xl...\\">...</h2>..."
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit erreicht. Bitte versuche es später erneut." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Keine Credits verfügbar. Bitte lade Credits auf." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let generatedContent = data.choices?.[0]?.message?.content || "";
    
    console.log("Raw AI response length:", generatedContent.length);

    // Try to parse as JSON first
    let contentTop = "";
    let contentBottom = "";

    try {
      // Clean up potential markdown code blocks
      generatedContent = generatedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(generatedContent);
      contentTop = parsed.contentTop || "";
      contentBottom = parsed.contentBottom || "";
      console.log("Successfully parsed JSON response");
    } catch (parseError) {
      console.log("JSON parse failed, falling back to separator method:", parseError);
      // Fallback to separator method
      const parts = generatedContent.split("---SEPARATOR---");
      contentTop = parts[0]?.trim() || "";
      contentBottom = parts[1]?.trim() || generatedContent;
    }

    console.log("Content Top length:", contentTop.length);
    console.log("Content Bottom length:", contentBottom.length);

    return new Response(
      JSON.stringify({
        contentTop,
        contentBottom,
        city,
        keyword,
        wordCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in generate-city-content:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Ein unbekannter Fehler ist aufgetreten" 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
