import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// --- TYPES ---

export interface ForumThread {
  id: string;
  title: string;
  slug: string;
  content: string;
  author_name: string;
  category_id: string | null;
  view_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_answered: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  seo_title?: string;
  seo_description?: string;
  featured_image_url?: string;
  admin_notes?: string;
  status?: string;
  raw_html_content?: string;
  reply_count?: number; // Anzahl der Kommentare
  is_liked_by_user?: boolean; // Für Like-Status
  likes_count?: number; // Anzahl Likes
}

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ForumReply {
  id: string;
  thread_id: string;
  content: string;
  author_name: string;
  is_active: boolean;
  is_spam: boolean;
  created_at: string;
}

// --- THREADS HOOKS ---

export const useForumThreads = () => {
  return useQuery({
    queryKey: ["forum-threads"],
    queryFn: async () => {
      // Wir laden die Threads UND die Anzahl der Antworten (count)
      const { data, error } = await supabase
        .from("forum_threads")
        .select(`
          *,
          forum_replies(count)
        `)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transformieren: Supabase gibt count als Array zurück, wir wollen eine Zahl.
      return data.map((thread: any) => ({
        ...thread,
        reply_count: thread.forum_replies?.[0]?.count || 0
      })) as ForumThread[];
    },
  });
};

export const useForumThread = (slug: string) => {
  return useQuery({
    queryKey: ["forum-thread", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_threads")
        .select(`
          *,
          forum_replies(count)
        `)
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Check if user liked this thread (optional, requires auth)
      let isLiked = false;
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
         const { data: likeData } = await supabase
           .from("forum_likes") // Annahme: Tabelle heißt forum_likes
           .select("*")
           .eq("thread_id", data.id)
           .eq("user_id", session.session.user.id)
           .maybeSingle();
         isLiked = !!likeData;
      }

      // Count total likes
      const { count: likesCount } = await supabase
        .from("forum_likes")
        .select("*", { count: 'exact', head: true })
        .eq("thread_id", data.id);

      return {
        ...data,
        reply_count: data.forum_replies?.[0]?.count || 0,
        is_liked_by_user: isLiked,
        likes_count: likesCount || 0
      } as ForumThread;
    },
    enabled: !!slug,
  });
};

// --- CATEGORIES HOOKS ---

export const useForumCategories = (includeInactive = false) => {
  return useQuery({
    queryKey: ["forum-categories", includeInactive],
    queryFn: async () => {
      let query = supabase
        .from("forum_categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ForumCategory[];
    },
  });
};

// --- REPLIES HOOKS ---

// 1. Für den Admin (Alle Antworten)
export const useAllReplies = () => {
  return useQuery({
    queryKey: ["forum-all-replies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_replies")
        .select(`
          *,
          forum_threads (title)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

// 2. Für den Besucher (Nur aktive Antworten eines Threads)
export const useThreadReplies = (threadId: string) => {
  return useQuery({
    queryKey: ["forum-replies", threadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_replies")
        .select("*")
        .eq("thread_id", threadId)
        .eq("is_active", true) // Nur freigegebene anzeigen
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as ForumReply[];
    },
    enabled: !!threadId,
  });
};

// --- INTERACTION HOOKS (VIEWS & LIKES) ---

export const useIncrementViewCount = () => {
  return useMutation({
    mutationFn: async (threadId: string) => {
      // Versucht RPC aufzurufen, Fallback auf manuelles Update wenn RPC fehlt
      const { error } = await supabase.rpc('increment_forum_view', { thread_id: threadId });
      if (error) {
         console.warn("RPC increment_forum_view missing, skipping view count update");
      }
    }
  });
};

export const useToggleLike = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (threadId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Du musst eingeloggt sein, um Beiträge zu liken.");
      }

      // Check if already liked
      const { data: existing } = await supabase
        .from("forum_likes")
        .select("id")
        .eq("thread_id", threadId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        // Unlike
        await supabase.from("forum_likes").delete().eq("id", existing.id);
      } else {
        // Like
        await supabase.from("forum_likes").insert({ 
          thread_id: threadId, 
          user_id: user.id 
        });
      }
    },
    onSuccess: (_, threadId) => {
      queryClient.invalidateQueries({ queryKey: ["forum-thread"] });
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
};

// --- MUTATIONS (ADMIN) ---

export const useCreateThread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (thread: Partial<ForumThread>) => {
      const slug = thread.slug || generateSlug(thread.title || "");
      const { data, error } = await supabase
        .from("forum_threads")
        .insert([{ ...thread, slug }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
    },
  });
};

export const useUpdateThread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ForumThread> & { id: string }) => {
      const { error } = await supabase
        .from("forum_threads")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
      queryClient.invalidateQueries({ queryKey: ["forum-thread", variables.slug] });
    },
  });
};

export const useDeleteThread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("forum_threads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
    },
  });
};

// --- CATEGORY MUTATIONS ---

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: Partial<ForumCategory>) => {
      const slug = category.slug || generateSlug(category.name || "");
      const { data, error } = await supabase
        .from("forum_categories")
        .insert([{ ...category, slug }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-categories"] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ForumCategory> & { id: string }) => {
      const { error } = await supabase
        .from("forum_categories")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-categories"] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("forum_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-categories"] });
    },
  });
};

// --- REPLY MUTATIONS ---

// 1. Neuer Kommentar (User)
export const useCreateReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reply: { thread_id: string; content: string; author_name: string }) => {
      // Standardmäßig: Inaktiv (Muss moderiert werden)
      const { data, error } = await supabase
        .from("forum_replies")
        .insert([{ 
          ...reply, 
          is_active: false, 
          is_spam: false 
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-all-replies"] });
    },
  });
};

// 2. Reply Update (Admin: Freigabe / Spam)
export const useUpdateReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; is_active?: boolean; is_spam?: boolean }) => {
      const { error } = await supabase.from("forum_replies").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-all-replies"] });
      // Auch die öffentlichen Replies neu laden
      queryClient.invalidateQueries({ queryKey: ["forum-replies"] });
      queryClient.invalidateQueries({ queryKey: ["forum-threads"] }); // Für Count Update
    },
  });
};

// Helper
export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}