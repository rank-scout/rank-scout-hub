import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CategoryInput, NavigationSettings } from "@/lib/schemas";

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  theme: "DATING" | "ADULT" | "CASINO" | "GENERIC";
  template: "comparison" | "review";
  color_theme: "dark" | "light" | "neon";
  
  // Content & SEO
  site_name: string | null;
  hero_headline: string | null;
  hero_pretitle: string | null;
  hero_cta_text: string | null;
  hero_badge_text: string | null;
  meta_title: string | null;
  meta_description: string | null;
  h1_title: string | null;
  long_content_top: string | null;
  long_content_bottom: string | null;
  
  // === NEUE HUB FELDER (Flexible Landingpages) ===
  intro_title: string | null;
  comparison_title: string | null;
  project_cta_text: string | null;
  features_title: string | null;
  sticky_cta_text: string | null;
  sticky_cta_link: string | null;
  
  // KYRA UPDATE: Typ-Definition
  hero_image_url: string | null;
  
  // Tech & Override
  analytics_code: string | null;
  banner_override: string | null;
  custom_html_override: string | null;
  
  // Footer
  footer_site_name: string | null;
  footer_copyright_text: string | null;
  footer_designer_name: string | null;
  footer_designer_url: string | null;
  
  // JSONB / Complex Objects
  navigation_settings: NavigationSettings | null;
  faq_data: any; 
  
  // Sidebar Ads (Zur Sicherheit auch hier)
  sidebar_ad_html: string | null;
  sidebar_ad_image: string | null;

  // Flags & Meta
  is_active: boolean;
  is_city: boolean;
  is_internal_generated: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export function useCategories(refetchOnMount = false) {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
    refetchOnMount,
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ["categories", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Category;
    },
    enabled: !!id,
  });
}

export function useCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      return data as Category | null;
    },
    enabled: !!slug,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CategoryInput) => {
      const { data: existing } = await supabase
        .from("categories")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .single();
      const nextOrder = (existing?.sort_order ?? 0) + 1;

      const { data, error } = await supabase
        .from("categories")
        .insert({
          ...input,
          description: input.description || null,
          icon: input.icon || "📊",
          color_theme: input.color_theme || "dark",
          is_active: input.is_active ?? true,
          is_city: input.is_city ?? false,
          is_internal_generated: (input as any).is_internal_generated ?? false,
          faq_data: input.faq_data || [],
          sort_order: nextOrder,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<CategoryInput>) => {
      const { data, error } = await supabase
        .from("categories")
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Category;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      if (data.slug) {
          queryClient.invalidateQueries({ queryKey: ["category", data.slug] });
      }
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDuplicateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: Category) => {
      const { id, created_at, updated_at, ...rest } = category;
      const newSlug = `${rest.slug}-copy-${Math.floor(Math.random() * 1000)}`;
      
      const { data: newCat, error: catError } = await supabase
        .from("categories")
        .insert({
          ...rest,
          slug: newSlug,
          name: `${rest.name} (Kopie)`,
          is_active: false,
        })
        .select()
        .single();

      if (catError) throw catError;

      const { data: links } = await supabase.from("category_projects").select("*").eq("category_id", id);
      if (links && links.length > 0) {
        const newLinks = links.map(l => ({ category_id: newCat.id, project_id: l.project_id, sort_order: l.sort_order }));
        await supabase.from("category_projects").insert(newLinks);
      }
      
      const { data: footerLinks } = await supabase.from("popular_footer_links").select("*").eq("category_id", id);
      if (footerLinks && footerLinks.length > 0) {
         const newFooterLinks = footerLinks.map(l => ({ category_id: newCat.id, label: l.label, url: l.url, sort_order: l.sort_order, is_active: l.is_active }));
         try { await supabase.from("popular_footer_links").insert(newFooterLinks); } catch(e) {}
      }

      return newCat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}