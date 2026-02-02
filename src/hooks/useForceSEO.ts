import { useEffect } from 'react';

/**
 * useForceSEO - Die "Brechstange"
 * Zwingt den Browser, die Meta-Description zu aktualisieren,
 * indem es direkt auf das DOM zugreift (Vanilla JS).
 * Umgeht React-Helmet Caching-Probleme.
 */
export const useForceSEO = (description: string | undefined) => {
  useEffect(() => {
    // Sicherheitspuffer: Nur ausführen, wenn wir wirklich einen Text haben
    if (!description || description.trim() === "") return;

    // 1. Suche das existierende Tag
    let metaTag = document.querySelector("meta[name='description']");

    // 2. Wenn es nicht existiert, erstelle es neu
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'description');
      document.head.appendChild(metaTag);
    }

    // 3. HARTES ÜBERSCHREIBEN DES INHALTS
    metaTag.setAttribute('content', description);
    
    // Debugging (damit du siehst, dass es feuert)
    console.log("🔥 FORCE SEO UPDATE: Description gesetzt auf:", description);

  }, [description]); // Feuert jedes Mal neu, wenn sich die Beschreibung ändert
};