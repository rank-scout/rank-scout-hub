import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { TrendingLink } from "@/lib/schemas";

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
  link_url?: string;
  headline?: string;
  subheadline?: string;
  cta_text?: string;
  html_code?: string;
  position?: string;
}

// --- CORE FETCHING ---
async function fetchSettings(): Promise<Record<string, Json>> {
  const { data, error } = await supabase.from("settings").select("*");
  if (error) throw error;
  
  const settings: Record<string, Json> = {};
  data?.forEach((row) => { 
    settings[row.key] = row.value; 
  });
  
  return settings;
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000,
  });
}

// Generic Hook zum Lesen
export function useSetting<T>(key: string, defaultValue: T): T {
  const { data: settings } = useSettings();
  if (!settings || settings[key] === undefined) return defaultValue;
  return settings[key] as T;
}

// Generic Hook zum Schreiben
export function useUpdateSetting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: Json }) => {
      const { error } = await supabase.from("settings").upsert(
        { 
          key, 
          value, 
          updated_at: new Date().toISOString() 
        },
        { onConflict: 'key' }
      );
      
      if (error) {
        console.error("Supabase Error:", error);
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
  ads: false
};

// CONTENT DEFAULTS (Erweitert um SEO Fields für Home)
export const defaultHomeContent = {
  // NEU: SEO Fields direkt im Content-Objekt
  seo_title: "",
  seo_description: "",
  
  hero: {
    badge: "NEU: Rank-Scout 2.0 ist live",
    headline: "Der ultimative Vergleichs-Hub",
    title: "Der ultimative Vergleichs-Hub",
    subtitle: "Suche & finde die besten Tools für deinen Erfolg.",
    subheadline: "Suche & finde die besten Tools für deinen Erfolg. Vergleiche, entdecke und nutze die Top-Angebote aus KI, Software und Lifestyle. Unabhängig geprüft.",
    search_placeholder: "Was suchst du heute? (z.B. 'KI Tools', 'Dating')",
    search_label: "Finden"
  },
  trust: { 
    headline: "Warum Rank-Scout?", 
    subheadline: "Wir stehen für Transparenz und Qualität.", 
    card1_title: "Daten statt Meinung", card1_text: "Unsere Algorithmen analysieren tausende Datenpunkte. Keine gekauften Platzierungen, nur harte Fakten.", 
    card2_title: "Echtzeit-Scouting", card2_text: "Der Markt schläft nie. Unsere Datenbank wird täglich aktualisiert, damit Sie keinen Trend verpassen.", 
    card3_title: "Verifizierte Experten", card3_text: "Nur Dienstleister mit nachgewiesenem Track-Record schaffen es in unsere Rankings.", 
    box_title: "Ihr unfairer Wettbewerbsvorteil", box_text: "Während andere noch suchen, haben Sie bereits entschieden. Rank-Scout liefert Ihnen die Marktdaten, die Sie für technologische Führung brauchen.", 
    live_badge: "Live-System aktiv" 
  },
  big_three: { 
    headline: "Wählen Sie Ihren Bereich", 
    items: [
        { id: "1", title: "Finanzen & Krypto", desc: "Broker, Kredite & Geschäftskonten im Härtetest.", link: "/finanzen", button_text: "Vergleichen", theme: "blue", image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab" },
        { id: "2", title: "Software & SaaS", desc: "Die besten Tools für Marketing, HR und Vertrieb.", link: "/software", button_text: "Tools finden", theme: "gold", image_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b" },
        { id: "3", title: "Dienstleistungen", desc: "Agenturen, Berater und Services auf dem Prüfstand.", link: "/dienstleistungen", button_text: "Suchen", theme: "dark", image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c" }
    ],
    finance_title: "Finanzen & Krypto", finance_desc: "Broker, Kredite & Geschäftskonten im Härtetest.", finance_link: "/finanzen", finance_button: "Jetzt vergleichen", 
    software_title: "Software & SaaS", software_desc: "Die besten Tools für Marketing, HR und Vertrieb.", software_link: "/software", software_button: "Tools finden", 
    services_title: "Dienstleistungen", services_desc: "Agenturen, Berater und Services auf dem Prüfstand.", services_link: "/dienstleistungen", services_button: "Anbieter suchen" 
  },
  why_us: {
    headline: "Warum Rank-Scout?",
    subheadline: "Wir sind deine intelligente Entscheidungshilfe.",
    features: [
      { title: "Extreme Performance", text: "Keine Ladezeiten, nur Fakten.", icon: "zap" },
      { title: "100% Unabhängig", text: "Maximale Neutralität.", icon: "shield" },
      { title: "Global & Lokal", text: "Von International bis Regional.", icon: "globe" },
      { title: "Echtzeit Updates", text: "Täglich frische Daten.", icon: "chart" }
    ]
  },
  seo: { 
    headline: "Über unser Vergleichsportal", 
    intro: "Willkommen bei Rank-Scout. Wir bringen Licht in den Dschungel digitaler Dienstleistungen.", 
    block1_title: "Warum Rank-Scout?", block1_text: "In einer Welt voller Fake-Bewertungen und intransparenter Affiliate-Modelle setzen wir einen neuen Standard.", 
    block2_title: "Zukunftssicherheit", block2_text: "Unsere Scouts scannen den globalen Markt permanent nach neuen Trends." 
  },
  categories: { headline: "Alle Kategorien im Überblick", count: 6, button_more: "Alle Kategorien anzeigen", button_card: "Bereich erkunden" },
  news: { headline: "Aktuelles & Ratgeber", subheadline: "News & Updates", count: 3, button_text: "Zum Magazin", read_more: "Artikel lesen" },
  forum_teaser: { headline: "Community Hub", subheadline: "Diskutiere mit den Besten.", link_text: "Alle Foren anzeigen", mobile_button: "Zum Community Forum" }
};

export const defaultHeaderConfig = { 
  button_text: "Jetzt vergleichen", 
  button_url: "/kategorien", 
  nav_links: [{ label: "Software Vergleich", url: "/software" }, { label: "Finanz-Tools", url: "/finanzen" }, { label: "Agentur Finder", url: "/dienstleistungen" }], 
  hub_links: [{ label: "Vergleichs-Hub", url: "/kategorien", icon: "LayoutGrid" }, { label: "Arcade", url: "/arcade", icon: "Gamepad2" }, { label: "Brain-Boost", url: "/brain-boost", icon: "BrainCircuit" }, { label: "Community", url: "/forum", icon: "Users" }] 
};

export const defaultFooterConfig = { 
  title: "Rank-Scout", 
  text_checked: "Redaktionell geprüft", 
  text_update: "Aktualisiert: 2026", 
  text_description: "Unsere Vergleiche basieren auf echten Daten, Nutzer-Feedback und Experten-Analysen.", 
  copyright_text: "© 2026 Rank-Scout. Alle Rechte vorbehalten.", 
  made_with_text: "Made with", 
  made_in_text: "in Germany", 
  disclaimer: "*Werbehinweis: Wir finanzieren uns über sogenannte Affiliate-Links. Wenn Sie über einen Link auf dieser Seite einkaufen, erhalten wir möglicherweise eine Provision. Der Preis für Sie ändert sich dabei nicht. Unsere redaktionelle Unabhängigkeit bleibt davon unberührt.", 
  legal_links: [{ label: "Impressum", url: "/impressum" }, { label: "Datenschutz", url: "/datenschutz" }, { label: "AGB", url: "/agb" }], 
  popular_links: [{ label: "Software Vergleich", url: "/software" }, { label: "Finanz-Tools", url: "/finanzen" }, { label: "Agentur Finder", url: "/dienstleistungen" }] 
};

export const defaultScoutyConfig = { 
  bubble_intro: "Hi, ich bin Scouty! Ich finde die besten Produkt-Deals für dich! 🔭", 
  bubble_exit: "Warte! 🛑 Bevor du gehst: Ich habe gerade einen neuen Testsieger gefunden. Willst du ihn sehen?", 
  bubble_newsletter: "Top 3 Deals per Mail?", 
  powered_by: "Powered By Rank-Scout AI" 
};

export const defaultHomeForumTeaser = { 
  headline: "Community Hub", 
  subheadline: "Diskutiere mit den Besten. Tauche in unsere beliebtesten Themenbereiche ein und vernetze dich mit Experten.", 
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
      else if (s.id === 'seo') isEnabled = layout.why_us;
      else if (s.id === 'amazon_top' || s.id === 'adsense_middle') isEnabled = layout.ads;
      
      return { ...s, enabled: isEnabled };
  });

  return { 
      sections: mappedSections, 
      layout 
  }; 
}

export function useHeaderConfig() { const { data } = useSettings(); return { ...defaultHeaderConfig, ...(data?.header_config as any || {}) }; }
export function useFooterConfig() { const { data } = useSettings(); return { ...defaultFooterConfig, ...(data?.footer_config as any || {}) }; }
export function useScoutyConfig() { const { data } = useSettings(); return { ...defaultScoutyConfig, ...(data?.scouty_config as any || {}) }; }
export function useHomeForumTeaser() { const { data } = useSettings(); return { ...defaultHomeForumTeaser, ...(data?.home_forum_teaser as any || {}) }; }

export function useHomeContent() { 
  const { data: settings } = useSettings(); 
  const content = { ...defaultHomeContent, ...(settings?.home_content as any || {}) }; 
  
  // Deep Merge sicherstellen
  content.big_three = { ...defaultHomeContent.big_three, ...(content.big_three || {}) };
  content.big_three.items = content.big_three.items || defaultHomeContent.big_three.items;
  
  content.why_us = { ...defaultHomeContent.why_us, ...(content.why_us || {}) };
  content.categories = { ...defaultHomeContent.categories, ...content.categories }; 
  content.news = { ...defaultHomeContent.news, ...content.news }; 
  content.trust = { ...defaultHomeContent.trust, ...content.trust }; 
  content.hero = { ...defaultHomeContent.hero, ...content.hero }; 
  content.seo = { ...defaultHomeContent.seo, ...content.seo }; 
  
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

// --- EXPORTS MIT FIX ---
// HIER WURDE GEÄNDERT: Defaults auf leeren String gesetzt, keine "Demo-Texte" mehr!
export function useSiteTitle() { return useSetting<string>("site_title", ""); }
export function useSiteLogo() { return useSetting<string | null>("site_logo_url", null); }
export function useSiteDescription() { return useSetting<string>("site_description", ""); }
export function useHeroTitle() { return useSetting<string>("hero_title", "Entdecke die besten Vergleiche"); }
export function useHeroSubtitle() { return useSetting<string>("hero_subtitle", "Wir vergleichen, damit du die richtige Wahl triffst"); }
export function useAdsEnabled() { return useSetting<boolean>("ads_enabled", false); }
export function useGlobalAnalyticsCode() { return useSetting<string>("global_analytics_code", ""); }
export function useNavLinks() { const c = useHeaderConfig(); return c.nav_links; }
export function useFooterLinks() { const c = useFooterConfig(); return c.popular_links; }
export function useFooterSiteName() { const c = useFooterConfig(); return c.title; }
export function useFooterCopyright() { const c = useFooterConfig(); return c.copyright_text; }
export function useFooterDesignerName() { return useSetting<string>("footer_designer_name", "Digital-Perfect"); }
export function useFooterDesignerUrl() { return useSetting<string>("footer_designer_url", "https://digital-perfect.com"); }
export function useTrendingLinks() { return useSetting<TrendingLink[]>("trending_links", []); }