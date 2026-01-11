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
    const { city, keyword = "Dating" } = await req.json();
    
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

    console.log(`Generating content for city: ${city}, keyword: ${keyword}`);

    const systemPrompt = `Du bist ein SEO-Texter. Erstelle Inhalt für eine Dating-Vergleichsseite in ${city}.
Antworte NUR mit zwei HTML-Blöcken, getrennt durch "---SEPARATOR---".
Nutze EXAKT die vorgegebene HTML-Struktur mit den Tailwind-Klassen.
Schreibe IMMER auf Deutsch und benutze die Du-Form.`;

    const userPrompt = `Erstelle Content für eine Landingpage zum Thema "${keyword} in ${city}".

**BLOCK 1 - USP-Grid (contentTop):**
Nutze EXAKT diese Struktur mit 3 Cards:

<div class="usp-section">
  <div class="usp-grid">
    <div class="usp-card">
      <div class="usp-icon">❤️</div>
      <h3>Lokale ${city} Singles</h3>
      <p>Finde echte Profile aus ${city} und Umgebung – keine Fake-Accounts.</p>
    </div>
    <div class="usp-card">
      <div class="usp-icon">✨</div>
      <h3>Kostenlos testen</h3>
      <p>Starte ohne Risiko und entscheide später, ob du upgraden willst.</p>
    </div>
    <div class="usp-card">
      <div class="usp-icon">🔒</div>
      <h3>100% Diskret</h3>
      <p>Deine Daten sind geschützt – volle Anonymität garantiert.</p>
    </div>
  </div>
</div>

Ersetze die Texte mit passenden, kreativen Inhalten für ${city}.

---SEPARATOR---

**BLOCK 2 - SEO & FAQ (contentBottom):**
Nutze EXAKT diese Struktur:

<h2>${keyword} in ${city}</h2>
<p>[2-3 Absätze SEO-Text über Dating in ${city}, ca. 150-200 Wörter. Erwähne lokale Besonderheiten, beliebte Treffpunkte, und warum Online-Dating in ${city} beliebt ist.]</p>

<h2>Häufige Fragen</h2>
<details class="faq-item">
  <summary>Welche Dating-App ist in ${city} am besten?</summary>
  <p>[Antwort mit Bezug zu ${city}]</p>
</details>
<details class="faq-item">
  <summary>Gibt es viele Singles in ${city}?</summary>
  <p>[Antwort mit lokalen Fakten]</p>
</details>
<details class="faq-item">
  <summary>Ist Online-Dating in ${city} sicher?</summary>
  <p>[Antwort über Sicherheit und Datenschutz]</p>
</details>

WICHTIG: 
- Antworte NUR mit den zwei HTML-Blöcken, getrennt durch "---SEPARATOR---"
- Keine zusätzlichen Erklärungen oder Markdown
- Nutze realistische, lokale Bezüge zu ${city}
- Die Texte sollen Vertrauen aufbauen und zum Klicken motivieren`;

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
