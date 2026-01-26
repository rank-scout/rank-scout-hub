import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ProjectInput } from "@/lib/schemas";

export type Project = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  url: string;
  short_description: string | null;
  description: string | null;
  logo_url: string | null;
  affiliate_link: string | null;
  rating: number;
  badge_text: string | null;
  features: string[];
  pros_list: string[] | null;
  cons_list: string[] | null;
  is_default: boolean | null;
  country_scope: "AT" | "DE" | "DACH" | "EU";
  tags: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProjectWithCategory = Project & {
  categories: {
    id: string;
    name: string;
    slug: string;
    theme: string;
    icon: string | null;
  } | null;
};

export function useProjects(includeInactive = false, categoryId?: string) {
  return useQuery({
    queryKey: ["projects", includeInactive, categoryId],
    queryFn: async () => {
      let query = supabase
        .from("projects")
        .select(`
          *,
          categories (
            id,
            name,
            slug,
            theme,
            icon
          )
        `)
        .order("sort_order", { ascending: true });

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ProjectWithCategory[];
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          categories (
            id,
            name,
            slug,
            theme,
            icon
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as ProjectWithCategory;
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ProjectInput) => {
      const insertData = {
        category_id: input.category_id || null,
        name: input.name,
        slug: input.slug,
        url: input.url,
        short_description: input.short_description || null,
        description: input.description || null,
        logo_url: input.logo_url || null,
        affiliate_link: input.affiliate_link || null,
        rating: input.rating ?? 9.8,
        badge_text: input.badge_text || null,
        features: input.features ?? [],
        country_scope: input.country_scope ?? "DACH",
        tags: input.tags ?? [],
        is_active: input.is_active ?? true,
        sort_order: input.sort_order ?? 0,
      };

      const { data, error } = await supabase
        .from("projects")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<ProjectInput> }) => {
      const updateData: Record<string, unknown> = {};
      
      if (input.category_id !== undefined) updateData.category_id = input.category_id;
      if (input.name !== undefined) updateData.name = input.name;
      if (input.slug !== undefined) updateData.slug = input.slug;
      if (input.url !== undefined) updateData.url = input.url;
      if (input.short_description !== undefined) updateData.short_description = input.short_description;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.logo_url !== undefined) updateData.logo_url = input.logo_url;
      if (input.affiliate_link !== undefined) updateData.affiliate_link = input.affiliate_link;
      if (input.rating !== undefined) updateData.rating = input.rating;
      if (input.badge_text !== undefined) updateData.badge_text = input.badge_text;
      if (input.features !== undefined) updateData.features = input.features;
      if (input.country_scope !== undefined) updateData.country_scope = input.country_scope;
      if (input.tags !== undefined) updateData.tags = input.tags;
      if (input.is_active !== undefined) updateData.is_active = input.is_active;
      if (input.sort_order !== undefined) updateData.sort_order = input.sort_order;

      const { data, error } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
