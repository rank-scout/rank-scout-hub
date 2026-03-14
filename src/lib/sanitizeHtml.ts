import DOMPurify from "dompurify";

const CMS_ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "ul", "ol", "li",
  "strong", "em", "b", "i", "u",
  "a", "span", "div",
  "img", "blockquote",
  "table", "thead", "tbody", "tr", "th", "td",
  "details", "summary", "code", "pre", "figure", "figcaption"
];

const CMS_ALLOWED_ATTR = [
  "href", "target", "rel",
  "src", "srcset", "alt", "title",
  "class", "id",
  "width", "height", "loading", "decoding",
  "colspan", "rowspan"
];

const STORAGE_SEGMENT = "/storage/v1/object/public/";
const RENDER_SEGMENT = "/storage/v1/render/image/public/";
const MAX_FORUM_IMAGE_WIDTH = 1400;
const MIN_FORUM_IMAGE_WIDTH = 180;

function splitUrlParts(url: string) {
  const trimmed = url.trim();
  const hashIndex = trimmed.indexOf("#");
  const withoutHash = hashIndex >= 0 ? trimmed.slice(0, hashIndex) : trimmed;
  const hash = hashIndex >= 0 ? trimmed.slice(hashIndex) : "";
  const queryIndex = withoutHash.indexOf("?");
  const base = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : "";

  return { base, query, hash };
}

function buildSupabaseImageUrl(base: string, rawQuery: string, hash: string, width: number, quality: number) {
  const params = new URLSearchParams(rawQuery);
  params.set("width", String(width));
  params.set("quality", String(quality));

  const query = params.toString();
  return `${base}${query ? `?${query}` : ""}${hash}`;
}

function rewriteImageSrcset(srcset: string, width: number, quality: number) {
  return srcset
    .split(",")
    .map((entry) => {
      const trimmed = entry.trim();
      if (!trimmed) return trimmed;

      const firstWhitespace = trimmed.search(/\s/);
      if (firstWhitespace === -1) {
        return optimizeSupabaseImageUrl(trimmed, width, quality);
      }

      const url = trimmed.slice(0, firstWhitespace);
      const descriptor = trimmed.slice(firstWhitespace).trim();
      return `${optimizeSupabaseImageUrl(url, width, quality)}${descriptor ? ` ${descriptor}` : ""}`;
    })
    .join(", ");
}

function normalizeImageWidth(value?: string | null): string | null {
  if (!value) return null;

  const numeric = Number.parseInt(String(value).replace(/px$/i, "").trim(), 10);
  if (!Number.isFinite(numeric)) return null;

  const safeWidth = Math.min(Math.max(numeric, MIN_FORUM_IMAGE_WIDTH), MAX_FORUM_IMAGE_WIDTH);
  return String(safeWidth);
}

function normalizeImageAttributes(html?: string | null) {
  if (!html) return "";

  const markup = String(html);

  if (typeof DOMParser === "undefined") {
    return markup;
  }

  const documentFragment = new DOMParser().parseFromString(markup, "text/html");

  documentFragment.querySelectorAll("img").forEach((img) => {
    const widthAttr = normalizeImageWidth(img.getAttribute("width"));
    const styleWidth = normalizeImageWidth((img as HTMLElement).style?.width || null);
    const resolvedWidth = widthAttr || styleWidth;

    if (resolvedWidth) {
      img.setAttribute("width", resolvedWidth);
    } else {
      img.removeAttribute("width");
    }

    if (!img.getAttribute("loading")) {
      img.setAttribute("loading", "lazy");
    }

    if (!img.getAttribute("decoding")) {
      img.setAttribute("decoding", "async");
    }
  });

  return documentFragment.body.innerHTML;
}

export function optimizeSupabaseImageUrl(url?: string | null, width = 800, quality = 80): string {
  if (!url) return "";

  const trimmedUrl = String(url).trim();
  if (!trimmedUrl) return "";

  const { base, query, hash } = splitUrlParts(trimmedUrl);

  if (base.includes(RENDER_SEGMENT)) {
    return buildSupabaseImageUrl(base, query, hash, width, quality);
  }

  if (base.includes(STORAGE_SEGMENT)) {
    return buildSupabaseImageUrl(base.replace(STORAGE_SEGMENT, RENDER_SEGMENT), query, hash, width, quality);
  }

  return trimmedUrl;
}

export function rewriteSupabaseStorageUrls(html?: string | null, width = 800, quality = 80): string {
  if (!html) return "";

  const markup = normalizeImageAttributes(html);

  if (typeof DOMParser === "undefined") {
    return markup.replace(/<img\b([^>]*)\bsrc=(["'])([^"']+)\2([^>]*)>/gi, (_full, before, quote, src, after) => {
      const optimizedSrc = optimizeSupabaseImageUrl(src, width, quality);
      return `<img${before}src=${quote}${optimizedSrc}${quote}${after}>`;
    });
  }

  const documentFragment = new DOMParser().parseFromString(markup, "text/html");

  documentFragment.querySelectorAll("img[src]").forEach((img) => {
    const currentSrc = img.getAttribute("src");
    if (currentSrc) {
      img.setAttribute("src", optimizeSupabaseImageUrl(currentSrc, width, quality));
    }

    const currentSrcset = img.getAttribute("srcset");
    if (currentSrcset) {
      img.setAttribute("srcset", rewriteImageSrcset(currentSrcset, width, quality));
    }
  });

  return documentFragment.body.innerHTML;
}

export function sanitizeCmsHtml(html?: string | null): string {
  if (!html) return "";

  const normalizedHtml = rewriteSupabaseStorageUrls(html);

  return DOMPurify.sanitize(normalizedHtml, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: CMS_ALLOWED_TAGS,
    ALLOWED_ATTR: CMS_ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: [
      "script", "iframe", "object", "embed",
      "form", "input", "button", "textarea", "select",
      "style", "svg", "math"
    ],
  });
}

export function sanitizeCmsHtmlWithBreaks(html?: string | null): string {
  if (!html) return "";
  return sanitizeCmsHtml(String(html).replace(/\n/g, "<br/>"));
}

export function sanitizeForumHtml(html?: string | null): string {
  if (!html) return "";

  const normalizedHtml = rewriteSupabaseStorageUrls(html);

  return DOMPurify.sanitize(normalizedHtml, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: CMS_ALLOWED_TAGS,
    ALLOWED_ATTR: CMS_ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: [
      "script", "iframe", "object", "embed",
      "form", "input", "button", "textarea", "select",
      "style", "svg", "math"
    ],
  });
}
