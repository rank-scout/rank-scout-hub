import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CategoryInput } from "@/lib/schemas";

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  theme: "DATING" | "ADULT" | "CASINO" | "GENERIC";
  meta_title: string | null;
  meta_description: string | null;
  h1_title: string | null;
  long_content_top: string | null;
  long_content_bottom: string | null;
  analytics_code: string | null;
  banner_override: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export function useCategories(includeInactive = false) {
  return useQuery({
    queryKey: ["categories", includeInactive],
    queryFn: async () => {
      let query = supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Category[];
    },
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
    queryKey: ["categories", "slug", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
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
      const { data, error } = await supabase
        .from("categories")
        .insert({
          slug: input.slug,
          name: input.name,
          description: input.description || null,
          icon: input.icon || "📊",
          theme: input.theme,
          meta_title: input.meta_title || null,
          meta_description: input.meta_description || null,
          h1_title: input.h1_title || null,
          long_content_top: input.long_content_top || null,
          long_content_bottom: input.long_content_bottom || null,
          is_active: input.is_active ?? true,
          sort_order: input.sort_order ?? 0,
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
    mutationFn: async ({ id, input }: { id: string; input: Partial<CategoryInput> }) => {
      const { data, error } = await supabase
        .from("categories")
        .update({
          ...(input.slug !== undefined && { slug: input.slug }),
          ...(input.name !== undefined && { name: input.name }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.icon !== undefined && { icon: input.icon }),
          ...(input.theme !== undefined && { theme: input.theme }),
          ...(input.meta_title !== undefined && { meta_title: input.meta_title }),
          ...(input.meta_description !== undefined && { meta_description: input.meta_description }),
          ...(input.h1_title !== undefined && { h1_title: input.h1_title }),
          ...(input.long_content_top !== undefined && { long_content_top: input.long_content_top }),
          ...(input.long_content_bottom !== undefined && { long_content_bottom: input.long_content_bottom }),
          ...(input.is_active !== undefined && { is_active: input.is_active }),
          ...(input.sort_order !== undefined && { sort_order: input.sort_order }),
        })
        .eq("id", id)
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

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

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
      const { data, error } = await supabase
        .from("categories")
        .insert({
          slug: `${category.slug}-copy`,
          name: `${category.name} (Kopie)`,
          description: category.description,
          icon: category.icon,
          theme: category.theme,
          meta_title: category.meta_title,
          meta_description: category.meta_description,
          h1_title: category.h1_title,
          long_content_top: category.long_content_top,
          long_content_bottom: category.long_content_bottom,
          analytics_code: category.analytics_code,
          banner_override: category.banner_override,
          is_active: false,
          sort_order: category.sort_order + 1,
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
