import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Layers, Zap } from "lucide-react";
import { Helmet } from "react-helmet-async";

interface HubTemplateProps {
  category: any;
}

export const HubTemplate = ({ category }: HubTemplateProps) => {
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const manualSlugsString = category.custom_css || "";
        const manualSlugs = manualSlugsString.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);

        if (manualSlugs.length > 0) {
            const { data } = await supabase.from('categories').select('*').in('slug', manualSlugs).eq('is_active', true);
            if (data) {
                const sortedData = manualSlugs.map((slug: string) => data.find((c: any) => c.slug === slug)).filter(Boolean);
                setSubCategories(sortedData);
            }
        } else {
            if (category.slug) {
                const { data } = await supabase.from('categories').select('*').eq('parent_group', category.slug).eq('is_active', true).order('sort_order', { ascending: true });
                if (data) setSubCategories(data);
            }
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubCategories();
  }, [category]);

  const getIcon = (slug: string) => {
    if (!slug) return "★";
    if (slug.includes('krypto') || slug.includes('bitcoin')) return "₿";
    if (slug.includes('bank') || slug.includes('konto')) return "€";
    return "★";
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Helmet>
        <title>{category?.meta_title || category?.name}</title>
        <meta name="description" content={category?.meta_description} />
      </Helmet>

      {/* HERO SECTION - DARK NAVY & ORANGE */}
      <div className="relative pt-32 pb-24 overflow-hidden bg-[#0F172A] border-b border-slate-800">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[80px] pointer-events-none translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
            {/* Badge: Orange/White */}
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-bold tracking-widest uppercase mb-8 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                <Layers className="w-3 h-3" /> Rank-Scout Hub
            </span>
            
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-white">
                {category?.h1_title || category?.name}
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                {category?.description || "Wähle einen Bereich für den detaillierten Vergleich."}
            </p>
        </div>
      </div>

      {/* GRID SECTION */}
      <div className="container mx-auto px-4 -mt-12 relative z-20 pb-24">
        {isLoading ? (
            <div className="text-center py-20"><div className="inline-block w-10 h-10 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin"></div></div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {subCategories && subCategories.length > 0 ? (
                    subCategories.map((sub) => (
                    <Link to={`/${sub.slug}`} key={sub.id} className="group block h-full">
                        <div className="bg-white rounded-2xl p-8 shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-orange-500/10 border border-slate-100 hover:border-orange-500/30 transition-all duration-300 h-full flex flex-col relative overflow-hidden group-hover:-translate-y-1">
                            
                            {/* Icon Box: White with Orange Icon */}
                            <div className="mb-6 w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-slate-100 group-hover:scale-110 transition-transform text-orange-500 font-bold group-hover:bg-orange-50">
                                {sub.icon ? <img src={sub.icon} alt="" className="w-8 h-8 object-contain" /> : getIcon(sub.slug)}
                            </div>
                            
                            <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">
                                {sub.name}
                            </h3>
                            
                            <p className="text-slate-500 mb-8 line-clamp-3 leading-relaxed flex-grow text-sm group-hover:text-slate-600">
                                {sub.meta_description || "Klicke hier für mehr Informationen."}
                            </p>
                            
                            {/* CTA: Orange Text */}
                            <div className="mt-auto flex items-center text-slate-900 font-bold text-sm border-t border-slate-100 pt-6 group-hover:text-orange-600">
                                Jetzt vergleichen <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                            </div>
                        </div>
                    </Link>
                    ))
                ) : (
                    <div className="col-span-full text-center py-16 px-6 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300"><Zap className="w-8 h-8" /></div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Noch keine Inhalte</h3>
                        <p className="text-slate-500">Nutze das Admin-Panel (Hub Config), um Seiten hinzuzufügen.</p>
                    </div>
                )}
            </div>
        )}
      </div>
      
      {/* SEO TEXT BOTTOM */}
      {category?.long_content_bottom && (
          <div className="container mx-auto px-4 pb-24 max-w-4xl border-t border-slate-200 pt-16">
              <div className="prose prose-lg text-slate-600 mx-auto max-w-none prose-headings:text-[#0F172A] prose-a:text-orange-600 hover:prose-a:text-orange-700" dangerouslySetInnerHTML={{ __html: category.long_content_bottom }} />
          </div>
      )}
    </div>
  );
};