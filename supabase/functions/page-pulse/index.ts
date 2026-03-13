import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function getClientIp(req: Request) {
  const cfIp = req.headers.get("cf-connecting-ip")?.trim();
  if (cfIp) return cfIp;

  const xff = req.headers.get("x-forwarded-for")?.trim();
  if (xff) {
    const firstIp = xff.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "unknown";
}

function normalizeCountry(req: Request) {
  return req.headers.get("cf-ipcountry")?.trim() || "Unknown";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => null);
    const pageName = typeof body?.pageName === "string" ? body.pageName.trim() : "";
    const type = typeof body?.type === "string" ? body.type.trim() : "";

    if (!pageName || !type) {
      return json({ error: "Missing parameters" }, 400);
    }

    const ip = getClientIp(req);
    const country = normalizeCountry(req);
    const userAgent = req.headers.get("user-agent")?.trim() || "unknown";
    const today = new Date().toISOString().slice(0, 10);

    const hashInput = `${ip}|${userAgent}|${today}`;
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(hashInput)
    );
    const visitorHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const payload = {
      page_name: pageName,
      page_type: type,
      visitor_hash: visitorHash,
      country,
      view_date: today,
    };

    const { error } = await supabaseAdmin
      .from("page_views_analytics")
      .upsert(payload, {
        onConflict: "page_name,visitor_hash,view_date",
        ignoreDuplicates: true,
      });

    if (error) {
      console.error("DB Insert Error:", error.message);
      return json({ error: "DB insert failed", details: error.message }, 500);
    }

    return json({ success: true });
  } catch (error) {
    console.error("Fatal Server Error:", error);
    return json({ error: "Internal Server Error" }, 500);
  }
});
