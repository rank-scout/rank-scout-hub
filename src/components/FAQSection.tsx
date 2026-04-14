import type { LandingFaqBlockData } from "@/lib/landing-page-builder";

type FAQSectionProps = {
  overrideData?: LandingFaqBlockData | null;
};

/**
 * Legacy homepage FAQ component.
 * 
 * Important:
 * The active homepage FAQ now lives in:
 * src/components/home/HomeFAQSection.tsx
 * 
 * This component is intentionally disabled so the old FAQ block
 * can no longer appear alongside the new homepage FAQ.
 */
const FAQSection = (_props: FAQSectionProps) => {
  return null;
};

export default FAQSection;
