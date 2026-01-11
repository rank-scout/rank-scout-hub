import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
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

    // Calculate approximate word distribution
    const topWords = Math.floor(wordCount * 0.3); // 30% for top section
    const bottomWords = Math.floor(wordCount * 0.7); // 70% for bottom section (SEO + FAQ)
    const faqCount = wordCount >= 3000 ? 5 : wordCount >= 2000 ? 4 : 3;
    const paragraphCount = wordCount >= 3000 ? 5 : wordCount >= 2000 ? 4 : 3;

    const systemPrompt = `Du bist ein erfahrener SEO-Texter und Content-Creator für ${keyword}-Webseiten.
Erstelle hochwertigen, informativen Content für eine ${keyword}-Vergleichsseite.
Antworte NUR mit zwei HTML-Blöcken, getrennt durch "---SEPARATOR---".
Schreibe IMMER auf Deutsch und benutze die Du-Form.
Der Content muss thematisch 100% zu "${keyword}" passen - nicht nur Dating allgemein!
Nutze eine moderne, professionelle Sprache.`;

    const userPrompt = `Erstelle umfangreichen Content für eine Landingpage zum Thema "${keyword} in ${city}".

WICHTIG: Der gesamte Inhalt muss sich spezifisch um "${keyword}" drehen, nicht nur um Dating allgemein!

**BLOCK 1 - USP-Grid (contentTop) - ca. ${topWords} Wörter:**
Erstelle 3 thematisch passende USP-Cards zum Thema "${keyword}". 
Nutze EXAKT diese HTML-Struktur mit moderner Schrift:

<div class="usp-section" style="font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;">
  <div class="usp-grid">
    <div class="usp-card">
      <div class="usp-icon">[Passendes Emoji für ${keyword}]</div>
      <h3 style="font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; font-weight: 600;">[Überschrift passend zu ${keyword}]</h3>
      <p style="font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;">[Beschreibung passend zu ${keyword} in ${city}]</p>
    </div>
    <div class="usp-card">
      <div class="usp-icon">[Passendes Emoji]</div>
      <h3 style="font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; font-weight: 600;">[Überschrift 2]</h3>
      <p style="font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;">[Beschreibung 2]</p>
    </div>
    <div class="usp-card">
      <div class="usp-icon">[Passendes Emoji]</div>
      <h3 style="font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; font-weight: 600;">[Überschrift 3]</h3>
      <p style="font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;">[Beschreibung 3]</p>
    </div>
  </div>
</div>

Die USPs müssen thematisch zu "${keyword}" passen! Beispiele:
- Bei "LGBTQ Dating": Safe Spaces, Community, Akzeptanz
- Bei "50+ Dating": Lebenserfahrung, Seriöse Partner, Neue Chancen
- Bei "Casual Dating": Unverbindlich, Diskret, Abenteuer

---SEPARATOR---

**BLOCK 2 - SEO & FAQ (contentBottom) - ca. ${bottomWords} Wörter:**
Erstelle ausführlichen SEO-Content mit moderner Schrift:

<div style="font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;">
<h2 style="font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; font-weight: 700;">${keyword} in ${city}</h2>
<p style="font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; line-height: 1.7;">
[${paragraphCount} ausführliche Absätze über ${keyword} speziell in ${city}. 
- Erkläre was ${keyword} bedeutet und warum es relevant ist
- Beschreibe die ${keyword}-Szene in ${city}
- Gehe auf lokale Besonderheiten, Treffpunkte und Communities ein
- Erkläre warum Online-Plattformen für ${keyword} in ${city} beliebt sind
- Gib Tipps für ${keyword} in ${city}
Insgesamt ca. ${Math.floor(bottomWords * 0.6)} Wörter.]
</p>

<h2 style="font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; font-weight: 700; margin-top: 2rem;">Häufige Fragen zu ${keyword} in ${city}</h2>
${Array(faqCount).fill(null).map((_, i) => `
<details class="faq-item" style="font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;">
  <summary style="font-weight: 600;">[FAQ Frage ${i + 1} zu ${keyword} in ${city}]</summary>
  <p style="line-height: 1.7;">[Ausführliche Antwort mit ca. ${Math.floor((bottomWords * 0.4) / faqCount)} Wörtern]</p>
</details>`).join('\n')}
</div>

WICHTIG: 
- Antworte NUR mit den zwei HTML-Blöcken, getrennt durch "---SEPARATOR---"
- Keine zusätzlichen Erklärungen oder Markdown
- Der Content muss 100% zum Thema "${keyword}" passen
- Nutze realistische, lokale Bezüge zu ${city}
- Gesamtlänge ca. ${wordCount} Wörter
- Verwende die moderne Schriftart-Angaben im style-Attribut
- Die Texte sollen Vertrauen aufbauen, informieren und zum Klicken motivieren`;

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
    const generatedContent = data.choices?.[0]?.message?.content || "";
    
    console.log("Generated content length:", generatedContent.length);

    // Split the content by separator
    const parts = generatedContent.split("---SEPARATOR---");
    
    const contentTop = parts[0]?.trim() || "";
    const contentBottom = parts[1]?.trim() || generatedContent;

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
