import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export const ScrollToTopHandler = () => {
  const location = useLocation();
  const navType = useNavigationType();
  const lastPath = useRef(location.pathname);

  // 1. Manuelle Kontrolle
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // 2. Speichern BEVOR der Pfad wechselt (Component Will Unmount Logik simuliert)
  useEffect(() => {
    const save = () => {
      sessionStorage.setItem(`pos:${lastPath.current}`, window.scrollY.toString());
    };
    // Cleanup function runs before the effect runs again (on path change)
    return () => {
        save();
        lastPath.current = location.pathname;
    };
  }, [location.pathname]);

  // 3. Restore
  useEffect(() => {
    const key = `pos:${location.pathname}`;
    
    if (navType === "POP") {
      const saved = sessionStorage.getItem(key);
      if (saved) {
        const y = parseInt(saved, 10);
        
        // Loop mit requestAnimationFrame (besser für Mobile Battery/Performance)
        let frames = 0;
        const forceScroll = () => {
            // Nur scrollen, wenn wir noch nicht da sind
            if (Math.abs(window.scrollY - y) > 10) {
                window.scrollTo(0, y);
            }
            
            frames++;
            // Versuche es für ca 60 Frames (1 Sekunde)
            if (frames < 60) {
                requestAnimationFrame(forceScroll);
            }
        };
        
        forceScroll();
        return;
      }
    } else {
        // Bei PUSH/REPLACE hart nach oben
        window.scrollTo(0, 0);
    }
  }, [location.pathname, navType]);

  return null;
};