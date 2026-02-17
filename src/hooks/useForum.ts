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
  views: number; // Geändert von view_count auf views (wie in DB)
  view_count?: number; // Fallback für Legacy Code
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
  reply_count?: number; 
  is_liked_by_user?: boolean;
  likes_count?: number;
  show_ad?: boolean;
  ad_type?: string;
  ad_image_url?: string;
  ad_link_url?: string;
  ad_html_code?: string;
  ad_cta_text?: string;
}

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  thread_count?: number;
}

export interface ForumReply {
  id: string;
  thread_id: string;
  content: string;
  author_name: string;
  author_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_spam: boolean;
}

export interface ForumReplyWithLikes extends ForumReply {
  like_count: number;
  user_has_liked: boolean;
}

// --- HOOKS ---

export const useForumCategories = () => {
  return useQuery({
    queryKey: ["forum-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_categories")
        .select("*, forum_threads(count)")
        .eq("is_active", true)
        .order("sort_order");
      
      if (error) throw error;
      
      return data.map(cat => ({
        ...cat,
        thread_count: cat.forum_threads?.[0]?.count || 0
      })) as ForumCategory[];
    },
  });
};

export const useForumThreads = (categorySlug?: string) => {
  return useQuery({
    queryKey: ["forum-threads", categorySlug],
    queryFn: async () => {
      let query = supabase
        .from("forum_threads")
        .select("*, forum_replies(count)")
        .eq("is_active", true)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (categorySlug) {
        const { data: cat } = await supabase.from("forum_categories").select("id").eq("slug", categorySlug).single();
        if (cat) {
          query = query.eq("category_id", cat.id);
        } else {
          return [];
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map(thread => ({
        ...thread,
        views: thread.views || 0, // Mapping sicherstellen
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
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data as ForumThread;
    },
    enabled: !!slug,
  });
};

// --- NEW: INCREMENT VIEW COUNT ---
export const useIncrementThreadView = () => {
  return useMutation({
    mutationFn: async (threadId: string) => {
      const { error } = await supabase.rpc('increment_thread_view', { t_id: threadId });
      if (error) throw error;
    }
  });
};
// --------------------------------

export const useThreadReplies = (threadId: string, userId?: string) => {
  return useQuery({
    queryKey: ["thread-replies", threadId, userId],
    queryFn: async () => {
      if (!threadId) return [];
      
      const { data: replies, error } = await supabase
        .from("forum_replies")
        .select("*")
        .eq("thread_id", threadId)
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch likes
      const replyIds = replies.map(r => r.id);
      
      // Get counts
      const { data: counts } = await supabase
        .from("forum_reply_likes")
        .select("reply_id");
        
      // Get user likes
      let userLikes: string[] = [];
      if (userId) {
        const { data: ul } = await supabase
          .from("forum_reply_likes")
          .select("reply_id")
          .eq("user_id", userId);
        if (ul) userLikes = ul.map(u => u.reply_id);
      }

      return replies.map(reply => {
        const likeCount = counts?.filter(c => c.reply_id === reply.id).length || 0;
        const hasLiked = userLikes.includes(reply.id);
        return {
          ...reply,
          like_count: likeCount,
          user_has_liked: hasLiked
        } as ForumReplyWithLikes;
      });
    },
    enabled: !!threadId,
  });
};

// ... Rest der Hooks (CreateThread, UpdateThread etc.) bleiben gleich, 
// ich kürze hier ab, da sie sich nicht ändern, aber der Vollständigkeit halber
// sollten sie im File bleiben. Da du Copy-Paste willst, hier die wichtigsten:

export const useCreateThread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (thread: any) => {
      const { data, error } = await supabase.from("forum_threads").insert([thread]).select().single();
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
    mutationFn: async ({ id, ...updates }: any) => {
      const { error } = await supabase.from("forum_threads").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
      queryClient.invalidateQueries({ queryKey: ["forum-thread"] });
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

export const useCreateReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reply: { thread_id: string; content: string; author_name: string }) => {
      const { data, error } = await supabase.from("forum_replies").insert([{ ...reply, is_active: false, is_spam: false }]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thread-replies"] });
    },
  });
};

export const useToggleLike = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ replyId, userId, isLiked }: { replyId: string; userId: string; isLiked: boolean }) => {
      if (isLiked) {
        await supabase.from("forum_reply_likes").delete().eq("reply_id", replyId).eq("user_id", userId);
      } else {
        await supabase.from("forum_reply_likes").insert([{ reply_id: replyId, user_id: userId }]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thread-replies"] });
    },
  });
};

// Utils
export const generateSlug = (text: string) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
};

// Placeholder Hooks für Kategorien-Management (da in useForum.ts referenziert)
export const useCreateCategory = () => { const qc = useQueryClient(); return useMutation({ mutationFn: async (c:any) => supabase.from("forum_categories").insert([c]), onSuccess: () => qc.invalidateQueries({ queryKey: ["forum-categories"] }) }) };
export const useUpdateCategory = () => { const qc = useQueryClient(); return useMutation({ mutationFn: async ({id, ...u}:any) => supabase.from("forum_categories").update(u).eq("id", id), onSuccess: () => qc.invalidateQueries({ queryKey: ["forum-categories"] }) }) };
export const useDeleteCategory = () => { const qc = useQueryClient(); return useMutation({ mutationFn: async (id:string) => supabase.from("forum_categories").delete().eq("id", id), onSuccess: () => qc.invalidateQueries({ queryKey: ["forum-categories"] }) }) };
export const useAllReplies = () => useQuery({ queryKey: ["forum-all-replies"], queryFn: async () => (await supabase.from("forum_replies").select("*")).data || [] });
export const useUpdateReply = () => { const qc = useQueryClient(); return useMutation({ mutationFn: async ({id, ...u}:any) => supabase.from("forum_replies").update(u).eq("id", id), onSuccess: () => qc.invalidateQueries({ queryKey: ["forum-all-replies"] }) }) };