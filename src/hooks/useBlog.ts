import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { generateSlug } from "@/lib/seo";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  author_name: string;
  category: string | null;
  read_time: number | null;
  is_featured: boolean | null;
  is_published: boolean | null;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface BlogPostInput {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  author_name?: string;
  category?: string;
  read_time?: number;
  is_featured?: boolean;
  is_published?: boolean;
  published_at?: string;
  meta_title?: string;
  meta_description?: string;
}

/**
 * Fetch latest published blog posts (for homepage)
 */
export function useLatestBlogPosts(limit = 3) {
  return useQuery({
    queryKey: ["blog-posts", "latest", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as BlogPost[];
    },
  });
}

/**
 * Fetch single blog post by slug (for detail page)
 */
export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog-posts", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error) throw error;
      return data as BlogPost | null;
    },
    enabled: !!slug,
  });
}

/**
 * Fetch all blog posts (for admin - includes drafts)
 */
export function useAllBlogPosts() {
  return useQuery({
    queryKey: ["blog-posts", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BlogPost[];
    },
  });
}

/**
 * Fetch single blog post by ID (for admin editing)
 */
export function useBlogPostById(id: string) {
  return useQuery({
    queryKey: ["blog-posts", "id", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!id,
  });
}

/**
 * Create a new blog post
 */
export function useCreateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: BlogPostInput) => {
      const slug = input.slug || generateSlug(input.title) + "-" + Date.now().toString(36);
      
      const { data, error } = await supabase
        .from("blog_posts")
        .insert({
          title: input.title.trim(),
          slug,
          excerpt: input.excerpt?.trim() || null,
          content: input.content.trim(),
          featured_image: input.featured_image || null,
          author_name: input.author_name?.trim() || "Redaktion",
          category: input.category || "Allgemein",
          read_time: input.read_time || 5,
          is_featured: input.is_featured || false,
          is_published: input.is_published || false,
          published_at: input.is_published ? new Date().toISOString() : null,
          meta_title: input.meta_title?.trim() || null,
          meta_description: input.meta_description?.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as BlogPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });
}

/**
 * Update an existing blog post
 */
export function useUpdateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: BlogPostInput & { id: string }) => {
      const updateData: any = {
        title: input.title.trim(),
        excerpt: input.excerpt?.trim() || null,
        content: input.content.trim(),
        featured_image: input.featured_image || null,
        author_name: input.author_name?.trim() || "Redaktion",
        category: input.category || "Allgemein",
        read_time: input.read_time || 5,
        is_featured: input.is_featured || false,
        is_published: input.is_published || false,
        meta_title: input.meta_title?.trim() || null,
        meta_description: input.meta_description?.trim() || null,
      };

      // Set published_at when publishing for the first time
      if (input.is_published && input.published_at === null) {
        updateData.published_at = new Date().toISOString();
      }

      if (input.slug) {
        updateData.slug = input.slug;
      }

      const { data, error } = await supabase
        .from("blog_posts")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as BlogPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });
}

/**
 * Delete a blog post
 */
export function useDeleteBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });
}

/**
 * Toggle publish status
 */
export function useTogglePublishBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const updateData: any = { is_published };
      
      if (is_published) {
        updateData.published_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("blog_posts")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as BlogPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });
}
