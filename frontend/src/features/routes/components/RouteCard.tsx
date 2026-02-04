/**
 * RouteCard component for displaying route summaries in a grid.
 * Shows featured image, difficulty badge, route type, and key stats.
 */

import { Link } from "react-router-dom";
import {
  ChevronRight,
  Timer,
  Mountain,
  ArrowUp,
  ArrowDown,
  RotateCcw,
} from "lucide-react";
import { Route } from "../types";
import { getDifficultyConfig, getRouteTypeConfig } from "../constants";

interface RouteCardProps {
  route: Route;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const RouteCard = ({
  route,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: RouteCardProps) => {
  const difficultyConfig = getDifficultyConfig(route.difficulty);
  const routeTypeConfig = getRouteTypeConfig(route.route_type);
  const RouteTypeIcon = routeTypeConfig.icon;

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-[2.5rem] border transition-all duration-500 ${
        isHovered
          ? "border-primary/30 bg-primary/5 shadow-2xl shadow-primary/10 -translate-y-2"
          : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-xl"
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Image Section */}
      <div className="relative aspect-[16/11] w-full overflow-hidden">
        <img
          src={
            route.featured_media?.variant_medium ||
            route.featured_media?.file ||
            route.image_url ||
            "/placeholder-route.jpg"
          }
          alt={route.title}
          className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />

        {/* Route Type Badge */}
        <div className="absolute top-4 left-4">
          <div
            className={`flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-md px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-sm ${routeTypeConfig.color}`}
          >
            <RouteTypeIcon className="h-3.5 w-3.5" />
            {routeTypeConfig.label}
          </div>
        </div>

        {/* Difficulty Badge */}
        <div className="absolute top-4 right-4">
          <div
            className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest ${difficultyConfig.bgColor} ${difficultyConfig.textColor}`}
          >
            {difficultyConfig.label}
          </div>
        </div>

        {/* Circular Badge */}
        {route.is_circular && (
          <div className="absolute bottom-4 left-4">
            <div className="flex items-center gap-1.5 rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white">
              <RotateCcw className="h-3 w-3" />
              Circular
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-8">
        <h3 className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-primary transition-colors mb-3 leading-tight">
          {route.title}
        </h3>

        {route.summary && (
          <p className="text-sm text-slate-500 mb-6 line-clamp-2">
            {route.summary}
          </p>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {route.distance_km && (
            <div className="flex items-center gap-2 text-slate-600">
              <Mountain className="h-4 w-4 text-primary/50" />
              <span className="text-xs font-bold">
                {route.distance_km.toFixed(1)} km
              </span>
            </div>
          )}
          {route.duration_formatted && (
            <div className="flex items-center gap-2 text-slate-600">
              <Timer className="h-4 w-4 text-primary/50" />
              <span className="text-xs font-bold">
                {route.duration_formatted}
              </span>
            </div>
          )}
          {route.elevation_gain && (
            <div className="flex items-center gap-2 text-slate-600">
              <ArrowUp className="h-4 w-4 text-green-500" />
              <span className="text-xs font-bold">
                +{route.elevation_gain}m
              </span>
            </div>
          )}
          {route.elevation_loss && (
            <div className="flex items-center gap-2 text-slate-600">
              <ArrowDown className="h-4 w-4 text-red-500" />
              <span className="text-xs font-bold">
                -{route.elevation_loss}m
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          <Link
            to={`/rutas/${route.slug}`}
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-primary hover:shadow-lg hover:shadow-primary/20 active:scale-95 w-full"
          >
            Ver ruta
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
