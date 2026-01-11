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

    const systemPrompt = `Du bist ein SEO-Experte für Affiliate-Landingpages im deutschsprachigen Raum. 
Du schreibst überzeugende, lokalisierte Inhalte für Dating-Apps und Singles-Seiten.
Deine Texte sind modern, vertrauenswürdig und optimiert für Conversions.
Schreibe IMMER auf Deutsch und benutze die Du-Form.`;

    const userPrompt = `Erstelle Content für eine Landingpage zum Thema "${keyword} in ${city}".

Liefere mir ZWEI getrennte HTML-Blöcke:

**BLOCK 1 - USP-Sektion (Content oben):**
Ein Grid mit 3 USP-Cards im folgenden Format:
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
  <div class="bg-card border border-border rounded-2xl p-6 text-center">
    <div class="text-4xl mb-4">[EMOJI]</div>
    <h3 class="text-lg font-semibold text-foreground mb-2">[HEADLINE]</h3>
    <p class="text-muted-foreground text-sm">[KURZER TEXT]</p>
  </div>
  <!-- 2 weitere Cards -->
</div>

Themen für die 3 Cards:
1. Lokale Singles / Verifizierte Profile
2. Kostenlos testen / Keine Verpflichtung  
3. Sicherheit / Datenschutz

**BLOCK 2 - SEO-Deep-Dive (Content unten):**
Strukturiere es so:
1. Eine H2-Überschrift: "${keyword} in ${city} – Darauf solltest du achten"
2. 2-3 Absätze SEO-Text (ca. 150-200 Wörter) über ${keyword} in ${city}
3. 3 FAQ-Einträge im details/summary Format:

<div class="bg-muted/30 rounded-2xl p-8 my-12">
  <h2 class="text-2xl font-display font-bold text-foreground mb-6">${keyword} in ${city} – Darauf solltest du achten</h2>
  <div class="prose prose-invert max-w-none text-muted-foreground space-y-4">
    <p>[SEO-TEXT ABSATZ 1]</p>
    <p>[SEO-TEXT ABSATZ 2]</p>
  </div>
</div>

<div class="space-y-4 my-12">
  <h2 class="text-2xl font-display font-bold text-foreground mb-6">Häufig gestellte Fragen</h2>
  <details class="bg-card border border-border rounded-xl p-4 group">
    <summary class="font-semibold text-foreground cursor-pointer list-none flex items-center justify-between">
      <span>[FAQ FRAGE 1]</span>
      <span class="text-primary">+</span>
    </summary>
    <p class="mt-3 text-muted-foreground text-sm">[FAQ ANTWORT 1]</p>
  </details>
  <!-- 2 weitere FAQ-Einträge -->
</div>

WICHTIG: 
- Antworte NUR mit den zwei HTML-Blöcken, getrennt durch "---SEPARATOR---"
- Keine zusätzlichen Erklärungen
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
