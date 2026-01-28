import { ShieldCheck, Zap } from "lucide-react";
import { useHomeContent } from "@/hooks/useSettings";

export const SEOContentSection = () => {
  const { content } = useHomeContent();
  if (!content) return null;

  return (
    <section className="bg-white py-24 border-t border-slate-100">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-950 mb-6 sm:text-4xl">
            {content.seo.headline}
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            {content.seo.intro}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
            <h3 className="text-xl font-bold text-blue-950 mb-4 flex items-center gap-2">
              <span className="h-8 w-8 bg-rose-100 text-rose-700 rounded-lg flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></span>
              {content.seo.block1_title}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {content.seo.block1_text}
            </p>
          </div>

          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
            <h3 className="text-xl font-bold text-blue-950 mb-4 flex items-center gap-2">
              <span className="h-8 w-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center"><Zap className="w-5 h-5" /></span>
              {content.seo.block2_title}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {content.seo.block2_text}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};