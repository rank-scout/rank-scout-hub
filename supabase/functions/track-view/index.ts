import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { pageName, type } = await req.json()

    if (!pageName || !type) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 
      })
    }

    // Cloudflare / Nginx Header auslesen (IP & Land)
    const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown';
    const country = req.headers.get('cf-ipcountry') || 'Unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const today = new Date().toISOString().split('T')[0];

    // DSGVO-Schutz: IP + UserAgent + Datum hashen (One-Way)
    const dataToHash = `${ip}-${userAgent}-${today}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(dataToHash);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const visitorHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Service Role Key nutzen, um in die gesicherte Analytics-Tabelle zu schreiben
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Eintragen mit Schutz vor Mehrfach-Klicks (ignoreDuplicates)
    const { error } = await supabaseAdmin
      .from('page_views_analytics')
      .upsert({
        page_name: pageName,
        page_type: type,
        visitor_hash: visitorHash,
        country: country,
        view_date: today
      }, {
        onConflict: 'page_name, visitor_hash, view_date',
        ignoreDuplicates: true
      });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Tracking Error:", error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})