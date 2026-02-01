import { Trophy, Star, Zap } from "lucide-react";
import { UserPoints } from "../types";

interface UserPointsCardProps {
  userPoints: UserPoints;
  className?: string;
}

export const UserPointsCard = ({
  userPoints,
  className = "",
}: UserPointsCardProps) => {
  const progressPercent =
    (userPoints.points / userPoints.next_level_points) * 100;

  return (
    <div
      className={`relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl ${className}`}
    >
      {/* Background Pattern */}
      <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
              Tu Rango
            </p>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">
              {userPoints.rank_name}
            </h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-end justify-between text-sm font-bold">
            <span className="flex items-center gap-2 text-slate-300">
              <Star className="h-4 w-4 text-yellow-400" />
              Nivel {userPoints.level}
            </span>
            <span className="text-primary">{userPoints.points} XP</span>
          </div>

          {/* Progress Bar */}
          <div className="h-4 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-right text-[10px] font-medium text-slate-500">
            Faltan {userPoints.next_level_points - userPoints.points} XP para
            nivel {userPoints.level + 1}
          </p>
        </div>

        <div className="mt-2 flex gap-3">
          <div className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-[10px] font-black uppercase tracking-wider transition-colors hover:bg-white/10">
            <Zap className="h-3.5 w-3.5 text-yellow-400" />
            Desafíos
          </div>
        </div>
      </div>
    </div>
  );
};
