import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Layers, Zap, Search, LayoutGrid, ListFilter } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HubTemplateProps {
  category: any;
}

export const HubTemplate = ({ category }: HubTemplateProps) => {
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
                setFilteredCategories(sortedData);
            }
        } else {
            if (category.slug) {
                const { data } = await supabase.from('categories').select('*').eq('parent_group', category.slug).eq('is_active', true).order('sort_order', { ascending: true });
                if (data) {
                    setSubCategories(data);
                    setFilteredCategories(data);
                }
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

  // Live Search Filter
  useEffect(() => {
    if (!searchQuery) {
        setFilteredCategories(subCategories);
    } else {
        const lower = searchQuery.toLowerCase();
        setFilteredCategories(subCategories.filter(c => 
            c.name.toLowerCase().includes(lower) || 
            (c.meta_description && c.meta_description.toLowerCase().includes(lower))
        ));
    }
  }, [searchQuery, subCategories]);

  const getIcon = (slug: string) => {
    if (!slug) return "★";
    if (slug.includes('krypto') || slug.includes('bitcoin')) return "₿";
    if (slug.includes('bank') || slug.includes('konto')) return "€";
    if (slug.includes('love') || slug.includes('dating')) return "♥";
    return "➜";
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Helmet>
        <title>{category?.meta_title || category?.name}</title>
        <meta name="description" content={category?.meta_description} />
      </Helmet>

      {/* PREMIUM HERO SECTION */}
      <div className="relative pt-32 pb-32 overflow-hidden bg-[#0F172A] border-b border-slate-800">
        <div className="absolute inset-0 z-0">
            {category.hero_image_url && (
                <img src={category.hero_image_url} className="w-full h-full object-cover opacity-20 mix-blend-overlay" alt="" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/90 via-[#0F172A]/80 to-[#0F172A]"></div>
        </div>
        
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/4"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 border border-white/10 text-xs font-bold tracking-widest uppercase mb-8 text-white backdrop-blur-md shadow-xl">
                <Layers className="w-3 h-3 text-orange-500" /> Rank-Scout Themen-Hub
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight text-white drop-shadow-2xl">
                {category?.h1_title || category?.name}
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed antialiased mb-10">
                {category?.hero_headline || category?.description || "Wähle einen Bereich für den detaillierten Vergleich."}
            </p>

            {/* Hub Search Bar */}
            <div className="max-w-xl mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                <div className="relative flex items-center bg-white rounded-xl shadow-2xl p-2">
                    <Search className="w-5 h-5 text-slate-400 ml-3" />
                    <Input 
                        placeholder="Was möchtest du vergleichen?" 
                        className="border-0 shadow-none focus-visible:ring-0 text-base h-12 bg-transparent"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button size="sm" className="h-10 px-6 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white font-bold">
                        Suchen
                    </Button>
                </div>
            </div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="container mx-auto px-4 -mt-16 relative z-20 pb-24">
        {isLoading ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-xl border border-slate-100 max-w-4xl mx-auto">
                <div className="inline-block w-12 h-12 border-4 border-slate-100 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Lade Themenbereiche...</p>
            </div>
        ) : (
            <>
                {/* Results Count Bar */}
                <div className="flex items-center justify-between mb-6 text-sm font-medium text-slate-500 px-2">
                    <div className="flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4" /> 
                        <span>{filteredCategories.length} Bereiche gefunden</span>
                    </div>
                    {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="text-orange-600 hover:underline">
                            Filter zurücksetzen
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCategories.length > 0 ? (
                        filteredCategories.map((sub) => (
                        <Link to={`/${sub.slug}`} key={sub.id} className="group block h-full">
                            <div className="bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-orange-500/10 border border-slate-100 hover:border-orange-500/30 transition-all duration-300 h-full flex flex-col relative overflow-hidden group-hover:-translate-y-1">
                                
                                <div className="flex items-start justify-between mb-6">
                                    {/* Icon Box */}
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-slate-100 group-hover:scale-110 transition-transform text-orange-500 font-bold group-hover:bg-orange-50">
                                        {sub.icon ? <img src={sub.icon} alt="" className="w-8 h-8 object-contain" /> : getIcon(sub.slug)}
                                    </div>
                                    <div className="bg-slate-50 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-slate-100">
                                        Vergleich
                                    </div>
                                </div>
                                
                                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors leading-tight">
                                    {sub.name}
                                </h3>
                                
                                <p className="text-slate-500 mb-8 line-clamp-3 leading-relaxed flex-grow text-sm group-hover:text-slate-600">
                                    {sub.meta_description || "Klicke hier für den detaillierten Vergleich und Testbericht."}
                                </p>
                                
                                {/* CTA */}
                                <div className="mt-auto flex items-center text-slate-900 font-bold text-sm border-t border-slate-50 pt-6 group-hover:text-orange-600">
                                    Jetzt vergleichen <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </Link>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 px-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300"><Search className="w-10 h-10" /></div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Keine Ergebnisse</h3>
                            <p className="text-slate-500 mb-6">Wir konnten für "{searchQuery}" leider keinen Bereich finden.</p>
                            <Button onClick={() => setSearchQuery("")} variant="outline">Suche zurücksetzen</Button>
                        </div>
                    )}
                </div>
            </>
        )}
      </div>
      
      {/* SEO CONTENT SECTION */}
      {category?.long_content_bottom && (
          <div className="bg-white border-t border-slate-200 py-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-slate-50 rounded-3xl p-10 border border-slate-100 shadow-inner">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <Zap className="w-6 h-6 text-orange-500" /> Wissenswertes zum Thema {category.name}
                    </h2>
                    <div className="prose prose-lg text-slate-600 max-w-none prose-headings:text-slate-900 prose-a:text-orange-600 hover:prose-a:text-orange-700 prose-img:rounded-2xl prose-strong:text-slate-800" dangerouslySetInnerHTML={{ __html: category.long_content_bottom }} />
                </div>
            </div>
          </div>
      )}
    </div>
  );
};