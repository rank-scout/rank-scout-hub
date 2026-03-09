import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useTrackView(pageName: string | undefined, type: string) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!pageName || hasTracked.current) return;

    const track = async () => {
      try {
        hasTracked.current = true;
        
        // 100% Cookieless & Storage-Free Stealth Tracking
        await supabase.functions.invoke('page-pulse', {
          body: { pageName, type }
        });
      } catch (error) {
        console.error("Pulse Sync Failed", error);
      }
    };

    track();
  }, [pageName, type]);
}