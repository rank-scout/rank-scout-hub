import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TrendingLink, NavLink } from "@/lib/schemas";
import type { Json } from "@/integrations/supabase/types";

// --- TYPES ---
export interface ForumBannerConfig {
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  title?: string;
  description?: string;
  ctaText?: string;
}

type SettingsRecord = {
  id: string;
  key: string;
  value: Json;
};

// --- FETCHING ---
async function fetchSettings(): Promise<Record<string, Json>> {
  const { data, error } = await supabase
    .from("settings")
    .select("*");

  if (error) throw error;

  const settings: Record<string, Json> = {};
  (data as SettingsRecord[])?.forEach((row) => {
    settings[row.key] = row.value;
  });

  return settings;
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes Cache
  });
}

export function useSetting<T>(key: string, defaultValue: T): T {
  const { data: settings } = useSettings();
  return (settings?.[key] as T) ?? defaultValue;
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: Json }) => {
      // WICHTIG: Kein 'updated_at', da Spalte in DB fehlt
      const { error } = await supabase
        .from("settings")
        .upsert({ key, value }, { onConflict: "key" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

// --- SPECIFIC HOOKS ---

export function useSiteTitle() { return useSetting<string>("site_title", "Rank-Scout"); }
export function useSiteLogo() { return useSetting<string | null>("site_logo_url", null); }
export function useSiteDescription() { return useSetting<string>("site_description", "Dein Vergleichsportal"); }

export function useHeroTitle() { return useSetting<string>("hero_title", "Entdecke die besten Vergleiche"); }
export function useHeroSubtitle() { return useSetting<string>("hero_subtitle", "Wir vergleichen, damit du die richtige Wahl triffst"); }

export function useTrendingLinks() { return useSetting<TrendingLink[]>("trending_links", []); }
export function useNavLinks() { return useSetting<NavLink[]>("nav_links", []); }
export function useFooterLinks() { return useSetting<NavLink[]>("footer_links", []); }

export function useFooterSiteName() { return useSetting<string>("footer_site_name", "Rank-Scout"); }
export function useFooterCopyright() { return useSetting<string>("footer_copyright", `© ${new Date().getFullYear()} Rank-Scout. Alle Rechte vorbehalten.`); }
export function useFooterDesignerName() { return useSetting<string>("footer_designer_name", "Digital-Perfect"); }
export function useFooterDesignerUrl() { return useSetting<string>("footer_designer_url", "https://digital-perfect.com"); }

export function useAdsEnabled() { return useSetting<boolean>("ads_enabled", false); }
export function useGlobalAnalyticsCode() { return useSetting<string>("global_analytics_code", ""); }

// --- LAYOUT & CONTENT ---

// Definitive Liste aller Sektionen (Array für Sortierung im Admin)
export const defaultHomeLayout = [
  { id: "hero", type: "hero", is_active: true, sort_order: 0 },
  { id: "amazon_top", type: "ad", is_active: false, sort_order: 1 },
  { id: "trust", type: "trust", is_active: true, sort_order: 2 },
  { id: "big_three", type: "features", is_active: true, sort_order: 3 }, // Alias 'stats'
  { id: "adsense_middle", type: "ad", is_active: false, sort_order: 4 },
  { id: "categories", type: "categories", is_active: true, sort_order: 5 },
  { id: "forum", type: "forum", is_active: true, sort_order: 6 },
  { id: "news", type: "news", is_active: true, sort_order: 7 },
  { id: "seo", type: "seo", is_active: true, sort_order: 8 },
  { id: "mascot", type: "widget", is_active: true, sort_order: 99 }
];

export const defaultHomeContent = {
  hero: { badge: "NEU: Rank-Scout 2.0 ist live", title: "Entdecke die besten Vergleiche", subtitle: "Wir vergleichen, damit du die richtige Wahl triffst.", search_placeholder: "Was suchst du?", search_label: "AI-Suche" },
  trust: { headline: "Markt-Transparenz", subheadline: "Wir filtern das Signal aus dem Rauschen.", card1_title: "Daten", card1_text: "Fakten statt Meinung.", card2_title: "Echtzeit", card2_text: "Täglich aktuell.", card3_title: "Experten", card3_text: "Geprüfte Qualität.", box_title: "Vorteil", box_text: "Entscheiden Sie besser." },
  big_three: { headline: "Wählen Sie Ihren Bereich", finance_title: "Finanzen", finance_desc: "Broker & Krypto", software_title: "Software", software_desc: "Tools & SaaS", services_title: "Services", services_desc: "Agenturen" },
  categories: { headline: "Alle Kategorien" },
  news: { headline: "Aktuelles", subheadline: "News & Trends.", button_text: "Zum Magazin" },
  seo: { headline: "Über uns", intro: "Willkommen bei Rank-Scout." }
};

// FIX: Gibt Array zurück (für Admin)
export function useHomeLayout() {
  const { data } = useSettings();
  const dbLayout = data?.['home_layout'];
  
  if (!Array.isArray(dbLayout) || dbLayout.length === 0) {
    return defaultHomeLayout;
  }
  return dbLayout;
}

// FIX: Gibt { content: ... } zurück (für Komponenten) & führt Deep Merge durch
export function useHomeContent() {
  const { data } = useSettings();
  const dbContent = data?.['home_content'] as any;

  // Merge Logik: Default + DB
  const mergedContent = dbContent ? {
    ...defaultHomeContent,
    ...dbContent,
    hero: { ...defaultHomeContent.hero, ...(dbContent.hero || {}) },
    trust: { ...defaultHomeContent.trust, ...(dbContent.trust || {}) },
    big_three: { ...defaultHomeContent.big_three, ...(dbContent.big_three || {}) },
    news: { ...defaultHomeContent.news, ...(dbContent.news || {}) },
    seo: { ...defaultHomeContent.seo, ...(dbContent.seo || {}) }
  } : defaultHomeContent;

  // WICHTIG: Als { content } wrappen, da Komponenten "const { content } = useHomeContent()" nutzen
  return { content: mergedContent };
}

export function useAdSenseConfig() { return useSetting("adsense_config", { client_id: "", slot_id: "", is_active: false }); }
export function useAmazonConfig() { return useSetting("amazon_config", { tracking_id: "", is_active: false }); }

export function useForumBannerConfig() {
  const { data } = useSettings();
  const dbConfig = data?.['forum_banner_config'] as any;
  const defaultConfig = {
    imageUrl: "https://placehold.co/500x300/e2e8f0/1e293b?text=Dein+Banner+Hier",
    linkUrl: "#",
    isActive: true,
    title: "Spezialangebot",
    description: "Klicke hier für mehr Infos.",
    ctaText: "Jetzt ansehen"
  };
  return { ...defaultConfig, ...(dbConfig || {}) };
}