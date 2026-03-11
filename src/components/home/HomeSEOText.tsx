import { useHomeContent } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";
import { ShieldCheck, Cup, GraphUp } from "@solar-icons/react";
import { sanitizeCmsHtml } from "@/lib/sanitizeHtml";

export const HomeSEOText = () => {
  const { content } = useHomeContent();

  const fallbackText = `
    <h2>Rank-Scout: Dein Kompass im digitalen Dschungel</h2>
    <p>
      Die digitale Welt ist riesig. Täglich poppen neue <strong>SaaS-Tools</strong>, <strong>Finanz-Apps</strong> und <strong>Agenturen</strong> auf. 
      Wer soll da den Überblick behalten? Rank-Scout bündelt Vergleiche, Rechner und Ratgeber in einer einheitlichen Struktur.
    </p>
    <p>
      Wir bereiten Informationen zu Funktionen, Kosten und Modellen übersichtlich auf.
    </p>
    <h3>Vergleiche und Ratgeber für 2026</h3>
    <p>
      Egal ob du Informationen zu einem <strong>Girokonto</strong> oder einer <strong>SEO-Agentur</strong> suchst: Wir bündeln Informationen, Modelle und Unterschiede in übersichtlicher Form. 
      Unsere Inhalte sind redaktionell aufgebaut und werden fortlaufend gepflegt.
    </p>
  `;

  const seoContent = content?.seo?.long_text || fallbackText;

  if (!content?.seo?.long_text && !fallbackText) return null;

  const cardImage = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop";

  return (
    <section className="py-20 bg-slate-50 border-y border-slate-200 overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* LINKS: CONTENT */}
            <div className="lg:col-span-7 xl:col-span-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-px w-8 bg-secondary"></div>
                    <span className="text-xs font-bold text-secondary uppercase tracking-widest">Unsere Mission</span>
                </div>
                <div className="prose prose-slate prose-lg dark:prose-invert max-w-none 
                  prose-headings:text-primary prose-headings:font-display prose-headings:font-bold 
                  prose-p:text-slate-600 prose-strong:text-primary">
                  <div dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(seoContent) }} />
                </div>
            </div>

            {/* RECHTS: IDENTITY CARD */}
            <div className="lg:col-span-5 xl:col-span-4 flex justify-center lg:justify-end relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[400px] bg-secondary/20 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="group relative w-[300px] h-[460px] bg-slate-900 rounded-3xl shadow-2xl border-[4px] border-slate-800 rotate-3 hover:rotate-0 transition-all duration-500 ease-out hover:scale-105 z-10 cursor-pointer overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50 z-10"></div>
                    <img src={cardImage} alt="Rank Scout Elite" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                    
                    <div className="absolute top-0 left-0 w-full p-5 flex justify-between items-start z-30">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-mono text-secondary tracking-widest uppercase">Rank-Scout</span>
                            <span className="text-white font-bold text-lg leading-none">ELITE</span>
                        </div>
                        <ShieldCheck weight="Bold" className="w-6 h-6 text-green-400" />
                    </div>

                    <div className="absolute bottom-0 left-0 w-full p-5 bg-gradient-to-t from-black/90 to-transparent z-30">
                        <span className="text-white font-display font-bold text-xl tracking-wide">THE SCOUT</span>
                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10">
                            <div className="flex items-center gap-2">
                                <GraphUp className="w-4 h-4 text-blue-400" />
                                <span className="text-[10px] text-slate-300 font-mono">DATEN: gepflegt</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Cup className="w-4 h-4 text-secondary" />
                                <span className="text-[10px] text-slate-300 font-mono">FOKUS: Übersicht</span>
                            </div>
                        </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 z-40 pointer-events-none"></div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};