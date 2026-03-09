import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// KYRA FIX: 'Access-Control-Allow-Methods' hinzugefügt, damit der Browser den POST nicht blockiert!
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

serve(async (req) => {
  // CORS Preflight abfangen
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

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // KYRA FIX: Wir nutzen direkt den Namen des Constraints, den du im SQL erstellt hast!
    const { error } = await supabaseAdmin
      .from('page_views_analytics')
      .upsert({
        page_name: pageName,
        page_type: type,
        visitor_hash: visitorHash,
        country: country,
        view_date: today
      }, {
        onConflict: 'unique_view_per_visitor_per_day',
        ignoreDuplicates: true
      });

    if (error) {
        console.error("DB Insert Error:", error);
        throw error;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Pulse Error:", error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})