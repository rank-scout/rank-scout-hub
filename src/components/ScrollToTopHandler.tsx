import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export const ScrollToTopHandler = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  
  // Flag: Sind wir gerade dabei, die Position wiederherzustellen?
  const isRestoring = useRef(false);
  // Flag: Haben wir das Ziel schon einmal erreicht?
  const hasRestored = useRef(false);

  // 1. Browser-Automatik komplett töten
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // 2. DAS IST NEU: Wir speichern GENAU dann, wenn der User klickt.
  // Das ist viel präziser als beim "Verlassen" der Seite, da Mobile-Browser
  // beim Seitenwechsel oft schon einfrieren.
  useEffect(() => {
    const handleClick = () => {
      // Speichere die aktuelle harte Position unter dem aktuellen Pfad
      sessionStorage.setItem(`scroll-pos-${pathname}`, window.scrollY.toString());
    };

    // Wir hören auf alle Klicks im Fenster (Capture Phase für max. Priorität)
    window.addEventListener("click", handleClick, true);

    return () => {
      window.removeEventListener("click", handleClick, true);
    };
  }, [pathname]);

  // 3. Die aggressive Wiederherstellung
  useEffect(() => {
    const restore = () => {
      // Wenn es eine neue Seite ist (PUSH) -> Sofort nach oben
      if (navigationType !== "POP") {
        window.scrollTo(0, 0);
        return;
      }

      // Wenn wir "Zurück" drücken (POP)
      const savedPos = sessionStorage.getItem(`scroll-pos-${pathname}`);
      const yTarget = savedPos ? parseInt(savedPos, 10) : 0;

      // Wenn keine Position da ist oder sie 0 ist -> Nichts tun (bleibt oben)
      if (!yTarget || yTarget === 0) return;

      isRestoring.current = true;
      hasRestored.current = false;

      // Strategie: MutationObserver
      // Wir beobachten den DOM. Sobald Supabase Elemente reinlädt, 
      // checken wir, ob wir springen können.
      const observer = new MutationObserver(() => {
        if (hasRestored.current) return;

        const currentHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;

        // Wenn die Seite hoch genug gewachsen ist, um die alte Position zu fassen
        if (currentHeight >= yTarget + clientHeight) {
          // WICHTIG: 'instant' statt 'smooth'. Smooth bricht auf Mobile oft ab.
          window.scrollTo({ top: yTarget, behavior: "instant" });
          
          // Doppel-Check: Sind wir wirklich da?
          if (Math.abs(window.scrollY - yTarget) < 50) {
            hasRestored.current = true;
            // Observer noch kurz laufen lassen für Layout-Shifts, dann killen
            setTimeout(() => {
                observer.disconnect();
                isRestoring.current = false;
            }, 500);
          }
        }
      });

      // Start Observing auf dem Body (für Supabase Inserts)
      observer.observe(document.body, { 
        childList: true, 
        subtree: true, 
        attributes: true // Auch Höhenänderungen durch CSS-Klassen beachten
      });

      // Fallback: Manchmal ist der Content sofort da (Cache)
      window.scrollTo({ top: yTarget, behavior: "instant" });

      // Kill-Switch: Nach 5 Sekunden geben wir auf, um Ressourcen zu sparen
      const timeout = setTimeout(() => {
        observer.disconnect();
        isRestoring.current = false;
      }, 5000);

      return () => {
        observer.disconnect();
        clearTimeout(timeout);
      };
    };

    restore();
  }, [pathname, navigationType]);

  return null;
};