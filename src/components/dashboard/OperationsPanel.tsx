import { AlertTriangle, Cpu, FileText, Siren, Sparkles, Workflow } from "lucide-react";

import type { TrafficSnapshot } from "@/store/trafficStore";

import Panel from "./Panel";

type OperationsPanelProps = {
  snapshot: TrafficSnapshot;
  aiAutoControl: boolean;
};

const OperationsPanel = ({ snapshot, aiAutoControl }: OperationsPanelProps) => {
  const ranked = [...snapshot.intersections].sort((a, b) => b.vehicles - a.vehicles);
  const alerts = ranked.slice(0, 3).map((intersection, index) => ({
    id: intersection.id,
    title: intersection.name,
    body:
      intersection.congestion === "High"
        ? "Queue length is elevated and should be reviewed."
        : "Traffic volume is trending up and worth watching.",
    severity: index === 0 ? "critical" : intersection.congestion === "High" ? "warning" : "info",
    time: `${index + 2} min ago`,
  }));

  const stack = [
    { label: "Control mesh", status: "online", note: "Signal packets healthy", icon: Workflow },
    { label: "Forecast engine", status: aiAutoControl ? "active" : "standby", note: "Refreshing hourly scenarios", icon: Cpu },
    { label: "Incident relay", status: alerts.length ? "armed" : "quiet", note: "Escalates priority alerts", icon: Siren },
  ];

  const actions = [
    { label: "Create Ops Report", icon: FileText },
    { label: "Run Adaptive Sweep", icon: Sparkles },
    { label: "Trigger Priority Mode", icon: AlertTriangle },
  ];

  return (
    <Panel
      badge="Ops"
      title="Control Rail"
      subtitle="Live incident feed, system readiness, and fast operator actions."
      className="h-full"
    >
      <div className="space-y-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Incident feed</h3>
            <span className="data-pill">{alerts.length} active</span>
          </div>

          {alerts.map((alert) => (
            <div key={alert.id} className="rounded-[24px] border border-white/10 bg-black/12 p-4">
              <div className="flex items-start gap-3">
                <span
                  className={`mt-1 h-2.5 w-2.5 rounded-full ${
                    alert.severity === "critical"
                      ? "bg-rose-400"
                      : alert.severity === "warning"
                        ? "bg-secondary"
                        : "bg-primary"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{alert.title}</p>
                    <span className="text-xs text-slate-400">{alert.time}</span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-300">{alert.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-3">
          {stack.map(({ label, status, note, icon: Icon }) => (
            <div key={label} className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/4 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/15 p-2.5">
                  <Icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="mt-1 text-xs text-slate-400">{note}</p>
                </div>
              </div>
              <span className="data-pill">{status}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {actions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              className="group rounded-[22px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white/8"
            >
              <Icon className="h-5 w-5 text-primary transition group-hover:text-white" />
              <p className="mt-4 text-sm font-medium text-white">{label}</p>
            </button>
          ))}
        </div>
      </div>
    </Panel>
  );
};

export default OperationsPanel;
