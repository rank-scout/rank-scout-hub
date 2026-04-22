import { Link } from "react-router-dom";
import { Eye, MessageCircle, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRelatedThreads } from "@/hooks/useForum";

interface RelatedForumThreadsProps {
  categoryId?: string | null;
  currentThreadId?: string | null;
  title?: string;
  description?: string;
  className?: string;
}

export function RelatedForumThreads({
  categoryId,
  currentThreadId,
  title = "Passende Ratgeber aus dem Forum",
  description = "Aktuelle Diskussionen und redaktionelle Ratgeber aus derselben Themenwelt.",
  className = "",
}: RelatedForumThreadsProps) {
  const { data: threads, isLoading } = useRelatedThreads({
    categoryId: categoryId || null,
    currentThreadId: currentThreadId || null,
    limit: 3,
  });

  if (!categoryId) return null;

  if (isLoading) {
    return (
      <section className={`py-12 md:py-14 ${className}`.trim()} aria-labelledby="related-forum-threads-heading">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-7 max-w-3xl">
            <Skeleton className="mb-4 h-5 w-40 rounded-full" />
            <Skeleton className="mb-3 h-8 w-80" />
            <Skeleton className="h-4 w-full max-w-2xl" />
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <Skeleton className="mb-4 h-5 w-24 rounded-full" />
                <Skeleton className="mb-4 h-14 w-full" />
                <Skeleton className="mb-5 h-10 w-full" />
                <div className="mb-5 flex items-center gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!threads || threads.length === 0) return null;

  return (
    <section className={`py-12 md:py-14 ${className}`.trim()} aria-labelledby="related-forum-threads-heading">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-7 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-orange-600 shadow-sm">
              <MessageCircle className="h-3.5 w-3.5" /> Forum & Ratgeber
            </span>
            <h2 id="related-forum-threads-heading" className="mt-4 text-2xl font-bold tracking-tight text-gray-950 md:text-3xl">
              {title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 md:text-base">{description}</p>
          </div>
          <div className="hidden md:flex">
            <Link
              to="/forum"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#0E1F53] shadow-sm transition-all duration-300 hover:border-orange-200 hover:bg-orange-50"
            >
              Alle Diskussionen ansehen <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 xl:gap-6">
          {threads.map((thread) => (
            <Link
              key={thread.id}
              to={`/forum/${thread.slug}`}
              className="group flex h-full flex-col rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-100/60"
            >
              <div className="mb-4 inline-flex w-fit items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-600">
                <MessageCircle className="h-3 w-3" /> Forum
              </div>
              <h3 className="line-clamp-2 min-h-[3.5rem] text-lg font-bold leading-tight text-slate-900 transition-colors group-hover:text-primary">
                {thread.title}
              </h3>
              <p className="mt-3 line-clamp-3 min-h-[3.75rem] flex-grow text-sm leading-6 text-slate-500">
                {thread.seo_description || "Passender Ratgeber aus dem Rank-Scout Forum mit kompaktem Überblick und weiterführenden Informationen."}
              </p>
              <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-orange-500" />
                  {thread.views || thread.view_count || 0} Aufrufe
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5 text-orange-500" />
                  {thread.reply_count || 0} Antworten
                </span>
              </div>
              <div className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#0E1F53] transition-colors group-hover:text-orange-500">
                Zum Ratgeber <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center md:hidden">
          <Link
            to="/forum"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#0E1F53] shadow-sm transition-all duration-300 hover:border-orange-200 hover:bg-orange-50"
          >
            Alle Diskussionen ansehen <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
