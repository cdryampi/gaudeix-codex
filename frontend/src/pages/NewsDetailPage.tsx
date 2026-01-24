import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getNewsItem } from "@/features/news/api";
import type { NewsItem } from "@/features/news/types";
import { formatDateTime } from "@/features/agenda/dateUtils";

export default function NewsDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const [news, setNews] = useState<NewsItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            setLoading(true);
            getNewsItem(slug)
                .then(setNews)
                .finally(() => setLoading(false));
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <SiteHeader />
                <div className="flex h-[50vh] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            </div>
        );
    }

    if (!news) {
        return (
            <div className="min-h-screen bg-white">
                <SiteHeader />
                <div className="container mx-auto px-6 py-24 text-center">
                    <h1 className="text-4xl font-black uppercase text-slate-900">Noticia no encontrada</h1>
                    <Link to="/" className="mt-8 inline-block text-primary hover:underline">
                        Volver al inicio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-slate-900">
            <SiteHeader />

            <article>
                {/* Header Image */}
                <div className="relative h-[60vh] w-full overflow-hidden bg-slate-900">
                    <img
                        src={news.imageUrl}
                        alt={news.title}
                        className="h-full w-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                    <div className="absolute bottom-0 left-0 w-full p-6 md:p-20">
                        <div className="container mx-auto">
                            <Link to="/#noticias" className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/80 hover:text-white">
                                <ArrowLeft className="h-4 w-4" />
                                Volver
                            </Link>

                            <div className="mb-6 flex flex-wrap gap-6 text-sm font-bold uppercase tracking-widest text-white/60">
                                <span className="flex items-center gap-2">
                                    <Tag className="h-4 w-4 text-primary" />
                                    {news.category}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    {formatDateTime(news.publishedAt)}
                                </span>
                            </div>

                            <h1 className="max-w-4xl text-4xl font-black uppercase leading-none tracking-tighter text-white md:text-6xl lg:text-7xl">
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
                                <div dangerouslySetInnerHTML={{ __html: news.body.replace(/\n/g, '<br/>') }} />
                            ) : (
                                <p className="italic text-slate-400">Contenido completo no disponible.</p>
                            )}
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}
