import { ArrowUpRight, Gauge, Radar, Route, TimerReset, Waves } from "lucide-react";

import type { PredictionPoint, TrafficSnapshot } from "@/store/trafficStore";

import Panel from "./Panel";

type OverviewHeroProps = {
  snapshot: TrafficSnapshot;
  predictions: PredictionPoint[];
};

const OverviewHero = ({ snapshot, predictions }: OverviewHeroProps) => {
  const networkLoad = Math.min(100, Math.round((snapshot.totalVehicles / 650) * 100));
  const nextWave = predictions[0]?.predicted ?? snapshot.totalVehicles;
  const busiest = [...snapshot.intersections].sort((a, b) => b.vehicles - a.vehicles).slice(0, 3);
  const avgDensity = Math.round(
    snapshot.intersections.reduce((sum, item) => sum + item.density, 0) / snapshot.intersections.length,
  );
  const readiness = Math.max(68, 96 - Math.round(avgDensity / 3));

  return (
    <Panel
      badge="Overview"
      title="Network Pulse"
      subtitle="A quick operational read on volume, queue pressure, and the corridors that will demand attention next."
      className="h-full"
    >
      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
        <div className="card-gentle glow-hover rounded-[28px] border border-border/50 backdrop-blur-xl bg-surface-1/80 p-5 shadow-glow-primary">
          <div className="relative mx-auto flex h-48 w-48 items-center justify-center rounded-full border border-border/30 backdrop-blur-md animate-glow-pulse">
            <div
              className="absolute inset-3 rounded-full"
              style={{
                background: `conic-gradient(hsl(var(--primary)) ${networkLoad * 3.6}deg, hsl(var(--background)/0.4) 0deg)`,
              }}
            />
            <div className="absolute inset-7 rounded-full bg-[radial-gradient(circle_at_top, hsl(var(--primary)/0.2), hsl(var(--background)/0.95)_70%)]" />
            <div className="relative text-center">
              <p className="soft-label text-foreground/80">Load index</p>
              <p className="mt-2 text-5xl font-semibold text-foreground font-mono">{networkLoad}%</p>
              <p className="mt-2 text-xs text-muted-foreground">Vehicles moving across the network</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <Metric label="Forecast wave" value={`${Math.round(nextWave)} veh`} icon={Radar} />
            <Metric label="Queue density" value={`${avgDensity} veh/km`} icon={Gauge} />
            <Metric label="Readiness" value={`${readiness}%`} icon={TimerReset} />
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <HeroCard
              title="Traffic Throughput"
              value={`${snapshot.totalVehicles}`}
              hint="Current vehicles on network"
              accent="from-primary/20 dark:from-primary/25 via-primary/5 to-transparent"
              icon={Waves}
              className="glow-hover card-gentle shadow-glow-primary"
            />
            <HeroCard
              title="Average Speed"
              value={`${snapshot.avgSpeed} km/h`}
              hint={`${snapshot.congestionLevel} congestion posture`}
              accent="from-secondary/20 dark:from-secondary/25 via-secondary/5 to-transparent"
              icon={ArrowUpRight}
              className="glow-hover card-gentle shadow-glow-secondary"
            />

          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/4 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="soft-label">Priority corridors</p>
                <h3 className="mt-1 text-lg font-semibold text-white">Where the next operator check should land</h3>
              </div>
              <Route className="h-5 w-5 text-primary" />
            </div>

            <div className="mt-5 space-y-4">
              {busiest.map((intersection, index) => {
                const share = Math.min(100, Math.round((intersection.vehicles / 160) * 100));
                return (
                  <div key={intersection.id} className="rounded-2xl border border-white/8 bg-black/10 p-4 transition duration-300 hover:bg-white/10">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {index + 1}. {intersection.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {intersection.vehicles} vehicles • {intersection.avgSpeed} km/h • {intersection.congestion} congestion
                        </p>
                      </div>
                      <span className="data-pill">{intersection.signal.toUpperCase()}</span>
                    </div>
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary via-cyan-300 to-secondary"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
};

const Metric = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Gauge;
}) => (
  <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/10 px-4 py-3">
    <div>
      <p className="soft-label">{label}</p>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
    </div>
    <Icon className="h-4.5 w-4.5 text-primary" />
  </div>
);

import { cn } from "@/lib/utils";

const HeroCard = ({
  title,
  value,
  hint,
  accent,
  icon: Icon,
  className,
}: {
  title: string;
  value: string;
  hint: string;
  accent: string;
  icon: typeof Gauge;
  className?: string;
}) => (
  <div className={cn(`relative overflow-hidden rounded-[28px] backdrop-blur-xl border border-border/50 bg-gradient-to-br ${accent} p-5 shadow-[0_28px_90px_hsl(var(--primary)/0.15)] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_35px_120px_hsl(var(--primary)/0.25)] glow-hover card-gentle`, className)}>
    <div className="absolute inset-0 bg-gradient-to-b from-white/5 dark:from-black/20 to-transparent" />
    <div className="relative">
      <div className="flex items-center justify-between gap-3">
        <p className="soft-label text-foreground/80">{title}</p>
        <Icon className="h-5 w-5 text-foreground/70 animate-rotate-subtle" />
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-tight font-mono text-foreground">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
    </div>
  </div>
);

export default OverviewHero;
