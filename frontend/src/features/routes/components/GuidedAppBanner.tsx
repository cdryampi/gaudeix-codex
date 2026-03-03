import React from "react";
import { ExternalLink } from "lucide-react";

interface GuidedAppBannerProps {
    iosUrl?: string | null;
    androidUrl?: string | null;
    title?: string;
    className?: string;
}

export const GuidedAppBanner: React.FC<GuidedAppBannerProps> = ({
    iosUrl,
    androidUrl,
    title = "Ruta guiada e interpretada",
    className = "",
}) => {
    // If neither URL is provided, we don't render the banner.
    if (!iosUrl && !androidUrl) return null;

    return (
        <div
            className={`relative overflow-hidden bg-gradient-to-br from-amber-400/20 via-amber-200/40 to-yellow-500/10 dark:from-amber-900/30 dark:to-yellow-800/20 border border-amber-300/50 dark:border-amber-700/50 rounded-2xl p-5 md:p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm ${className}`}
        >
            {/* Visual Decoration Overlay */}
            <div className="absolute top-0 right-0 -m-8 opacity-10 pointer-events-none">
                <svg
                    width="120"
                    height="120"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-amber-600"
                >
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
            </div>

            <div className="flex-1 text-center sm:text-left z-10">
                <div className="inline-flex items-center gap-2 mb-2">
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-amber-600 dark:text-amber-500"
                    >
                        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                    </svg>
                    <h3 className="font-bold text-lg text-amber-900 dark:text-amber-100">
                        {title}
                    </h3>
                </div>
                <p className="text-sm text-amber-800/80 dark:text-amber-200/80 max-w-md">
                    Descarrega l'app gratuïta per tenir tota la informació sense connexió,
                    seguiment GPS en temps real i descoberta de l'entorn interpretada.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto z-10">
                {iosUrl && (
                    <a
                        href={iosUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-center gap-2.5 px-6 py-2.5 bg-zinc-900 hover:bg-black text-white rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap"
                    >
                        <svg
                            className="w-5 h-5 fill-current"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.701z" />
                        </svg>
                        <div className="text-left leading-tight">
                            <div className="text-[10px] text-zinc-300 opacity-90 font-medium">
                                Disponible a
                            </div>
                            <div className="text-[15px] font-semibold -mt-0.5">App Store</div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 opacity-0 -ml-2 group-hover:opacity-50 group-hover:ml-0 transition-all ml-1" />
                    </a>
                )}

                {androidUrl && (
                    <a
                        href={androidUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-center gap-2.5 px-6 py-2.5 bg-white text-zinc-900 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-xl transition-all shadow-sm hover:shadow hover:-translate-y-0.5 whitespace-nowrap"
                    >
                        <svg
                            className="w-5 h-5 flex-shrink-0"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M17.523 15.341l-2.469-2.274-9.358 8.441a2.126 2.126 0 001.385.127l10.442-5.464c.068-.035.132-.075.193-.119l-.193-.711zM2.872 2.766a2.14 2.14 0 00-.51 1.488v15.228a2.123 2.123 0 00.57 1.493l9.809-8.847-9.869-9.362zM3.468 2.016l10.456 5.465 2.116-2.007L13.141 3.26a2.133 2.133 0 00-2.887-.905L3.468 2.016zM17.152 7.82l4.135 2.162c1.3.68 1.3 1.787 0 2.467l-2.923 1.528-2.616-2.408 1.404-1.332v-2.417z"
                                fill="#444"
                            />
                            <path d="M17.152 7.82L14.041 10.74v2.417l2.616 2.408 2.923-1.528c1.3-.68 1.3-1.787 0-2.467l-4.135-2.162z" fill="#4B91F7" />
                            <path d="M3.468 2.016l6.786.339 2.887.905 2.899 2.554-14.572-3.798M2.872 2.766l9.869 9.362 1.3 1.233-14.557-3.799.55-15.228 1.229 1.2M17.523 15.341l.193.711-.193.119-10.442 5.464a2.126 2.126 0 01-1.385-.127l9.358-8.441 2.469 2.274z" fill="#FFC107" />
                            <path d="M2.362 4.254l10.325 8.871-9.809 8.847a2.123 2.123 0 01-.57-1.493V4.254h.054z" fill="#00A65B" />
                            <path d="M12.687 13.125l4.836-2.22 1.404-1.332-15.459-6.807 9.219 10.359z" fill="#FF3333" />
                        </svg>
                        <div className="text-left leading-tight">
                            <div className="text-[10px] text-zinc-500 font-medium tracking-wide">
                                DISPONIBLE A
                            </div>
                            <div className="text-[15px] font-bold text-zinc-800 -mt-0.5">
                                Google Play
                            </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 opacity-0 -ml-2 group-hover:opacity-50 group-hover:ml-0 transition-all text-zinc-400 ml-1" />
                    </a>
                )}
            </div>
        </div>
    );
};
