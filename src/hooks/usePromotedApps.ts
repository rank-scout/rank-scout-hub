import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PromotedApp {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  affiliate_link: string | null;
  category: string | null;
  short_description: string | null;
  rating: number;
  daily_rank: number | null;
  advertising_weight: number; // 1-10
}

/**
 * Holt ALLE aktiven Apps für die Top 100 Liste
 * Sortiert nach 'daily_rank'
 */
export const useTop100Apps = () => {
  return useQuery({
    queryKey: ["promoted-apps-top-100"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promoted_apps")
        .select("*")
        .eq("is_active", true)
        .order("daily_rank", { ascending: true }) // Platz 1 zuerst
        .limit(100);

      if (error) throw error;
      return data as PromotedApp[];
    },
    staleTime: 1000 * 60 * 5, // 5 Minuten Cache
  });
};

/**
 * Der "Smart Slider" Algorithmus
 * Wählt zufällige Apps aus, aber bevorzugt solche mit hohem 'advertising_weight'.
 * @param limit Anzahl der Apps im Slider (z.B. 15)
 */
export const useWeightedApps = (limit: number = 15) => {
  return useQuery({
    queryKey: ["promoted-apps-weighted", limit],
    queryFn: async () => {
      // 1. Alle aktiven Apps holen
      const { data, error } = await supabase
        .from("promoted_apps")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      const allApps = data as PromotedApp[];

      // 2. Der "Los-Topf" (Weighted Random Pool)
      // Eine App mit Gewicht 10 landet 10x im Array. Eine mit 1 nur 1x.
      const pool: PromotedApp[] = [];
      
      allApps.forEach((app) => {
        // Gewichtung sicherstellen (min 1, max 10)
        const weight = Math.max(1, Math.min(10, app.advertising_weight || 1));
        
        for (let i = 0; i < weight; i++) {
          pool.push(app);
        }
      });

      // 3. Mischen (Fisher-Yates Shuffle)
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }

      // 4. Einzigartige Gewinner ziehen (keine App doppelt im Slider anzeigen)
      const selectedApps = new Set<string>();
      const result: PromotedApp[] = [];

      for (const app of pool) {
        if (result.length >= limit) break; // Genug Apps gefunden
        if (!selectedApps.has(app.id)) {
          selectedApps.add(app.id);
          result.push(app);
        }
      }
      
      // Falls wir nicht genug einzigartige Apps haben (weil DB leer ist), 
      // füllen wir den Rest einfach auf oder lassen es so.
      
      return result;
    },
    staleTime: 1000 * 60 * 1, // 1 Minute Cache (damit Slider bei Reload variiert)
  });
};