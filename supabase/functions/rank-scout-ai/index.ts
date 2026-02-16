import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json();
    const { topic, keyword, systemPrompt } = body;
    const finalTopic = topic || keyword || "Allgemeines Thema";

    // 1. API Key
    let apiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!apiKey) throw new Error("GOOGLE_API_KEY fehlt.");
    apiKey = apiKey.trim();

    console.log(`[NEU] Rank-Scout AI für: ${finalTopic}`);

    // 2. Prompt
    const defaultSystem = "Du bist Redakteur. Schreibe HTML.";
    const combinedPrompt = `${systemPrompt || defaultSystem}\n\nAUFGABE: Schreibe über "${finalTopic}". Nur HTML.`;

    // 3. Request (Gemini Flash)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: combinedPrompt }] }],
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Google API Error: ${err}`);
    }

    const data = await response.json();
    let content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error("Kein Text erhalten.");

    content = content.replace(/```html/g, '').replace(/```/g, '').trim();

    return new Response(JSON.stringify({ contentTop: content, contentBottom: "" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("Server Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});