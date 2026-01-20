import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { city, keyword = "Dating", wordCount = 5000 } = await req.json();
    
    // API KEY LOGIC (Lovable Proxy wie gewünscht)
    const openAiKey = Deno.env.get('LOVABLE_API_KEY'); 
    if (!openAiKey) throw new Error("API Key missing");

    console.log(`Generating structured content for: ${city}`);

    // --- PROMPT FÜR STRUKTURIERTE DATEN (TEXT + JSON FAQS) ---
    const systemPrompt = `
      Du bist ein professioneller Redakteur für ein Vergleichsportal.
      Aufgabe: Content für Landingpage "${keyword} in ${city}".
      
      OUTPUT FORMAT (EXAKTES JSON):
      {
        "contentTop": "HTML STRING (Einleitung, Vorteile)",
        "contentBottom": "HTML STRING (Tipps, Sicherheit - KEINE FAQS HIER!)",
        "faqs": [
          { "question": "Frage 1?", "answer": "Antwort 1..." },
          { "question": "Frage 2?", "answer": "Antwort 2..." },
          { "question": "Frage 3?", "answer": "Antwort 3..." },
          { "question": "Frage 4?", "answer": "Antwort 4..." },
          { "question": "Frage 5?", "answer": "Antwort 5..." }
        ]
      }
      
      REGELN:
      1. contentTop/Bottom: HTML (h2, p, ul). Nutze IMMER class="text-center".
      2. faqs: Reine Text-Strings, KEIN HTML.
      3. Schreibe hochwertig, abwechslungsreich und hilfreich.
    `;

    const userPrompt = `Erstelle einen sehr ausführlichen Text für ${city} (Ziel: ${wordCount} Wörter). Trenne die FAQs strikt als Array ab.`;

    const response = await fetch('https://api.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
      }),
    });

    const aiData = await response.json();
    let generatedContent = aiData.choices[0].message.content;
    generatedContent = generatedContent.replace(/```json/g, '').replace(/```/g, '').trim();

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(generatedContent);
    } catch (e) {
      console.error("JSON Error", e);
      jsonResponse = { 
        contentTop: `<div class="text-center"><p>${generatedContent}</p></div>`, 
        contentBottom: "",
        faqs: []
      };
    }

    return new Response(
      JSON.stringify(jsonResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});