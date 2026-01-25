import { useState, useEffect, useCallback } from "react";

export interface CookieConsent {
  essential: boolean; // Always true - required
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

const STORAGE_KEY = "cookie-consent-v2";

const DEFAULT_CONSENT: CookieConsent = {
  essential: true,
  functional: false,
  analytics: false,
  marketing: false,
  timestamp: 0,
};

function getStoredConsent(): CookieConsent | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate structure
      if (typeof parsed === "object" && "essential" in parsed) {
        return { ...DEFAULT_CONSENT, ...parsed, essential: true };
      }
    }
  } catch {
    // Invalid JSON, ignore
  }
  return null;
}

export function useCookieConsent() {
  const [consent, setConsentState] = useState<CookieConsent | null>(() => getStoredConsent());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      setIsVisible(true);
    } else {
      setConsentState(stored);
      // Apply consent settings to Google Consent Mode v2
      applyConsentMode(stored);
    }
  }, []);

  const updateConsent = useCallback((newConsent: Partial<CookieConsent>) => {
    const fullConsent: CookieConsent = {
      ...DEFAULT_CONSENT,
      ...consent,
      ...newConsent,
      essential: true, // Always required
      timestamp: Date.now(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullConsent));
    setConsentState(fullConsent);
    setIsVisible(false);
    
    // Apply to Google Consent Mode v2
    applyConsentMode(fullConsent);
  }, [consent]);

  const acceptAll = useCallback(() => {
    updateConsent({
      functional: true,
      analytics: true,
      marketing: true,
    });
  }, [updateConsent]);

  const acceptEssentialOnly = useCallback(() => {
    updateConsent({
      functional: false,
      analytics: false,
      marketing: false,
    });
  }, [updateConsent]);

  const showBanner = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideBanner = useCallback(() => {
    setIsVisible(false);
  }, []);

  const hasConsented = consent !== null && consent.timestamp > 0;

  return {
    consent,
    isVisible,
    hasConsented,
    updateConsent,
    acceptAll,
    acceptEssentialOnly,
    showBanner,
    hideBanner,
  };
}

/**
 * Apply consent settings to Google Consent Mode v2
 */
function applyConsentMode(consent: CookieConsent) {
  // Initialize dataLayer if not exists
  window.dataLayer = window.dataLayer || [];
  
  const consentUpdate = {
    ad_storage: consent.marketing ? "granted" : "denied",
    ad_user_data: consent.marketing ? "granted" : "denied",
    ad_personalization: consent.marketing ? "granted" : "denied",
    analytics_storage: consent.analytics ? "granted" : "denied",
    functionality_storage: consent.functional ? "granted" : "denied",
    personalization_storage: consent.functional ? "granted" : "denied",
    security_storage: "granted", // Always required
  };

  // Push consent update
  window.dataLayer.push({
    event: "consent_update",
    ...consentUpdate,
  });

  // Also push using gtag format if available
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", consentUpdate);
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}
