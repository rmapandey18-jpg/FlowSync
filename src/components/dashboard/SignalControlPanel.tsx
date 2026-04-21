import { BrainCircuit, MoveRight, TrafficCone } from "lucide-react";

import type { Intersection } from "@/store/trafficStore";

import Panel from "./Panel";

type SignalControlPanelProps = {
  intersections: Intersection[];
  selectedIntersection: string | null;
  aiAutoControl: boolean;
  setAiAutoControl: (enabled: boolean) => void;
  selectIntersection: (id: string | null) => void;
  toggleSignal: (intersectionId: string) => void;
};

const SignalControlPanel = ({
  intersections,
  selectedIntersection,
  aiAutoControl,
  setAiAutoControl,
  selectIntersection,
  toggleSignal,
}: SignalControlPanelProps) => {
  const selected = intersections.find((item) => item.id === selectedIntersection) ?? intersections[0];

  return (
    <Panel
      badge="Signals"
      title="Signal Director"
      subtitle="Switch between adaptive control and manual intervention without losing sight of queue pressure."
      className="h-full"
    >
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => setAiAutoControl(!aiAutoControl)}
          className={`w-full rounded-[26px] border px-5 py-5 text-left transition duration-300 ease-out ${
            aiAutoControl
              ? "border-primary/40 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(34,211,238,0.03))] shadow-[0_28px_80px_rgba(34,211,238,0.12)] hover:-translate-y-0.5"
              : "border-white/10 bg-white/4 hover:border-primary/30 hover:bg-white/8 hover:-translate-y-0.5"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="soft-label">Control mode</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{aiAutoControl ? "Adaptive AI engaged" : "Manual routing active"}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {aiAutoControl
                  ? "Signals react to simulated congestion automatically while operators keep override access."
                  : "Manual mode keeps the selected signal frozen until you intervene."}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
              <BrainCircuit className={`h-6 w-6 ${aiAutoControl ? "text-primary" : "text-slate-400"}`} />
            </div>
          </div>
        </button>

        <div className="rounded-[26px] border border-white/10 bg-white/4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="soft-label">Selected signal</p>
              <h3 className="mt-2 text-lg font-semibold text-white">{selected.name}</h3>
              <p className="mt-1 text-sm text-slate-300">
                {selected.vehicles} vehicles • {selected.avgSpeed} km/h • {selected.congestion} pressure
              </p>
            </div>
            <span className="data-pill">{selected.signal}</span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={aiAutoControl}
              onClick={() => toggleSignal(selected.id)}
              className="rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(251,146,60,0.18),rgba(251,146,60,0.06))] px-4 py-4 text-left text-white transition duration-300 ease-out enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_24px_60px_rgba(251,146,60,0.16)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <p className="flex items-center gap-2 text-sm font-medium">
                <TrafficCone className="h-4 w-4" />
                Toggle signal phase
              </p>
              <p className="mt-2 text-xs text-slate-200/80">Switch between green and red for the selected node.</p>
            </button>
            <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-4 text-sm text-slate-300">
              <p className="flex items-center gap-2 font-medium text-white">
                <MoveRight className="h-4 w-4 text-primary" />
                Manual guidance
              </p>
              <p className="mt-2 leading-6">
                {aiAutoControl
                  ? "AI will continue making the next cycle choices."
                  : "Manual mode will keep your override until you turn AI back on."}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {intersections.map((intersection) => (
            <button
              key={intersection.id}
              type="button"
              onClick={() => selectIntersection(intersection.id)}
              className={`rounded-[22px] border px-4 py-4 text-left transition duration-300 ease-out ${
                selected.id === intersection.id
                  ? "border-primary/40 bg-primary/10 shadow-[0_20px_40px_rgba(34,211,238,0.12)]"
                  : "border-white/10 bg-white/4 hover:border-white/20 hover:bg-white/8 hover:-translate-y-0.5"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-white">{intersection.name}</p>
                <span
                  className={`h-3 w-3 rounded-full ${
                    intersection.signal === "green"
                      ? "bg-emerald-400"
                      : intersection.signal === "red"
                        ? "bg-rose-400"
                        : "bg-secondary"
                  }`}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {intersection.vehicles} vehicles • {intersection.congestion} queue
              </p>
            </button>
          ))}
        </div>
      </div>
    </Panel>
  );
};

export default SignalControlPanel;
