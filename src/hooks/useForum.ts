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
  is_pinned: boolean;
  is_active: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface ForumReply {
  id: string;
  thread_id: string;
  content: string;
  author_name: string;
  is_active: boolean;
  created_at: string;
}

export interface ForumThreadWithReplies extends ForumThread {
  replies: ForumReply[];
}

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
