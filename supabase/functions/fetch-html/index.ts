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
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching HTML from: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({ error: `Failed to fetch URL: ${response.status} ${response.statusText}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let html = await response.text();
    console.log(`Successfully fetched ${html.length} characters`);

    // Extract base URL for converting relative paths to absolute
    const urlObj = new URL(url);
    const baseUrl = urlObj.origin;

    // Convert relative URLs to absolute URLs
    html = html
      .replace(/href="\/(?!\/)/g, `href="${baseUrl}/`)
      .replace(/src="\/(?!\/)/g, `src="${baseUrl}/`)
      .replace(/url\(\/(?!\/)/g, `url(${baseUrl}/`)
      .replace(/href='\/(?!\/)/g, `href='${baseUrl}/`)
      .replace(/src='\/(?!\/)/g, `src='${baseUrl}/`);

    console.log(`Converted relative URLs to absolute using base: ${baseUrl}`);

    // Extract slug from URL
    let slug = urlObj.pathname.replace(/^\/|\/$/g, ''); // Remove leading/trailing slashes
    if (!slug) {
      slug = urlObj.hostname.split('.')[0]; // Use subdomain as fallback
    }

    return new Response(
      JSON.stringify({ 
        html, 
        slug,
        originalUrl: url,
        baseUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error fetching HTML:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch HTML';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
