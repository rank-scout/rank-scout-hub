import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

// Types
export type ForumThread = Tables<"forum_threads"> & {
  forum_categories?: { name: string; slug: string } | null;
};
export type ForumCategory = Tables<"forum_categories">;
export type ForumReply = Tables<"forum_replies">;

export type ForumReplyWithLikes = ForumReply & {
  like_count: number;
  user_has_liked: boolean;
};

// ============ UTILS ============
export function generateSlug(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Leerzeichen zu Bindestrichen
    .replace(/[^\w\-]+/g, '') // Alles außer Wortzeichen entfernen
    .replace(/\-\-+/g, '-')   // Mehrfache Bindestriche reduzieren
    .replace(/^-+/, '')       // Trim Start
    .replace(/-+$/, '');      // Trim End
}

// ============ PUBLIC THREADS ============

export function useForumThreads(categorySlug?: string | null) {
  return useQuery({
    queryKey: ["forum-threads", categorySlug],
    queryFn: async () => {
      let query = supabase
        .from("forum_threads")
        .select(`
          *,
          forum_categories (
            name,
            slug
          )
        `)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (categorySlug && categorySlug !== "all") {
        query = query.eq("forum_categories.slug", categorySlug);
      }
      
      const { data, error } = await query;
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
        .select(`
          *,
          forum_categories (
            id,
            name,
            slug
          )
        `)
        .eq("slug", slug)
        .maybeSingle();
      
      if (error) throw error;
      return data as ForumThread;
    },
    enabled: !!slug,
  });
}

export function useLatestThreads(limit: number = 5) {
  return useQuery({
    queryKey: ["latest-threads", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_threads")
        .select(`
          *,
          forum_categories (
            name,
            slug
          )
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as ForumThread[];
    },
  });
}

// ============ ADMIN ACTIONS (DIE FEHLTEN!) ============

export function useCreateThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (threadData: any) => {
      const { error } = await supabase.from("forum_threads").insert(threadData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
      toast.success("Beitrag erstellt");
    },
    onError: (err) => {
      console.error(err);
      toast.error("Fehler beim Erstellen");
    }
  });
}

export function useUpdateThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<ForumThread>) => {
      const { error } = await supabase.from("forum_threads").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
      queryClient.invalidateQueries({ queryKey: ["forum-thread"] });
    },
  });
}

export function useDeleteThread() {
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
}

// ============ CATEGORIES (ADMIN & PUBLIC) ============

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("forum_categories").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<ForumCategory>) => {
      const { error } = await supabase.from("forum_categories").update(data).eq("id", id);
      if (error) throw error;
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
      const { error } = await supabase.from("forum_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-categories"] });
    },
  });
}

export function useForumCategories(includeInactive = false) {
  return useQuery({
    queryKey: ["forum-categories", includeInactive],
    queryFn: async () => {
      let query = supabase
        .from("forum_categories")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ForumCategory[];
    },
  });
}

// ============ REPLIES (PUBLIC & ADMIN) ============

export function useThreadReplies(threadId: string, currentUserId?: string) {
  return useQuery({
    queryKey: ["forum-replies", threadId, currentUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_replies")
        .select(`
          *,
          forum_reply_likes (user_id)
        `)
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return data.map((reply: any) => ({
        ...reply,
        like_count: reply.forum_reply_likes?.length || 0,
        user_has_liked: currentUserId 
          ? reply.forum_reply_likes?.some((like: any) => like.user_id === currentUserId)
          : false,
      })) as ForumReplyWithLikes[];
    },
    enabled: !!threadId,
  });
}

// WICHTIG: Das hier wird vom Admin-Bereich benötigt!
export function useAllReplies() {
  return useQuery({
    queryKey: ["all-replies"],
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
}

export function useCreateReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ thread_id, author_name, content }: any) => {
      const { error } = await supabase.from("forum_replies").insert({
        thread_id,
        author_name,
        content,
      });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["forum-replies", variables.thread_id] });
      toast.success("Kommentar gesendet!");
    },
    onError: (err) => {
      console.error(err);
      toast.error("Fehler beim Senden");
    }
  });
}

export function useUpdateReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<ForumReply>) => {
      const { error } = await supabase.from("forum_replies").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-replies"] });
      queryClient.invalidateQueries({ queryKey: ["all-replies"] });
    },
  });
}

// ============ INTERACTIONS ============

export function useIncrementViewCount() {
  return useMutation({
    mutationFn: async (threadId: string) => {
      // Versuch RPC, Fallback auf Update
      const { error } = await supabase.rpc('increment_view_count', { row_id: threadId });
      if (error) {
         const { data: t } = await supabase.from("forum_threads").select("view_count").eq("id", threadId).single();
         if (t) {
            await supabase.from("forum_threads").update({ view_count: (t.view_count || 0) + 1 }).eq("id", threadId);
         }
      }
    },
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ replyId, userId, isLiked }: { replyId: string; userId: string; isLiked: boolean }) => {
      if (isLiked) {
        const { error } = await supabase.from("forum_reply_likes").delete().eq("reply_id", replyId).eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("forum_reply_likes").insert({ reply_id: replyId, user_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-replies"] });
    },
  });
}