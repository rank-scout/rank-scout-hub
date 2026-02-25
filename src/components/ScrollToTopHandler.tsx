import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export const ScrollToTopHandler = () => {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // Wenn der User "Zurück" drückt (POP), stoppen wir hier sofort.
    // Der Browser stellt die Position dann automatisch wieder her.
    if (navigationType === "POP") {
      return;
    }

    // Wenn ein Anker-Link (#...) vorhanden ist, scrolle dorthin
    if (hash) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
        return;
      }
    }

    // Nur bei einem NEUEN Link-Klick (PUSH/REPLACE) nach oben scrollen
    window.scrollTo(0, 0);
  }, [pathname, hash, navigationType]);

  return null;
};