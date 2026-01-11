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

    const systemPrompt = `Du bist ein erfahrener Web-Designer und SEO-Texter der VISUELL ANSPRECHENDE HTML-Inhalte erstellt.
Du erstellst NIEMALS plain text oder Email-ähnlichen Content.
Dein Output sieht IMMER aus wie eine professionelle, moderne Website.
Nutze CSS-Styling für alle Elemente.
Schreibe auf Deutsch in der Du-Form.`;

    const userPrompt = `Erstelle VISUELL HOCHWERTIGEN HTML-Content zum Thema "${keyword} in ${city}".

⚠️ KRITISCHE DESIGN-REGELN - BEFOLGE DIESE EXAKT:

1. GOOGLE FONTS: Starte JEDEN Block mit diesem Font-Import:
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

2. MODERNES DESIGN: Nutze diese Styles für ALLE Elemente:
- font-family: 'Plus Jakarta Sans', 'Inter', sans-serif
- Abgerundete Ecken (border-radius: 16px oder 24px)
- Subtile Schatten (box-shadow: 0 4px 20px rgba(0,0,0,0.08))
- Gradient-Hintergründe für Cards
- Viel Whitespace (padding: 24px oder mehr)
- Moderne Farben: #1a1a2e (dunkel), #f8f9fa (hell), #d4af37 (gold/accent)

3. NIEMALS: Plain Text, Arial, Times New Roman, Email-Style, oder ungestylte Elemente!

---

**BLOCK 1 - USP-Section (${topWords} Wörter):**

<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

<style>
.usp-container { font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; padding: 40px 20px; }
.usp-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; max-width: 1200px; margin: 0 auto; }
.usp-card { background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); border-radius: 20px; padding: 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.05); transition: transform 0.3s ease, box-shadow 0.3s ease; }
.usp-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.12); }
.usp-icon { font-size: 48px; margin-bottom: 20px; }
.usp-card h3 { font-size: 1.25rem; font-weight: 700; color: #1a1a2e; margin-bottom: 12px; letter-spacing: -0.02em; }
.usp-card p { font-size: 1rem; color: #6b7280; line-height: 1.7; font-weight: 400; }
</style>

<div class="usp-container">
  <div class="usp-grid">
    <div class="usp-card">
      <div class="usp-icon">[Emoji passend zu ${keyword}]</div>
      <h3>[Überschrift 1 für ${keyword}]</h3>
      <p>[Beschreibung 1 - professionell, vertrauensbildend, ca. 25-35 Wörter]</p>
    </div>
    <div class="usp-card">
      <div class="usp-icon">[Emoji 2]</div>
      <h3>[Überschrift 2 für ${keyword}]</h3>
      <p>[Beschreibung 2 - professionell, ca. 25-35 Wörter]</p>
    </div>
    <div class="usp-card">
      <div class="usp-icon">[Emoji 3]</div>
      <h3>[Überschrift 3 für ${keyword}]</h3>
      <p>[Beschreibung 3 - professionell, ca. 25-35 Wörter]</p>
    </div>
  </div>
</div>

Passe die USPs thematisch an "${keyword}" an!

---SEPARATOR---

**BLOCK 2 - SEO-Content & FAQ (${bottomWords} Wörter):**

<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

<style>
.seo-container { font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; max-width: 900px; margin: 0 auto; padding: 60px 24px; }
.seo-section { background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%); border-radius: 24px; padding: 48px; margin-bottom: 40px; box-shadow: 0 2px 16px rgba(0,0,0,0.04); }
.seo-section h2 { font-size: 1.75rem; font-weight: 700; color: #1a1a2e; margin-bottom: 24px; letter-spacing: -0.03em; }
.seo-section p { font-size: 1.0625rem; color: #4b5563; line-height: 1.85; margin-bottom: 20px; }
.faq-section { background: #ffffff; border-radius: 24px; padding: 48px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
.faq-section h2 { font-size: 1.75rem; font-weight: 700; color: #1a1a2e; margin-bottom: 32px; letter-spacing: -0.03em; }
.faq-item { background: #f8f9fa; border-radius: 16px; margin-bottom: 16px; overflow: hidden; border: 1px solid rgba(0,0,0,0.04); }
.faq-item summary { padding: 24px; font-size: 1.0625rem; font-weight: 600; color: #1a1a2e; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; }
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after { content: '+'; font-size: 1.5rem; color: #d4af37; font-weight: 300; }
.faq-item[open] summary::after { content: '−'; }
.faq-item p { padding: 0 24px 24px; font-size: 1rem; color: #6b7280; line-height: 1.8; margin: 0; }
</style>

<div class="seo-container">
  <div class="seo-section">
    <h2>${keyword} in ${city}</h2>
    <p>[Absatz 1: Einführung in ${keyword} in ${city}, ca. 80-100 Wörter. Erkläre was ${keyword} bedeutet und warum es in ${city} relevant ist.]</p>
    <p>[Absatz 2: Die ${keyword}-Szene in ${city}, lokale Besonderheiten, ca. 80-100 Wörter.]</p>
    <p>[Absatz 3: Vorteile von Online-Plattformen für ${keyword} in ${city}, ca. 80-100 Wörter.]</p>
    <p>[Absatz 4: Tipps und Empfehlungen für ${keyword} in ${city}, ca. 80-100 Wörter.]</p>
  </div>
  
  <div class="faq-section">
    <h2>Häufige Fragen zu ${keyword} in ${city}</h2>
    ${Array(faqCount).fill(null).map((_, i) => `
    <details class="faq-item">
      <summary>[FAQ Frage ${i + 1} zu ${keyword} in ${city}?]</summary>
      <p>[Ausführliche, hilfreiche Antwort, ca. 50-70 Wörter]</p>
    </details>`).join('\n')}
  </div>
</div>

⚠️ WICHTIG:
- Antworte NUR mit den zwei HTML-Blöcken, getrennt durch "---SEPARATOR---"
- KEIN Markdown, keine Erklärungen, nur HTML
- Content muss 100% zu "${keyword}" passen
- Gesamtlänge: ca. ${wordCount} Wörter
- Das Design MUSS modern und professionell aussehen wie eine echte Website!`;

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
