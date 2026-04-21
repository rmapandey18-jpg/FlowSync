import { Activity, Gauge, Map, MapPin } from "lucide-react";

import type { Intersection } from "@/store/trafficStore";

import Panel from "./Panel";

type NetworkMapPanelProps = {
  intersections: Intersection[];
  selectedIntersection: string | null;
  selectIntersection: (id: string | null) => void;
};

const NetworkMapPanel = ({
  intersections,
  selectedIntersection,
  selectIntersection,
}: NetworkMapPanelProps) => {
  const activeIntersection =
    intersections.find((item) => item.id === selectedIntersection) ??
    [...intersections].sort((a, b) => b.vehicles - a.vehicles)[0];

  return (
    <Panel
      badge="Map"
      title="Intersection Matrix"
      subtitle="Click any node to inspect queue pressure, signal state, and manual control targets."
      className="h-full"
      headerExtra={
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Green", tone: "bg-emerald-400" },
            { label: "Amber", tone: "bg-secondary" },
            { label: "Red", tone: "bg-rose-400" },
          ].map((item) => (
            <span key={item.label} className="data-pill">
              <span className={`status-dot ${item.tone}`} />
              {item.label}
            </span>
          ))}
        </div>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="command-grid relative min-h-[420px] overflow-hidden rounded-[28px] border border-white/10 p-4">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/8 to-transparent animate-[scanner_8s_linear_infinite]" />
          <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-slate-300">
            <Map className="h-3.5 w-3.5 text-primary" />
            Synthetic city grid
          </div>

          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="roadGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(34,211,238,0.55)" />
                <stop offset="100%" stopColor="rgba(251,146,60,0.28)" />
              </linearGradient>
            </defs>
            <line x1="8" y1="22" x2="92" y2="22" stroke="url(#roadGlow)" strokeWidth="1.8" opacity="0.55" />
            <line x1="8" y1="48" x2="92" y2="48" stroke="url(#roadGlow)" strokeWidth="1.8" opacity="0.45" />
            <line x1="8" y1="74" x2="92" y2="74" stroke="url(#roadGlow)" strokeWidth="1.8" opacity="0.55" />
            <line x1="24" y1="8" x2="24" y2="92" stroke="url(#roadGlow)" strokeWidth="1.8" opacity="0.5" />
            <line x1="50" y1="8" x2="50" y2="92" stroke="url(#roadGlow)" strokeWidth="1.8" opacity="0.45" />
            <line x1="76" y1="8" x2="76" y2="92" stroke="url(#roadGlow)" strokeWidth="1.8" opacity="0.55" />
          </svg>

          {intersections.map((intersection) => {
            const isSelected = selectedIntersection === intersection.id;
            const signalTone =
              intersection.signal === "green"
                ? "bg-emerald-400"
                : intersection.signal === "red"
                  ? "bg-rose-400"
                  : "bg-secondary";

            return (
              <button
                key={intersection.id}
                type="button"
                onClick={() => selectIntersection(isSelected ? null : intersection.id)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 transition duration-300 ease-out ${
                  isSelected ? "z-20 scale-110 shadow-[0_20px_60px_rgba(34,211,238,0.18)]" : "z-10 hover:scale-105 hover:shadow-[0_14px_40px_rgba(34,211,238,0.12)]"
                }`}
                style={{ left: `${intersection.x}%`, top: `${intersection.y}%` }}
              >
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.86),rgba(4,10,18,0.96))] shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
                  <div className={`signal-ring h-5 w-5 rounded-full ${signalTone} ${isSelected ? "animate-pulse-slow" : ""}`} />
                  <div className="absolute -right-1 -top-1 rounded-full border border-white/12 bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    {intersection.vehicles}
                  </div>
                </div>
                <div className="mt-3 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-left shadow-lg backdrop-blur transition duration-300 hover:bg-white/10">
                  <p className="max-w-[160px] text-xs font-medium text-white">{intersection.name}</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {intersection.avgSpeed} km/h • {intersection.congestion}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-4 rounded-[28px] border border-white/10 bg-white/4 p-4">
          <div className="rounded-[24px] border border-white/10 bg-black/12 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="soft-label">Selected node</p>
                <h3 className="mt-1 text-lg font-semibold text-white">{activeIntersection.name}</h3>
              </div>
              <span className="data-pill">{activeIntersection.signal}</span>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Approximate grid position {activeIntersection.x}% / {activeIntersection.y}%
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-secondary" />
                {activeIntersection.vehicles} vehicles in queue
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-emerald-300" />
                {activeIntersection.avgSpeed} km/h average approach speed
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: "Queue density", value: Math.min(100, activeIntersection.density * 2.1) },
              { label: "Flow efficiency", value: Math.min(100, activeIntersection.avgSpeed * 1.8) },
              { label: "Signal confidence", value: activeIntersection.signal === "green" ? 88 : 74 },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-300">{item.label}</p>
                  <span className="text-xs text-slate-400">{Math.round(item.value)}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary via-cyan-300 to-secondary"
                    style={{ width: `${Math.round(item.value)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[24px] border border-dashed border-white/12 bg-black/10 p-4 text-sm text-slate-300">
            Recommended operator note:
            <span className="mt-2 block text-white">
              {activeIntersection.congestion === "High"
                ? "Hold green for two extra cycles and keep broadcast alerts enabled."
                : activeIntersection.congestion === "Medium"
                  ? "Watch queue buildup and allow AI timing if the next wave grows."
                  : "Traffic is flowing cleanly. No intervention needed right now."}
            </span>
          </div>
        </div>
      </div>
    </Panel>
  );
};

export default NetworkMapPanel;
