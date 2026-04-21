import { Car, Gauge, TrendingDown, TrendingUp, Activity } from "lucide-react";
import { useTrafficStore } from "@/store/trafficStore";

const TrafficStats = () => {
  const snapshot = useTrafficStore((s) => s.currentSnapshot);

  const congestionColor =
    snapshot.congestionLevel === "Low"
      ? "text-neon-green"
      : snapshot.congestionLevel === "Medium"
      ? "text-neon-amber"
      : "text-neon-red";

  const congestionBg =
    snapshot.congestionLevel === "Low"
      ? "bg-neon-green/10 border-neon-green/20"
      : snapshot.congestionLevel === "Medium"
      ? "bg-neon-amber/10 border-neon-amber/20"
      : "bg-neon-red/10 border-neon-red/20";

  return (
    <div className="rounded-xl glass-card hover-lift p-6 space-y-6 animate-float border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary animate-pulse-slow" />
          <h3 className="text-lg font-semibold text-foreground tracking-wide holographic">Traffic Overview</h3>
        </div>
        <div className="text-xs text-muted-foreground font-mono bg-surface-2 px-2 py-1 rounded neon-border animate-pulse">
          Live Data
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Vehicles */}
        <StatCard
          icon={<Car className="w-5 h-5 text-neon-cyan animate-glow-pulse" />}
          label="Total Vehicles"
          value={snapshot.totalVehicles.toString()}
          trend={snapshot.totalVehicles > 400 ? "up" : "down"}
          subtitle="On network"
        />

        {/* Congestion */}
        <div className={`relative overflow-hidden rounded-xl border p-4 glass-card hover-lift transition-all duration-300 hover:scale-105 ${congestionBg}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Gauge className={`w-5 h-5 ${congestionColor} animate-pulse`} />
              <span className="text-sm font-medium text-foreground">Congestion Level</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-2xl font-bold ${congestionColor} animate-bounce`}>{snapshot.congestionLevel}</span>
            <div className={`w-3 h-3 rounded-full ${congestionColor.replace('text-', 'bg-')} animate-pulse neon-glow-blue`} />
          </div>
        </div>

        {/* Avg Speed */}
        <StatCard
          icon={<Gauge className="w-5 h-5 text-neon-purple animate-glow-pulse" />}
          label="Average Speed"
          value={`${snapshot.avgSpeed} km/h`}
          trend={snapshot.avgSpeed > 30 ? "up" : "down"}
          subtitle="Network wide"
        />
      </div>
    </div>
  );
};

function StatCard({
  icon,
  label,
  value,
  trend,
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: "up" | "down";
  subtitle?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl glass-card border-0 p-4 hover-lift transition-all duration-300 hover:scale-105 group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-surface-2/50 group-hover:bg-primary/10 transition-colors">
            {icon}
          </div>
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        {trend === "up" ? (
          <TrendingUp className="w-4 h-4 text-neon-green animate-bounce" />
        ) : (
          <TrendingDown className="w-4 h-4 text-neon-red animate-bounce" />
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold font-mono text-foreground animate-fade-in">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

export default TrafficStats;
