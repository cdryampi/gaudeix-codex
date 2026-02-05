/**
 * NewsDetailPage - Detail view for a specific news item.
 *
 * Refactored to use useQuery for consistency with other pages.
 * Moved from src/pages/ to src/features/news/pages/ for modular architecture.
 */
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { getNewsItem } from "@/features/news/api";
import { formatDateTime } from "@/features/agenda/dateUtils";

export function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const {
    data: news,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["news", "detail", slug],
    queryFn: () => getNewsItem(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header provided by MainLayout */}
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header provided by MainLayout */}
        <div className="container mx-auto px-6 pt-36 pb-24 text-center">
          <h1 className="text-4xl font-black uppercase text-slate-900">
            Noticia no encontrada
          </h1>
          <Link
            to="/noticias"
            className="mt-8 inline-block text-primary hover:underline"
          >
            Volver a noticias
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header provided by MainLayout with transparent overlay on hero */}

      <article>
        {/* Hero Image - Match EventDetailPage exactly */}
        <div className="relative h-[70vh] w-full overflow-hidden bg-slate-900 md:h-[85vh]">
          <img
            src={news.imageUrl}
            alt={news.title}
            className="h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />

          {/* Breadcrumb Overlay - TOP */}
          <div className="absolute top-0 left-0 right-0 z-10 pt-36 px-6 md:px-16">
            <div className="container mx-auto">
              <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                <Link to="/" className="hover:text-white transition-colors">
                  Inicio
                </Link>
                <ChevronRight className="h-3 w-3" />
                <Link
                  to="/noticias"
                  className="hover:text-white transition-colors"
                >
                  Noticias
                </Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-accent truncate max-w-[200px] md:max-w-none">
                  {news.title}
                </span>
              </nav>
            </div>
          </div>

          {/* Content Overlay - BOTTOM */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-16">
            <div className="container mx-auto">
              {/* Back Button */}
              <div className="flex items-center justify-between mb-8">
                <Link
                  to="/noticias"
                  className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-md transition-all hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a Noticias
                </Link>
              </div>

              {/* Category & Date Badges */}
              <div className="mb-6 flex flex-wrap gap-3">
                <span className="rounded-full bg-primary px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-primary/20">
                  {news.category}
                </span>
                <span className="rounded-full bg-white/10 px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm border border-white/10">
                  {formatDateTime(news.publishedAt)}
                </span>
              </div>

              {/* Title - Smaller for news (long titles) */}
              <h1 className="text-4xl font-black uppercase leading-[0.9] tracking-tighter text-white md:text-6xl lg:text-7xl max-w-4xl">
                {news.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 py-24 md:px-20">
          <div className="mx-auto max-w-3xl">
            <p className="mb-12 text-2xl font-medium leading-relaxed text-slate-500">
              {news.excerpt}
            </p>

            <div className="prose prose-lg prose-slate max-w-none">
              {news.body ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: news.body.replace(/\n/g, "<br/>"),
                  }}
                />
              ) : (
                <p className="italic text-slate-400">
                  Contenido completo no disponible.
                </p>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export default NewsDetailPage;
