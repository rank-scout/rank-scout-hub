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
      const { data, error } = await supabase
        .from("projects")
        .update({
          ...(input.category_id !== undefined && { category_id: input.category_id }),
          ...(input.name !== undefined && { name: input.name }),
          ...(input.slug !== undefined && { slug: input.slug }),
          ...(input.url !== undefined && { url: input.url }),
          ...(input.short_description !== undefined && { short_description: input.short_description }),
          ...(input.country_scope !== undefined && { country_scope: input.country_scope }),
          ...(input.tags !== undefined && { tags: input.tags }),
          ...(input.is_active !== undefined && { is_active: input.is_active }),
          ...(input.sort_order !== undefined && { sort_order: input.sort_order }),
        })
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
