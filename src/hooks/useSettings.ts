import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { TrendingLink } from "@/lib/schemas";
import { normalizeFooterConfigLinks, normalizeHeaderConfigLinks } from "@/lib/routes";
export const PUBLIC_SETTINGS_KEYS = [
  "active_theme",
  "home_sections",
  "home_layout_v2",
  "home_content",
  "header_config",
  "footer_config",
  "scouty_config",
  "home_forum_teaser",
  "ads_sense_client_id",
  "ads_sense_slot_id",
  "ads_enabled",
  "ads_amazon_headline",
  "ads_amazon_text",
  "ads_amazon_button_text",
  "ads_amazon_link",
  "forum_banner_headline",
  "forum_banner_subheadline",
  "forum_banner_badge",
  "forum_ads",
  "site_title",
  "site_logo_url",
  "site_description",
  "hero_title",
  "hero_subtitle",
  "footer_designer_name",
  "footer_designer_url",
  "ticker_badge_text",
  "ticker_headline",
  "ticker_link_text",
  "trending_links",
  "compliance_config",
  "google_analytics_id",
  "google_search_console_verification",
  "top_bar_text",
  "top_bar_link",
  "top_bar_active",
  "newsletter_active",
  "popup_active"
];

// --- HELPER FÜR TOXIC_WORD_ERROR ---
const getCleanToxicWordMessage = (rawMessage?: string) => {
  if (!rawMessage) return "Der Inhalt enthält einen blockierten Begriff.";

  const cleanMsg = rawMessage
    .replace(/^.*TOXIC_WORD_ERROR:\s*/i, "")
    .split("\n")[0]
    .trim();

  return cleanMsg || "Der Inhalt enthält einen blockierten Begriff.";
};

// --- TYPES ---
export type HomeSection = {
  id: string;
  label: string;
  enabled: boolean;
  order: number;
};

export interface ForumAd {
  id: string;
  name: string;
  type: 'image' | 'code';
  enabled: boolean;
  image_url?: string;
  ad_image_alt?: string;
  link_url?: string;
  headline?: string;
  subheadline?: string;
  cta_text?: string;
  html_code?: string;
  position?: string;
}

// --- CORE FETCHING ---
async function fetchPublicSettings(): Promise<Record<string, Json>> {
  const { data, error } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", PUBLIC_SETTINGS_KEYS);

  if (error) throw error;

  const settings: Record<string, Json> = {};
  data?.forEach((row) => {
    settings[row.key] = row.value;
  });

  return settings;
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings", "public"],
    queryFn: fetchPublicSettings,
    staleTime: 5 * 60 * 1000,
  });
}
async function fetchAdminSettings(): Promise<Record<string, Json>> {
  const { data, error } = await supabase
    .from("settings")
    .select("key, value");

  if (error) throw error;

  const settings: Record<string, Json> = {};
  data?.forEach((row) => {
    settings[row.key] = row.value;
  });

  return settings;
}

export function useAdminSettings() {
  return useQuery({
    queryKey: ["settings", "admin"],
    queryFn: fetchAdminSettings,
    staleTime: 1 * 60 * 1000,
  });
}

// Generic Hook zum Lesen
export function useSetting<T>(key: string, defaultValue: T): T {
  const { data: settings } = useSettings();
  if (!settings || settings[key] === undefined) return defaultValue;
  return settings[key] as T;
}

// Server-only Keys dürfen nicht mehr clientseitig gespeichert werden
const BLOCKED_SERVER_ONLY_KEYS = new Set(["bridge_key", "admin_pin"]);

// Generic Hook zum Schreiben
export function useUpdateSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: Json }) => {
      if (BLOCKED_SERVER_ONLY_KEYS.has(key)) {
        throw new Error(`Die Einstellung "${key}" darf nicht mehr clientseitig gespeichert werden.`);
      }

      const { error } = await supabase.from("settings").upsert(
        {
          key,
          value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

      if (error) {
        console.error("Supabase Error:", error);

        if (error.message?.includes("TOXIC_WORD_ERROR")) {
          const cleanMsg = getCleanToxicWordMessage(error.message);
          throw new Error(cleanMsg);
        }

        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

// --- THEME HOOK ---
export function useActiveTheme() {
  return useSetting<string>("active_theme", "navy");
}

// --- CMS DEFAULTS ---

export const defaultHomeSections: HomeSection[] = [
  { id: "hero", label: "Hero Sektion", enabled: true, order: 0 },
  { id: "amazon_top", label: "Amazon Banner (Top)", enabled: true, order: 1 },
  { id: "trust", label: "Trust & Siegel", enabled: true, order: 2 },
  { id: "big_three", label: "Big Three (Main Links)", enabled: true, order: 3 },
  { id: "adsense_middle", label: "Google AdSense", enabled: true, order: 4 },
  { id: "categories", label: "Kategorien Slider", enabled: true, order: 5 },
  { id: "forum", label: "Forum Teaser", enabled: true, order: 6 },
  { id: "news", label: "News / Newsletter", enabled: true, order: 7 },
  { id: "seo", label: "SEO Text (Unten)", enabled: true, order: 8 },
  { id: "mascot", label: "Scouty Maskottchen", enabled: true, order: 9 },
];

export const defaultHomeLayout = {
  hero: true,
  trust: true,
  big_three: true,
  why_us: true, 
  categories: true,
  news: true,
  forum_teaser: true,
  ads: false,
  seo_text: true
};

// CONTENT DEFAULTS
export const defaultHomeContent = {
  seo_title: "",
  seo_description: "",
  
  hero: {
  badge: "NEU: Rank-Scout 2.0 ist live",
  headline: "Dein zentraler Vergleichs-Hub",
  title: "Dein zentraler Vergleichs-Hub",
  subtitle: "Suche & finde passende Tools für deinen Erfolg.",
  subheadline: "Suche & finde passende Tools für deinen Erfolg. Vergleiche, entdecke und nutze etablierte Angebote aus KI, Software und Lifestyle. Transparent eingeordnet.",
  search_placeholder: "Was suchst du heute? (z.B. 'KI Tools', 'Dating')",
  search_label: "Finden",
  button_text: "Jetzt vergleichen"
},
  trust: { 
    headline: "Warum Rank-Scout?", 
    subheadline: "Wir stehen für Transparenz und Qualität.", 
    card1_title: "Daten statt Meinung", card1_text: "Unsere Algorithmen strukturieren tausende Datenpunkte. Nachvollziehbare Vergleiche statt reiner Meinungen.", 
    card2_title: "Laufendes Scouting", card2_text: "Angebote und Entwicklungen ändern sich regelmäßig. Unsere Datenbank wird regelmäßig aktualisiert, damit du keinen Trend verpasst.", 
    card3_title: "Etablierte Anbieter", card3_text: "Wir listen Dienstleister und Produkte mit nachvollziehbarem Track-Record in unseren Übersichten.", 
    box_title: "Dein Informationsvorsprung", box_text: "Während andere noch suchen, hast du bereits verglichen. Rank-Scout liefert dir strukturierte Marktdaten für fundierte Entscheidungen.", 
    live_badge: "Vergleiche aktiv" 
  },
  big_three: { 
    headline: "Wähle deinen Bereich", 
    items: [
        { id: "1", title: "Finanzen & Krypto", desc: "Broker, Kredite & Geschäftskonten im Überblick.", link: "/finanzen", button_text: "Vergleichen", theme: "blue", image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab" },
        { id: "2", title: "Software & SaaS", desc: "Beliebte Tools für Marketing, HR und Vertrieb.", link: "/software", button_text: "Tools finden", theme: "gold", image_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b" },
        { id: "3", title: "Dienstleistungen", desc: "Agenturen, Berater und Services im Vergleich.", link: "/dienstleistungen", button_text: "Suchen", theme: "dark", image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c" }
    ],
    finance_title: "Finanzen & Krypto", finance_desc: "Broker, Kredite & Geschäftskonten im Überblick.", finance_link: "/finanzen", finance_button: "Jetzt vergleichen", 
    software_title: "Software & SaaS", software_desc: "Beliebte Tools für Marketing, HR und Vertrieb.", software_link: "/software", software_button: "Tools finden", 
    services_title: "Dienstleistungen", services_desc: "Agenturen, Berater und Services im Vergleich.", services_link: "/dienstleistungen", services_button: "Anbieter suchen" 
  },
  why_us: {
    headline: "Warum Rank-Scout?",
    subheadline: "Wir sind deine intelligente Entscheidungshilfe.",
    features: [
      { title: "Hohe Performance", text: "Schnelle Ladezeiten, klare Fakten.", icon: "zap" },
      { title: "Transparente Kriterien", text: "Nachvollziehbare Vergleiche.", icon: "shield" },
      { title: "Global & Lokal", text: "Von International bis Regional.", icon: "globe" },
      { title: "Laufende Updates", text: "Regelmäßig frische Daten.", icon: "chart" }
    ]
  },
  seo: { 
    headline: "Über unseren Vergleichs-Hub", 
    intro: "Willkommen bei Rank-Scout. Wir bringen Licht in den Dschungel digitaler Dienstleistungen.", 
    block1_title: "Unser Ansatz", block1_text: "Wir strukturieren komplexe Angebote und bereiten Konditionen verständlich und übersichtlich auf.", 
    block2_title: "Laufende Pflege", block2_text: "Unsere Redaktion überprüft den Markt regelmäßig auf neue Entwicklungen und Tarifänderungen.",
    long_text: "" 
  },
  categories: { headline: "Alle Kategorien im Überblick", count: 6, button_more: "Alle Kategorien anzeigen", button_card: "Bereich erkunden" },
  news: { headline: "Aktuelles & Ratgeber", subheadline: "News & Updates", count: 3, button_text: "Zum Magazin", read_more: "Artikel lesen" },
  forum_teaser: { headline: "Community Hub", subheadline: "Tauche in beliebte Themenbereiche ein und teile deine Erfahrungen mit der Community.", link_text: "Alle Foren anzeigen", mobile_button: "Zum Community Forum" }
};

export const defaultHeaderConfig = { 
  button_text: "Jetzt vergleichen", 
  button_url: "/kategorien", 
  nav_links: [{ label: "Software Vergleich", url: "/software" }, { label: "Finanz-Tools", url: "/finanzen" }, { label: "Agentur Finder", url: "/dienstleistungen" }], 
  hub_links: [{ label: "Vergleichs-Hub", url: "/kategorien", icon: "LayoutGrid" }, { label: "Arcade", url: "/arcade", icon: "Gamepad2" }, { label: "Brain-Boost", url: "/brain-boost", icon: "BrainCircuit" }, { label: "Community", url: "/forum", icon: "Users" }] 
};

export const defaultFooterConfig = { 
  title: "Rank-Scout", 
  text_checked: "Redaktioneller Überblick", 
  text_update: "Aktualisiert: 2026", 
  text_description: "Unsere Inhalte basieren auf strukturierten Informationen, redaktioneller Einordnung und fortlaufend gepflegten Übersichten.", 
  copyright_text: "© 2026 Rank-Scout. Alle Rechte vorbehalten.", 
  made_with_text: "Made with", 
  made_in_text: "in Germany", 
  disclaimer: "*Werbehinweis: Wir finanzieren uns über sogenannte Affiliate-Links. Wenn du über einen Link auf dieser Seite einkaufst, erhalten wir möglicherweise eine Provision. Der Preis für dich ändert sich dabei nicht. Unsere Inhalte werden redaktionell erstellt und fortlaufend gepflegt.", 
  legal_links: [{ label: "Impressum", url: "/impressum" }, { label: "Datenschutz", url: "/datenschutz" }, { label: "AGB", url: "/agb" }], 
  popular_links: [{ label: "Software Vergleich", url: "/software" }, { label: "Finanz-Tools", url: "/finanzen" }, { label: "Agentur Finder", url: "/dienstleistungen" }] 
};

export const defaultScoutyConfig = { 
  bubble_intro: "Hi, ich bin Scouty! Ich finde passende Angebote für dich! 🔭", 
  bubble_exit: "Warte! 🛑 Bevor du gehst: Ich habe gerade einen passenden Vorschlag gefunden. Willst du ihn sehen?", 
  bubble_newsletter: "Spannende Deals per Mail?", 
  powered_by: "Powered By Rank-Scout AI" 
};

export const defaultHomeForumTeaser = { 
  headline: "Community Hub", 
  subheadline: "Tauche in beliebte Themenbereiche ein und teile deine Erfahrungen mit der Community.", 
  link_text: "Alle Foren anzeigen", 
  mobile_button: "Zum Community Forum" 
};

// --- CONFIG HOOKS ---

export function useHomeLayout() { 
  const { data: settings } = useSettings(); 
  
  const layoutV2 = settings?.home_layout_v2 as typeof defaultHomeLayout | undefined;
  const layout = { ...defaultHomeLayout, ...(layoutV2 || {}) };

  let sections: HomeSection[] = (settings?.home_sections as HomeSection[]) || defaultHomeSections;
  if (!Array.isArray(sections)) sections = defaultHomeSections;
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  const mappedSections = sortedSections.map(s => {
      let isEnabled = true;
      if (s.id === 'hero') isEnabled = layout.hero;
      else if (s.id === 'trust') isEnabled = layout.trust;
      else if (s.id === 'big_three') isEnabled = layout.big_three;
      else if (s.id === 'categories') isEnabled = layout.categories;
      else if (s.id === 'news') isEnabled = layout.news;
      else if (s.id === 'forum') isEnabled = layout.forum_teaser;
      else if (s.id === 'seo') isEnabled = layout.seo_text;
      else if (s.id === 'amazon_top' || s.id === 'adsense_middle') isEnabled = layout.ads;
      
      return { ...s, enabled: isEnabled };
  });

  return { 
      sections: mappedSections, 
      layout 
  }; 
}

export function useHeaderConfig() {
  const { data } = useSettings();
  return normalizeHeaderConfigLinks({ ...defaultHeaderConfig, ...(data?.header_config as any || {}) });
}

export function useFooterConfig() {
  const { data } = useSettings();
  return normalizeFooterConfigLinks({ ...defaultFooterConfig, ...(data?.footer_config as any || {}) });
}
export function useScoutyConfig() { const { data } = useSettings(); return { ...defaultScoutyConfig, ...(data?.scouty_config as any || {}) }; }
export function useHomeForumTeaser() { const { data } = useSettings(); return { ...defaultHomeForumTeaser, ...(data?.home_forum_teaser as any || {}) }; }

export function useHomeContent() { 
  const { data: settings } = useSettings(); 
  const settingsContent = (settings?.home_content as any || {});
  
  const content = { 
    ...defaultHomeContent, 
    ...settingsContent,
    seo: {
        ...defaultHomeContent.seo,
        ...(settingsContent.seo || {})
    }
  }; 
  
  content.big_three = { ...defaultHomeContent.big_three, ...(content.big_three || {}) };
  content.big_three.items = content.big_three.items || defaultHomeContent.big_three.items;
  
  content.why_us = { ...defaultHomeContent.why_us, ...(content.why_us || {}) };
  content.categories = { ...defaultHomeContent.categories, ...content.categories }; 
  content.news = { ...defaultHomeContent.news, ...content.news }; 
  content.trust = { ...defaultHomeContent.trust, ...content.trust }; 
  content.hero = { ...defaultHomeContent.hero, ...content.hero }; 
  
  return { content }; 
}

export function useAdSenseConfig() { const { data: settings } = useSettings(); return { clientId: (settings?.ads_sense_client_id as string) || "", defaultSlotId: (settings?.ads_sense_slot_id as string) || "", enabled: (settings?.ads_enabled as boolean) || false }; }
export function useAmazonConfig() { const { data: settings } = useSettings(); return { headline: (settings?.ads_amazon_headline as string) || "", text: (settings?.ads_amazon_text as string) || "", buttonText: (settings?.ads_amazon_button_text as string) || "Zum Angebot", link: (settings?.ads_amazon_link as string) || "", enabled: (settings?.ads_enabled as boolean) || false }; }
export function useForumBannerConfig() { const { data: settings } = useSettings(); return { headline: (settings?.forum_banner_headline as string) || "Diskussionen & Erfahrungen", subheadline: (settings?.forum_banner_subheadline as string) || "Tausche dich mit anderen aus, stelle Fragen und teile deine Erfahrungen", badge: (settings?.forum_banner_badge as string) || "Community Forum", enabled: true }; }

export function useForumAds() { 
    const { data } = useSettings(); 
    const ads = (data?.forum_ads as ForumAd[]) || []; 
    return ads; 
}

export function useSiteTitle() { return useSetting<string>("site_title", ""); }
export function useSiteLogo() { return useSetting<string | null>("site_logo_url", null); }
export function useSiteDescription() { return useSetting<string>("site_description", ""); }
export function useHeroTitle() { return useSetting<string>("hero_title", "Entdecke strukturierte Vergleiche"); }
export function useHeroSubtitle() { return useSetting<string>("hero_subtitle", "Wir strukturieren Daten, damit du die richtige Wahl triffst"); }
export function useAdsEnabled() { return useSetting<boolean>("ads_enabled", false); }
export function useGlobalAnalyticsCode() { return useSetting<string>("global_analytics_code", ""); }
export function useNavLinks() { const c = useHeaderConfig(); return c.nav_links; }
export function useFooterLinks() { const c = useFooterConfig(); return c.popular_links; }
export function useFooterSiteName() { const c = useFooterConfig(); return c.title; }
export function useFooterCopyright() { const c = useFooterConfig(); return c.copyright_text; }
export function useFooterDesignerName() { return useSetting<string>("footer_designer_name", "Digital-Perfect"); }
export function useFooterDesignerUrl() { return useSetting<string>("footer_designer_url", "https://digital-perfect.com"); }

export function useTickerConfig() {
  const { data: settings } = useSettings();
  return {
    badge: (settings?.ticker_badge_text as string) || "Aktuelle Trends",
    headline: (settings?.ticker_headline as string) || "Beliebte Apps & Deals",
    linkText: (settings?.ticker_link_text as string) || "Alle Trends ansehen →"
  };
}

export function useTrendingLinks() {
  return useSetting<TrendingLink[]>("trending_links", []);
}
// --- COMPLIANCE MANAGER HOOKS ---
type ComplianceConfig = {
  mode: "strict" | "warn" | "off";
  exempt_slugs: string;
};

export function useComplianceConfig() {
  return useSetting<ComplianceConfig>("compliance_config", {
    mode: "strict",
    exempt_slugs: ""
  });
}

export function useUpdateComplianceConfig() {
  const updateSetting = useUpdateSetting();
  return (config: { mode: string; exempt_slugs: string }) =>
    updateSetting.mutateAsync({
      key: "compliance_config",
      value: config as unknown as Json
    });
}