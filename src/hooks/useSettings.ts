import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TrendingLink, NavLink } from "@/lib/schemas";
import type { Json } from "@/integrations/supabase/types";

type SettingsRecord = {
  id: string;
  key: string;
  value: Json;
  updated_at: string;
};

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
    staleTime: 5 * 60 * 1000, // 5 minutes
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
      const { data: existing } = await supabase
        .from("settings")
        .select("id")
        .eq("key", key)
        .single();

      let result;
      if (existing) {
        result = await supabase
          .from("settings")
          .update({ value })
          .eq("key", key)
          .select()
          .single();
      } else {
        result = await supabase
          .from("settings")
          .insert({ key, value })
          .select()
          .single();
      }

      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

// --- STANDARD VALUES FÜR HOME LAYOUT & CONTENT ---

export const defaultHomeLayout = {
  hero: true,
  amazon_top: true,
  trust: true,
  big_three: true,
  adsense_middle: true,
  categories: true,
  news: true,
  mascot: true
};

export const defaultHomeContent = {
  hero: {
    badge: "NEU: Rank-Scout 2.0 ist live",
    title: "Entdecke die besten Vergleiche",
    subtitle: "Wir vergleichen, damit du die richtige Wahl triffst. Unabhängig. Datengestützt. Kompromisslos ehrlich.",
    search_placeholder: "Was möchtest du vergleichen?",
    search_label: "AI-Live-Search"
  },
  trust: {
    headline: "Markt-Transparenz statt Dschungel.",
    subheadline: "Wir filtern das Signal aus dem Rauschen. Rank-Scout ist Ihre Intelligence-Plattform für validierte Dienstleister und Software.",
    card1_title: "Daten statt Meinung",
    card1_text: "Unsere Algorithmen analysieren tausende Datenpunkte. Keine gekauften Platzierungen, nur harte Fakten.",
    card2_title: "Echtzeit-Scouting",
    card2_text: "Der Markt schläft nie. Unsere Datenbank wird täglich aktualisiert, damit Sie keinen Trend verpassen.",
    card3_title: "Verifizierte Experten",
    card3_text: "Nur Dienstleister mit nachgewiesenem Track-Record schaffen es in unsere Rankings.",
    box_title: "Ihr unfairer Wettbewerbsvorteil",
    box_text: "Während andere noch suchen, haben Sie bereits entschieden. Rank-Scout liefert Ihnen die Marktdaten, die Sie für technologische Führung brauchen."
  },
  big_three: {
    headline: "Wählen Sie Ihren Bereich",
    finance_title: "Finanzen & Krypto",
    finance_desc: "Broker, Kredite & Geschäftskonten im Härtetest.",
    software_title: "Software & SaaS",
    software_desc: "Die besten Tools für Marketing, HR und Vertrieb.",
    services_title: "Dienstleistungen",
    services_desc: "Agenturen, Berater und Services auf dem Prüfstand."
  },
  categories: {
    headline: "Alle Kategorien im Überblick"
  },
  news: {
    headline: "Der \"Unfair Advantage\" Newsletter",
    subheadline: "Erhalten Sie kuratierte Top-Tools und geheime Markt-Daten, bevor Ihre Konkurrenz davon erfährt. Keine Theorie, nur validiertes Wachstum.",
    button_text: "Kostenlos anmelden",
    placeholder: "ihre@firmen-email.de"
  },
  seo: {
    headline: "Rank-Scout: Die Instanz für digitale Markttransparenz",
    intro: "Wir bringen Licht in den undurchsichtigen Markt digitaler Dienstleistungen und Technologien. Unabhängig. Datengestützt. Kompromisslos ehrlich.",
    block1_title: "Warum Rank-Scout?",
    block1_text: "In einer Welt voller Fake-Bewertungen und intransparenter Affiliate-Modelle setzen wir einen neuen Standard. Wir analysieren nicht nur Features, sondern prüfen echte Business-Impacts.",
    block2_title: "Zukunftssicherheit",
    block2_text: "Unsere Scouts scannen den globalen Markt permanent nach neuen Trends. Ob Generative AI oder Blockchain – wir übersetzen Trends in Business-Cases."
  }
};

// --- HOOKS ---

export function useHomeLayout() {
  const { data: settings } = useSettings();
  const layout = (settings?.home_layout as typeof defaultHomeLayout) || defaultHomeLayout;
  return { layout };
}

export function useHomeContent() {
  const { data: settings } = useSettings();
  const content = (settings?.home_content as typeof defaultHomeContent) || defaultHomeContent;
  return { content };
}

// Ads Config Hooks
export function useAdSenseConfig() {
  const { data: settings } = useSettings();
  return {
    clientId: (settings?.ads_sense_client_id as string) || "",
    defaultSlotId: (settings?.ads_sense_slot_id as string) || ""
  };
}

// KYRA UPDATE: NATIVE AMAZON CONFIG
export function useAmazonConfig() {
  const { data: settings } = useSettings();
  return {
    headline: (settings?.ads_amazon_headline as string) || "",
    text: (settings?.ads_amazon_text as string) || "",
    buttonText: (settings?.ads_amazon_button_text as string) || "Zum Angebot",
    link: (settings?.ads_amazon_link as string) || ""
  };
}

// Legacy / Simple Getter Hooks
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