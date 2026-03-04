import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MarkerF, PolylineF, InfoWindowF } from "@react-google-maps/api";
import { MapContainer, DEFAULT_CENTER } from "@/components/site/MapContainer";
import { getRoutes, getRouteItinerary } from "../api";
import { Route, RouteFilters, RouteType, RouteDifficulty } from "../types";
import { getDifficultyConfig } from "../constants";
import {
    ChevronRight,
    Navigation,
    Mountain,
    Timer,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";

export const RoadmapPage = () => {
    const [filters, setFilters] = useState<RouteFilters>({
        is_published: true,
    });
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedRouteSlugs = useMemo(() => {
        const routesParam = searchParams.get("routes");
        return routesParam ? routesParam.split(',').filter(Boolean) : [];
    }, [searchParams]);

    const [hoveredCheckpointId, setHoveredCheckpointId] = useState<number | null>(null);

    const toggleRouteSelection = (slug: string) => {
        setSearchParams((prev) => {
            const current = prev.get("routes")?.split(',').filter(Boolean) || [];
            let next: string[];
            if (current.includes(slug)) {
                next = current.filter(s => s !== slug);
            } else {
                next = [...current, slug];
            }
            if (next.length > 0) {
                prev.set("routes", next.join(','));
            } else {
                prev.delete("routes");
            }
            return prev;
        });
    };

    // Fetch list of routes matching filters
    const { data: routesResponse, isLoading: isLoadingRoutes } = useQuery({
        queryKey: ["routes", filters],
        queryFn: () => getRoutes(filters as RouteFilters & Record<string, unknown>),
    });

    const routes = useMemo(() => {
        if (!routesResponse) return [];
        return Array.isArray(routesResponse)
            ? routesResponse
            : routesResponse.results || [];
    }, [routesResponse]);

    // Fetch itineraries for all selected routes
    const itineraryQueries = useQueries({
        queries: selectedRouteSlugs.map((slug) => ({
            queryKey: ["route-itinerary", slug],
            queryFn: () => getRouteItinerary(slug),
            staleTime: 5 * 60 * 1000,
        }))
    });

    const itineraries = useMemo(() => {
        return itineraryQueries.map(q => q.data).filter(Boolean) as any[];
    }, [itineraryQueries]);

    // Calculate Map center or bounds across all itineraries
    const mapBounds = useMemo(() => {
        if (itineraries.length === 0) return undefined;
        let north = -90, south = 90, east = -180, west = 180;
        let hasBounds = false;

        itineraries.forEach(it => {
            if (it.bounds) {
                hasBounds = true;
                north = Math.max(north, it.bounds.north);
                south = Math.min(south, it.bounds.south);
                east = Math.max(east, it.bounds.east);
                west = Math.min(west, it.bounds.west);
            }
        });

        return hasBounds ? { north, south, east, west } : undefined;
    }, [itineraries]);

    const mapCenter = useMemo(() => {
        if (mapBounds) {
            return {
                lat: (mapBounds.north + mapBounds.south) / 2,
                lng: (mapBounds.east + mapBounds.west) / 2,
            };
        }
        return DEFAULT_CENTER;
    }, [mapBounds]);

    // Calculate totals
    const totals = useMemo(() => {
        let distance = 0;
        let duration = 0;
        let stops = 0;
        itineraries.forEach(it => {
            distance += Number(it.summary?.distance_km || 0);
            duration += Number(it.summary?.duration_minutes || 0);
            stops += Number(it.summary?.checkpoints_count || 0);
        });
        return { distance, duration, stops };
    }, [itineraries]);

    return (
        <main className="min-h-screen bg-slate-50 pt-24 pb-12 flex flex-col h-screen">
            <div className="container mx-auto px-6 h-full flex flex-col lg:flex-row gap-6">
                {/* Sidebar: Filters & Route List */}
                <aside className="w-full lg:w-1/3 flex flex-col gap-6 max-h-[40vh] lg:max-h-full overflow-hidden shrink-0">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex-shrink-0">
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6">
                            Roadmap de Rutas
                        </h1>

                        {/* Filters */}
                        <div className="flex flex-col gap-4">
                            <select
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none text-sm font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all"
                                value={filters.route_type || "all"}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        route_type:
                                            e.target.value === "all" ? undefined : (e.target.value as RouteType),
                                    }))
                                }
                            >
                                <option value="all">Tipos (Todos)</option>
                                <option value="walking">A pie</option>
                                <option value="cycling">Bicicleta</option>
                                <option value="mixed">Mixta</option>
                            </select>

                            <select
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none text-sm font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all"
                                value={filters.difficulty || "all"}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        difficulty:
                                            e.target.value === "all" ? undefined : (e.target.value as RouteDifficulty),
                                    }))
                                }
                            >
                                <option value="all">Dificultad (Todas)</option>
                                <option value="easy">Fácil</option>
                                <option value="moderate">Moderada</option>
                                <option value="difficult">Difícil</option>
                                <option value="expert">Experta</option>
                            </select>
                        </div>
                    </div>

                    {/* Route List */}
                    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex-1 flex flex-col">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                                {routes.length} Rutas disponibles
                            </span>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2 space-y-2">
                            {isLoadingRoutes ? (
                                <div className="p-8 text-center text-slate-400 font-medium">
                                    Cargando rutas...
                                </div>
                            ) : routes.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 font-medium">
                                    No hay rutas que coincidan con los filtros.
                                </div>
                            ) : (
                                routes.map((route: Route) => {
                                    const isActive = selectedRouteSlugs.includes(route.slug);
                                    const diffConfig = getDifficultyConfig(route.difficulty);

                                    return (
                                        <button
                                            key={route.id}
                                            onClick={() => toggleRouteSelection(route.slug)}
                                            className={`w-full text-left p-4 rounded-2xl transition-all ${isActive
                                                ? "bg-slate-900 text-white shadow-lg"
                                                : "bg-white hover:bg-slate-50 text-slate-900 border border-transparent hover:border-slate-100"
                                                }`}
                                        >
                                            <h3 className="font-bold text-sm tracking-tight mb-2">
                                                {route.title}
                                            </h3>
                                            <div className="flex items-center gap-3 text-xs">
                                                <span
                                                    className={`font-semibold ${isActive ? "text-white/80" : diffConfig.textColor}`}
                                                >
                                                    {diffConfig.label}
                                                </span>
                                                {route.distance_km && (
                                                    <span
                                                        className={
                                                            isActive ? "text-white/60" : "text-slate-500"
                                                        }
                                                    >
                                                        {Number(route.distance_km).toFixed(1)} km
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </aside>

                {/* Main Area: Map & Itinerary Details */}
                <div className="w-full lg:w-2/3 flex flex-col gap-6 h-full min-h-[50vh]">
                    {/* Map */}
                    <div className="flex-1 bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 relative group min-h-[300px]">
                        <MapContainer
                            className="w-full h-full"
                            center={mapCenter}
                            zoom={itineraries.length > 0 ? 12 : 11}
                            options={{
                                mapTypeControl: false,
                                streetViewControl: false,
                                fullscreenControl: true,
                            }}
                        >
                            {window.google && itineraries.length > 0 && (
                                <>
                                    {itineraries.map((itinerary, idx) => {
                                        // Try using track_geojson first
                                        let paths: google.maps.LatLngLiteral[][] = [];
                                        if (itinerary.route.track_geojson) {
                                            const geo = itinerary.route.track_geojson;
                                            if (geo.type === "LineString" && geo.coordinates) {
                                                paths = [geo.coordinates.map((c: number[]) => ({ lat: c[1], lng: c[0] }))];
                                            } else if (geo.type === "MultiLineString" && geo.coordinates) {
                                                paths = geo.coordinates.map((seg: number[][]) => seg.map((c: number[]) => ({ lat: c[1], lng: c[0] })));
                                            }
                                        }

                                        // Fallback to checkpoints
                                        if (paths.length === 0 && itinerary.checkpoints) {
                                            const cpPath = itinerary.checkpoints
                                                .filter((cp: any) => cp.lat !== null && cp.lng !== null)
                                                .map((cp: any) => ({ lat: cp.lat as number, lng: cp.lng as number }));
                                            if (cpPath.length > 1) paths = [cpPath];
                                        }

                                        // Use distinct colors for different routes based on index
                                        const colors = ["#00f2ea", "#e8a317", "#ef4444", "#8b5cf6", "#10b981"];
                                        const routeColor = colors[idx % colors.length];

                                        return (
                                            <div key={`itinerary-${itinerary.route.slug}`}>
                                                {paths.map((path, pIdx) => (
                                                    <PolylineF
                                                        key={`poly-${idx}-${pIdx}`}
                                                        path={path}
                                                        options={{
                                                            strokeColor: routeColor,
                                                            strokeOpacity: 0.8,
                                                            strokeWeight: 4,
                                                        }}
                                                    />
                                                ))}

                                                {/* Checkpoint markers */}
                                                {itinerary.checkpoints.map((cp: any) =>
                                                    cp.lat && cp.lng && (
                                                        <MarkerF
                                                            key={`marker-${idx}-${cp.id}`}
                                                            position={{ lat: cp.lat, lng: cp.lng }}
                                                            onMouseOver={() => setHoveredCheckpointId(cp.id)}
                                                            onMouseOut={() => setHoveredCheckpointId(null)}
                                                            icon={{
                                                                path: google.maps.SymbolPath.CIRCLE,
                                                                fillColor: hoveredCheckpointId === cp.id ? routeColor : "#0f172a",
                                                                fillOpacity: 1,
                                                                strokeColor: "#ffffff",
                                                                strokeWeight: 2,
                                                                scale: hoveredCheckpointId === cp.id ? 8 : 6,
                                                            }}
                                                        />
                                                    )
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* Combined InfoWindow for hovered checkpoint */}
                                    {hoveredCheckpointId && (() => {
                                        // Find which checkpoint is hovered across all itineraries
                                        let hoveredCp: any = null;
                                        for (const it of itineraries) {
                                            const found = it.checkpoints.find((c: any) => c.id === hoveredCheckpointId);
                                            if (found) { hoveredCp = found; break; }
                                        }

                                        return hoveredCp?.lat && hoveredCp?.lng ? (
                                            <InfoWindowF
                                                position={{ lat: hoveredCp.lat, lng: hoveredCp.lng }}
                                                options={{ disableAutoPan: true }}
                                            >
                                                <div className="p-2 min-w-[150px]">
                                                    <p className="font-bold text-slate-900 text-sm">{hoveredCp.title}</p>
                                                    {hoveredCp.description && (
                                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{hoveredCp.description}</p>
                                                    )}
                                                </div>
                                            </InfoWindowF>
                                        ) : null;
                                    })()}
                                </>
                            )}
                        </MapContainer>

                        {selectedRouteSlugs.length === 0 && (
                            <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm flex items-center justify-center p-6 text-center">
                                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm">
                                    <Navigation className="h-12 w-12 text-primary mx-auto mb-4" />
                                    <h3 className="text-xl font-black text-slate-900 mb-2">Selecciona una Ruta</h3>
                                    <p className="text-sm text-slate-500">
                                        Elige una ruta en el panel lateral para visualizar su itinerario y puntos de paso en el mapa.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Itinerary Bottom Panel - Sum of metrics */}
                    {selectedRouteSlugs.length > 0 && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex-shrink-0 max-h-[30vh] overflow-y-auto">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                        Roadmap Seleccionado ({selectedRouteSlugs.length} rutas)
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm font-semibold text-slate-500">
                                        <span className="flex items-center gap-1.5">
                                            <Mountain className="h-4 w-4" />
                                            {totals.distance.toFixed(1)} km en total
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Timer className="h-4 w-4" />
                                            {totals.duration} min
                                        </span>
                                        <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg text-xs">
                                            {totals.stops} paradas
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert("¡Enlace copiado al portapapeles! Puedes compartir tu Roadmap.");
                                    }}
                                    className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-primary text-white text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2"
                                >
                                    Compartir Roadmap
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>

                            {/* List of stops/checkpoints across all selected routes */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-primary">
                                    Puntos de paso ({totals.stops} puntos)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {itineraries.map((itinerary, rIdx) => (
                                        itinerary.checkpoints.map((cp: any) => (
                                            <div
                                                key={`cp-${rIdx}-${cp.id}`}
                                                className="flex gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
                                                onMouseEnter={() => setHoveredCheckpointId(cp.id)}
                                                onMouseLeave={() => setHoveredCheckpointId(null)}
                                            >
                                                <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black shrink-0 group-hover:bg-primary transition-colors">
                                                    {cp.order}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm text-slate-900 truncate">
                                                        {cp.title}
                                                    </p>
                                                    {cp.description && (
                                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                            {cp.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};
