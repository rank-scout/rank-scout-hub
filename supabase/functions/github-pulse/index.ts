import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

type GithubCommitResponse = {
  sha?: string;
  html_url?: string;
  commit?: {
    message?: string;
    author?: {
      name?: string;
      date?: string;
    };
    committer?: {
      name?: string;
      date?: string;
    };
  };
  author?: {
    login?: string;
  } | null;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders,
  });
}

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name)?.trim();

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function getOptionalEnv(...names: string[]) {
  for (const name of names) {
    const value = Deno.env.get(name)?.trim();
    if (value) return value;
  }

  return null;
}

function getBearerToken(req: Request) {
  const authHeader = req.headers.get("Authorization")?.trim();

  if (!authHeader) {
    throw new Error("Missing Authorization header");
  }

  return authHeader;
}

function resolveRepoConfig() {
  const directOwner = getOptionalEnv("GITHUB_REPO_OWNER", "GITHUB_OWNER");
  const directName = getOptionalEnv("GITHUB_REPO_NAME", "GITHUB_REPO");
  const combined = getOptionalEnv("GITHUB_REPOSITORY");

  if (directOwner && directName) {
    return { owner: directOwner, repo: directName };
  }

  if (combined && combined.includes("/")) {
    const [owner, repo] = combined.split("/").map((value) => value.trim());
    if (owner && repo) {
      return { owner, repo };
    }
  }

  throw new Error(
    "Missing repository configuration: set GITHUB_REPO_OWNER + GITHUB_REPO_NAME or GITHUB_REPOSITORY",
  );
}

async function ensureAdminUser(
  supabaseUrl: string,
  supabaseAnonKey: string,
  serviceRoleKey: string,
  authHeader: string,
) {
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized");
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: roleRow } = await adminClient
    .from("user_roles")
    .select("id")
    .eq("user_id", user.id)
    .eq("role", "ADMIN")
    .maybeSingle();

  if (roleRow) {
    return user;
  }

  const { data: profileRow } = await adminClient
    .from("profiles")
    .select("id, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profileRow?.is_admin) {
    throw new Error("Forbidden");
  }

  return user;
}

function normalizePerPage(rawValue: unknown) {
  const parsed = Number(rawValue);

  if (!Number.isFinite(parsed)) return 12;

  return Math.min(Math.max(Math.trunc(parsed), 1), 15);
}

function getErrorStatus(message: string) {
  if (message === "Missing Authorization header" || message === "Unauthorized") {
    return 401;
  }

  if (message === "Forbidden") {
    return 403;
  }

  if (message.startsWith("Missing environment variable:") || message.startsWith("Missing repository configuration:")) {
    return 500;
  }

  return 500;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    const authHeader = getBearerToken(req);
    const body = await req.json().catch(() => ({}));
    const perPage = normalizePerPage(body?.perPage);

    const supabaseUrl = getRequiredEnv("SUPABASE_URL");
    const supabaseAnonKey = getRequiredEnv("SUPABASE_ANON_KEY");
    const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const githubAccessToken = getRequiredEnv("GITHUB_ACCESS_TOKEN");
    const { owner, repo } = resolveRepoConfig();

    await ensureAdminUser(
      supabaseUrl,
      supabaseAnonKey,
      serviceRoleKey,
      authHeader,
    );

    const response = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?per_page=${perPage}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${githubAccessToken}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "rank-scout-github-pulse",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    const responseText = await response.text();
    let payload: GithubCommitResponse[] | { message?: string } | null = null;

    try {
      payload = responseText ? JSON.parse(responseText) : null;
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const message =
        (payload && !Array.isArray(payload) ? payload.message : null) ||
        responseText ||
        `GitHub request failed with status ${response.status}`;

      return json(
        {
          success: false,
          error: message,
        },
        response.status,
      );
    }

    const commits = (Array.isArray(payload) ? payload : []).map((item) => ({
      sha: item.sha ?? "unknown",
      message: item.commit?.message?.split("\n")[0]?.trim() || "Ohne Commit-Message",
      authorName:
        item.commit?.author?.name?.trim() ||
        item.commit?.committer?.name?.trim() ||
        item.author?.login?.trim() ||
        "Unbekannt",
      authorLogin: item.author?.login?.trim() || null,
      committedAt:
        item.commit?.author?.date?.trim() ||
        item.commit?.committer?.date?.trim() ||
        new Date(0).toISOString(),
      url: item.html_url?.trim() || `https://github.com/${owner}/${repo}/commit/${item.sha ?? ""}`,
    }));

    return json({
      success: true,
      repository: `${owner}/${repo}`,
      commits,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return json(
      {
        success: false,
        error: message,
      },
      getErrorStatus(message),
    );
  }
});
