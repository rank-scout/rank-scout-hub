import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export const ScrollToTopHandler = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const scrollPosRef = useRef<{ [key: string]: number }>({});
  
  // WICHTIG: Wir merken uns, ob wir gerade versuchen wiederherzustellen
  const isRestoring = useRef(false);

  // 1. Browser-Automatik hart deaktivieren
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // 2. Position speichern (bevor wir die Seite verlassen)
  useEffect(() => {
    const savePos = () => {
      // Nur speichern, wenn wir NICHT gerade am Wiederherstellen sind
      if (!isRestoring.current) {
        const pos = window.scrollY;
        sessionStorage.setItem(`scroll-pos-${pathname}`, pos.toString());
      }
    };

    // Event Listener für "echtes" Scrollen
    const onScroll = () => {
        if(!isRestoring.current) {
             // Debounce könnte hier hin, aber für Quick-Fix lassen wir es direkt
             scrollPosRef.current[pathname] = window.scrollY;
        }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    // Cleanup: Beim Unmounten (Seite verlassen) final speichern
    return () => {
      window.removeEventListener("scroll", onScroll);
      savePos();
    };
  }, [pathname]);

  // 3. Die intelligente Wiederherstellung mit ResizeObserver
  useEffect(() => {
    const restoreScroll = async () => {
      if (navigationType === "POP") {
        const savedPos = sessionStorage.getItem(`scroll-pos-${pathname}`);
        const yTarget = savedPos ? parseInt(savedPos, 10) : 0;

        if (yTarget > 0) {
          isRestoring.current = true; // LOCK: Nicht überschreiben beim Scrollen!

          // Sofortiger Versuch (falls Daten im Cache sind)
          window.scrollTo(0, yTarget);

          // OBSERVER: Wir beobachten den Body. Wenn Supabase Daten lädt,
          // wird der Body größer. Jedes Mal wenn er wächst, prüfen wir,
          // ob wir jetzt zum Ziel scrollen können.
          const observer = new ResizeObserver(() => {
            const currentHeight = document.documentElement.scrollHeight;
            const viewportHeight = window.innerHeight;

            // Kann man überhaupt schon so weit scrollen?
            if (currentHeight >= (yTarget + viewportHeight)) {
               window.scrollTo(0, yTarget);
               
               // Wenn wir exakt da sind (oder sehr nah), sind wir fertig
               if (Math.abs(window.scrollY - yTarget) < 50) {
                   observer.disconnect();
                   // Kurzer Timeout um sicherzugehen, dass keine Nachlader kommen
                   setTimeout(() => { isRestoring.current = false; }, 200);
               }
            } else {
                // Falls die Seite noch wächst aber wir noch nicht beim Target sind,
                // scrollen wir so weit wie möglich nach unten
                window.scrollTo(0, currentHeight);
            }
          });

          observer.observe(document.body);

          // Sicherheits-Timeout: Nach 3 Sekunden hören wir auf zu versuchen (Fallback)
          const safetyTimeout = setTimeout(() => {
            observer.disconnect();
            isRestoring.current = false;
          }, 3000);

          return () => {
            observer.disconnect();
            clearTimeout(safetyTimeout);
          };
        }
      } else {
        // PUSH (Neue Seite) -> Nach oben
        window.scrollTo(0, 0);
        isRestoring.current = false;
      }
    };

    restoreScroll();
  }, [pathname, navigationType]);

  return null;
};