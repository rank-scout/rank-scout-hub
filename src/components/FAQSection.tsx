import { motion } from "framer-motion";
import { Check, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import {
  resolveHomepageSectionPatternClassFromSettings,
  resolveHomepageSectionStyleVarsFromSettings,
} from "@/lib/homepage-section-styles";
import type { LandingFaqBlockData } from "@/lib/landing-page-builder";
import { sanitizeRichHtml } from "@/lib/content";

type FAQSectionProps = {
  overrideData?: LandingFaqBlockData | null;
};

const FAQSection = ({ overrideData }: FAQSectionProps) => {
  const { getSetting, settings } = useSiteSettings();
  const sectionStyleVars = resolveHomepageSectionStyleVarsFromSettings(settings, "faq");
  const sectionPatternClass = resolveHomepageSectionPatternClassFromSettings(settings, "faq");
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;

  const { data: queriedFaqs = [] } = useQuery({
    queryKey: ["faq_items", siteId],
    enabled: !overrideData,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faq_items")
        .select("*")
        .eq("site_id", siteId)
        .order("sort_order");

      if (error) throw error;
      return data;
    },
  });

  const faqs =
    overrideData?.items && overrideData.items.length > 0
      ? overrideData.items
      : queriedFaqs.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
        }));

  if (!faqs.length) {
    return null;
  }

  const kicker = overrideData?.kicker?.trim() || getSetting("home_faq_kicker", "FAQ · Rank-Scout");
  const title =
    overrideData?.title?.trim() ||
    getSetting("home_faq_title", "Häufige Fragen zu Rank-Scout, Vergleichen und Partner-Anfragen");
  const description =
    overrideData?.description?.trim() ||
    getSetting(
      "home_faq_description",
      "Hier findest du kompakte Antworten zu Vergleichen, Rechnern, Ratgebern und unverbindlichen Partner-Anfragen auf Rank-Scout.",
    );

  return (
    <section
      id="faq"
      aria-label="FAQ"
      className={`homepage-style-scope surface-section-shell ${sectionPatternClass} relative overflow-hidden py-20 sm:py-24`}
      style={sectionStyleVars}
    >
      <div className="section-container relative z-10">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55 }}
            className="mb-10 rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_18px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#FF8400]/20 bg-[#FF8400]/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FF8400]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#FF8400] shadow-[0_0_12px_rgba(255,132,0,0.65)]" />
              {kicker}
            </div>

            <div className="flex items-start gap-4 sm:gap-5">
              <div className="mt-1 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <HelpCircle size={24} strokeWidth={2.1} />
              </div>

              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h2>
                <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">{description}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, delay: 0.08 }}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => {
                const safeAnswer = sanitizeRichHtml((faq.answer || "").replace(/\n/g, "<br />"));

                return (
                  <AccordionItem
                    key={`${faq.question}-${index}`}
                    value={`item-${index}`}
                    className="group overflow-hidden rounded-[1.75rem] border border-border/80 bg-card px-0 shadow-[0_14px_44px_-32px_rgba(15,23,42,0.32)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#FF8400]/25 hover:shadow-[0_18px_50px_-28px_rgba(255,132,0,0.18)] data-[state=open]:border-[#FF8400]/30 data-[state=open]:shadow-[0_22px_56px_-30px_rgba(255,132,0,0.22)]"
                  >
                    <AccordionTrigger className="px-6 py-6 text-left hover:no-underline [&>svg]:hidden sm:px-8 sm:py-7 [&[data-state=open]_.faq-check-shell]:scale-105 [&[data-state=open]_.faq-check-shell]:shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_12px_28px_-12px_rgba(255,132,0,0.8)] [&[data-state=open]_.faq-check-inner]:from-[#FF9B2F] [&[data-state=open]_.faq-check-inner]:to-[#FF8400] [&[data-state=open]_.faq-check-icon]:scale-110 [&[data-state=open]_.faq-question]:text-primary">
                      <div className="flex w-full items-center gap-4">
                        <div className="min-w-0 flex-1">
                          <span className="faq-question block text-lg font-bold leading-snug text-foreground transition-colors duration-300">
                            {faq.question}
                          </span>
                        </div>

                        <span className="faq-check-shell relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#FF8400]/18 bg-gradient-to-br from-[#fff3e8] via-white to-[#ffe1c2] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_10px_22px_-14px_rgba(255,132,0,0.65)] transition-all duration-300 group-hover:scale-105">
                          <span className="faq-check-inner absolute inset-[5px] rounded-full bg-gradient-to-br from-[#FFB15C] to-[#FF8400]" />
                          <Check
                            className="faq-check-icon relative z-10 h-5 w-5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-transform duration-300"
                            strokeWidth={3}
                          />
                        </span>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-6 pb-8 pt-0 sm:px-8 sm:pb-9">
                      <div className="mb-6 h-px w-full bg-gradient-to-r from-border via-border/70 to-transparent" />
                      <div
                        className="prose prose-slate max-w-none text-base leading-8 text-muted-foreground prose-p:my-0 prose-p:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-ul:my-3 prose-ol:my-3"
                        dangerouslySetInnerHTML={{ __html: safeAnswer }}
                      />
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
