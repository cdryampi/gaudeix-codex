import React, { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, MapPin } from "lucide-react";
import { Place } from "@/features/places/types";
import { CreateRouteDTO } from "../types";

type RoutePointsEditorProps = {
    form: CreateRouteDTO;
    setForm: React.Dispatch<React.SetStateAction<CreateRouteDTO>>;
    places: Place[];
    googleMapsApiKey: string;
};

// Extracted bounds fit component
const FitBounds = ({ points }: { points: { lat: number; lng: number }[] }) => {
    const map = useMap();
    useEffect(() => {
        if (!map || points.length === 0) return;
        const bounds = new google.maps.LatLngBounds();
        points.forEach((p) => bounds.extend(p));
        map.fitBounds(bounds, { padding: 40 });
    }, [map, points]);
    return null;
};

export const RoutePointsEditor: React.FC<RoutePointsEditorProps> = ({ form, setForm, places, googleMapsApiKey }) => {
    const [activeItem, setActiveItem] = useState<{ type: 'waypoint' | 'checkpoint', index: number } | null>(null);

    const waypoints = form.waypoints_input || [];
    const checkpoints = form.checkpoints_input || [];

    // Generate map points for bounds and markers
    const mapPoints: { lat: number; lng: number; title: string; type: 'waypoint' | 'checkpoint'; idx: number }[] = [];

    waypoints.forEach((wp, idx) => {
        const place = places.find(p => p.id === wp.place_id);
        if (place?.latitude && place?.longitude) {
            mapPoints.push({ lat: place.latitude, lng: place.longitude, title: place.title, type: 'waypoint', idx });
        }
    });

    checkpoints.forEach((cp, idx) => {
        if (cp.latitude && cp.longitude) {
            mapPoints.push({ lat: cp.latitude, lng: cp.longitude, title: cp.title || `Checkpoint ${idx + 1}`, type: 'checkpoint', idx });
        }
    });

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        // Add new checkpoint
        const current = [...checkpoints];
        setForm(prev => ({
            ...prev,
            checkpoints_input: [
                ...current,
                {
                    order: current.length + 1,
                    title: `Nuevo Checkpoint`,
                    description: "",
                    latitude: lat,
                    longitude: lng,
                    is_active: true
                }
            ]
        }));
    };

    const updateCheckpointPosition = (index: number, lat: number, lng: number) => {
        const current = [...checkpoints];
        current[index].latitude = lat;
        current[index].longitude = lng;
        setForm(prev => ({ ...prev, checkpoints_input: current }));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[600px]">
            {/* LEFT PANEL - Editor List */}
            <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-background">
                <div className="p-3 border-b bg-muted/30 flex justify-between items-center shrink-0">
                    <h3 className="font-semibold text-sm">Puntos de la Ruta</h3>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 text-[11px]"
                            onClick={() => {
                                setForm(prev => ({
                                    ...prev,
                                    waypoints_input: [
                                        ...waypoints,
                                        { place_id: 0, order: waypoints.length + 1, instructions: "", distance_from_previous_km: null }
                                    ]
                                }));
                            }}
                        >
                            + Waypoint (Lugar)
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 text-[11px]"
                            onClick={() => {
                                setForm(prev => ({
                                    ...prev,
                                    checkpoints_input: [
                                        ...checkpoints,
                                        { order: checkpoints.length + 1, title: "", description: "", latitude: null, longitude: null, is_active: true }
                                    ]
                                }));
                            }}
                        >
                            + Checkpoint (Libre)
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-6">
                    {/* Waypoints */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Waypoints (Lugares)</h4>
                        {waypoints.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">No hay waypoints.</p>
                        ) : (
                            waypoints.map((wp, index) => (
                                <div
                                    key={`wp-${index}`}
                                    className={`p-3 border rounded-lg relative group transition-colors ${activeItem?.type === 'waypoint' && activeItem.index === index ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'bg-slate-50/50 dark:bg-slate-900/20 hover:border-border/80'}`}
                                    onClick={() => setActiveItem({ type: 'waypoint', index })}
                                >
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" disabled={index === 0}
                                            onClick={(e) => { e.stopPropagation(); const c = [...waypoints]; if (index > 0) { [c[index - 1], c[index]] = [c[index], c[index - 1]]; c.forEach((x, i) => x.order = i + 1); setForm(p => ({ ...p, waypoints_input: c })); } }}
                                        >↑</Button>
                                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" disabled={index === waypoints.length - 1}
                                            onClick={(e) => { e.stopPropagation(); const c = [...waypoints]; if (index < c.length - 1) { [c[index + 1], c[index]] = [c[index], c[index + 1]]; c.forEach((x, i) => x.order = i + 1); setForm(p => ({ ...p, waypoints_input: c })); } }}
                                        >↓</Button>
                                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 hover:text-destructive"
                                            onClick={(e) => { e.stopPropagation(); const c = waypoints.filter((_, i) => i !== index); c.forEach((x, i) => x.order = i + 1); setForm(p => ({ ...p, waypoints_input: c })); if (activeItem?.index === index) setActiveItem(null); }}
                                        ><X className="h-3 w-3" /></Button>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3 pr-16">
                                        <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                                            W{index + 1}
                                        </div>
                                        <Select value={wp.place_id ? String(wp.place_id) : ""} onValueChange={(val) => { const c = [...waypoints]; c[index].place_id = Number(val); setForm(p => ({ ...p, waypoints_input: c })); }}>
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue placeholder="Selecciona lugar..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {places.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.title}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Input className="h-8 text-xs" type="number" step="0.01" placeholder="Dist. desde anterior (km)" value={wp.distance_from_previous_km ?? ""} onChange={(e) => { const c = [...waypoints]; c[index].distance_from_previous_km = e.target.value ? Number(e.target.value) : null; setForm(p => ({ ...p, waypoints_input: c })); }} />
                                        <Textarea className="min-h-[60px] text-xs resize-none" placeholder="Instrucciones ruta..." value={wp.instructions || ""} onChange={(e) => { const c = [...waypoints]; c[index].instructions = e.target.value; setForm(p => ({ ...p, waypoints_input: c })); }} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-4">Checkpoints (Puntos Libres)</h4>
                        {checkpoints.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">No hay checkpoints.</p>
                        ) : (
                            checkpoints.map((cp, index) => (
                                <div
                                    key={`cp-${index}`}
                                    className={`p-3 border rounded-lg relative group transition-colors ${activeItem?.type === 'checkpoint' && activeItem.index === index ? 'border-amber-500 ring-1 ring-amber-500/20 bg-amber-50/50 dark:bg-amber-900/10' : 'bg-slate-50/50 dark:bg-slate-900/20 hover:border-amber-200'}`}
                                    onClick={() => setActiveItem({ type: 'checkpoint', index })}
                                >
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" disabled={index === 0}
                                            onClick={(e) => { e.stopPropagation(); const c = [...checkpoints]; if (index > 0) { [c[index - 1], c[index]] = [c[index], c[index - 1]]; c.forEach((x, i) => x.order = i + 1); setForm(p => ({ ...p, checkpoints_input: c })); } }}
                                        >↑</Button>
                                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" disabled={index === checkpoints.length - 1}
                                            onClick={(e) => { e.stopPropagation(); const c = [...checkpoints]; if (index < c.length - 1) { [c[index + 1], c[index]] = [c[index], c[index + 1]]; c.forEach((x, i) => x.order = i + 1); setForm(p => ({ ...p, checkpoints_input: c })); } }}
                                        >↓</Button>
                                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 hover:text-destructive"
                                            onClick={(e) => { e.stopPropagation(); const c = checkpoints.filter((_, i) => i !== index); c.forEach((x, i) => x.order = i + 1); setForm(p => ({ ...p, checkpoints_input: c })); if (activeItem?.index === index) setActiveItem(null); }}
                                        ><X className="h-3 w-3" /></Button>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3 pr-16">
                                        <div className="h-6 w-6 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                            C{index + 1}
                                        </div>
                                        <Input className="h-8 text-xs font-semibold" placeholder="Título" value={cp.title} onChange={(e) => { const c = [...checkpoints]; c[index].title = e.target.value; setForm(p => ({ ...p, checkpoints_input: c })); }} />
                                    </div>
                                    <div className="space-y-2">
                                        <Textarea className="min-h-[40px] text-xs resize-none" placeholder="Descripción (Opcional)" value={cp.description || ""} onChange={(e) => { const c = [...checkpoints]; c[index].description = e.target.value; setForm(p => ({ ...p, checkpoints_input: c })); }} />
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input className="h-8 text-xs" type="number" step="0.000001" placeholder="Latitud" value={cp.latitude ?? ""} onChange={(e) => { const c = [...checkpoints]; c[index].latitude = e.target.value ? Number(e.target.value) : null; setForm(p => ({ ...p, checkpoints_input: c })); }} />
                                            <Input className="h-8 text-xs" type="number" step="0.000001" placeholder="Longitud" value={cp.longitude ?? ""} onChange={(e) => { const c = [...checkpoints]; c[index].longitude = e.target.value ? Number(e.target.value) : null; setForm(p => ({ ...p, checkpoints_input: c })); }} />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL - Map Editor */}
            <div className="border rounded-xl overflow-hidden bg-muted/20 relative">
                <APIProvider apiKey={googleMapsApiKey}>
                    <Map
                        defaultCenter={{ lat: 41.3851, lng: 2.1734 }}
                        defaultZoom={11}
                        mapId="ROUTE_POINTS_EDITOR_MAP"
                        gestureHandling="greedy"
                        disableDefaultUI={true}
                        onClick={handleMapClick}
                    >
                        {mapPoints.map((p) => (
                            <AdvancedMarker
                                key={`${p.type}-${p.idx}`}
                                position={{ lat: p.lat, lng: p.lng }}
                                title={p.title}
                                draggable={p.type === 'checkpoint'}
                                onDragEnd={(e) => {
                                    if (p.type === 'checkpoint' && e.latLng) {
                                        updateCheckpointPosition(p.idx, e.latLng.lat(), e.latLng.lng());
                                    }
                                }}
                                onClick={() => setActiveItem({ type: p.type, index: p.idx })}
                            >
                                <div
                                    className={`relative flex items-center justify-center transition-transform ${activeItem?.type === p.type && activeItem?.index === p.idx ? 'scale-125 z-50' : 'hover:scale-110'}`}
                                >
                                    <MapPin
                                        size={32}
                                        className={p.type === 'waypoint' ? "text-primary fill-primary/20" : "text-amber-500 fill-amber-500/20"}
                                        strokeWidth={2}
                                    />
                                    <span className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-800">
                                        {p.type === 'waypoint' ? 'W' : 'C'}{p.idx + 1}
                                    </span>
                                </div>
                            </AdvancedMarker>
                        ))}

                        {/* If we have points, fit map bounds */}
                        <FitBounds points={mapPoints} />
                    </Map>
                </APIProvider>

                <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                    <div className="bg-background/90 backdrop-blur-sm p-3 rounded-lg border shadow-sm text-xs font-medium text-center pointer-events-auto">
                        Haz clic en el mapa para añadir un nuevo <span className="text-amber-500">Checkpoint</span>. Arrástralo para cambiar su posición.
                    </div>
                </div>
            </div>
        </div>
    );
};
