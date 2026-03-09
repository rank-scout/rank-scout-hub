import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useTrackView(pageName: string | undefined, type: string) {
  useEffect(() => {
    if (!pageName) return;

    const today = new Date().toISOString().split('T')[0];
    const storageKey = `viewed_${type}_${pageName}_${today}`;

    if (sessionStorage.getItem(storageKey)) {
      return;
    }

    const track = async () => {
      try {
        // KYRA UPDATE: Stealth-Modus! Wir funken an 'page-pulse', um AdBlocker auszutricksen.
        const { error } = await supabase.functions.invoke('page-pulse', {
          body: { pageName, type }
        });

        if (error) throw error;
        
        sessionStorage.setItem(storageKey, "true");
      } catch (error) {
        // Im Hintergrund lassen wir Fehler stumm, damit die UX nicht leidet
        console.error("Pulse Sync Failed:", error);
      }
    };

    track();
  }, [pageName, type]);
}