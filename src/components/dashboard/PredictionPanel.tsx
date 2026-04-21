import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, BrainCircuit, TrendingDown, TrendingUp } from "lucide-react";

import type { PredictionPoint } from "@/store/trafficStore";

import Panel from "./Panel";

type PredictionPanelProps = {
  history: PredictionPoint[];
  predictions: PredictionPoint[];
};

const PredictionPanel = ({ history, predictions }: PredictionPanelProps) => {
  const [chartType, setChartType] = useState<"stream" | "bars">("stream");
  const latestActual = history.length ? history[history.length - 1].actual : 0;
  const nextPrediction = predictions.length ? predictions[0].predicted : latestActual;
  const change = nextPrediction - latestActual;
  const confidence = latestActual
    ? Math.max(72, Math.round(96 - (Math.abs(change) / latestActual) * 100))
    : 88;

  const chartData = [
    ...history.map((point) => ({
      time: point.time,
      actual: point.actual,
      predicted: point.predicted,
    })),
    ...predictions.map((point) => ({
      time: point.time,
      actual: null,
      predicted: point.predicted,
    })),
  ];

  const insightCards = [
    {
      label: "Next wave",
      value: `${Math.round(nextPrediction)} veh`,
      note: change >= 0 ? "Demand is building" : "Demand is easing",
      icon: change >= 0 ? TrendingUp : TrendingDown,
    },
    {
      label: "Confidence",
      value: `${confidence}%`,
      note: "Based on recent history fit",
      icon: BrainCircuit,
    },
    {
      label: "Forecast span",
      value: `${predictions.length} ticks`,
      note: "Short horizon planning window",
      icon: Activity,
    },
  ];

  return (
    <Panel
      badge="Forecast"
      title="Prediction Studio"
      subtitle="Live history blends into a short-range forecast so you can anticipate congestion before it spikes."
      className="h-full"
      headerExtra={
        <div className="inline-flex rounded-full border border-white/10 bg-black/20 p-1">
          {[
            { key: "stream", label: "Stream" },
            { key: "bars", label: "Bars" },
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setChartType(option.key as "stream" | "bars")}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                chartType === option.key ? "bg-primary text-primary-foreground" : "text-slate-300"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="rounded-[28px] border border-white/10 bg-black/10 p-4">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="data-pill">
              <span className="status-dot bg-primary" />
              Actual stream
            </span>
            <span className="data-pill">
              <span className="status-dot bg-secondary" />
              Predicted curve
            </span>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "stream" ? (
                <AreaChart data={chartData} margin={{ top: 12, right: 10, left: -24, bottom: 8 }}>
                  <defs>
                    <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.42} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.03} />
                    </linearGradient>
                    <linearGradient id="predictionFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="time" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10, 18, 29, 0.96)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "18px",
                      boxShadow: "0 16px 50px rgba(0,0,0,0.35)",
                    }}
                    labelStyle={{ color: "#e2e8f0", fontWeight: 600 }}
                    itemStyle={{ color: "#cbd5e1" }}
                  />
                  <Area type="monotone" dataKey="actual" stroke="hsl(var(--primary))" fill="url(#actualFill)" strokeWidth={3} />
                  <Line type="monotone" dataKey="predicted" stroke="hsl(var(--secondary))" strokeWidth={3} strokeDasharray="8 5" dot={false} />
                  <Area type="monotone" dataKey="predicted" stroke="transparent" fill="url(#predictionFill)" />
                </AreaChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 12, right: 10, left: -24, bottom: 8 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="time" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(10, 18, 29, 0.96)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "18px",
                      boxShadow: "0 16px 50px rgba(0,0,0,0.35)",
                    }}
                    labelStyle={{ color: "#e2e8f0", fontWeight: 600 }}
                    itemStyle={{ color: "#cbd5e1" }}
                  />
                  <Bar dataKey="actual" fill="hsl(var(--primary))" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="predicted" fill="hsl(var(--secondary))" radius={[5, 5, 0, 0]} opacity={0.7} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          {insightCards.map(({ label, value, note, icon: Icon }) => (
            <div key={label} className="metric-shell">
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

          <div className="rounded-[28px] border border-dashed border-white/12 bg-black/10 p-5">
            <p className="soft-label">Operator takeaway</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {change >= 0
                ? "Expect queue pressure to rise during the next forecast block. Keep the busiest corridor selected and let adaptive mode continue unless one node stalls sharply."
                : "The current wave is cooling. This is a good window to clear manual overrides and observe whether signal balance recovers on its own."}
            </p>
          </div>
        </div>
      </div>
    </Panel>
  );
};

export default PredictionPanel;
