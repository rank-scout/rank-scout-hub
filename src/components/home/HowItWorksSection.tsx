
import { useEffect, useMemo, useState } from "react";
import { Magnifer, ChartSquare, CheckCircle } from "@solar-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useHomeContent } from "@/hooks/useSettings";

const BRAND_BLUE = "#0E1F53";
const BRAND_ORANGE = "#FF8400";

const defaultSteps = [
  {
    icon: Magnifer,
    title: "Suchen",
    description: "Wähle deine Kategorie oder suche direkt nach deinem Bedarf.",
  },
  {
    icon: ChartSquare,
    title: "Vergleichen",
    description: "Unsere KI-gestützten Daten zeigen dir Stärken, Schwächen und Preise auf einen Blick.",
  },
  {
    icon: CheckCircle,
    title: "Entscheiden",
    description: "Vergleiche passende Angebote und prüfe verfügbare Vorteile.",
  },
];

const cardBaseStyle: React.CSSProperties = {
  borderColor: "rgba(14,31,83,0.92)",
  boxShadow: "0 18px 48px rgba(14,31,83,0.08)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,255,0.98))",
};

const getCardHighlight = (active: boolean, final = false): React.CSSProperties => ({
  boxShadow: active
    ? `0 24px 60px ${final ? "rgba(255,132,0,0.22)" : "rgba(14,31,83,0.14)"}, inset 0 0 0 1px ${final ? BRAND_ORANGE : BRAND_BLUE}`
    : "0 18px 48px rgba(14,31,83,0.08)",
  borderColor: active ? (final ? BRAND_ORANGE : BRAND_BLUE) : "rgba(14,31,83,0.92)",
});

const buildSteps = (howItWorks: any) => {
  const configuredSteps = Array.isArray(howItWorks.steps) && howItWorks.steps.length > 0
    ? howItWorks.steps
    : defaultSteps;

  return configuredSteps.slice(0, 3).map((step, index) => ({
    ...defaultSteps[index],
    ...step,
  }));
};

const CardShell = ({
  index,
  activeIndex,
  shouldReduceMotion,
  step,
  children,
}: {
  index: number;
  activeIndex: number;
  shouldReduceMotion: boolean;
  step: (typeof defaultSteps)[number];
  children?: React.ReactNode;
}) => {
  const Icon = step.icon;
  const isFinalStep = index === 2;
  const isActive = activeIndex === index;

  return (
    <motion.article
      initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={shouldReduceMotion ? {} : { y: -8, transition: { duration: 0.22 } }}
      className="group relative overflow-hidden rounded-[2rem] border px-6 pb-8 pt-7 text-center md:px-7"
      style={{ ...cardBaseStyle, ...getCardHighlight(isActive, isFinalStep) }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-24 transition-all duration-300"
        style={{
          background: isFinalStep
            ? "linear-gradient(180deg, rgba(255,132,0,0.12) 0%, rgba(255,255,255,0) 100%)"
            : "linear-gradient(180deg, rgba(14,31,83,0.06) 0%, rgba(255,255,255,0) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-[2rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: `inset 0 0 0 1px ${BRAND_ORANGE}, 0 20px 46px rgba(255,132,0,0.16)` }}
      />

      <div className="relative z-10">
        <div
          className="mx-auto inline-flex items-center justify-center rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em]"
          style={{
            color: BRAND_BLUE,
            borderColor: "rgba(14,31,83,0.18)",
            backgroundColor: "rgba(255,255,255,0.96)",
          }}
        >
          Schritt {index + 1}
        </div>

        <motion.div
          className="mx-auto mb-6 mt-5 flex h-20 w-20 items-center justify-center rounded-full border bg-white"
          style={{
            borderColor: isFinalStep ? "rgba(255,132,0,0.32)" : "rgba(14,31,83,0.18)",
            boxShadow: isFinalStep
              ? "0 18px 42px rgba(255,132,0,0.16)"
              : "0 18px 40px rgba(14,31,83,0.11)",
          }}
          animate={shouldReduceMotion ? {} : { y: isActive ? -4 : 0, scale: isActive ? 1.04 : 1 }}
          transition={{ duration: 0.32 }}
        >
          <motion.div
            className="relative flex h-12 w-12 items-center justify-center rounded-full"
            style={{
              background: isFinalStep
                ? `linear-gradient(135deg, ${isActive ? BRAND_ORANGE : "#f59f2f"} 0%, ${BRAND_ORANGE} 100%)`
                : `linear-gradient(135deg, ${BRAND_BLUE} 0%, #17317f 100%)`,
              boxShadow: isFinalStep
                ? "0 10px 24px rgba(255,132,0,0.26)"
                : "0 10px 24px rgba(14,31,83,0.24)",
            }}
          >
            <Icon weight="Bold" className="h-7 w-7 text-white" />
          </motion.div>
        </motion.div>

        <h3 className="text-2xl font-display font-bold tracking-tight" style={{ color: BRAND_BLUE }}>
          {step.title}
        </h3>
        <p className="mx-auto mt-4 max-w-[18rem] text-[17px] leading-8 text-slate-600">
          {step.description}
        </p>

        {children}
      </div>
    </motion.article>
  );
};

const SectionHeader = ({ howItWorks, shouldReduceMotion }: { howItWorks: any; shouldReduceMotion: boolean }) => (
  <motion.div
    initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
    whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.35 }}
    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    className="mx-auto mb-8 max-w-3xl text-center md:mb-12"
  >
    <div
      className="mx-auto inline-flex items-center gap-3 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.34em] shadow-sm"
      style={{
        color: BRAND_BLUE,
        borderColor: "rgba(14,31,83,0.22)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(244,247,255,0.98))",
        boxShadow: "0 10px 30px rgba(14,31,83,0.07)",
      }}
    >
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: BRAND_ORANGE, boxShadow: `0 0 0 6px rgba(255,132,0,0.14)` }}
      />
      <span>{howItWorks.badge || "In 3 Schritten zum Vergleich"}</span>
    </div>

    <h2 className="mt-6 text-3xl font-display font-bold tracking-tight md:text-5xl" style={{ color: BRAND_BLUE }}>
      {howItWorks.headline || "So funktioniert Rank-Scout"}
    </h2>
    <p className="mt-4 text-lg text-slate-600">
      {howItWorks.subheadline || "In drei einfachen Schritten zur besten Entscheidung."}
    </p>
  </motion.div>
);

const SectionShell = ({ children }: { children: React.ReactNode }) => (
  <section className="relative overflow-hidden bg-white py-16 md:py-24 border-b border-slate-100">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-56"
      style={{
        background: "radial-gradient(circle at top center, rgba(14,31,83,0.06), transparent 64%)",
      }}
    />
    <div className="container relative mx-auto px-4">{children}</div>
  </section>
);

const MorphIcon = ({ stage, active, shouldReduceMotion }: { stage: number; active: boolean; shouldReduceMotion: boolean }) => {
  if (stage === 0) {
    return (
      <motion.div
        className="relative h-12 w-12"
        animate={shouldReduceMotion ? {} : { scale: active ? [1, 1.06, 1] : 1 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-[2px] rounded-full border-[4px] border-white" />
        <div className="absolute bottom-[6px] right-[5px] h-3.5 w-1 rounded-full bg-white rotate-[-42deg]" />
      </motion.div>
    );
  }

  if (stage === 1) {
    return (
      <div className="flex h-12 w-12 items-end justify-center gap-[5px]">
        {[0,1,2].map((bar) => (
          <motion.span
            key={bar}
            className="block w-[5px] rounded-full bg-white"
            animate={shouldReduceMotion ? {} : { height: active ? [16, 28, 18] : 16 }}
            transition={{ duration: 1.1, repeat: Infinity, delay: bar * 0.12, ease: "easeInOut" }}
            style={{ height: 16 + bar * 5 }}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="relative h-12 w-12"
      animate={shouldReduceMotion ? {} : { scale: active ? [0.9, 1.08, 1] : 1 }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div
        className="absolute left-[12px] top-[20px] h-[4px] w-[10px] rounded-full bg-white rotate-45"
        animate={shouldReduceMotion ? {} : { opacity: active ? [0.2, 1, 1] : 1 }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-[18px] top-[17px] h-[4px] w-[18px] rounded-full bg-white rotate-[-48deg]"
        animate={shouldReduceMotion ? {} : { opacity: active ? [0.2, 1, 1] : 1 }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: 0.12 }}
      />
    </motion.div>
  );
};

export const HowItWorksSection = () => {
  const { content } = useHomeContent();
  const howItWorks = content?.how_it_works || {};
  const shouldReduceMotion = useReducedMotion();
  const steps = useMemo(() => buildSteps(howItWorks), [howItWorks]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const interval = window.setInterval(() => {
      setActiveIndex((value) => (value + 1) % 3);
    }, 2100);
    return () => window.clearInterval(interval);
  }, [shouldReduceMotion]);

  return (
    <SectionShell>
      <SectionHeader howItWorks={howItWorks} shouldReduceMotion={shouldReduceMotion} />

      <div className="mx-auto mb-8 hidden max-w-5xl md:block">
        <div className="relative h-14">
          <div className="absolute inset-x-[12%] top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-slate-200" />
          <motion.div
            className="absolute inset-y-0 left-[12%] rounded-full"
            style={{ width: activeIndex === 0 ? "0%" : activeIndex === 1 ? "38%" : "76%", background: `linear-gradient(90deg, ${BRAND_BLUE}, ${BRAND_ORANGE})`, height: 3, top: "50%", transform: "translateY(-50%)" }}
            transition={{ duration: 0.45 }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8 xl:gap-10">
        {steps.map((step, index) => {
          const active = activeIndex === index;
          const final = index === 2;
          return (
            <motion.article
              key={`${step.title}-${index}`}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-[2rem] border px-6 pb-8 pt-7 text-center md:px-7"
              style={{ ...cardBaseStyle, ...getCardHighlight(active, final) }}
            >
              <div className="absolute inset-x-0 top-0 h-24" style={{ background: final ? "linear-gradient(180deg, rgba(255,132,0,0.12), transparent)" : "linear-gradient(180deg, rgba(14,31,83,0.06), transparent)" }} />
              <div className="relative z-10">
                <div className="mx-auto inline-flex items-center justify-center rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: BRAND_BLUE, borderColor: "rgba(14,31,83,0.18)", backgroundColor: "rgba(255,255,255,0.96)" }}>
                  Schritt {index + 1}
                </div>

                <motion.div
                  className="mx-auto mb-6 mt-5 flex h-20 w-20 items-center justify-center rounded-full border bg-white"
                  style={{
                    borderColor: final ? "rgba(255,132,0,0.32)" : "rgba(14,31,83,0.18)",
                    boxShadow: final ? "0 18px 42px rgba(255,132,0,0.16)" : "0 18px 40px rgba(14,31,83,0.11)",
                  }}
                  animate={shouldReduceMotion ? {} : { y: active ? -4 : 0, rotate: active ? [0, 1.5, 0] : 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full"
                    style={{
                      background: final ? `linear-gradient(135deg, ${BRAND_ORANGE} 0%, #ff9a1f 100%)` : `linear-gradient(135deg, ${BRAND_BLUE} 0%, #17317f 100%)`,
                      boxShadow: final ? "0 10px 24px rgba(255,132,0,0.26)" : "0 10px 24px rgba(14,31,83,0.24)",
                    }}
                  >
                    <MorphIcon stage={index} active={active} shouldReduceMotion={shouldReduceMotion} />
                  </div>
                </motion.div>

                <h3 className="text-2xl font-display font-bold tracking-tight" style={{ color: BRAND_BLUE }}>
                  {step.title}
                </h3>
                <p className="mx-auto mt-4 max-w-[18rem] text-[17px] leading-8 text-slate-600">
                  {step.description}
                </p>
              </div>
            </motion.article>
          );
        })}
      </div>
    </SectionShell>
  );
};
