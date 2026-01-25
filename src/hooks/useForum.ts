import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ForumThreadInput, ForumReplyInput } from "@/lib/schemas";
import { generateSlug } from "@/lib/seo";

export interface ForumThread {
  id: string;
  title: string;
  slug: string;
  content: string;
  author_name: string;
  category_id: string | null;
  is_pinned: boolean | null;
  is_active: boolean | null;
  is_locked: boolean | null;
  is_answered: boolean | null;
  admin_notes: string | null;
  view_count: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ForumReply {
  id: string;
  thread_id: string;
  content: string;
  author_name: string;
  is_active: boolean | null;
  is_spam: boolean | null;
  created_at: string | null;
}

export interface ForumThreadWithReplies extends ForumThread {
  replies: ForumReply[];
}

// =============================================
// PUBLIC HOOKS
// =============================================

/**
 * Fetch latest threads for homepage
 */
export function useLatestThreads(limit = 5) {
  return useQuery({
    queryKey: ["forum-threads", "latest", limit],
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

/**
 * Fetch single thread with replies
 */
export function useThread(slug: string) {
  return useQuery({
    queryKey: ["forum-threads", slug],
    queryFn: async () => {
      // First get the thread
      const { data: thread, error: threadError } = await supabase
        .from("forum_threads")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (threadError) throw threadError;

      // Then get replies
      const { data: replies, error: repliesError } = await supabase
        .from("forum_replies")
        .select("*")
        .eq("thread_id", thread.id)
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (repliesError) throw repliesError;

      return {
        ...thread,
        replies: replies || [],
      } as ForumThreadWithReplies;
    },
    enabled: !!slug,
  });
}

/**
 * Fetch replies for a thread
 */
export function useThreadReplies(threadId: string) {
  return useQuery({
    queryKey: ["forum-replies", threadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_replies")
        .select("*")
        .eq("thread_id", threadId)
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as ForumReply[];
    },
    enabled: !!threadId,
  });
}

/**
 * Create a new thread
 */
export function useCreateThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ForumThreadInput) => {
      const slug = generateSlug(input.title) + "-" + Date.now().toString(36);
      
      const { data, error } = await supabase
        .from("forum_threads")
        .insert({
          title: input.title.trim(),
          slug,
          content: input.content.trim(),
          author_name: input.author_name.trim(),
          category_id: input.category_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ForumThread;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
    },
  });
}

/**
 * Create a reply to a thread
 */
export function useCreateReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ForumReplyInput) => {
      const { data, error } = await supabase
        .from("forum_replies")
        .insert({
          thread_id: input.thread_id,
          content: input.content.trim(),
          author_name: input.author_name.trim(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as ForumReply;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["forum-replies", variables.thread_id] });
      queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
    },
  });
}

// =============================================
// ADMIN HOOKS
// =============================================

/**
 * Fetch ALL threads (including inactive) for admin
 */
export function useAllThreads() {
  return useQuery({
    queryKey: ["forum-threads", "admin", "all"],
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

/**
 * Fetch ALL replies for a thread (including inactive/spam) for admin
 */
export function useAllReplies(threadId: string) {
  return useQuery({
    queryKey: ["forum-replies", "admin", threadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_replies")
        .select("*")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as ForumReply[];
    },
    enabled: !!threadId,
  });
}

/**
 * Update a thread (admin)
 */
export function useUpdateThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ForumThread> & { id: string }) => {
      const { data, error } = await supabase
        .from("forum_threads")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as ForumThread;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
    },
  });
}

/**
 * Toggle pin status
 */
export function useTogglePinThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_pinned }: { id: string; is_pinned: boolean }) => {
      const { data, error } = await supabase
        .from("forum_threads")
        .update({ is_pinned })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as ForumThread;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
    },
  });
}

/**
 * Toggle lock status
 */
export function useToggleLockThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_locked }: { id: string; is_locked: boolean }) => {
      const { data, error } = await supabase
        .from("forum_threads")
        .update({ is_locked })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as ForumThread;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
    },
  });
}

/**
 * Toggle active status (soft delete)
 */
export function useToggleActiveThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from("forum_threads")
        .update({ is_active })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as ForumThread;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
    },
  });
}

/**
 * Delete thread permanently
 */
export function useDeleteThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // First delete all replies
      await supabase.from("forum_replies").delete().eq("thread_id", id);
      
      // Then delete thread
      const { error } = await supabase
        .from("forum_threads")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
      queryClient.invalidateQueries({ queryKey: ["forum-replies"] });
    },
  });
}

/**
 * Update a reply (admin)
 */
export function useUpdateReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ForumReply> & { id: string }) => {
      const { data, error } = await supabase
        .from("forum_replies")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as ForumReply;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-replies"] });
    },
  });
}

/**
 * Delete reply permanently
 */
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
    },
  });
}

/**
 * Toggle spam status on reply
 */
export function useToggleSpamReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_spam }: { id: string; is_spam: boolean }) => {
      const { data, error } = await supabase
        .from("forum_replies")
        .update({ is_spam, is_active: !is_spam })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as ForumReply;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-replies"] });
    },
  });
}
