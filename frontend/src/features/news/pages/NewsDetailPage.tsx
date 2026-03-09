import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { MotionReveal } from "@/components/animated/MotionReveal";
import { PageHero } from "@/components/site/primitives";
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
      <div className="min-h-screen bg-background-light page-shell-offset">
        <div className="page-container flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen bg-background-light page-shell-offset">
        <div className="page-container py-20 text-center">
          <h1 className="text-4xl text-slate-900">Noticia no encontrada</h1>
          <Link to="/noticias" className="mt-8 inline-block text-primary hover:underline">
            Volver a noticias
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background-light page-shell-offset">
      <PageHero
        eyebrow="Actualidad municipal"
        title={news.title}
        description={news.excerpt}
        tone="immersive"
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Noticias", href: "/noticias" },
          { label: news.title },
        ]}
        metrics={[
          { label: "Publicado", value: formatDateTime(news.publishedAt) },
          { label: "Categoria", value: news.category },
          { label: "Lectura", value: "Informacion municipal" },
        ]}
      />

      <article className="page-container py-10">
        <MotionReveal>
          <div className="card-surface overflow-hidden md:rounded-[2.5rem]">
            <div className="aspect-[16/7] overflow-hidden bg-slate-200">
              <img src={news.imageUrl} alt={news.title} className="h-full w-full object-cover" />
            </div>
            <div className="mx-auto max-w-4xl space-y-10 p-8 md:p-16">
              <p className="text-xl md:text-2xl font-medium leading-relaxed text-slate-700">{news.excerpt}</p>
              <div className="prose prose-slate prose-lg md:prose-xl max-w-none prose-a:text-primary hover:prose-a:text-secondary">
                {news.body ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: news.body.replace(/\n/g, "<br/>"),
                    }}
                  />
                ) : (
                  <p className="italic text-slate-400">Contenido completo no disponible.</p>
                )}
              </div>
            </div>
          </div>
        </MotionReveal>
      </article>
    </main>
  );
}

export default NewsDetailPage;
