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
export const colorThemeEnum = z.enum(["dark", "light", "neon"]);

// Navigation settings schema for quick navigation toggles
export const navigationSettingsSchema = z.object({
  show_top3_dating_apps: z.boolean().default(true),
  show_singles_in_der_naehe: z.boolean().default(true),
  show_chat_mit_einer_frau: z.boolean().default(true),
  show_online_dating_cafe: z.boolean().default(true),
  show_bildkontakte_login: z.boolean().default(true),
  show_18plus_hint_box: z.boolean().default(true),
});

export type NavigationSettings = z.infer<typeof navigationSettingsSchema>;

export const categorySchema = z.object({
  slug: z.string().min(1, "Slug erforderlich").regex(/^[a-z0-9-]+$/, "Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt"),
  name: z.string().min(1, "Name erforderlich"),
  description: z.string().optional(),
  icon: z.string().optional(),
  
  // SEO & Content
  meta_title: z.string().max(60, "Max. 60 Zeichen").optional(),
  meta_description: z.string().max(160, "Max. 160 Zeichen").optional(),
  h1_title: z.string().optional(),
  hero_pretitle: z.string().optional(),
  hero_headline: z.string().optional(),
  hero_cta_text: z.string().optional(),
  hero_badge_text: z.string().optional(),
  intro_title: z.string().optional(),
  
  // HTML Content
  long_content_top: z.string().optional(),
  long_content_bottom: z.string().optional(),
  
  // NEW: FAQ Data (JSON)
  faq_data: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),

  // Settings
  theme: categoryThemeEnum.default("DATING"),
  template: categoryTemplateEnum.default("comparison"),
  color_theme: colorThemeEnum.default("dark"),
  is_active: z.boolean().default(true),
  sort_order: z.number().default(0),
  
  // Navigation
  navigation_settings: navigationSettingsSchema.optional(),
  
  // Footer & Branding
  site_name: z.string().optional(),
  footer_site_name: z.string().optional(),
  footer_copyright_text: z.string().optional(),
  footer_designer_name: z.string().optional(),
  footer_designer_url: z.string().optional(),
  
  // Advanced
  analytics_code: z.string().optional(),
  banner_override: z.string().optional(),
  custom_html_override: z.string().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

// Project schemas
const countryScopeEnum = z.enum(["DACH", "AT", "DE", "EU"]);

export const projectSchema = z.object({
  category_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1, "Projektname erforderlich"),
  slug: z.string().min(1, "Slug erforderlich"),
  url: z.string().url("Ungültige URL"),
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

// Export types for settings
export type TrendingLink = z.infer<typeof trendingLinkSchema>;
export type NavLink = z.infer<typeof navLinkSchema>;

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
  contact_email: z.string().email(),
  trending_links: z.array(trendingLinkSchema).default([]),
  header_nav_links: z.array(navLinkSchema).default([]),
  custom_css: z.string().optional(),
});

// Export types for settings (AFTER schema definitions)
export type TrendingLink = z.infer<typeof trendingLinkSchema>;
export type NavLink = z.infer<typeof navLinkSchema>;
export type SiteSettings = z.infer<typeof siteSettingsSchema>;