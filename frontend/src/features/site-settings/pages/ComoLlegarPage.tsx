import { HowToGetHere } from "@/features/site-settings/components/HowToGetHere";

export const ComoLlegarPage = () => {
  return (
    <main className="min-h-screen bg-white pb-32">
      {/* Hero Header */}
      <div className="bg-slate-900 pt-48 pb-32 px-6">
        <div className="container mx-auto">
          <span className="text-sm font-black uppercase tracking-[0.5em] text-accent mb-6 block">
            Planifica tu visita
          </span>
          <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none">
            Cómo <span className="italic text-accent">llegar</span>
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-16">
        <div className="bg-white rounded-[4rem] overflow-hidden shadow-3xl border border-slate-100">
          <div className="p-12 md:p-20">
            <HowToGetHere />
          </div>
        </div>
      </div>
    </main>
  );
};
