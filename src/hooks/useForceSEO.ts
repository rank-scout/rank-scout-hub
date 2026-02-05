import { useEffect } from 'react';

/**
 * useForceSEO - Standard Version
 * Setzt die Meta-Description auf jeder Seite, die diesen Hook aufruft.
 * Keine Einschränkung auf die Startseite mehr.
 */
export const useForceSEO = (description: string | undefined) => {
  useEffect(() => {
    // 1. Sicherheitspuffer: Nur ausführen, wenn wir Text haben
    if (!description || description.trim() === "") return;

    // 2. Suche das existierende Tag
    let metaTag = document.querySelector("meta[name='description']");

    // 3. Wenn Tag fehlt, erstellen
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'description');
      document.head.appendChild(metaTag);
    }

    // 4. HARTES ÜBERSCHREIBEN (Damit es auch wirklich greift)
    // Wir prüfen nicht mehr auf die URL, sondern vertrauen darauf, 
    // dass die Komponente, die diesen Hook ruft, den richtigen Text liefert.
    metaTag.setAttribute('content', description);

  }, [description]); // Feuert neu, wenn sich die Beschreibung ändert
};