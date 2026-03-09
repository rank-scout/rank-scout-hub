import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useTrackView(pageName: string | undefined, type: string) {
  useEffect(() => {
    if (!pageName) return;

    const today = new Date().toISOString().split('T')[0];
    const storageKey = `viewed_${type}_${pageName}_${today}`;

    // Session Check: Haben wir heute schon gezählt?
    if (sessionStorage.getItem(storageKey)) {
      return;
    }

    const track = async () => {
      try {
        // KYRA UPDATE: Wir rufen jetzt die sichere Edge Function auf!
        const { error } = await supabase.functions.invoke('track-view', {
          body: { pageName, type }
        });

        if (error) throw error;
        
        // Sperre im Browser setzen
        sessionStorage.setItem(storageKey, "true");
      } catch (error) {
        console.error("Tracking Error:", error);
      }
    };

    track();
  }, [pageName, type]);
}