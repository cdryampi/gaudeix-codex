import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Medal, Trophy, Users, Globe } from "lucide-react";
import { getRankings, getUserPoints } from "../api";
import { UserPointsCard } from "../components/UserPointsCard";

export const RankingsPage = () => {
  const [period, setPeriod] = useState<"global" | "monthly">("global");

  const { data: userPoints } = useQuery({
    queryKey: ["userPoints"],
    queryFn: getUserPoints,
  });

  const { data: rankings, isLoading } = useQuery({
    queryKey: ["rankings", period],
    queryFn: () => getRankings(period),
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-32">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white mb-4">
              <Trophy className="h-3 w-3 text-yellow-400" />
              Hall of Fame
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-slate-900">
              Rankings <span className="text-primary italic">Gaudeix</span>
            </h1>
          </div>

          {/* Period Toggles */}
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
            <button
              onClick={() => setPeriod("global")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                period === "global"
                  ? "bg-slate-900 text-white shadow-lg"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              Global
            </button>
            <button
              onClick={() => setPeriod("monthly")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                period === "monthly"
                  ? "bg-slate-900 text-white shadow-lg"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Medal className="h-3.5 w-3.5" />
              Mensual
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Rankings List */}
          <div className="lg:col-span-8 space-y-4">
            {isLoading
              ? [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 w-full animate-pulse rounded-[2rem] bg-white"
                  />
                ))
              : rankings?.map((user, index) => (
                  <div
                    key={user.user_id}
                    className={`group flex items-center justify-between p-6 rounded-[2rem] border transition-all hover:scale-[1.02] ${
                      index === 0
                        ? "bg-white border-yellow-200 shadow-xl shadow-yellow-100/50"
                        : index === 1
                          ? "bg-white border-slate-200 shadow-lg"
                          : index === 2
                            ? "bg-white border-orange-200 shadow-lg"
                            : "bg-white border-slate-100 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl font-black text-xl ${
                          index === 0
                            ? "bg-yellow-100 text-yellow-600"
                            : index === 1
                              ? "bg-slate-100 text-slate-600"
                              : index === 2
                                ? "bg-orange-100 text-orange-600"
                                : "bg-slate-50 text-slate-400"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">
                          {user.username}
                        </h4>
                        <p className="text-xs font-medium text-slate-500">
                          {user.rank_name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-xl font-black text-primary">
                        {user.points}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        Puntos
                      </span>
                    </div>
                  </div>
                ))}
          </div>

          {/* Right Column: User Stats */}
          <div className="lg:col-span-4 space-y-8">
            {userPoints && <UserPointsCard userPoints={userPoints} />}

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
                  <Users className="h-5 w-5 text-slate-400" />
                </div>
                <h4 className="font-bold text-slate-900">Invita amigos</h4>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                Gana 500 XP por cada amigo que se una a Gaudeix.
              </p>
              <button className="w-full py-4 rounded-xl bg-slate-100 text-slate-900 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">
                Copiar enlace
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
