import { Gauge, Orbit, TimerReset, TrendingUp } from "lucide-react";

import type { PredictionPoint, TrafficSnapshot } from "@/store/trafficStore";

import Panel from "./Panel";

type TrafficInsightsPanelProps = {
  snapshot: TrafficSnapshot;
  history: PredictionPoint[];
};

const TrafficInsightsPanel = ({ snapshot, history }: TrafficInsightsPanelProps) => {
  const previousActual = history.length > 1 ? history[history.length - 2].actual : snapshot.totalVehicles;
  const delta = snapshot.totalVehicles - previousActual;
  const trendLabel = delta >= 0 ? "Rising" : "Cooling";
  const trendValue = `${delta >= 0 ? "+" : ""}${delta}`;
  const avgDensity = Math.round(
    snapshot.intersections.reduce((sum, item) => sum + item.density, 0) / snapshot.intersections.length,
  );
  const topFlow = [...snapshot.intersections].sort((a, b) => b.avgSpeed - a.avgSpeed).slice(0, 4);
  const automationScore = Math.max(65, 98 - avgDensity);

  const stats = [
    { label: "Flow Trend", value: trendLabel, note: trendValue, icon: TrendingUp },
    { label: "Network Density", value: `${avgDensity} veh/km`, note: "Cross-network queue average", icon: Gauge },
    { label: "Cycle Reserve", value: `${Math.max(12, 52 - avgDensity)} sec`, note: "Estimated adaptive slack", icon: TimerReset },
    { label: "Autonomy Score", value: `${automationScore}%`, note: "Signal confidence window", icon: Orbit },
  ];

  return (
    <Panel
      badge="Metrics"
      title="Flow Intelligence"
      subtitle="Operational indicators that help you judge whether traffic is stabilizing or starting to drift."
      className="h-full"
    >
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          {stats.map(({ label, value, note, icon: Icon }) => (
            <div key={label} className="metric-shell transition-transform duration-300 ease-out hover:-translate-y-1 hover:border-primary/20">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="soft-label">{label}</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
                  <p className="mt-2 text-xs text-slate-400">{note}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/15 p-2.5">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/4 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="soft-label">Fastest corridors</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Where vehicles are clearing cleanly</h3>
            </div>
            <span className="data-pill">{topFlow.length} lanes watched</span>
          </div>

          <div className="mt-5 space-y-4">
            {topFlow.map((intersection) => {
              const share = Math.min(100, Math.round((intersection.avgSpeed / 60) * 100));
              return (
                <div key={intersection.id}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{intersection.name}</p>
                      <p className="text-xs text-slate-400">{intersection.vehicles} vehicles currently routed</p>
                    </div>
                    <span className="text-sm text-slate-300">{intersection.avgSpeed} km/h</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-primary to-cyan-300"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Panel>
  );
};

export default TrafficInsightsPanel;
