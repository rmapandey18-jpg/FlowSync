import { Activity, BrainCircuit, Clock3, Network, ShieldCheck } from "lucide-react";

import type { TrafficSnapshot } from "@/store/trafficStore";

type DashboardHeaderProps = {
  snapshot: TrafficSnapshot;
  aiAutoControl: boolean;
  nextPrediction?: number;
};

const DashboardHeader = ({ snapshot, aiAutoControl, nextPrediction }: DashboardHeaderProps) => {
  const networkLoad = Math.min(100, Math.round((snapshot.totalVehicles / 650) * 100));
  const healthScore = Math.max(72, Math.min(99, 96 - Math.round(networkLoad / 5)));
  const updatedAt = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(snapshot.timestamp));

  const statusCards = [
    {
      label: "Intersections",
      value: snapshot.intersections.length.toString(),
      icon: Network,
      tone: "text-primary",
    },
    {
      label: "AI Mode",
      value: aiAutoControl ? "Adaptive" : "Manual",
      icon: BrainCircuit,
      tone: aiAutoControl ? "text-emerald-300" : "text-secondary",
    },
    {
      label: "Next Hour",
      value: nextPrediction ? `${Math.round(nextPrediction)} veh` : "Priming",
      icon: Activity,
      tone: "text-cyan-200",
    },
    {
      label: "Health Score",
      value: `${healthScore}%`,
      icon: ShieldCheck,
      tone: "text-lime-300",
    },
  ];

  return (
    <header className="relative overflow-hidden rounded-[34px] border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_38%),linear-gradient(145deg,rgba(8,22,34,0.96),rgba(15,28,44,0.94))] px-6 py-7 shadow-[0_24px_80px_rgba(0,0,0,0.42)] sm:px-8">
      <div className="absolute inset-y-0 right-0 hidden w-72 bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.16),transparent_62%)] lg:block" />
      <div className="absolute -left-10 top-12 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 right-20 h-28 w-28 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px] xl:items-end">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="data-pill">
              <span className="status-dot bg-emerald-400" />
              Live command deck
            </span>
            <span className="data-pill">
              <Clock3 className="h-3.5 w-3.5" />
              Updated {updatedAt}
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.42em] text-primary/80">Real-time urban mobility orchestration</p>
            <div className="space-y-2">
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl xl:text-6xl">
                FlowSync AI
                <span className="block text-slate-200/90">Traffic command center for live signal, queue, and forecast control.</span>
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Adaptive monitoring, congestion response, and prediction summaries built for operators who need a cleaner picture of what is happening right now and what is about to happen next.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {statusCards.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="metric-shell transition-transform duration-300 ease-out hover:-translate-y-1 hover:border-primary/20">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="soft-label">{label}</p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{value}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5">
                  <Icon className={`h-5 w-5 ${tone}`} />
                </div>
              </div>
              {label === "Health Score" ? (
                <div className="mt-4 h-2 rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-gradient-to-r from-lime-300 to-emerald-400" style={{ width: `${healthScore}%` }} />
                </div>
              ) : null}
              {label === "Intersections" ? (
                <p className="mt-3 text-xs text-slate-400">Across the active simulator network</p>
              ) : null}
              {label === "AI Mode" ? (
                <p className="mt-3 text-xs text-slate-400">Manual overrides stay available from the signal panel</p>
              ) : null}
              {label === "Next Hour" ? (
                <p className="mt-3 text-xs text-slate-400">Forecast is refreshed from the current history window</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
