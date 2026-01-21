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
      // Check if setting exists
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

// Type-safe setting hooks
export function useSiteTitle() {
  return useSetting<string>("site_title", "Rank-Scout");
}

export function useSiteDescription() {
  return useSetting<string>("site_description", "Dein Vergleichsportal");
}

export function useHeroTitle() {
  return useSetting<string>("hero_title", "Entdecke die besten Vergleiche");
}

export function useHeroSubtitle() {
  return useSetting<string>("hero_subtitle", "Wir vergleichen, damit du die richtige Wahl triffst");
}

export function useTrendingLinks() {
  return useSetting<TrendingLink[]>("trending_links", []);
}

export function useNavLinks() {
  return useSetting<NavLink[]>("nav_links", []);
}

export function useFooterLinks() {
  return useSetting<NavLink[]>("footer_links", []);
}

// Global footer settings hooks (used when no category is provided)
export function useFooterSiteName() {
  return useSetting<string>("footer_site_name", "Rank-Scout");
}

export function useFooterCopyright() {
  return useSetting<string>("footer_copyright", `© ${new Date().getFullYear()} Rank-Scout. Alle Rechte vorbehalten.`);
}

export function useFooterDesignerName() {
  return useSetting<string>("footer_designer_name", "Digital-Perfect");
}

export function useFooterDesignerUrl() {
  return useSetting<string>("footer_designer_url", "https://digital-perfect.com");
}

// NEU: Ads Toggle Hook
export function useAdsEnabled() {
  // Standardmäßig false, damit wir erst aktivieren, wenn wir bereit sind
  return useSetting<boolean>("ads_enabled", false);
}