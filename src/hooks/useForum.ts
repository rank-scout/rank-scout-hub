import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type ForumThread = Tables<"forum_threads">;
export type ForumReplyLike = Tables<"forum_reply_likes">;
export type ForumReply = Tables<"forum_replies">;
export type ForumCategory = Tables<"forum_categories">;

// ============ THREADS ============

export function useForumThreads() {
  return useQuery({
    queryKey: ["forum-threads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_threads")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as ForumThread[];
    },
  });
}

export function useForumThread(slug: string) {
  return useQuery({
    queryKey: ["forum-thread", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_threads")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      
      if (error) throw error;
      return data as ForumThread | null;
    },
    enabled: !!slug,
  });
}

export function useForumThreadById(id: string) {
  return useQuery({
    queryKey: ["forum-thread-id", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_threads")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      if (error) throw error;
      return data as ForumThread | null;
    },
    enabled: !!id,
  });
}

export function useLatestThreads(limit = 5) {
  return useQuery({
    queryKey: ["forum-threads-latest", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_threads")
        .select("*")
        .eq("is_active", true)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as ForumThread[];
    },
  });
}

export function useCreateThread() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (thread: TablesInsert<"forum_threads">) => {
      const { data, error } = await supabase
        .from("forum_threads")
        .insert(thread)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
    },
  });
}

export function useUpdateThread() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"forum_threads"> & { id: string }) => {
      const { data, error } = await supabase
        .from("forum_threads")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
    },
  });
}

export function useDeleteThread() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("forum_threads")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
    },
  });
}

// ============ REPLIES ============

export type ForumReplyWithLikes = Tables<"forum_replies"> & {
  like_count: number;
  user_has_liked: boolean;
};

export function useThreadReplies(threadId: string, userId?: string) {
  return useQuery({
    queryKey: ["forum-replies", threadId, userId],
    queryFn: async () => {
      // Get replies
      const { data: replies, error } = await supabase
        .from("forum_replies")
        .select("*")
        .eq("thread_id", threadId)
        .eq("is_active", true)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      
      // Get like counts for each reply
      const replyIds = replies?.map(r => r.id) || [];
      
      if (replyIds.length === 0) {
        return [] as ForumReplyWithLikes[];
      }
      
      // Get all likes for these replies
      const { data: likes, error: likesError } = await supabase
        .from("forum_reply_likes")
        .select("reply_id, user_id")
        .in("reply_id", replyIds);
      
      if (likesError) throw likesError;
      
      // Calculate like counts and user's likes
      const likeCounts = new Map<string, number>();
      const userLikes = new Set<string>();
      
      likes?.forEach(like => {
        likeCounts.set(like.reply_id, (likeCounts.get(like.reply_id) || 0) + 1);
        if (userId && like.user_id === userId) {
          userLikes.add(like.reply_id);
        }
      });
      
      return replies.map(reply => ({
        ...reply,
        like_count: likeCounts.get(reply.id) || 0,
        user_has_liked: userLikes.has(reply.id),
      })) as ForumReplyWithLikes[];
    },
    enabled: !!threadId,
  });
}

export function useAllReplies() {
  return useQuery({
    queryKey: ["forum-replies-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_replies")
        .select("*, forum_threads(title, slug)")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateReply() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reply: TablesInsert<"forum_replies">) => {
      const { data, error } = await supabase
        .from("forum_replies")
        .insert(reply)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["forum-replies", variables.thread_id] });
    },
  });
}

export function useUpdateReply() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"forum_replies"> & { id: string }) => {
      const { data, error } = await supabase
        .from("forum_replies")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-replies"] });
      queryClient.invalidateQueries({ queryKey: ["forum-replies-all"] });
    },
  });
}

export function useDeleteReply() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("forum_replies")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-replies"] });
      queryClient.invalidateQueries({ queryKey: ["forum-replies-all"] });
    },
  });
}

// ============ CATEGORIES ============

export function useForumCategories(includeInactive = false) {
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
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (category: TablesInsert<"forum_categories">) => {
      const { data, error } = await supabase
        .from("forum_categories")
        .insert(category)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"forum_categories"> & { id: string }) => {
      const { data, error } = await supabase
        .from("forum_categories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("forum_categories")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-categories"] });
    },
  });
}

// ============ VIEW COUNT ============

export function useIncrementViewCount() {
  return useMutation({
    mutationFn: async (threadId: string) => {
      // Get current view count and increment
      const { data: thread } = await supabase
        .from("forum_threads")
        .select("view_count")
        .eq("id", threadId)
        .maybeSingle();
      
      const newCount = (thread?.view_count || 0) + 1;
      
      await supabase
        .from("forum_threads")
        .update({ view_count: newCount })
        .eq("id", threadId);
    },
  });
}

// ============ LIKES ============

export function useToggleLike() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ replyId, userId, isLiked }: { replyId: string; userId: string; isLiked: boolean }) => {
      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from("forum_reply_likes")
          .delete()
          .eq("reply_id", replyId)
          .eq("user_id", userId);
        
        if (error) throw error;
      } else {
        // Add like
        const { error } = await supabase
          .from("forum_reply_likes")
          .insert({ reply_id: replyId, user_id: userId });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-replies"] });
    },
  });
}

// Helper: Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}
