const DEFAULT_SITE_URL = "https://rank-scout.com";

const RESERVED_TOP_LEVEL_SLUGS = new Set([
  "sitemap.xml",
  "robots.txt",
  "favicon.ico",
  "site.webmanifest",
  "manifest.json",
  "asset-manifest.json",
  "browserconfig.xml",
  "ads.txt",
  "security.txt",
]);

function sanitizeSlug(rawSlug: string): string {
  return String(rawSlug ?? "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

export function normalizeRoutePath(rawPath: string): string {
  const cleaned = String(rawPath ?? "").trim();

  if (!cleaned || cleaned === "/") {
    return "/";
  }

  const withLeadingSlash = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
  const collapsed = withLeadingSlash.replace(/\/+/g, "/");

  return collapsed.length > 1 && collapsed.endsWith("/")
    ? collapsed.slice(0, -1)
    : collapsed;
}

export function isBlockedTopLevelSlug(rawSlug: string | null | undefined): boolean {
  const slug = sanitizeSlug(String(rawSlug ?? "")).toLowerCase();

  if (!slug) return true;
  if (RESERVED_TOP_LEVEL_SLUGS.has(slug)) return true;

  return /\.[a-z0-9]+$/i.test(slug);
}

export function buildAbsoluteSiteUrl(
  path: string,
  siteUrl: string = DEFAULT_SITE_URL,
): string {
  return `${siteUrl.replace(/\/$/, "")}${normalizeRoutePath(path)}`;
}

export function getCategoriesRoute(): string {
  return "/kategorien";
}

export function getCategoryRoute(slug: string): string {
  return normalizeRoutePath(`/${sanitizeSlug(slug)}`);
}

export function getCategoryCanonicalUrl(
  slug: string,
  siteUrl: string = DEFAULT_SITE_URL,
): string {
  return buildAbsoluteSiteUrl(getCategoryRoute(slug), siteUrl);
}

export function getProjectRoute(slug: string): string {
  return normalizeRoutePath(`/go/${sanitizeSlug(slug)}`);
}

export function getProjectCanonicalUrl(
  slug: string,
  siteUrl: string = DEFAULT_SITE_URL,
): string {
  return buildAbsoluteSiteUrl(getProjectRoute(slug), siteUrl);
}

export function getForumIndexRoute(): string {
  return "/forum";
}

export function getForumCategoryRoute(slug: string): string {
  return normalizeRoutePath(`/forum/kategorie/${sanitizeSlug(slug)}`);
}

export function getForumThreadRoute(slug: string): string {
  return normalizeRoutePath(`/forum/${sanitizeSlug(slug)}`);
}

export function getCategoriesCanonicalUrl(siteUrl: string = DEFAULT_SITE_URL): string {
  return buildAbsoluteSiteUrl(getCategoriesRoute(), siteUrl);
}
