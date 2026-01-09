import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen haben"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Category schemas
export const categoryThemeEnum = z.enum(["DATING", "ADULT", "CASINO", "GENERIC"]);
export const categoryTemplateEnum = z.enum(["comparison", "review"]);

export const categorySchema = z.object({
  slug: z.string().min(1, "Slug erforderlich").regex(/^[a-z0-9-]+$/, "Nur Kleinbuchstaben, Zahlen und Bindestriche"),
  name: z.string().min(1, "Name erforderlich").max(100),
  description: z.string().max(500).optional(),
  icon: z.string().max(10).optional(),
  theme: categoryThemeEnum,
  template: categoryTemplateEnum.default("comparison"),
  meta_title: z.string().max(60).optional(),
  meta_description: z.string().max(160).optional(),
  h1_title: z.string().max(100).optional(),
  long_content_top: z.string().optional(),
  long_content_bottom: z.string().optional(),
  analytics_code: z.string().optional(),
  banner_override: z.string().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

export type CategoryInput = z.infer<typeof categorySchema>;

// Project schemas
export const countryScopeEnum = z.enum(["AT", "DE", "DACH", "EU"]);

export const projectSchema = z.object({
  category_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1, "Name erforderlich").max(100),
  slug: z.string().min(1, "Slug erforderlich").regex(/^[a-z0-9-]+$/, "Nur Kleinbuchstaben, Zahlen und Bindestriche"),
  url: z.string().url("Ungültige URL").refine(
    (url) => url.startsWith('https://') || url.startsWith('http://'),
    "URL muss http:// oder https:// verwenden"
  ),
  short_description: z.string().max(300).optional(),
  description: z.string().optional(),
  logo_url: z.string().url("Ungültige Logo-URL").optional().or(z.literal("")),
  affiliate_link: z.string().url("Ungültiger Affiliate-Link").optional().or(z.literal("")),
  rating: z.number().min(0).max(10).default(9.8),
  badge_text: z.string().max(50).optional(),
  features: z.array(z.string()).default([]),
  country_scope: countryScopeEnum.default("DACH"),
  tags: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

export type ProjectInput = z.infer<typeof projectSchema>;

// Settings schemas
export const trendingLinkSchema = z.object({
  label: z.string().min(1),
  url: z.string().min(1),
  emoji: z.string().optional(),
});

export const navLinkSchema = z.object({
  label: z.string().min(1),
  url: z.string().min(1),
});

export const siteSettingsSchema = z.object({
  site_title: z.string().min(1).max(100),
  site_description: z.string().max(300),
  hero_title: z.string().max(100),
  hero_subtitle: z.string().max(200),
});

export const trendingLinksSchema = z.array(trendingLinkSchema);
export const navLinksSchema = z.array(navLinkSchema);
export const footerLinksSchema = z.array(navLinkSchema);

export type TrendingLink = z.infer<typeof trendingLinkSchema>;
export type NavLink = z.infer<typeof navLinkSchema>;
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
