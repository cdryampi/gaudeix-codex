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
    Info,
} from "lucide-react";
import { Link } from "react-router-dom";

export const RoadmapPage = () => {
    const [filters, setFilters] = useState<RouteFilters>({
        is_published: true,
    });
    const [selectedRouteSlug, setSelectedRouteSlug] = useState<string | null>(
        null,
    );
    const [hoveredCheckpointId, setHoveredCheckpointId] = useState<number | null>(
        null,
    );

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

    // Fetch itinerary for selected route
    const { data: itinerary } = useQuery({
        queryKey: ["route-itinerary", selectedRouteSlug],
        queryFn: () =>
            selectedRouteSlug ? getRouteItinerary(selectedRouteSlug) : null,
        enabled: !!selectedRouteSlug,
    });

    // Calculate Map center or bounds
    const mapCenter = useMemo(() => {
        if (itinerary?.bounds) {
            return {
                lat: (itinerary.bounds.north + itinerary.bounds.south) / 2,
                lng: (itinerary.bounds.east + itinerary.bounds.west) / 2,
            };
        }
        return DEFAULT_CENTER;
    }, [itinerary]);

    // Derived polyline path from checkpoints
    const polylinePath = useMemo(() => {
        if (!itinerary?.checkpoints) return [];
        return itinerary.checkpoints
            .filter((cp) => cp.lat !== null && cp.lng !== null)
            .map((cp) => ({ lat: cp.lat as number, lng: cp.lng as number }));
    }, [itinerary]);

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
                                    const isActive = selectedRouteSlug === route.slug;
                                    const diffConfig = getDifficultyConfig(route.difficulty);

                                    return (
                                        <button
                                            key={route.id}
                                            onClick={() => setSelectedRouteSlug(route.slug)}
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
                            zoom={itinerary ? 13 : 11}
                            options={{
                                mapTypeControl: false,
                                streetViewControl: false,
                                fullscreenControl: true,
                            }}
                        >
                            {window.google && itinerary && (
                                <>
                                    {/* Polyline connecting checkpoints */}
                                    {polylinePath.length > 1 && (
                                        <PolylineF
                                            path={polylinePath}
                                            options={{
                                                strokeColor: "#00f2ea",
                                                strokeOpacity: 0.8,
                                                strokeWeight: 4,
                                            }}
                                        />
                                    )}

                                    {/* Marker for each active checkpoint */}
                                    {itinerary.checkpoints.map(
                                        (cp) =>
                                            cp.lat &&
                                            cp.lng && (
                                                <MarkerF
                                                    key={cp.id}
                                                    position={{ lat: cp.lat, lng: cp.lng }}
                                                    onMouseOver={() => setHoveredCheckpointId(cp.id)}
                                                    onMouseOut={() => setHoveredCheckpointId(null)}
                                                    icon={{
                                                        path: google.maps.SymbolPath.CIRCLE,
                                                        fillColor:
                                                            hoveredCheckpointId === cp.id
                                                                ? "#00f2ea"
                                                                : "#0f172a",
                                                        fillOpacity: 1,
                                                        strokeColor: "#ffffff",
                                                        strokeWeight: 2,
                                                        scale: hoveredCheckpointId === cp.id ? 8 : 6,
                                                    }}
                                                />
                                            ),
                                    )}

                                    {/* InfoWindow for hovered checkpoint */}
                                    {hoveredCheckpointId && (
                                        <InfoWindowF
                                            position={{
                                                lat:
                                                    itinerary.checkpoints.find(
                                                        (c) => c.id === hoveredCheckpointId,
                                                    )?.lat || 0,
                                                lng:
                                                    itinerary.checkpoints.find(
                                                        (c) => c.id === hoveredCheckpointId,
                                                    )?.lng || 0,
                                            }}
                                            options={{ disableAutoPan: true }}
                                        >
                                            <div className="p-2 min-w-[150px]">
                                                <p className="font-bold text-slate-900 text-sm">
                                                    {
                                                        itinerary.checkpoints.find(
                                                            (c) => c.id === hoveredCheckpointId,
                                                        )?.title
                                                    }
                                                </p>
                                            </div>
                                        </InfoWindowF>
                                    )}
                                </>
                            )}
                        </MapContainer>

                        {!selectedRouteSlug && (
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

                    {/* Itinerary Bottom Panel */}
                    {itinerary && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex-shrink-0 max-h-[30vh] overflow-y-auto">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                        {itinerary.route.title}
                                    </h2>
                                    <div className="flex items-center gap-4 mt-2 text-sm font-semibold text-slate-500">
                                        {itinerary.summary.distance_km && (
                                            <span className="flex items-center gap-1.5">
                                                <Mountain className="h-4 w-4" />
                                                {Number(itinerary.summary.distance_km).toFixed(1)} km
                                            </span>
                                        )}
                                        {itinerary.summary.duration_minutes && (
                                            <span className="flex items-center gap-1.5">
                                                <Timer className="h-4 w-4" />
                                                {itinerary.summary.duration_minutes} min
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <Link
                                    to={`/rutas/${itinerary.route.slug}`}
                                    className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2"
                                >
                                    Ver Ficha Completa
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>

                            {itinerary.checkpoints && itinerary.checkpoints.length > 0 ? (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-primary">
                                        Itinerario ({itinerary.checkpoints.length} puntos)
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {itinerary.checkpoints.map((cp) => (
                                            <div
                                                key={cp.id}
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
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-slate-400 p-4 rounded-2xl border border-dashed border-slate-200">
                                    <Info className="h-5 w-5" />
                                    <p className="text-sm font-medium">Esta ruta no tiene itinerario o puntos de paso configurados aún.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};
