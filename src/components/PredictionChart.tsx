import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar } from "recharts";
import { useTrafficStore } from "@/store/trafficStore";
import { Brain, TrendingUp, TrendingDown, Activity, BarChart3 } from "lucide-react";
import { useState } from "react";

const PredictionChart = () => {
  const history = useTrafficStore((s) => s.history);
  const predictions = useTrafficStore((s) => s.predictions);
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  // Combine history and predictions for the chart
  const chartData = [
    ...history.map((p) => ({ time: p.time, actual: p.actual, predicted: p.predicted })),
    ...predictions.map((p) => ({ time: p.time, actual: null, predicted: p.predicted })),
  ];

  // Calculate trend metrics
  const latestActual = history[history.length - 1]?.actual || 0;
  const latestPredicted = predictions[predictions.length - 1]?.predicted || 0;
  const accuracy = Math.abs(latestActual - latestPredicted) / latestActual * 100;
  const trend = latestPredicted > latestActual ? 'up' : 'down';

  return (
    <div className="rounded-xl bg-surface-1 border border-border p-6 space-y-4 shadow-lg animate-slide-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary/10 border border-secondary/20">
            <Brain className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground tracking-wide">AI Traffic Prediction</h3>
            <p className="text-sm text-muted-foreground">Real-time analytics and forecasting</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Chart type toggle */}
          <div className="flex bg-surface-2 rounded-lg p-1">
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                chartType === 'area'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Area
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                chartType === 'bar'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Bar
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-neon-cyan rounded" />
              <span className="text-muted-foreground">Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-neon-purple rounded opacity-60" style={{ borderStyle: "dashed" }} />
              <span className="text-muted-foreground">Predicted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-2 border border-border rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Accuracy</span>
            <Activity className="w-3 h-3 text-neon-green" />
          </div>
          <p className="text-lg font-bold text-foreground">{(100 - accuracy).toFixed(1)}%</p>
        </div>
        <div className="bg-surface-2 border border-border rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Trend</span>
            {trend === 'up' ? (
              <TrendingUp className="w-3 h-3 text-neon-green" />
            ) : (
              <TrendingDown className="w-3 h-3 text-neon-red" />
            )}
          </div>
          <p className="text-lg font-bold text-foreground capitalize">{trend}</p>
        </div>
        <div className="bg-surface-2 border border-border rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Peak Load</span>
            <BarChart3 className="w-3 h-3 text-neon-purple" />
          </div>
          <p className="text-lg font-bold text-foreground">1,247</p>
        </div>
        <div className="bg-surface-2 border border-border rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Confidence</span>
            <Brain className="w-3 h-3 text-secondary" />
          </div>
          <p className="text-lg font-bold text-foreground">92%</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(185 80% 55%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(185 80% 55%)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(270 70% 55%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(270 70% 55%)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" opacity={0.3} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }}
                stroke="hsl(222 30% 18%)"
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }}
                stroke="hsl(222 30% 18%)"
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222 40% 8%)",
                  border: "1px solid hsl(222 30% 18%)",
                  borderRadius: "12px",
                  fontSize: "13px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                }}
                labelStyle={{ color: "hsl(213 31% 91%)", fontWeight: "600" }}
                itemStyle={{ color: "hsl(213 31% 91%)" }}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="hsl(185 80% 55%)"
                fill="url(#actualGradient)"
                strokeWidth={3}
                dot={false}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="hsl(270 70% 55%)"
                strokeWidth={3}
                strokeDasharray="8 4"
                dot={false}
                strokeOpacity={0.8}
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" opacity={0.3} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }}
                stroke="hsl(222 30% 18%)"
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }}
                stroke="hsl(222 30% 18%)"
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222 40% 8%)",
                  border: "1px solid hsl(222 30% 18%)",
                  borderRadius: "12px",
                  fontSize: "13px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                }}
                labelStyle={{ color: "hsl(213 31% 91%)", fontWeight: "600" }}
                itemStyle={{ color: "hsl(213 31% 91%)" }}
              />
              <Bar dataKey="actual" fill="hsl(185 80% 55%)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="predicted" fill="hsl(270 70% 55%)" radius={[2, 2, 0, 0]} opacity={0.7} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          <span>Live data streaming</span>
        </div>
        <div className="text-muted-foreground font-mono">
          Updated {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default PredictionChart;
